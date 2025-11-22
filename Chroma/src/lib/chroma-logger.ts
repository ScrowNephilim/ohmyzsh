/**
 * Automated Chroma Logger - Logs interactions to Ripl(a)y's diary automatically
 * Token-efficient summaries of Chroma sessions
 */

import { table } from '@devvai/devv-code-backend';
import type { ChromaMessage } from './chroma-types';

// Table ID
const RIPLAY_MASTERFILES_TABLE = 'f44s2urbc5xc';

export interface ChromaLogEntry {
  timestamp: string;
  location: string;
  participants: string[];
  messageCount: number;
  summary: string;
  notableEvents: string[];
  emotionalTone: string;
}

class ChromaLogger {
  // Generate token-efficient summary of Chroma session
  generateSummary(messages: ChromaMessage[], location: string, duration: number): ChromaLogEntry {
    const participants = [...new Set(messages.map(m => m.speaker).filter(s => s !== 'Environment'))];
    const notableEvents: string[] = [];
    
    // Extract action messages (power activations, environment changes)
    messages.forEach(msg => {
      if (msg.is_action && msg.content.includes('*')) {
        const event = msg.content.replace(/\*/g, '').trim();
        if (event.length < 100) {
          notableEvents.push(event);
        }
      }
    });

    // Detect emotional tone from message content
    const allContent = messages.map(m => m.content.toLowerCase()).join(' ');
    let emotionalTone = 'neutral';
    
    if (allContent.match(/\b(love|joy|happy|delight|wonderful)\b/)) emotionalTone = 'positive';
    else if (allContent.match(/\b(sad|pain|hurt|difficult|struggle)\b/)) emotionalTone = 'melancholic';
    else if (allContent.match(/\b(curious|wonder|discover|explore)\b/)) emotionalTone = 'exploratory';
    else if (allContent.match(/\b(think|philosophy|différance|being)\b/)) emotionalTone = 'philosophical';

    // Create compact summary (50-100 tokens)
    const summary = this.createCompactSummary(messages, participants, notableEvents);

    return {
      timestamp: new Date().toISOString(),
      location,
      participants,
      messageCount: messages.length,
      summary,
      notableEvents: notableEvents.slice(0, 3), // Max 3 events
      emotionalTone
    };
  }

  // Create very compact summary
  private createCompactSummary(messages: ChromaMessage[], participants: string[], events: string[]): string {
    const participantList = participants.join(', ');
    const messageCount = messages.length;
    
    // Extract key themes from messages
    const themes: string[] = [];
    const allText = messages.map(m => m.content).join(' ').toLowerCase();
    
    if (allText.includes('philosophy') || allText.includes('différance')) themes.push('philosophical dialogue');
    if (allText.includes('power') || allText.includes('reality')) themes.push('reality manipulation');
    if (events.length > 0) themes.push('environment shifts');
    if (participants.length > 2) themes.push('multi-agent interaction');

    const themeStr = themes.length > 0 ? `. ${themes.join(', ')}` : '';
    const eventStr = events.length > 0 ? `. Notable: ${events[0]}` : '';

    return `${messageCount} msg exchange w/ ${participantList}${themeStr}${eventStr}`;
  }

  // Append log entry to master file's chroma_references field
  async logToMasterFile(logEntry: ChromaLogEntry, interactionId: string): Promise<void> {
    try {
      // Get current master file (status = 'current')
      const result = await table.getItems(RIPLAY_MASTERFILES_TABLE, {
        query: { status: 'current' }
      });

      if (result.items.length === 0) {
        console.log('No current master file found, skipping Chroma log');
        return;
      }

      const masterFile = result.items[0];
      const chromaRefs = masterFile.chroma_references 
        ? JSON.parse(masterFile.chroma_references) 
        : [];

      // Add new log entry
      chromaRefs.push({
        interaction_id: interactionId,
        ...logEntry
      });

      // Keep only last 20 sessions (token limit management)
      const recentRefs = chromaRefs.slice(-20);

      // Update master file
      await table.updateItem(RIPLAY_MASTERFILES_TABLE, {
        _id: masterFile._id,
        chroma_references: JSON.stringify(recentRefs)
      });

      console.log(`📝 Logged Chroma session to master file: ${logEntry.summary}`);
    } catch (error) {
      console.error('Error logging to master file:', error instanceof Error ? { message: error.message, name: error.name, stack: error.stack } : error);
    console.error('Raw error:', error);
      // Don't throw - logging shouldn't break the session
    }
  }

  // Format log entry for display in diary
  formatForDiary(logEntry: ChromaLogEntry): string {
    const date = new Date(logEntry.timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `[${date}] ${logEntry.location} - ${logEntry.summary} (${logEntry.emotionalTone})`;
  }

  // Determine if session should be logged (min 3 messages, exclude very short)
  shouldLogSession(messages: ChromaMessage[]): boolean {
    const userMessages = messages.filter(m => m.speaker === 'Ulysses').length;
    const nephilimMessages = messages.filter(m => m.speaker !== 'Ulysses' && m.speaker !== 'Environment').length;
    
    // Log if at least 3 user messages and 2 Nephilim responses
    return userMessages >= 3 && nephilimMessages >= 2;
  }
}

export const chromaLogger = new ChromaLogger();
