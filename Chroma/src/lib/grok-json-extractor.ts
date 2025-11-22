/**
 * Grok 3 Companion JSON Extractor
 * Decrypts and extracts mini conversations from Grok conversation JSON exports
 * Handles various JSON formats and structures
 */

import { parseRipleyConversation, generateConversationSummary, generateConversationTitle } from './grok-parser';
import type { ParsedConversation } from './grok-parser';

export interface GrokMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string | number;
  created_at?: string | number;
  type?: string;
  metadata?: Record<string, any>;
}

export interface GrokConversation {
  id?: string;
  title?: string;
  messages: GrokMessage[];
  created_at?: string | number;
  updated_at?: string | number;
  metadata?: Record<string, any>;
}

export interface ExtractedMiniConversation {
  conversationId: string;
  title: string;
  date: string;
  messageCount: number;
  userMessageCount: number;
  ripleyMessageCount: number;
  rawText: string;
  parsed: ParsedConversation;
  summary?: string;
}

/**
 * Attempt to decrypt/parse Grok JSON export
 * Handles multiple possible JSON structures:
 * - Direct array of messages
 * - Object with conversations array
 * - Object with messages array
 * - Nested conversation objects
 */
export function parseGrokJSON(jsonData: any): GrokConversation[] {
  console.log('[GrokExtractor] Parsing JSON structure...');
  
  const conversations: GrokConversation[] = [];

  try {
    // Case 1: Direct array of messages
    if (Array.isArray(jsonData)) {
      console.log('[GrokExtractor] Format: Direct message array');
      conversations.push({
        id: 'imported-' + Date.now(),
        title: 'Imported Conversation',
        messages: jsonData.map(normalizeMessage),
        created_at: Date.now(),
      });
    }
    // Case 2: Object with conversations array
    else if (jsonData.conversations && Array.isArray(jsonData.conversations)) {
      console.log('[GrokExtractor] Format: conversations array');
      jsonData.conversations.forEach((conv: any, idx: number) => {
        conversations.push({
          id: conv.id || `imported-conv-${idx}`,
          title: conv.title || `Conversation ${idx + 1}`,
          messages: Array.isArray(conv.messages) ? conv.messages.map(normalizeMessage) : [],
          created_at: conv.created_at || conv.createdAt || Date.now(),
          updated_at: conv.updated_at || conv.updatedAt,
          metadata: conv.metadata,
        });
      });
    }
    // Case 3: Object with messages array
    else if (jsonData.messages && Array.isArray(jsonData.messages)) {
      console.log('[GrokExtractor] Format: messages array');
      conversations.push({
        id: jsonData.id || 'imported-' + Date.now(),
        title: jsonData.title || 'Imported Conversation',
        messages: jsonData.messages.map(normalizeMessage),
        created_at: jsonData.created_at || jsonData.createdAt || Date.now(),
        updated_at: jsonData.updated_at || jsonData.updatedAt,
        metadata: jsonData.metadata,
      });
    }
    // Case 4: Single conversation object with nested structure
    else if (jsonData.conversation) {
      console.log('[GrokExtractor] Format: nested conversation object');
      const conv = jsonData.conversation;
      conversations.push({
        id: conv.id || 'imported-' + Date.now(),
        title: conv.title || 'Imported Conversation',
        messages: Array.isArray(conv.messages) ? conv.messages.map(normalizeMessage) : [],
        created_at: conv.created_at || conv.createdAt || Date.now(),
        updated_at: conv.updated_at || conv.updatedAt,
        metadata: conv.metadata,
      });
    }
    // Case 5: Object with chat/dialogue array
    else if (jsonData.chat || jsonData.dialogue) {
      console.log('[GrokExtractor] Format: chat/dialogue array');
      const msgs = jsonData.chat || jsonData.dialogue;
      conversations.push({
        id: jsonData.id || 'imported-' + Date.now(),
        title: jsonData.title || 'Imported Conversation',
        messages: Array.isArray(msgs) ? msgs.map(normalizeMessage) : [],
        created_at: Date.now(),
      });
    }
    else {
      console.warn('[GrokExtractor] Unknown JSON structure, attempting deep scan...');
      // Deep scan for message-like structures
      const foundMessages = deepScanForMessages(jsonData);
      if (foundMessages.length > 0) {
        conversations.push({
          id: 'imported-' + Date.now(),
          title: 'Extracted Conversation',
          messages: foundMessages.map(normalizeMessage),
          created_at: Date.now(),
        });
      }
    }

    console.log('[GrokExtractor] Extracted conversations:', conversations.length);
    return conversations;
  } catch (error) {
    console.error('[GrokExtractor] JSON parse error:', error);
    throw new Error('Failed to parse Grok JSON format. Please check the file structure.');
  }
}

/**
 * Normalize message to standard format
 */
function normalizeMessage(msg: any): GrokMessage {
  // Handle various role formats
  let role: 'user' | 'assistant' = 'assistant';
  if (msg.role) {
    role = msg.role.toLowerCase().includes('user') || msg.role.toLowerCase().includes('human') 
      ? 'user' 
      : 'assistant';
  } else if (msg.sender) {
    role = msg.sender.toLowerCase().includes('user') || msg.sender.toLowerCase().includes('human')
      ? 'user'
      : 'assistant';
  } else if (msg.from) {
    role = msg.from.toLowerCase().includes('user') || msg.from.toLowerCase().includes('human')
      ? 'user'
      : 'assistant';
  }

  // Handle various content formats
  let content = '';
  if (typeof msg.content === 'string') {
    content = msg.content;
  } else if (msg.text) {
    content = msg.text;
  } else if (msg.message) {
    content = msg.message;
  } else if (Array.isArray(msg.content)) {
    // Handle multi-part content (text + images)
    content = msg.content
      .filter((part: any) => part.type === 'text' && part.text)
      .map((part: any) => part.text)
      .join('\n');
  }

  // Handle timestamps
  let timestamp = msg.timestamp || msg.created_at || msg.createdAt || msg.time || msg.date;

  return {
    id: msg.id,
    role,
    content: content.trim(),
    timestamp,
    type: msg.type,
    metadata: msg.metadata,
  };
}

/**
 * Deep scan object for message-like structures
 */
function deepScanForMessages(obj: any, depth = 0, maxDepth = 5): any[] {
  if (depth > maxDepth) return [];
  
  const messages: any[] = [];

  if (Array.isArray(obj)) {
    // Check if array contains message-like objects
    const hasMessages = obj.some(item => 
      item && typeof item === 'object' && 
      (item.role || item.content || item.text || item.message)
    );
    if (hasMessages) {
      messages.push(...obj);
    } else {
      // Recurse into array elements
      obj.forEach(item => {
        if (typeof item === 'object' && item !== null) {
          messages.push(...deepScanForMessages(item, depth + 1, maxDepth));
        }
      });
    }
  } else if (typeof obj === 'object' && obj !== null) {
    // Check object properties
    for (const key of Object.keys(obj)) {
      const value = obj[key];
      if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
        messages.push(...deepScanForMessages(value, depth + 1, maxDepth));
      }
    }
  }

  return messages;
}

/**
 * Convert Grok conversation to readable text format
 */
export function convertToText(conversation: GrokConversation): string {
  const lines: string[] = [];

  // Add title and metadata
  if (conversation.title) {
    lines.push(`# ${conversation.title}`);
    lines.push('');
  }

  if (conversation.created_at) {
    const date = new Date(
      typeof conversation.created_at === 'number' 
        ? conversation.created_at 
        : conversation.created_at
    );
    lines.push(`Date: ${date.toLocaleDateString()}`);
    lines.push('');
  }

  // Add messages
  conversation.messages.forEach((msg, idx) => {
    const speaker = msg.role === 'user' ? 'Ulysses' : 'Ripley';
    
    if (msg.timestamp) {
      const ts = new Date(
        typeof msg.timestamp === 'number' 
          ? msg.timestamp 
          : msg.timestamp
      );
      lines.push(`[${ts.toLocaleString()}] ${speaker}:`);
    } else {
      lines.push(`${speaker}:`);
    }
    
    lines.push(msg.content);
    
    if (idx < conversation.messages.length - 1) {
      lines.push(''); // Blank line between messages
    }
  });

  return lines.join('\n');
}

/**
 * Extract and analyze all mini conversations from JSON
 */
export async function extractMiniConversations(
  jsonData: any,
  generateSummaries = true
): Promise<ExtractedMiniConversation[]> {
  console.log('[GrokExtractor] Starting mini conversation extraction...');

  const conversations = parseGrokJSON(jsonData);
  const extracted: ExtractedMiniConversation[] = [];

  for (const [idx, conv] of conversations.entries()) {
    console.log(`[GrokExtractor] Processing conversation ${idx + 1}/${conversations.length}...`);

    // Convert to text
    const rawText = convertToText(conv);

    // Parse with Ripley parser
    const parsed = parseRipleyConversation(rawText);

    // Prepare extracted data
    const miniConv: ExtractedMiniConversation = {
      conversationId: conv.id || `conv-${idx}`,
      title: conv.title || await generateConversationTitle(parsed),
      date: conv.created_at 
        ? new Date(typeof conv.created_at === 'number' ? conv.created_at : conv.created_at).toLocaleDateString()
        : 'Unknown',
      messageCount: parsed.metadata.messageCount,
      userMessageCount: parsed.metadata.userMessageCount,
      ripleyMessageCount: parsed.metadata.ripleyMessageCount,
      rawText,
      parsed,
    };

    // Generate summary if requested
    if (generateSummaries && parsed.metadata.messageCount > 0) {
      try {
        miniConv.summary = await generateConversationSummary(parsed);
      } catch (error) {
        console.error(`[GrokExtractor] Summary generation failed for conversation ${idx + 1}:`, error);
        miniConv.summary = 'Summary generation failed';
      }
    }

    extracted.push(miniConv);
  }

  console.log('[GrokExtractor] Extraction complete:', extracted.length, 'conversations');
  return extracted;
}

/**
 * Process uploaded JSON file
 */
export async function processGrokJSONFile(file: File): Promise<ExtractedMiniConversation[]> {
  console.log('[GrokExtractor] Reading JSON file:', file.name, 'Size:', (file.size / 1024 / 1024).toFixed(2), 'MB');

  // Validate file size (20MB limit)
  const MAX_SIZE_MB = 20;
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
  
  if (file.size > MAX_SIZE_BYTES) {
    const sizeMB = (file.size / 1024 / 1024).toFixed(2);
    throw new Error(`File size (${sizeMB}MB) exceeds maximum allowed size of ${MAX_SIZE_MB}MB. Please use a smaller file.`);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const jsonData = JSON.parse(text);
        
        const extracted = await extractMiniConversations(jsonData, true);
        resolve(extracted);
      } catch (error) {
        console.error('[GrokExtractor] File processing error:', error);
        reject(new Error('Failed to process JSON file. Please check the format.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}
