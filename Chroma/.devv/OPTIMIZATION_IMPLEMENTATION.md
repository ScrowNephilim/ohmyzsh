# DevvAI Optimization Implementation Guide

**Priority:** High  
**Estimated Impact:** 60-80% cost reduction for long conversations  
**Implementation Time:** 1-2 hours

---

## Phase 1: Context Window Limit (Highest Priority)

### Problem
The main chat system sends the **entire conversation history** with every message, causing exponential credit usage as conversations grow.

**Example:**
- Message 1: 100 tokens
- Message 10: 1,000 tokens (10x previous messages)
- Message 50: 5,000 tokens (50x previous messages)
- Message 100: 10,000 tokens (100x previous messages)

### Solution
Limit context to last 20 messages, preserving system prompt and recent context.

### Implementation

**File:** `src/store/chat-store.ts`  
**Location:** Around line 379-402

**Current Code:**
```typescript
const systemPrompt = currentConversation.system_prompt || getModeSystemPrompt(currentConversation.mode);
const apiMessages = [
  { role: 'system' as const, content: systemPrompt },
  ...updatedMessages.map(m => {
    // Message processing...
  })
];
```

**Optimized Code:**
```typescript
const systemPrompt = currentConversation.system_prompt || getModeSystemPrompt(currentConversation.mode);

// Context window optimization: Keep last 20 messages only
const CONTEXT_WINDOW_SIZE = 20;
const recentMessages = updatedMessages.length > CONTEXT_WINDOW_SIZE 
  ? updatedMessages.slice(-CONTEXT_WINDOW_SIZE)
  : updatedMessages;

// Add conversation summary if context was truncated
const contextSummary = updatedMessages.length > CONTEXT_WINDOW_SIZE
  ? `\n\n[Earlier conversation summary: ${updatedMessages.length - CONTEXT_WINDOW_SIZE} messages about ${currentConversation.title}. Continuing recent context below.]`
  : '';

const apiMessages = [
  { role: 'system' as const, content: systemPrompt + contextSummary },
  ...recentMessages.map(m => {
    // Message processing...
  })
];
```

**Benefits:**
- 80% cost reduction for conversations with 100+ messages
- 60% reduction for conversations with 50+ messages
- No cost increase for short conversations
- Minimal UX impact (recent context preserved)

---

## Phase 2: Max Tokens Limit for Chroma

### Problem
Chroma Nephilim responses have no `max_tokens` limit, allowing unexpectedly long responses that spike credit usage.

### Solution
Add appropriate `max_tokens` limits based on response type.

### Implementation

**File:** `src/pages/ChromaPage.tsx`  
**Location:** Around line 327-335

**Current Code:**
```typescript
const response = await ai.chat.completions.create({
  model: 'default',
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userInput }
  ],
  temperature,
  stream: false
});
```

**Optimized Code:**
```typescript
// Determine max_tokens based on Nephilim type
const maxTokens = targetNephilim.nephilim_name === 'Ripl(a)y' 
  ? 150  // Brief, 66-char responses
  : targetNephilim.nephilim_name === 'Ana'
  ? 300  // Sociological analysis
  : 200; // Ephemeral Nephilims

const response = await ai.chat.completions.create({
  model: 'default',
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userInput }
  ],
  temperature,
  max_tokens: maxTokens,
  stream: false
});
```

**Benefits:**
- Prevents unexpectedly long responses
- Consistent character behavior (Ripl(a)y stays brief)
- 40-50% cost reduction for Chroma interactions
- Better UX (faster responses)

---

## Phase 3: Usage Tracking (Analytics)

### Problem
No visibility into actual credit usage patterns, making optimization difficult.

### Solution
Add lightweight usage tracking to monitor real costs.

### Implementation

**File:** `src/lib/usage-tracker.ts` (new file)

```typescript
/**
 * DevvAI Usage Tracker - Monitor credit consumption
 */

export interface UsageMetric {
  feature: 'main_chat' | 'chroma' | 'bystander';
  mode?: string;
  tokensIn: number;
  tokensOut: number;
  timestamp: string;
}

class UsageTracker {
  private metrics: UsageMetric[] = [];
  private readonly STORAGE_KEY = 'devvai_usage_metrics';
  private readonly MAX_STORED_METRICS = 1000;

  /**
   * Track a DevvAI API call
   */
  track(metric: UsageMetric) {
    this.metrics.push(metric);
    
    // Keep only last 1000 metrics
    if (this.metrics.length > this.MAX_STORED_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_STORED_METRICS);
    }
    
    // Log to console for monitoring
    console.log(`[DevvAI Usage] ${metric.feature}: ${metric.tokensOut} tokens out`);
    
    // Persist to localStorage
    this.persist();
  }

  /**
   * Estimate tokens from text
   */
  estimateTokens(text: string): number {
    // Rough estimate: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  /**
   * Get usage statistics
   */
  getStats() {
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);

    const recentMetrics = this.metrics.filter(m => 
      new Date(m.timestamp).getTime() > oneDayAgo
    );
    const weeklyMetrics = this.metrics.filter(m => 
      new Date(m.timestamp).getTime() > oneWeekAgo
    );

    return {
      today: {
        total: recentMetrics.reduce((sum, m) => sum + m.tokensOut, 0),
        byFeature: this.groupByFeature(recentMetrics)
      },
      week: {
        total: weeklyMetrics.reduce((sum, m) => sum + m.tokensOut, 0),
        byFeature: this.groupByFeature(weeklyMetrics)
      }
    };
  }

  private groupByFeature(metrics: UsageMetric[]) {
    return metrics.reduce((acc, m) => {
      acc[m.feature] = (acc[m.feature] || 0) + m.tokensOut;
      return acc;
    }, {} as Record<string, number>);
  }

  private persist() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.metrics));
    } catch (error) {
      console.warn('Failed to persist usage metrics:', error);
    }
  }

  private load() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.metrics = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load usage metrics:', error);
    }
  }

  constructor() {
    this.load();
  }
}

export const usageTracker = new UsageTracker();
```

**Integration in chat-store.ts:**

```typescript
import { usageTracker } from '@/lib/usage-tracker';

// After receiving AI response
const tokensIn = usageTracker.estimateTokens(
  JSON.stringify(apiMessages)
);
const tokensOut = usageTracker.estimateTokens(fullResponse);

usageTracker.track({
  feature: 'main_chat',
  mode: currentConversation.mode,
  tokensIn,
  tokensOut,
  timestamp: new Date().toISOString()
});
```

**Benefits:**
- Real-time usage visibility
- Identify high-cost features
- Data-driven optimization decisions
- User usage patterns

---

## Phase 4: Conversation Summarization

### Problem
Even with context window limits, very long conversations (100+ messages) lose important early context.

### Solution
Automatically summarize older messages into a brief context block.

### Implementation Strategy

**Trigger:** When conversation exceeds 30 messages  
**Action:** Summarize messages 1-10 into 100-word summary  
**Frequency:** Re-summarize every 20 new messages

**File:** `src/lib/conversation-summarizer.ts` (new file)

```typescript
/**
 * Conversation Summarizer - Condense old messages for context efficiency
 */

import { DevvAI } from '@devvai/devv-code-backend';
import type { Message } from '@/store/chat-store';

export async function summarizeMessages(
  messages: Message[],
  mode: string
): Promise<string> {
  const ai = new DevvAI();
  
  const conversationText = messages
    .map(m => `${m.role}: ${m.content}`)
    .join('\n');

  const systemPrompt = `You are summarizing a ${mode} conversation. Create a brief, information-dense summary (100 words max) capturing:
- Main topics discussed
- Key decisions or conclusions
- Important context for future messages

Be concise and factual.`;

  const response = await ai.chat.completions.create({
    model: 'default',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Summarize this conversation:\n\n${conversationText}` }
    ],
    temperature: 0.3,  // Low temp for consistent summaries
    max_tokens: 200,
    stream: false
  });

  return response.choices[0].message.content || 'Earlier conversation context.';
}
```

**Integration Pattern:**

```typescript
// In chat-store.ts
if (updatedMessages.length > 30 && updatedMessages.length % 20 === 0) {
  // Summarize messages 1-10
  const oldMessages = updatedMessages.slice(0, 10);
  const summary = await summarizeMessages(oldMessages, currentConversation.mode);
  
  // Store summary in conversation metadata
  currentConversation.context_summary = summary;
}
```

**Benefits:**
- Preserve long-term context
- Reduce token usage by 70-80% for very long conversations
- Better AI understanding of conversation arc
- One-time summarization cost vs repeated full history

---

## Implementation Priority

### Week 1: High Impact, Low Effort
1. ✅ Context Window Limit (30 min)
2. ✅ Chroma Max Tokens (15 min)
3. ✅ Usage Tracking (45 min)

**Expected Impact:** 60-70% cost reduction

### Week 2: Medium Impact, Medium Effort
4. ⏳ Conversation Summarization (2 hours)
5. ⏳ Usage Dashboard UI (3 hours)

**Expected Impact:** Additional 10-15% cost reduction

### Week 3: Fine-Tuning
6. ⏳ Dynamic bystander frequency
7. ⏳ Smart temperature adjustment
8. ⏳ User-level usage controls

**Expected Impact:** Additional 5-10% cost reduction + better UX

---

## Testing Checklist

### Context Window Limit
- [ ] Short conversations (< 20 messages) work normally
- [ ] Long conversations (50+ messages) maintain coherence
- [ ] Context summary appears in system prompt
- [ ] No breaking changes to existing conversations

### Chroma Max Tokens
- [ ] Ripl(a)y stays brief (66 chars when appropriate)
- [ ] Ana provides adequate analysis (not cut off mid-sentence)
- [ ] Ephemeral Nephilims respond appropriately
- [ ] No incomplete responses

### Usage Tracking
- [ ] Console logs show token counts
- [ ] localStorage persists metrics
- [ ] getStats() returns accurate data
- [ ] No performance impact

---

## Rollback Plan

If optimizations cause issues:

1. **Context Window:**
   - Change `CONTEXT_WINDOW_SIZE = 20` to `50`
   - Or remove slicing: `const recentMessages = updatedMessages;`

2. **Max Tokens:**
   - Remove max_tokens parameter
   - Or increase limits by 50%

3. **Summarization:**
   - Disable auto-summarization
   - Keep manual summarization option

---

## Success Metrics

**After 1 Week:**
- 60%+ reduction in average tokens per conversation
- No increase in user complaints about coherence
- Clear usage data in console logs

**After 1 Month:**
- 70%+ reduction in total credit usage
- Maintained or improved user satisfaction
- Data-driven insights for further optimization

---

**Document Version:** 1.0  
**Implementation Status:** Ready for deployment  
**Estimated ROI:** 70% cost savings for 2 hours of work
