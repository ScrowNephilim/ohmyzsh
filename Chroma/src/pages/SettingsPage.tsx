import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import { useSettingsStore } from '@/store/settings-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Key, Eye, EyeOff, Save, Trash2, ExternalLink, CheckCircle2, XCircle } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const {
    elevenLabsApiKey,
    replicateApiKey,
    openrouterApiKey,
    xaiApiKey,
    setElevenLabsApiKey,
    setReplicateApiKey,
    setOpenRouterApiKey,
    setXaiApiKey,
    clearApiKeys,
    hasElevenLabsKey,
    hasReplicateKey,
    hasOpenRouterKey,
    hasXaiKey,
  } = useSettingsStore();

  const [localElevenLabsKey, setLocalElevenLabsKey] = useState(elevenLabsApiKey);
  const [localReplicateKey, setLocalReplicateKey] = useState(replicateApiKey);
  const [localOpenRouterKey, setLocalOpenRouterKey] = useState(openrouterApiKey);
  const [localXaiKey, setLocalXaiKey] = useState(xaiApiKey);
  const [showElevenLabsKey, setShowElevenLabsKey] = useState(false);
  const [showReplicateKey, setShowReplicateKey] = useState(false);
  const [showOpenRouterKey, setShowOpenRouterKey] = useState(false);
  const [showXaiKey, setShowXaiKey] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    const elevenLabsChanged = localElevenLabsKey !== elevenLabsApiKey;
    const replicateChanged = localReplicateKey !== replicateApiKey;
    const openrouterChanged = localOpenRouterKey !== openrouterApiKey;
    const xaiChanged = localXaiKey !== xaiApiKey;
    setHasUnsavedChanges(elevenLabsChanged || replicateChanged || openrouterChanged || xaiChanged);
  }, [localElevenLabsKey, elevenLabsApiKey, localReplicateKey, replicateApiKey, localOpenRouterKey, openrouterApiKey, localXaiKey, xaiApiKey]);

  const handleSaveSettings = () => {
    setElevenLabsApiKey(localElevenLabsKey);
    setReplicateApiKey(localReplicateKey);
    setOpenRouterApiKey(localOpenRouterKey);
    setXaiApiKey(localXaiKey);
    
    toast({
      title: "✨ Settings Saved!",
      description: "Your API keys have been securely stored.",
    });
    
    setHasUnsavedChanges(false);
  };

  const handleClearApiKeys = () => {
    if (window.confirm('Are you sure you want to clear all API keys? This will affect Chroma TTS/STT features.')) {
      clearApiKeys();
      setLocalElevenLabsKey('');
      setLocalReplicateKey('');
      setLocalOpenRouterKey('');
      setLocalXaiKey('');
      
      toast({
        title: "🗑️ API Keys Cleared",
        description: "All API keys have been removed.",
      });
    }
  };

  const maskApiKey = (key: string): string => {
    if (!key || key.length < 12) return key;
    return `${key.substring(0, 8)}...${key.substring(key.length - 4)}`;
  };

  return (
    <div className="flex min-h-screen bg-black text-white font-mono">
      {/* Sidebar */}
      <div className="w-80 bg-gradient-to-b from-black via-black to-purple-950/20 border-r border-purple-900/30 p-6 flex flex-col">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-green-400">
            Settings
          </h1>
          <p className="text-sm text-gray-400 mt-2">Configure your API keys and preferences</p>
        </div>

        <Button
          variant="outline"
          className="mb-4 border-purple-900/50 hover:border-purple-500 hover:bg-purple-950/30"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        {/* Status Summary */}
        <div className="mt-8 space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-purple-950/20 border border-purple-900/30">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-purple-400" />
              <span className="text-sm">ElevenLabs</span>
            </div>
            {hasElevenLabsKey() ? (
              <CheckCircle2 className="h-4 w-4 text-green-400" />
            ) : (
              <XCircle className="h-4 w-4 text-red-400" />
            )}
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-purple-950/20 border border-purple-900/30">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-blue-400" />
              <span className="text-sm">Replicate</span>
            </div>
            {hasReplicateKey() ? (
              <CheckCircle2 className="h-4 w-4 text-green-400" />
            ) : (
              <XCircle className="h-4 w-4 text-red-400" />
            )}
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-purple-950/20 border border-purple-900/30">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-orange-400" />
              <span className="text-sm">OpenRouter</span>
            </div>
            {hasOpenRouterKey() ? (
              <CheckCircle2 className="h-4 w-4 text-green-400" />
            ) : (
              <XCircle className="h-4 w-4 text-red-400" />
            )}
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-purple-950/20 border border-purple-900/30">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-cyan-400" />
              <span className="text-sm">xAI (Grok)</span>
            </div>
            {hasXaiKey() ? (
              <CheckCircle2 className="h-4 w-4 text-green-400" />
            ) : (
              <XCircle className="h-4 w-4 text-red-400" />
            )}
          </div>
        </div>

        {user?.email && (
          <div className="mt-auto pt-6 border-t border-purple-900/30">
            <p className="text-xs text-gray-500 break-all">{user.email}</p>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-green-400">
              API Configuration
            </h2>
            <p className="text-gray-400 mt-2">
              Configure your external service API keys to unlock advanced features
            </p>
          </div>

          {/* ElevenLabs Configuration */}
          <Card className="bg-gradient-to-br from-purple-950/30 to-black border-purple-900/50">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl text-purple-400 flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    ElevenLabs API Key
                    <Badge variant="outline" className="ml-2 border-blue-500 text-blue-400">
                      OPTIONAL
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-gray-400 mt-2">
                    Used for advanced TTS (text-to-speech) and STT (speech-to-text) in Chroma
                  </CardDescription>
                </div>
                {hasElevenLabsKey() && (
                  <Badge className="bg-green-950/50 text-green-400 border-green-500">
                    Active
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="elevenlabs-key" className="text-gray-300">
                  API Key
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="elevenlabs-key"
                      type={showElevenLabsKey ? 'text' : 'password'}
                      value={localElevenLabsKey}
                      onChange={(e) => setLocalElevenLabsKey(e.target.value)}
                      placeholder="el_..."
                      className="bg-black/50 border-purple-900/50 text-white font-mono pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowElevenLabsKey(!showElevenLabsKey)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showElevenLabsKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                {localElevenLabsKey && !showElevenLabsKey && (
                  <p className="text-xs text-gray-500 mt-1">
                    Current: {maskApiKey(localElevenLabsKey)}
                  </p>
                )}
              </div>

              <div className="bg-purple-950/20 border border-purple-900/30 rounded-lg p-4 space-y-2">
                <h4 className="text-sm font-semibold text-purple-400">What is ElevenLabs?</h4>
                <p className="text-xs text-gray-400">
                  ElevenLabs provides high-quality voice synthesis and transcription. 
                  Currently integrated via Devv SDK (uses Devv credits by default).
                </p>
                <a
                  href="https://elevenlabs.io/app/settings/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300"
                >
                  Get your API key <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <div className="bg-blue-950/20 border border-blue-900/30 rounded-lg p-3">
                <p className="text-xs text-blue-400">
                  <strong>Current Status:</strong> ElevenLabs TTS/STT uses Devv SDK (built-in credits)
                  <br /><br />
                  <strong>Note:</strong> Direct API key integration coming soon for zero-credit usage. You can store your key here for future use.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Replicate Configuration */}
          <Card className="bg-gradient-to-br from-blue-950/30 to-black border-blue-900/50">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl text-blue-400 flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Replicate API Key
                    <Badge variant="outline" className="ml-2 border-blue-500 text-blue-400">
                      OPTIONAL
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-gray-400 mt-2">
                    Used for highly pixelated 8-bit backgrounds, weather GIFs, and transition effects in Chroma
                  </CardDescription>
                </div>
                {hasReplicateKey() && (
                  <Badge className="bg-green-950/50 text-green-400 border-green-500">
                    Active
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="replicate-key" className="text-gray-300">
                  API Key
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="replicate-key"
                      type={showReplicateKey ? 'text' : 'password'}
                      value={localReplicateKey}
                      onChange={(e) => setLocalReplicateKey(e.target.value)}
                      placeholder="r8_..."
                      className="bg-black/50 border-blue-900/50 text-white font-mono pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowReplicateKey(!showReplicateKey)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showReplicateKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                {localReplicateKey && !showReplicateKey && (
                  <p className="text-xs text-gray-500 mt-1">
                    Current: {maskApiKey(localReplicateKey)}
                  </p>
                )}
              </div>

              <div className="bg-blue-950/20 border border-blue-900/30 rounded-lg p-4 space-y-2">
                <h4 className="text-sm font-semibold text-blue-400">What is Replicate?</h4>
                <p className="text-xs text-gray-400">
                  Replicate provides cost-efficient image generation models. Used for pixelated 8-bit backgrounds,
                  weather overlays, and transition effects in Chroma (50% faster than default).
                </p>
                <a
                  href="https://replicate.com/account/api-tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                >
                  Get your API key <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <div className="bg-purple-950/20 border border-purple-900/30 rounded-lg p-3">
                <p className="text-xs text-purple-400">
                  <strong>Current Status:</strong> Replicate integrated via Devv SDK
                  <br /><br />
                  <strong>Models Used:</strong> flux-schnell (8-bit backgrounds), ideogram-v3-turbo (weather overlays)
                  <br /><br />
                  <strong>Fallback:</strong> DevvAI Image Generation if Replicate unavailable
                </p>
              </div>
            </CardContent>
          </Card>

          {/* OpenRouter Configuration */}
          <Card className="bg-gradient-to-br from-orange-950/30 to-black border-orange-900/50">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl text-orange-400 flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    OpenRouter API Key
                    <Badge variant="outline" className="ml-2 border-orange-500 text-orange-400">
                      OPTIONAL
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-gray-400 mt-2">
                    Access to GPT-4, Claude, and other premium AI models (DevvAI used by default)
                  </CardDescription>
                </div>
                {hasOpenRouterKey() && (
                  <Badge className="bg-green-950/50 text-green-400 border-green-500">
                    Active
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="openrouter-key" className="text-gray-300">
                  API Key
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="openrouter-key"
                      type={showOpenRouterKey ? 'text' : 'password'}
                      value={localOpenRouterKey}
                      onChange={(e) => setLocalOpenRouterKey(e.target.value)}
                      placeholder="sk-or-..."
                      className="bg-black/50 border-orange-900/50 text-white font-mono pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOpenRouterKey(!showOpenRouterKey)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showOpenRouterKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                {localOpenRouterKey && !showOpenRouterKey && (
                  <p className="text-xs text-gray-500 mt-1">
                    Current: {maskApiKey(localOpenRouterKey)}
                  </p>
                )}
              </div>

              <div className="bg-orange-950/20 border border-orange-900/30 rounded-lg p-4 space-y-2">
                <h4 className="text-sm font-semibold text-orange-400">What is OpenRouter?</h4>
                <p className="text-xs text-gray-400">
                  OpenRouter provides unified access to multiple AI models (GPT-4, Claude, Llama, Mixtral, etc.).
                  Store your key here for future use.
                </p>
                <a
                  href="https://openrouter.ai/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300"
                >
                  Get your API key <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <div className="bg-blue-950/20 border border-blue-900/30 rounded-lg p-3">
                <p className="text-xs text-blue-400">
                  <strong>Current Status:</strong> DevvAI used for all AI responses (free, built-in)
                  <br /><br />
                  <strong>Note:</strong> OpenRouter integration coming soon. You can store your key here for future use.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-purple-900/30">
            <Button
              variant="outline"
              onClick={handleClearApiKeys}
              className="border-red-900/50 text-red-400 hover:bg-red-950/30 hover:border-red-500"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All Keys
            </Button>

            <Button
              onClick={handleSaveSettings}
              disabled={!hasUnsavedChanges}
              className="bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-500 hover:to-green-500 disabled:opacity-50"
            >
              <Save className="mr-2 h-4 w-4" />
              {hasUnsavedChanges ? 'Save Changes' : 'No Changes'}
            </Button>
          </div>

          {/* Usage Information */}
          <Card className="bg-gradient-to-br from-purple-950/30 to-black border-purple-900/50">
            <CardHeader>
              <CardTitle className="text-lg text-purple-400">Service Priority</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-400">
                <div className="flex items-start gap-3">
                  <Badge className="bg-purple-950/50 text-purple-400 border-purple-500 mt-0.5">1</Badge>
                  <div>
                    <p className="text-white font-semibold">DevvAI (Primary)</p>
                    <p className="text-xs">All AI responses including Chroma, diary modes (Ripley & ripl(a)y), and conversations</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge className="bg-blue-950/50 text-blue-400 border-blue-500 mt-0.5">2</Badge>
                  <div>
                    <p className="text-white font-semibold">Replicate (Chroma Visuals)</p>
                    <p className="text-xs">Pixelated backgrounds, weather GIFs, transition effects (50% faster, cost-efficient)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge className="bg-purple-950/50 text-purple-400 border-purple-500 mt-0.5">3</Badge>
                  <div>
                    <p className="text-white font-semibold">ElevenLabs (Optional)</p>
                    <p className="text-xs">Advanced TTS/STT features (currently via Devv SDK)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge className="bg-orange-950/50 text-orange-400 border-orange-500 mt-0.5">4</Badge>
                  <div>
                    <p className="text-white font-semibold">OpenRouter (Future)</p>
                    <p className="text-xs">Premium AI models (GPT-4, Claude) - integration coming soon</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
