import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Sparkles, MessageCircle } from 'lucide-react';
import { usePersonalityStore, Personality } from '@/store/personality-store';
import { useChatStore } from '@/store/chat-store';
import { useAuthStore } from '@/store/auth-store';
import { useToast } from '@/hooks/use-toast';

interface PersonalityListProps {
  onSelect?: (personality: Personality) => void;
  onEdit?: (personality: Personality) => void;
  selectedId?: string;
}

export function PersonalityList({ onSelect, onEdit, selectedId }: PersonalityListProps) {
  const navigate = useNavigate();
  const { personalities, isLoading, loadPersonalities, deletePersonality } = usePersonalityStore();
  const createConversation = useChatStore(state => state.createConversation);
  const user = useAuthStore(state => state.user);
  const { toast } = useToast();

  useEffect(() => {
    loadPersonalities();
  }, [loadPersonalities]);

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Delete "${name}"? This cannot be undone.`)) {
      await deletePersonality(id);
      toast({
        title: 'Personality deleted',
        description: `${name} has been removed`,
      });
    }
  };

  const handleStartChat = async (personality: Personality) => {
    if (!user?.uid) return;
    
    await createConversation('custom', user.uid, {
      id: personality._id,
      name: personality.name,
      prompt: personality.system_prompt
    });
    
    toast({
      title: 'Chat started!',
      description: `Now chatting with ${personality.name}`,
    });
    
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading personalities...</div>
      </div>
    );
  }

  if (personalities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Sparkles className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Custom Personalities Yet</h3>
        <p className="text-sm text-muted-foreground">
          Create your first custom AI personality to get started
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {personalities.map((personality) => (
        <Card
          key={personality._id}
          className={`transition-all hover:shadow-md ${
            selectedId === personality._id ? 'ring-2 ring-primary' : ''
          }`}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-primary" />
                  {personality.name}
                </CardTitle>
                <CardDescription>{personality.description}</CardDescription>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="default"
                  size="icon"
                  onClick={() => handleStartChat(personality)}
                  className="h-8 w-8"
                  title="Start chat"
                >
                  <MessageCircle className="w-4 h-4" />
                </Button>
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(personality)}
                    className="h-8 w-8"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(personality._id, personality.name)}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{personality.tone}</Badge>
              <Badge variant="outline">{personality.language_style}</Badge>
              {personality.expertise && (
                <Badge variant="outline">{personality.expertise}</Badge>
              )}
              <Badge variant="outline">
                {personality.emoji_usage} emojis
              </Badge>
            </div>
            <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
              <span>Creativity: {personality.creativity}%</span>
              <span>Verbosity: {personality.verbosity}%</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
