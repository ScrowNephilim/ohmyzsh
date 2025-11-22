/**
 * Bystander Engine - Generates and manages AI bystanders in Chroma environments
 * Bystanders are temporary NPCs that can interact with voice, then disappear
 */

import { DevvAI } from '@devvai/devv-code-backend';
import { ttsEngine, BYSTANDER_ARCHETYPES, type BystanderProfile } from './tts-engine';
import type { ChromaMessage } from './chroma-types';

export interface Bystander {
  id: string;
  archetype: string; // bartender, student, cop, thug, drunk, etc.
  name: string; // Display name (e.g., "Bartender", "Young Woman", "Officer")
  voiceId: string;
  language: string;
  personality: string;
  appearanceChance: number; // 0-1, how likely to appear in this environment
  contextualTriggers: string[]; // Keywords that trigger appearance (e.g., ["bar", "drink"], ["police", "cop"])
  lastAppearance?: string; // ISO timestamp
}

export interface BystanderInteraction {
  bystander: Bystander;
  dialogue: string;
  shouldSpeak: boolean; // true = TTS, false = text only
}

// Environment-specific bystander pools
export const ENVIRONMENT_BYSTANDERS: Record<string, Bystander[]> = {
  street: [
    {
      id: 'street_cop_1',
      archetype: 'cop',
      name: 'Officer',
      voiceId: BYSTANDER_ARCHETYPES.cop.voiceId,
      language: 'en',
      personality: BYSTANDER_ARCHETYPES.cop.personality,
      appearanceChance: 0.05, // REDUCED - More environment narration instead
      contextualTriggers: ['police', 'cop', 'law', 'trouble', 'suspicious'],
    },
    {
      id: 'street_stranger_1',
      archetype: 'stranger',
      name: 'Passerby',
      voiceId: BYSTANDER_ARCHETYPES.stranger.voiceId,
      language: 'en',
      personality: BYSTANDER_ARCHETYPES.stranger.personality,
      appearanceChance: 0.08, // REDUCED
      contextualTriggers: ['stranger', 'person', 'someone', 'walk'],
    },
    {
      id: 'street_thug_1',
      archetype: 'thug',
      name: 'Thug',
      voiceId: BYSTANDER_ARCHETYPES.thug.voiceId,
      language: 'en',
      personality: BYSTANDER_ARCHETYPES.thug.personality,
      appearanceChance: 0.03, // REDUCED
      contextualTriggers: ['fight', 'gang', 'trouble', 'money'],
    },
  ],
  club: [
    {
      id: 'club_bartender_1',
      archetype: 'bartender',
      name: 'Bartender',
      voiceId: BYSTANDER_ARCHETYPES.bartender.voiceId,
      language: 'en',
      personality: BYSTANDER_ARCHETYPES.bartender.personality,
      appearanceChance: 0.1, // REDUCED - Less bystander chatter, more environment
      contextualTriggers: ['drink', 'bar', 'bartender', 'order', 'glass'],
    },
    {
      id: 'club_drunk_1',
      archetype: 'drunk',
      name: 'Drunk Patron',
      voiceId: BYSTANDER_ARCHETYPES.drunk.voiceId,
      language: 'en',
      personality: BYSTANDER_ARCHETYPES.drunk.personality,
      appearanceChance: 0.08, // REDUCED
      contextualTriggers: ['drunk', 'alcohol', 'party', 'dance'],
    },
    {
      id: 'club_stranger_1',
      archetype: 'stranger',
      name: 'Club-goer',
      voiceId: BYSTANDER_ARCHETYPES.stranger.voiceId,
      language: 'en',
      personality: BYSTANDER_ARCHETYPES.stranger.personality,
      appearanceChance: 0.2,
      contextualTriggers: ['dance', 'music', 'crowd'],
    },
  ],
  indoor: [
    {
      id: 'indoor_shopkeeper_1',
      archetype: 'shopkeeper',
      name: 'Shopkeeper',
      voiceId: BYSTANDER_ARCHETYPES.shopkeeper.voiceId,
      language: 'en',
      personality: BYSTANDER_ARCHETYPES.shopkeeper.personality,
      appearanceChance: 0.35,
      contextualTriggers: ['shop', 'store', 'buy', 'purchase', 'help'],
    },
    {
      id: 'indoor_student_1',
      archetype: 'student',
      name: 'Student',
      voiceId: BYSTANDER_ARCHETYPES.student.voiceId,
      language: 'en',
      personality: BYSTANDER_ARCHETYPES.student.personality,
      appearanceChance: 0.25,
      contextualTriggers: ['study', 'book', 'school', 'learn', 'read'],
    },
  ],
  outdoor: [
    {
      id: 'outdoor_stranger_1',
      archetype: 'stranger',
      name: 'Stranger',
      voiceId: BYSTANDER_ARCHETYPES.stranger.voiceId,
      language: 'en',
      personality: BYSTANDER_ARCHETYPES.stranger.personality,
      appearanceChance: 0.2,
      contextualTriggers: ['person', 'someone', 'stranger'],
    },
  ],
};

export class BystanderEngine {
  private activeBystandersInScene: Set<string> = new Set();
  private interactionCooldowns: Map<string, number> = new Map();
  
  /**
   * Determine if a bystander should appear based on context
   */
  shouldBystanderAppear(
    bystander: Bystander,
    userMessage: string,
    environmentType: string
  ): boolean {
    // Check cooldown (bystanders don't reappear immediately)
    const cooldown = this.interactionCooldowns.get(bystander.id);
    if (cooldown && Date.now() - cooldown < 60000) { // 1 minute cooldown
      return false;
    }

    // Check if already active in scene
    if (this.activeBystandersInScene.has(bystander.id)) {
      return false;
    }

    // Check contextual triggers
    const messageLower = userMessage.toLowerCase();
    const hasContextualMatch = bystander.contextualTriggers.some(trigger =>
      messageLower.includes(trigger.toLowerCase())
    );

    // Random appearance with higher chance if contextually relevant
    const baseChance = bystander.appearanceChance;
    const finalChance = hasContextualMatch ? baseChance * 2 : baseChance;
    
    return Math.random() < finalChance;
  }

  /**
   * Get available bystanders for an environment type
   */
  getBystandersForEnvironment(environmentType: string): Bystander[] {
    return ENVIRONMENT_BYSTANDERS[environmentType] || ENVIRONMENT_BYSTANDERS.outdoor;
  }

  /**
   * Generate bystander response using AI
   */
  async generateBystanderResponse(
    bystander: Bystander,
    userMessage: string,
    conversationContext: string
  ): Promise<string> {
    const ai = new DevvAI();

    const systemPrompt = `You are a ${bystander.archetype} named "${bystander.name}". ${bystander.personality}

This is a brief, spontaneous interaction in the Chroma environment. You're speaking out loud (voice), not typing. Keep responses SHORT (1-2 sentences max, under 40 words) and natural for spontaneous street/bar conversation.

Recent context:
${conversationContext}

Respond authentically as this character. Be brief, direct, and stay in character.`;

    try {
      const response = await ai.chat.completions.create({
        model: 'default',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.8,
        max_tokens: 100,
        stream: false
      });

      return response.choices[0].message.content || 'Hey.';
    } catch (error: any) {
      console.error('Bystander generation error:', error instanceof Error ? { message: error.message, name: error.name, stack: error.stack } : error);
      console.error('Raw error:', error);
      // Fallback generic responses
      const fallbacks = [
        "Yeah, whatever.",
        "Not my business.",
        "Can't help you there.",
        "Move along.",
        "What?",
      ];
      return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }
  }

  /**
   * Create a bystander interaction (dialogue + TTS)
   */
  async createBystanderInteraction(
    bystander: Bystander,
    userMessage: string,
    conversationContext: string,
    speechEnabled: boolean = true
  ): Promise<BystanderInteraction> {
    // Generate dialogue
    const dialogue = await this.generateBystanderResponse(
      bystander,
      userMessage,
      conversationContext
    );

    // Mark as active and set cooldown
    this.activeBystandersInScene.add(bystander.id);
    this.interactionCooldowns.set(bystander.id, Date.now());

    return {
      bystander,
      dialogue,
      shouldSpeak: speechEnabled,
    };
  }

  /**
   * Play bystander speech audio
   */
  async playBystanderSpeech(
    bystander: Bystander,
    dialogue: string,
    onEnd?: () => void
  ): Promise<void> {
    try {
      const audioUrl = await ttsEngine.generateBystanderSpeech(
        bystander.archetype,
        dialogue,
        bystander.language
      );
      
      await ttsEngine.playSpeech(audioUrl, () => {
        // Remove from active scene after speaking
        this.activeBystandersInScene.delete(bystander.id);
        if (onEnd) onEnd();
      });
    } catch (error: any) {
      console.error('Bystander speech error:', error instanceof Error ? { message: error.message, name: error.name, stack: error.stack } : error);
      console.error('Raw error:', error);
      this.activeBystandersInScene.delete(bystander.id);
      if (onEnd) onEnd();
    }
  }

  /**
   * Check if any bystanders should appear and interact
   */
  async checkForBystanderInteractions(
    environmentType: string,
    userMessage: string,
    conversationContext: string,
    speechEnabled: boolean
  ): Promise<BystanderInteraction | null> {
    const availableBystanders = this.getBystandersForEnvironment(environmentType);
    
    // Check each bystander for potential appearance
    for (const bystander of availableBystanders) {
      if (this.shouldBystanderAppear(bystander, userMessage, environmentType)) {
        return await this.createBystanderInteraction(
          bystander,
          userMessage,
          conversationContext,
          speechEnabled
        );
      }
    }

    return null;
  }

  /**
   * Remove bystander from active scene
   */
  removeBystanderFromScene(bystanderId: string): void {
    this.activeBystandersInScene.delete(bystanderId);
  }

  /**
   * Clear all active bystanders (when changing locations)
   */
  clearActiveScene(): void {
    this.activeBystandersInScene.clear();
  }

  /**
   * Get currently active bystanders in scene
   */
  getActiveBystandersInScene(): Set<string> {
    return new Set(this.activeBystandersInScene);
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    this.activeBystandersInScene.clear();
    this.interactionCooldowns.clear();
  }
}

// Singleton instance
export const bystanderEngine = new BystanderEngine();
