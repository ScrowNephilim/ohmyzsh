import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PersonalityCreator } from '@/components/PersonalityCreator';
import { PersonalityList } from '@/components/PersonalityList';
import { ArrowLeft, Plus, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PersonalitiesPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('list');

  const handleSuccess = () => {
    setActiveTab('list');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Chat
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
                <Users className="w-8 h-8 text-primary" />
                AI Personalities
              </h1>
              <p className="text-muted-foreground">
                Create and manage custom AI personalities with unique traits
              </p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="list">
              My Personalities
            </TabsTrigger>
            <TabsTrigger value="create" className="gap-2">
              <Plus className="w-4 h-4" />
              Create New
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <PersonalityList />
          </TabsContent>

          <TabsContent value="create">
            <PersonalityCreator onSuccess={handleSuccess} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
