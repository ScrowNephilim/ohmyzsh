import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Brain, MessageCircle, Wand2 } from 'lucide-react';
import { usePersonalityStore } from '@/store/personality-store';
import { useToast } from '@/hooks/use-toast';

interface PersonalityCreatorProps {
  onSuccess?: () => void;
}

export function PersonalityCreator({ onSuccess }: PersonalityCreatorProps) {
  const { createPersonality, isLoading } = usePersonalityStore();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [tone, setTone] = useState('professional');
  const [expertise, setExpertise] = useState('');
  const [creativity, setCreativity] = useState([50]);
  const [verbosity, setVerbosity] = useState([50]);
  const [emojiUsage, setEmojiUsage] = useState('minimal');
  const [languageStyle, setLanguageStyle] = useState('balanced');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !description.trim() || !systemPrompt.trim()) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    await createPersonality({
      name: name.trim(),
      description: description.trim(),
      system_prompt: systemPrompt.trim(),
      tone,
      expertise: expertise.trim(),
      creativity: creativity[0],
      verbosity: verbosity[0],
      emoji_usage: emojiUsage,
      language_style: languageStyle,
    });

    toast({
      title: 'Personality created!',
      description: `${name} is ready to chat`,
    });

    // Reset form
    setName('');
    setDescription('');
    setSystemPrompt('');
    setTone('professional');
    setExpertise('');
    setCreativity([50]);
    setVerbosity([50]);
    setEmojiUsage('minimal');
    setLanguageStyle('balanced');
    
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Basic Information
          </CardTitle>
          <CardDescription>Define your AI companion's identity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Creative Writer, Code Mentor, Life Coach"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of what this personality does..."
              rows={2}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expertise">Area of Expertise</Label>
            <Input
              id="expertise"
              value={expertise}
              onChange={(e) => setExpertise(e.target.value)}
              placeholder="e.g., Python, Creative Writing, Fitness"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-secondary" />
            System Prompt
          </CardTitle>
          <CardDescription>The core instructions that shape AI behavior</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="You are a helpful assistant that..."
            rows={6}
            required
            className="font-mono text-sm"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-accent" />
            Communication Style
          </CardTitle>
          <CardDescription>Fine-tune how your AI communicates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger id="tone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language Style</Label>
              <Select value={languageStyle} onValueChange={setLanguageStyle}>
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="balanced">Balanced</SelectItem>
                  <SelectItem value="conversational">Conversational</SelectItem>
                  <SelectItem value="playful">Playful</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="emoji">Emoji Usage</Label>
            <Select value={emojiUsage} onValueChange={setEmojiUsage}>
              <SelectTrigger id="emoji">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None 🚫</SelectItem>
                <SelectItem value="minimal">Minimal ✨</SelectItem>
                <SelectItem value="moderate">Moderate 🎯✨</SelectItem>
                <SelectItem value="generous">Generous 🎉🚀✨</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Creativity Level</Label>
              <span className="text-sm text-muted-foreground">{creativity[0]}%</span>
            </div>
            <Slider
              value={creativity}
              onValueChange={setCreativity}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Higher values = more creative and varied responses
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Verbosity</Label>
              <span className="text-sm text-muted-foreground">{verbosity[0]}%</span>
            </div>
            <Slider
              value={verbosity}
              onValueChange={setVerbosity}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Lower = concise, Higher = detailed explanations
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button
          type="submit"
          disabled={isLoading}
          className="gap-2"
        >
          <Wand2 className="w-4 h-4" />
          {isLoading ? 'Creating...' : 'Create Personality'}
        </Button>
      </div>
    </form>
  );
}
