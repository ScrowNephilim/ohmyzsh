import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '@devvai/devv-code-backend';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles } from 'lucide-react';

type Step = 'email' | 'otp';

export default function LoginPage() {
  const location = useLocation();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const setUser = useAuthStore(state => state.setUser);
  const setDevMode = useAuthStore(state => state.setDevMode);
  const { toast } = useToast();

  // Check if there's a stored email from dev mode switch
  useEffect(() => {
    console.log('[LoginPage] Component mounted');
    const storedEmail = localStorage.getItem('dev_mode_email');
    if (storedEmail) {
      console.log('[LoginPage] Found stored email from dev mode switch:', storedEmail);
      setEmail(storedEmail);
      localStorage.removeItem('dev_mode_email'); // Clear it after using
      console.log('[LoginPage] Email pre-filled and cleared from storage');
    } else {
      console.log('[LoginPage] No stored email found');
    }
  }, []);

  // Stricter email validation to match backend expectations
  const validateEmail = (email: string): { valid: boolean; message: string } => {
    const trimmed = email.trim();
    
    if (!trimmed) {
      return { valid: false, message: 'Email is required' };
    }
    
    // Stricter regex pattern (requires proper domain with extension)
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
    if (!emailRegex.test(trimmed)) {
      return { valid: false, message: 'Please enter a valid email address (e.g., you@example.com)' };
    }
    
    // Check for consecutive dots
    if (trimmed.includes('..')) {
      return { valid: false, message: 'Email cannot contain consecutive dots' };
    }
    
    // Check for leading/trailing dots
    if (trimmed.startsWith('.') || trimmed.endsWith('.')) {
      return { valid: false, message: 'Email cannot start or end with a dot' };
    }
    
    // Check for spaces
    if (trimmed.includes(' ')) {
      return { valid: false, message: 'Email cannot contain spaces' };
    }
    
    // Validate @ symbol usage
    const parts = trimmed.split('@');
    if (parts.length !== 2 || parts[0].length === 0 || parts[1].length === 0) {
      return { valid: false, message: 'Invalid email format' };
    }
    
    return { valid: true, message: '' };
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email format BEFORE calling backend
    const validation = validateEmail(email);
    if (!validation.valid) {
      toast({
        title: 'Email Format Issue 📧',
        description: validation.message,
        variant: 'destructive',
      });
      return; // Don't call backend if validation fails
    }
    
    setIsLoading(true);

    try {
      const trimmedEmail = email.trim();
      console.log('[LoginPage] Attempting to send OTP to:', trimmedEmail);
      await auth.sendOTP(trimmedEmail);
      console.log('[LoginPage] OTP sent successfully! Check your email:', trimmedEmail);
      setStep('otp');
      toast({
        title: '✉️ Code Sent!',
        description: 'Check your inbox (and spam folder)! Your verification code is on its way...',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      // Properly serialize error object (Error properties are non-enumerable)
      const errorDetails = error instanceof Error 
        ? JSON.stringify({ message: error.message, name: error.name, stack: error.stack })
        : JSON.stringify(error);
      console.error('[LoginPage] Failed to send OTP:', errorMessage);
      console.error('[LoginPage] Full error details:', errorDetails);
      console.error('[LoginPage] Raw error object:', error);
      
      let title = 'Oops! Email Trouble 📧';
      let description = 'Couldn\'t send the code. Check your email and try again!';

      // Enhanced error detection for 400 Bad Request
      if (errorMessage.includes('400') || errorMessage.toLowerCase().includes('bad request')) {
        title = 'Invalid Email Format 🤔';
        description = 'That email format isn\'t accepted. Try: yourname@example.com (no spaces, valid domain)';
      } else if (errorMessage.includes('invalid email') || errorMessage.includes('9003')) {
        title = 'Email Address Issue 🤔';
        description = 'That email doesn\'t look quite right. Double-check it!';
      } else if (errorMessage.includes('rate limit') || errorMessage.includes('too many')) {
        title = 'Hang On! Too Fast 🏃';
        description = 'Too many requests. Wait a moment and try again!';
      }

      toast({
        title,
        description: `${description}\n\nError: ${errorMessage}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log('[LoginPage] 🔍 Verifying OTP for email:', email);
    console.log('[LoginPage] 🔍 OTP code length:', otp.length, 'characters');

    try {
      // 🔓 Master password bypass for development
      const MASTER_PASSWORD = 'Aufhebung24';
      
      if (otp === MASTER_PASSWORD) {
        console.log('[LoginPage] ✅ Master password detected, activating dev mode');
        // Bypass OTP verification with mock user
        const mockUser = {
          uid: `dev_${Date.now()}`,
          email: email,
          name: email.split('@')[0] || 'Dev User',
        };
        
        // Store mock session
        localStorage.setItem('DEVV_CODE_SID', `mock_session_${Date.now()}`);
        
        setUser(mockUser);
        setDevMode(true); // Mark as dev mode
        toast({
          title: '🔓 Dev Mode Activated',
          description: 'UI testing only. Database, AI, and Chroma features require real email authentication.',
        });
        navigate('/');
        return;
      }

      // Normal OTP verification flow
      console.log('[LoginPage] 🔍 Verifying OTP...');
      console.log('[LoginPage] 🔍 Email:', email);
      console.log('[LoginPage] 🔍 OTP code:', otp);
      console.log('[LoginPage] 🔍 OTP length:', otp.length, 'characters');
      console.log('[LoginPage] 🔍 OTP trimmed:', otp.trim());
      console.log('[LoginPage] 📞 Calling auth.verifyOTP()...');
      const response = await auth.verifyOTP(email, otp.trim());
      console.log('[LoginPage] ✅ OTP verification successful!');
      setUser({
        uid: response.user.uid,
        email: response.user.email,
        name: response.user.name,
      });
      setDevMode(false); // Ensure dev mode is disabled for real authentication
      console.log('[LoginPage] ✅ Dev mode disabled, navigating to home...');
      toast({
        title: '✨ Welcome Back!',
        description: 'Great to see you!',
      });
      navigate('/');
    } catch (error) {
      // Enhanced error handling with specific error codes
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorDetails = error instanceof Error 
        ? JSON.stringify({ message: error.message, name: error.name, stack: error.stack })
        : JSON.stringify(error);
      console.error('[LoginPage] ❌ OTP verification failed:', errorMessage);
      console.error('[LoginPage] ❌ Full error details:', errorDetails);
      console.error('[LoginPage] ❌ Raw error object:', error);
      
      let title = 'Oops! Wrong Code 🔍';
      let description = 'That code doesn\'t match. Double-check and try again!';

      // Detect specific error codes
      if (errorMessage.includes('9001') || errorMessage.includes('invalid verification code')) {
        title = 'Oops! Wrong Code 🔍';
        description = 'That code doesn\'t match. Double-check and try again! (Hint: Codes expire after 10 minutes)';
        console.error('[LoginPage] 🔍 Error Code 9001: Invalid verification code - possible reasons:');
        console.error('  - Code was mistyped');
        console.error('  - Code has expired (>10 minutes old)');
        console.error('  - Email/code mismatch (used code for different email)');
      } else if (errorMessage.includes('9002') || errorMessage.includes('expired')) {
        title = 'Code Expired ⏰';
        description = 'That code is too old. Click "Resend Code" for a fresh one!';
      } else if (errorMessage.includes('rate limit') || errorMessage.includes('too many')) {
        title = 'Slow Down There! 🛑';
        description = 'Too many attempts. Take a breath and try again in a moment!';
      }

      toast({
        title,
        description,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">AI Companion Hub</CardTitle>
          <CardDescription>
            {step === 'email' 
              ? 'Enter your email to get started' 
              : 'Enter the code sent to your email'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'email' ? (
            <div key="email">
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    💡 Use a personal email (Gmail, Outlook) for best results. No spaces or invalid characters.
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Continue
                </Button>
              </form>
            </div>
          ) : (
            <div key="otp">
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter verification code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.trim())}
                    required
                    disabled={isLoading}
                    autoComplete="off"
                  />
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      💡 Codes expire after 10 minutes. Need a fresh one? Use "Resend Code" below!
                    </p>
                    {otp && (
                      <p className="text-xs text-muted-foreground/70 font-mono">
                        📝 Code entered: "{otp}" ({otp.length} chars)
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground/50 font-mono">
                      🔓 Dev tip: Use master password to bypass
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Verify
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={async () => {
                        setIsLoading(true);
                        try {
                          await auth.sendOTP(email);
                          toast({
                            title: '✉️ New Code Sent!',
                            description: 'Check your email for a fresh verification code!',
                          });
                        } catch (error) {
                          toast({
                            title: 'Couldn\'t Resend 😅',
                            description: 'Wait a moment and try again!',
                            variant: 'destructive',
                          });
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      disabled={isLoading}
                    >
                      Resend Code
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="flex-1"
                      onClick={() => {
                        setStep('email');
                        setOtp('');
                      }}
                      disabled={isLoading}
                    >
                      Back
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          )}
          
          {/* Email Troubleshooting Help */}
          {step === 'email' && (
            <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-muted">
              <h4 className="text-sm font-semibold mb-2 text-foreground">📧 Not Receiving Emails?</h4>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                <li>• <strong>Check spam/junk folder</strong> - OTP emails often land there</li>
                <li>• <strong>Wait 2-3 minutes</strong> - Email delivery can be slow</li>
                <li>• <strong>Try a different email</strong> - Some providers block automated emails</li>
                <li>• <strong>Use Gmail/Outlook</strong> - They work most reliably</li>
                <li className="pt-1 text-orange-400">• <strong>Dev Mode Available:</strong> Use master password for UI testing (SDK features disabled)</li>
              </ul>
            </div>
          )}
          
          {step === 'otp' && (
            <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-muted">
              <h4 className="text-sm font-semibold mb-2 text-foreground">🔓 Testing Without Email?</h4>
              <p className="text-xs text-muted-foreground">
                Use the master password <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-orange-400">Aufhebung24</code> to bypass email verification. 
                This enables UI testing but <strong>disables SDK features</strong> (database, AI, Chroma).
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
