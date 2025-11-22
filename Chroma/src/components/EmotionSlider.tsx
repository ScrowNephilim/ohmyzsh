import React, { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Frown, 
  Heart, 
  Zap, 
  Battery, 
  Smile, 
  Users, 
  Lightbulb,
  Award,
  Sparkles,
  HelpCircle,
  Sun,
  Flame
} from 'lucide-react';

interface EmotionData {
  name: string;
  icon: React.ReactNode;
  color: string;
  descriptions: string[];
}

const emotions: EmotionData[] = [
  {
    name: 'Sad',
    icon: <Frown className="h-5 w-5" />,
    color: 'from-blue-500 to-indigo-600',
    descriptions: [
      'Neutral, content',
      'Fleeting shadow',
      'Wistful nostalgia',
      'A bit sad',
      'Noticeably low',
      'Tears close',
      'Deeply sad',
      'Heavy sadness',
      'Profound grief',
      'Collapsing',
      'Drowning in despair'
    ]
  },
  {
    name: 'Anxious',
    icon: <Zap className="h-5 w-5" />,
    color: 'from-yellow-500 to-orange-600',
    descriptions: [
      'Calm, at peace',
      'Tiny flutter',
      'Slightly on edge',
      'A bit anxious',
      'Thoughts racing',
      'Heart rate up',
      'Very anxious',
      'Walls closing in',
      'Severe anxiety',
      'Panic rising',
      'Full panic'
    ]
  },
  {
    name: 'Angry',
    icon: <Flame className="h-5 w-5" />,
    color: 'from-red-500 to-rose-600',
    descriptions: [
      'Peaceful',
      'Tiny spark',
      'Mildly irritated',
      'A bit frustrated',
      'Noticeably annoyed',
      'Angry, voice raising',
      'Very angry',
      'Rage building',
      'Furious',
      'Explosive rage',
      'Uncontrolled fury'
    ]
  },
  {
    name: 'Happy',
    icon: <Smile className="h-5 w-5" />,
    color: 'from-pink-500 to-rose-500',
    descriptions: [
      'Neutral',
      'Tiny spark of pleasure',
      'Slightly pleased',
      'A bit happy',
      'Noticeably cheerful',
      'Happy, smiling',
      'Very happy',
      'Joyful',
      'Deeply joyful',
      'Ecstatic',
      'Pure euphoria'
    ]
  },
  {
    name: 'Excited',
    icon: <Sparkles className="h-5 w-5" />,
    color: 'from-violet-500 to-purple-600',
    descriptions: [
      'Calm',
      'Faint anticipation',
      'Slightly intrigued',
      'A bit excited',
      'Noticeably energized',
      'Excited, buzzing',
      'Very excited',
      'Highly energized',
      'Intensely excited',
      'Overwhelmed with excitement',
      'Peak excitement'
    ]
  },
  {
    name: 'Lonely',
    icon: <Users className="h-5 w-5" />,
    color: 'from-slate-500 to-gray-600',
    descriptions: [
      'Connected, content',
      'Tiny wish',
      'Slightly lonely',
      'A bit lonely',
      'Noticeably isolated',
      'Lonely, aching',
      'Very lonely',
      'Deeply isolated',
      'Profound loneliness',
      'Devastating isolation',
      'Unbearable loneliness'
    ]
  },
  {
    name: 'Loved',
    icon: <Heart className="h-5 w-5" />,
    color: 'from-rose-400 to-pink-500',
    descriptions: [
      'Neutral',
      'Tiny warmth',
      'Slightly held',
      'A bit loved',
      'Noticeably connected',
      'Loved, safe',
      'Deeply loved',
      'Profoundly connected',
      'Overflowing with love',
      'Complete belonging',
      'Transcendent love'
    ]
  },
  {
    name: 'Hopeful',
    icon: <Lightbulb className="h-5 w-5" />,
    color: 'from-emerald-400 to-green-500',
    descriptions: [
      'Neutral',
      'Tiny glimmer',
      'Slightly hopeful',
      'A bit optimistic',
      'Noticeably hopeful',
      'Hopeful, trusting',
      'Very optimistic',
      'Deeply hopeful',
      'Radiating hope',
      'Unshakeable optimism',
      'Pure hope'
    ]
  },
  {
    name: 'Exhausted',
    icon: <Battery className="h-5 w-5" />,
    color: 'from-amber-600 to-orange-700',
    descriptions: [
      'Energized, rested',
      'Barely tired',
      'Slightly weary',
      'A bit tired',
      'Noticeably drained',
      'Exhausted',
      'Very exhausted',
      'Deeply drained',
      'Severely exhausted',
      'Collapsing',
      'Complete depletion'
    ]
  },
  {
    name: 'Proud',
    icon: <Award className="h-5 w-5" />,
    color: 'from-yellow-400 to-amber-500',
    descriptions: [
      'Neutral',
      'Tiny satisfaction',
      'Slightly pleased',
      'A bit proud',
      'Noticeably accomplished',
      'Proud, celebrating',
      'Very proud',
      'Deeply proud',
      'Intensely accomplished',
      'Overflowing with pride',
      'Peak achievement'
    ]
  },
  {
    name: 'Confused',
    icon: <HelpCircle className="h-5 w-5" />,
    color: 'from-cyan-500 to-blue-600',
    descriptions: [
      'Clear, certain',
      'Tiny question',
      'Slightly puzzled',
      'A bit confused',
      'Noticeably uncertain',
      'Confused, lost',
      'Very confused',
      'Deeply uncertain',
      'Severely confused',
      'Lost in confusion',
      'Complete disorientation'
    ]
  },
  {
    name: 'Peaceful',
    icon: <Sun className="h-5 w-5" />,
    color: 'from-sky-400 to-cyan-500',
    descriptions: [
      'Neutral',
      'Tiny stillness',
      'Slightly calm',
      'A bit peaceful',
      'Noticeably serene',
      'Peaceful, quiet',
      'Very peaceful',
      'Deeply serene',
      'Transcendent peace',
      'Complete serenity',
      'Pure peace'
    ]
  }
];

interface EmotionSliderProps {
  onEmotionSelect?: (emotions: Record<string, number>) => void;
  compact?: boolean;
}

export default function EmotionSlider({ onEmotionSelect, compact = false }: EmotionSliderProps) {
  const [selectedEmotions, setSelectedEmotions] = useState<Record<string, number>>({});
  const [expandedEmotion, setExpandedEmotion] = useState<string | null>(null);

  const handleSliderChange = (emotionName: string, value: number[]) => {
    const newValue = value[0];
    const newEmotions = { ...selectedEmotions, [emotionName]: newValue };
    setSelectedEmotions(newEmotions);
    
    if (onEmotionSelect) {
      onEmotionSelect(newEmotions);
    }
  };

  const getDescription = (emotion: EmotionData, value: number): string => {
    const index = Math.round(value * 10);
    return emotion.descriptions[index] || emotion.descriptions[0];
  };

  const getActiveEmotions = () => {
    return Object.entries(selectedEmotions)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => {
        const emotion = emotions.find(e => e.name === name);
        return { name, value, emotion };
      });
  };

  const clearAll = () => {
    setSelectedEmotions({});
    if (onEmotionSelect) {
      onEmotionSelect({});
    }
  };

  const activeEmotions = getActiveEmotions();

  if (compact && activeEmotions.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-2">
        No emotions tracked yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary of active emotions */}
      {activeEmotions.length > 0 && (
        <Card className="p-4 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-warm-gradient">
              Current Emotional State
            </h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearAll}
              className="h-7 text-xs hover-lift"
            >
              Clear All
            </Button>
          </div>
          <div className="space-y-2">
            {activeEmotions.map(({ name, value, emotion }) => (
              <div key={name} className="flex items-center gap-3">
                <div className={`p-1.5 rounded-lg bg-gradient-to-br ${emotion?.color} text-white`}>
                  {emotion?.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium text-sm">{name}</span>
                    <span className="text-xs text-muted-foreground">
                      {value.toFixed(1)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {emotion && getDescription(emotion, value)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Emotion sliders */}
      {!compact && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-warm-gradient mb-2">
            How are you feeling? Rate your emotions:
          </h3>
          <div className="grid gap-4">
            {emotions.map((emotion) => {
              const value = selectedEmotions[emotion.name] || 0;
              const isExpanded = expandedEmotion === emotion.name;
              const isActive = value > 0;

              return (
                <Card 
                  key={emotion.name} 
                  className={`p-4 transition-all duration-300 ${
                    isActive 
                      ? 'border-primary/40 bg-gradient-to-br from-primary/5 to-secondary/5 shadow-md' 
                      : 'hover:border-primary/20'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${emotion.color} text-white transition-transform hover-lift`}>
                        {emotion.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2 mb-1">
                          <h4 className="font-semibold text-sm">{emotion.name}</h4>
                          {isActive && (
                            <span className="text-xs font-medium text-primary">
                              {value.toFixed(1)}
                            </span>
                          )}
                        </div>
                        {isActive && (
                          <p className="text-xs text-muted-foreground">
                            {getDescription(emotion, value)}
                          </p>
                        )}
                      </div>
                    </div>

                    <Slider
                      value={[value]}
                      onValueChange={(val) => handleSliderChange(emotion.name, val)}
                      max={1}
                      step={0.1}
                      className="cursor-pointer"
                    />

                    {isActive && (
                      <div className="pt-2 border-t border-primary/10">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedEmotion(isExpanded ? null : emotion.name)}
                          className="h-7 text-xs w-full justify-start hover:bg-primary/5"
                        >
                          {isExpanded ? '▼' : '▶'} See intensity scale
                        </Button>
                        
                        {isExpanded && (
                          <div className="mt-2 space-y-1 text-xs text-muted-foreground animate-in fade-in slide-in-from-top-2">
                            {emotion.descriptions.map((desc, idx) => (
                              <div 
                                key={idx} 
                                className={`py-1 px-2 rounded ${
                                  Math.round(value * 10) === idx 
                                    ? 'bg-primary/10 text-primary font-medium' 
                                    : ''
                                }`}
                              >
                                <span className="font-mono">{(idx / 10).toFixed(1)}</span> - {desc}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Usage tip */}
      {!compact && activeEmotions.length === 0 && (
        <Card className="p-4 bg-gradient-to-br from-secondary/5 to-primary/5 border-dashed">
          <p className="text-sm text-muted-foreground text-center">
            💭 <span className="font-medium">Slide to rate your emotions</span> from 0.0 (not present) to 1.0 (maximum intensity). 
            <br />
            <span className="text-xs mt-1 block">
              This helps you and your AI companion understand your emotional state with precision.
            </span>
          </p>
        </Card>
      )}
    </div>
  );
}
