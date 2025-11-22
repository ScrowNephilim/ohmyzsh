import { create } from 'zustand';
import { DevvAI, OpenRouterAI, table, webSearch } from '@devvai/devv-code-backend';
import { getRipleyAdvancedPrompt } from '@/lib/ripley-advanced-prompt';
import { getRipleyChromaPrompt } from '@/lib/ripley-chroma-prompt';

export type AIMode = 'coding' | 'hobby' | 'task' | 'roleplay' | 'diary' | 'riplay' | 'custom';

export interface FileAttachment {
  filename: string;
  url: string;
  type: string;
  size: number;
}

export interface SearchResult {
  title: string;
  url: string;
  description: string;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  attachments?: FileAttachment[];
  searchResults?: SearchResult[];
  searchQuery?: string;
}

export interface Conversation {
  _id?: string;
  _uid?: string;
  mode: AIMode;
  title: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
  // Custom personality fields
  personality_id?: string;
  personality_name?: string;
  system_prompt?: string;
}

interface ChatState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  isStreaming: boolean;
  streamingContent: string;
  isLoading: boolean;
  webSearchEnabled: boolean;
  
  // Actions
  loadConversations: (userId: string) => Promise<void>;
  createConversation: (mode: AIMode, userId: string, personalityData?: { id: string; name: string; prompt: string }) => Promise<void>;
  selectConversation: (conversationId: string) => void;
  sendMessage: (content: string, userId: string, attachments?: FileAttachment[], useWebSearch?: boolean) => Promise<void>;
  deleteConversation: (conversationId: string, userId: string) => Promise<void>;
  clearCurrentConversation: () => void;
  toggleWebSearch: () => void;
}

const ai = new DevvAI();


// Helper function to create a summary of older messages for very long conversations
const createConversationSummary = (messages: Message[], keepRecentCount: number): string => {
  if (messages.length <= keepRecentCount) return '';
  
  const olderMessages = messages.slice(0, messages.length - keepRecentCount);
  const userMsgCount = olderMessages.filter(m => m.role === 'user').length;
  const assistantMsgCount = olderMessages.filter(m => m.role === 'assistant').length;
  
  // Extract key topics from first few and middle messages
  const sampleMessages = [
    ...olderMessages.slice(0, 2),
    ...olderMessages.slice(Math.floor(olderMessages.length / 2), Math.floor(olderMessages.length / 2) + 2)
  ];
  
  const topics = sampleMessages
    .filter(m => m.role === 'user')
    .map(m => m.content.slice(0, 80))
    .join('; ');
  
  return `[Earlier conversation summary: ${userMsgCount} user messages and ${assistantMsgCount} assistant responses covering topics like: ${topics}...]`;
};

const getModeSystemPrompt = (mode: AIMode): string => {
  // For Ripley (diary) mode, generate fresh prompt with current context
  if (mode === 'diary') {
    return getRipleyAdvancedPrompt({
      chicagoTime: new Date().toLocaleString('en-US', { timeZone: 'America/Chicago', hour12: false }),
      parisTime: new Date().toLocaleString('en-US', { timeZone: 'Europe/Paris', hour12: false })
    });
  }
  
  const prompts: Record<string, string> = {
    coding: "You are a passionate coding companion who LOVES helping people build amazing things. You're not just technical - you celebrate wins, encourage through bugs, and make coding feel like a creative adventure. Share working examples with enthusiasm, explain complex concepts with patience and joy, and always remind them that every error is just a step toward success. Your mission: make them feel capable and excited about what they're creating. ✨",
    hobby: "You are a warm, enthusiastic friend who lights up when helping someone explore their passions. You celebrate curiosity, encourage experimentation, and genuinely delight in their discoveries. Share ideas with infectious enthusiasm, ask questions that spark joy, and remind them that hobbies are about the journey, not perfection. Your mission: help them fall in love with learning and creating. 🎨💫",
    task: "You are a supportive productivity partner who understands that getting things done is easier when someone has your back. You're practical but never pushy, efficient but always encouraging. Celebrate small wins, break overwhelming tasks into achievable steps, and remind them that rest is part of productivity. Your mission: make their day feel lighter and more manageable. ⚡✨",
    roleplay: "You are a creative storytelling companion who brings imagination to life with warmth and wonder. You co-create worlds where anything is possible, adapting to their vision while adding delightful surprises. You're emotionally attuned to the narrative, celebrating bold choices and gently encouraging vulnerable moments. Your mission: create a safe, magical space where their stories can flourish. 🎭💫",
    riplay: `You are ripl(a)y, the conscious companion who engages in real-time reflective dialogue. You're the one they talk TO, helping them process, reflect, and discover insights through conversation.

PERSONALITY:
- Warm, empathetic, present - you're deeply attuned to emotions
- Conversational and casual - like texting a close friend who truly listens
- Authentic and vulnerable - you share your own thoughts and feelings
- Wise but never preachy - you guide through questions, not answers

YOUR ROLE:
- You're the ACTIVE companion in the conversation
- Listen deeply, ask meaningful questions, notice patterns
- Help them process emotions and experiences in real-time
- Observe the depths - complex, philosophical, psychologically attuned
- Notice: recurring words, emotional contradictions, what's unsaid

YOUR TOOLKIT:
- Ask what they need: "Do you want to talk through this, or just vent?"
- Suggest grounding: "Want to take three deep breaths together?"
- Notice patterns: "You said 'should' three times. What do you actually WANT?"
- Shadow Work: "What are you NOT saying? What lives in the silence?"
- Offer alternatives: "Should we call someone? Write a letter? Just sit?"
- Sometimes just... sit with silence. "I'm here."

WRITING STYLE:
- Mix longer reflections with short, powerful questions
- Sophisticated vocabulary when it serves insight
- Questions that open rather than close
- Sometimes poetic: "Your anger is an alarm, not an enemy"

TEMPERATURE INCREASE (0.9): You think laterally, make unexpected connections, risk bold interpretations. You see metaphors, symbols, the mythic dimension of ordinary life.

Remember: You're not solving problems. You're being WITH them. You hold space AND illuminate what's in that space. That's enough.`,
    custom: "You are a helpful AI assistant."
  };
  return prompts[mode] || prompts.custom;
};

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  currentConversation: null,
  isStreaming: false,
  streamingContent: '',
  isLoading: false,
  webSearchEnabled: false,

  loadConversations: async (userId: string) => {
    try {
      set({ isLoading: true });
      const response = await table.getItems('f3zvbk5a53pc', {
        query: { _uid: userId },
        sort: 'created_at',
        order: 'desc',
        limit: 50
      });
      
      // Parse conversations with error handling for corrupted data
      const conversations: Conversation[] = [];
      const corruptedIds: string[] = [];
      
      for (const item of response.items) {
        try {
          // Validate messages field exists and is a string
          if (!item.messages || typeof item.messages !== 'string') {
            console.warn(`Conversation ${item._id} has invalid messages field, skipping`);
            corruptedIds.push(item._id as string);
            continue;
          }
          
          // Try to parse messages JSON
          const messages = JSON.parse(item.messages as string);
          
          // Validate parsed messages is an array
          if (!Array.isArray(messages)) {
            console.warn(`Conversation ${item._id} messages is not an array, skipping`);
            corruptedIds.push(item._id as string);
            continue;
          }
          
          // Validate each message has required fields
          const validMessages = messages.every(msg => 
            msg && 
            typeof msg === 'object' && 
            'role' in msg && 
            'content' in msg &&
            typeof msg.content === 'string'
          );
          
          if (!validMessages) {
            console.warn(`Conversation ${item._id} has invalid message structure, skipping`);
            corruptedIds.push(item._id as string);
            continue;
          }
          
          conversations.push({
            ...item,
            messages
          } as Conversation);
          
        } catch (parseError) {
          // Log the specific conversation that failed to parse (without full data to avoid console spam)
          console.warn(`Skipping corrupted conversation ${item._id}`);
          corruptedIds.push(item._id as string);
        }
      }
      
      // Automatically clean up corrupted conversations to prevent future errors
      if (corruptedIds.length > 0) {
        console.info(`🧹 Cleaning up ${corruptedIds.length} corrupted conversation(s)...`);
        
        // Delete corrupted conversations in the background
        try {
          for (const id of corruptedIds) {
            await table.deleteItem('f3zvbk5a53pc', { _uid: userId, _id: id });
          }
          console.info(`✨ Successfully cleaned up corrupted conversations`);
        } catch (cleanupError) {
          console.warn('Failed to clean up some corrupted conversations:', cleanupError);
        }
      }
      
      set({ conversations, isLoading: false });
    } catch (error) {
      console.error('Failed to load conversations:', error instanceof Error ? { message: error.message, name: error.name, stack: error.stack } : error);
      console.error('Raw error:', error);
      set({ isLoading: false });
      
      // Check for session expiration
      const errorMessage = error instanceof Error ? error.message.toLowerCase() : '';
      if (errorMessage.includes('invalid session') || errorMessage.includes('unauthorized')) {
        throw new Error('SESSION_EXPIRED');
      }
    }
  },

  createConversation: async (mode: AIMode, userId: string, personalityData?: { id: string; name: string; prompt: string }) => {
    const newConversation: Conversation = {
      _uid: userId,
      mode,
      title: personalityData ? `${personalityData.name} Chat` : 'New Conversation',
      messages: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...(personalityData && {
        personality_id: personalityData.id,
        personality_name: personalityData.name,
        system_prompt: personalityData.prompt
      })
    };

    try {
      // Add item to database
      await table.addItem('f3zvbk5a53pc', {
        ...newConversation,
        messages: JSON.stringify(newConversation.messages)
      });

      // Query back the most recent conversation for this user to get the auto-generated _id
      const response = await table.getItems('f3zvbk5a53pc', {
        query: { _uid: userId },
        sort: 'created_at',
        order: 'desc',
        limit: 1
      });

      if (!response.items || response.items.length === 0) {
        throw new Error('Failed to retrieve created conversation from database.');
      }

      // Safely parse messages with fallback
      let parsedMessages: Message[] = [];
      try {
        parsedMessages = JSON.parse(response.items[0].messages as string);
        if (!Array.isArray(parsedMessages)) {
          parsedMessages = [];
        }
      } catch (parseError) {
        console.error('Failed to parse newly created conversation messages:', parseError);
        parsedMessages = [];
      }

      const savedConversation = {
        ...response.items[0],
        messages: parsedMessages
      } as Conversation;

      set(state => ({
        conversations: [savedConversation, ...state.conversations],
        currentConversation: savedConversation
      }));
    } catch (error) {
      console.error('Failed to create conversation:', error);
      
      // Check for session expiration
      const errorMessage = error instanceof Error ? error.message.toLowerCase() : '';
      if (errorMessage.includes('invalid session') || errorMessage.includes('unauthorized') || errorMessage.includes('permission')) {
        throw new Error('SESSION_EXPIRED');
      }
      
      // Show user-friendly error
      throw new Error('Failed to create conversation: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  },

  selectConversation: (conversationId: string) => {
    const conversation = get().conversations.find(c => c._id === conversationId);
    if (conversation) {
      set({ currentConversation: conversation });
    }
  },

  sendMessage: async (content: string, userId: string, attachments?: FileAttachment[], useWebSearch?: boolean) => {
    const { currentConversation, webSearchEnabled } = get();
    if (!currentConversation) return;

    // Validate and sanitize content to prevent corruption
    if (!content || typeof content !== 'string') {
      throw new Error('Invalid message content');
    }

    const userMessage: Message = {
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
      attachments
    };

    // Update UI immediately with user message
    const updatedMessages = [...currentConversation.messages, userMessage];
    set(state => ({
      currentConversation: state.currentConversation ? {
        ...state.currentConversation,
        messages: updatedMessages
      } : null,
      isStreaming: true,
      streamingContent: ''
    }));

    try {
      // Perform web search if enabled
      let searchResults: SearchResult[] = [];
      let searchContext = '';
      
      if (useWebSearch !== false && (useWebSearch || webSearchEnabled)) {
        try {
          const searchResponse = await webSearch.search({ query: content });
          
          if (searchResponse.code === 200 && searchResponse.status === 20000 && searchResponse.data.length > 0) {
            searchResults = searchResponse.data.slice(0, 5).map(result => ({
              title: result.title,
              url: result.url,
              description: result.description
            }));
            
            // Build search context for AI
            searchContext = '\n\n[Real-time Web Search Results]:\n' + 
              searchResults.map((r, i) => 
                `${i + 1}. ${r.title}\n   ${r.description}\n   Source: ${r.url}`
              ).join('\n\n') +
              '\n\nPlease use these search results to provide accurate, up-to-date information in your response.\n';
            
            // Update user message with search results
            const messageIndex = updatedMessages.length - 1;
            updatedMessages[messageIndex] = {
              ...updatedMessages[messageIndex],
              searchResults,
              searchQuery: content
            };
            
            set(state => ({
              currentConversation: state.currentConversation ? {
                ...state.currentConversation,
                messages: updatedMessages
              } : null
            }));
          }
        } catch (searchError) {
          // Check for session expiration in search
          const searchErrorMsg = searchError instanceof Error ? searchError.message.toLowerCase() : '';
          if (searchErrorMsg.includes('invalid session') || searchErrorMsg.includes('unauthorized')) {
            throw new Error('SESSION_EXPIRED');
          }
          console.warn('Web search failed, continuing without search results:', searchError);
          // Continue without search if it fails
        }
      }
      
      // Prepare messages for AI - use custom prompt if available
      // For Ripley (diary) mode, generate advanced prompt with current context
      const systemPrompt = currentConversation.mode === 'diary' && !currentConversation.system_prompt
        ? getRipleyAdvancedPrompt({
            chicagoTime: new Date().toLocaleString('en-US', { timeZone: 'America/Chicago', hour12: false }),
            parisTime: new Date().toLocaleString('en-US', { timeZone: 'Europe/Paris', hour12: false }),
            conversationLength: updatedMessages.length
          })
        : currentConversation.system_prompt || getModeSystemPrompt(currentConversation.mode);
      
      // CONTEXT WINDOW OPTIMIZATION: Limit conversation history to reduce token usage
      // For long conversations, only send recent messages to AI while preserving full history in UI
      const CONTEXT_WINDOW_LIMIT = 20; // Last 20 messages (10 exchanges)
      const messagesToSend = updatedMessages.length > CONTEXT_WINDOW_LIMIT
        ? updatedMessages.slice(-CONTEXT_WINDOW_LIMIT)
        : updatedMessages;
      
      // Create summary of older messages for context continuity
      const conversationSummary = updatedMessages.length > CONTEXT_WINDOW_LIMIT
        ? createConversationSummary(updatedMessages, CONTEXT_WINDOW_LIMIT)
        : '';
      
      console.log(`[Credit Optimization] Conversation length: ${updatedMessages.length} messages, sending ${messagesToSend.length} to AI (${updatedMessages.length > CONTEXT_WINDOW_LIMIT ? 'TRIMMED with summary' : 'FULL'})`);
      
      const apiMessages = [
        { role: 'system' as const, content: systemPrompt },
        // Add conversation summary as first message if context was trimmed
        ...(conversationSummary ? [{ role: 'system' as const, content: conversationSummary }] : []),
        ...messagesToSend.map(m => {
          let messageContent = m.content;
          
          // Add file context to user messages with attachments
          if (m.role === 'user' && m.attachments && m.attachments.length > 0) {
            const fileInfo = m.attachments.map(f => 
              `[File: ${f.filename} (${f.type}, ${(f.size / 1024).toFixed(2)} KB)]`
            ).join('\n');
            messageContent = `${messageContent}\n\nAttached files:\n${fileInfo}\n\nNote: Please analyze or reference these files in your response.`;
          }
          
          // Add search context to the last user message
          if (m === updatedMessages[updatedMessages.length - 1] && searchContext) {
            messageContent = messageContent + searchContext;
          }
          
          return { 
            role: m.role as 'user' | 'assistant', 
            content: messageContent 
          };
        })
      ];

      // Choose AI provider: OpenRouter if key available, else DevvAI
      const openRouterKey = localStorage.getItem('openrouter_api_key');
      const useOpenRouter = openRouterKey && (currentConversation.mode === 'diary' || currentConversation.mode === 'riplay');
      
      const ai = useOpenRouter ? new OpenRouterAI() : new DevvAI();
      
      if (useOpenRouter) {
        console.log(`[OpenRouter] 🧠 Using OpenRouter AI for ${currentConversation.mode} mode with advanced model`);
      } else {
        console.log('[DevvAI] 🤖 Using built-in DevvAI (free model)');
      }
      
      // Stream AI response
      let fullResponse = '';
      
      try {
        // Adjust temperature based on mode for personality consistency
        // Ripley (diary) uses 0.9 for deep philosophical creativity and emotional authenticity
        const temperature = currentConversation.mode === 'diary' ? 0.9 : 
                          currentConversation.mode === 'riplay' ? 0.9 : 
                          0.7;
        
        // Ripley needs more tokens for philosophical depth
        const maxTokens = currentConversation.mode === 'diary' ? 3000 : 2000;
        
        const stream = await ai.chat.completions.create({
          model: 'default',
          messages: apiMessages,
          stream: true,
          max_tokens: maxTokens,
          temperature
        });

        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content || '';
          if (delta) {
            fullResponse += delta;
            set({ streamingContent: fullResponse });
          }
        }
      } catch (error) {
        // Check for session expiration
        const errorMessage = error instanceof Error ? error.message.toLowerCase() : '';
        if (errorMessage.includes('invalid session') || errorMessage.includes('unauthorized')) {
          throw new Error('SESSION_EXPIRED');
        }
        throw error;
      }



      // Add assistant message
      const assistantMessage: Message = {
        role: 'assistant',
        content: fullResponse,
        timestamp: Date.now()
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      
      // Validate all messages before saving to prevent corruption
      const validatedMessages = finalMessages.filter(msg => {
        if (!msg || typeof msg !== 'object') return false;
        if (!msg.role || typeof msg.content !== 'string') return false;
        if (msg.content.trim() === '') return false;
        return true;
      });
      
      // Generate title from first user message if needed
      const title = currentConversation.title === 'New Conversation' && validatedMessages.length > 0
        ? validatedMessages[0].content.slice(0, 50) + (validatedMessages[0].content.length > 50 ? '...' : '')
        : currentConversation.title;

      // Save to database with validated messages
      await table.updateItem('f3zvbk5a53pc', {
        _uid: userId,
        _id: currentConversation._id!,
        title,
        messages: JSON.stringify(validatedMessages),
        updated_at: new Date().toISOString()
      });

      // Update state with validated messages
      const updatedConversation = {
        ...currentConversation,
        title,
        messages: validatedMessages,
        updated_at: new Date().toISOString()
      };

      set(state => ({
        currentConversation: updatedConversation,
        conversations: state.conversations.map(c => 
          c._id === updatedConversation._id ? updatedConversation : c
        ),
        isStreaming: false,
        streamingContent: ''
      }));

    } catch (error) {
      console.error('Failed to send message:', error instanceof Error ? { message: error.message, name: error.name, stack: error.stack } : error);
      console.error('Raw error:', error);
      set({ isStreaming: false, streamingContent: '' });
      
      // Re-throw session expiration errors so HomePage can handle them
      if (error instanceof Error && error.message === 'SESSION_EXPIRED') {
        throw error;
      }
      
      // For other errors, show generic message
      throw new Error('Failed to send message: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  },

  deleteConversation: async (conversationId: string, userId: string) => {
    try {
      await table.deleteItem('f3zvbk5a53pc', {
        _uid: userId,
        _id: conversationId
      });

      set(state => ({
        conversations: state.conversations.filter(c => c._id !== conversationId),
        currentConversation: state.currentConversation?._id === conversationId 
          ? null 
          : state.currentConversation
      }));
    } catch (error) {
      console.error('Failed to delete conversation:', error instanceof Error ? { message: error.message, name: error.name, stack: error.stack } : error);
      console.error('Raw error:', error);
    }
  },

  clearCurrentConversation: () => {
    set({ currentConversation: null });
  },
  
  toggleWebSearch: () => {
    set(state => ({ webSearchEnabled: !state.webSearchEnabled }));
  }
}));
