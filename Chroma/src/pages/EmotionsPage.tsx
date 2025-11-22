import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import EmotionSlider from '@/components/EmotionSlider';
import { useToast } from '@/hooks/use-toast';
import { useChatStore } from '@/store/chat-store';

export default function EmotionsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createConversation } = useChatStore();
  const [currentEmotions, setCurrentEmotions] = useState<Record<string, number>>({});

  const handleExportEmotions = () => {
    const activeEmotions = Object.entries(currentEmotions)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => `${name}: ${value.toFixed(1)}`)
      .join('\n');

    if (activeEmotions.length === 0) {
      toast({
        title: 'No Emotions to Export 📊',
        description: 'Rate some emotions first, then export your emotional snapshot!',
        variant: 'default'
      });
      return;
    }

    const timestamp = new Date().toLocaleString();
    const content = `Emotional Snapshot\n${timestamp}\n\n${activeEmotions}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emotions-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: '✨ Emotions Exported!',
      description: 'Your emotional snapshot is saved. Keep tracking your journey! 💭',
      variant: 'default'
    });
  };

  const handleStartConversation = () => {
    const activeEmotions = Object.entries(currentEmotions)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => `${name}: ${value.toFixed(1)}`);

    if (activeEmotions.length === 0) {
      toast({
        title: 'Rate Your Emotions First 💭',
        description: 'Set some emotion levels, then I can help you process them!',
        variant: 'default'
      });
      return;
    }

    const emotionSummary = activeEmotions.join(', ');
    const message = `I'm feeling: ${emotionSummary}\n\nCan you help me process these emotions?`;

    // Create a new conversation with ripl(a)y mode (companion for emotional processing)
    createConversation('riplay', 'Emotional Check-In');
    
    toast({
      title: '✨ Starting Conversation',
      description: "Let's explore these feelings together... 🌱",
      variant: 'default'
    });

    // Navigate to home with the pre-filled message
    navigate('/', { state: { initialMessage: message } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="hover-lift"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-warm-gradient">
              Emotional Check-In
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Rate your emotions with precision and self-awareness 💭
            </p>
          </div>
        </div>

        {/* Info Card */}
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
          <h2 className="text-lg font-semibold text-warm-gradient mb-3">
            About Emotional Intensity Scales
          </h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              Each emotion is measured on a scale from <span className="font-mono font-semibold text-primary">0.0</span> (not present) 
              to <span className="font-mono font-semibold text-primary">1.0</span> (maximum intensity).
            </p>
            <p>
              This system helps you communicate emotional depth with nuance. Instead of saying 
              "I feel sad," you can say "I'm at <span className="font-semibold">0.6 sad</span> - that deeply sad space where..."
            </p>
            <p className="text-xs pt-2 border-t border-primary/10 mt-3">
              💡 <span className="font-semibold">Remember:</span> All emotions at all intensities are valid. 
              Even 0.1 sad deserves acknowledgment and care.
            </p>
          </div>
        </Card>

        {/* Emotion Slider Component */}
        <EmotionSlider onEmotionSelect={setCurrentEmotions} />

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleStartConversation}
            className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity hover-lift"
            disabled={Object.values(currentEmotions).every(v => v === 0)}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Process with ripl(a)y
          </Button>
          <Button
            variant="outline"
            onClick={handleExportEmotions}
            className="hover-lift"
            disabled={Object.values(currentEmotions).every(v => v === 0)}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Scale Reference */}
        <Card className="p-6 bg-gradient-to-br from-secondary/5 to-primary/5 border-dashed">
          <h3 className="text-sm font-semibold text-warm-gradient mb-3">
            Quick Reference Guide
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-muted-foreground">
            <div className="space-y-1">
              <p><span className="font-mono font-semibold">0.0-0.2</span> - Barely noticeable</p>
              <p><span className="font-mono font-semibold">0.3-0.4</span> - Mild, manageable</p>
              <p><span className="font-mono font-semibold">0.5-0.6</span> - Moderate, impactful</p>
            </div>
            <div className="space-y-1">
              <p><span className="font-mono font-semibold">0.7-0.8</span> - Strong, consuming</p>
              <p><span className="font-mono font-semibold">0.9-1.0</span> - Overwhelming, intense</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-primary/10">
            ✨ For complete descriptions and usage guidelines, see 
            <code className="ml-1 px-1.5 py-0.5 bg-primary/10 rounded text-primary font-mono">
              .devv/EMOTIONAL_RULES.txt
            </code>
          </p>
        </Card>

        {/* Combinations tip */}
        <Card className="p-4 bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20">
          <p className="text-sm text-muted-foreground">
            💭 <span className="font-semibold">Emotions rarely exist alone.</span> You might be:
          </p>
          <ul className="text-xs text-muted-foreground mt-2 space-y-1 ml-4">
            <li>• 0.6 sad + 0.4 hopeful = grieving but believing in healing</li>
            <li>• 0.8 excited + 0.5 anxious = big opportunity with nerves</li>
            <li>• 0.5 lonely + 0.6 peaceful = content in solitude but missing connection</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
