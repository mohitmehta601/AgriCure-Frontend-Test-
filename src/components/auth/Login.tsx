import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { AuthApiService } from '@/services/authApi';
import { loginSchema, type LoginFormData } from '@/utils/validators';
import { isEmail, normalizePhoneNumber, formatPhoneForDisplay } from '@/utils/phone';
import { Loader2, ArrowLeft, Mail, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LoginProps {
  onVerificationNeeded: (data: { type: 'email' | 'sms'; email?: string; phone?: string; userData: any }) => void;
}

export default function Login({ onVerificationNeeded }: LoginProps) {
  const [formData, setFormData] = useState<LoginFormData>({
    identifier: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showResendOptions, setShowResendOptions] = useState(false);
  const [unverifiedUser, setUnverifiedUser] = useState<any>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendAttempts, setResendAttempts] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    try {
      loginSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: any) {
      const fieldErrors: Record<string, string> = {};
      error.errors?.forEach((err: any) => {
        if (err.path?.length > 0) {
          fieldErrors[err.path[0]] = err.message;
        }
      });
      setErrors(fieldErrors);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await AuthApiService.loginWithIdentifier(formData);

      if (result.error) {
        throw result.error;
      }

      const user = result.data?.user;
      
      if (!user) {
        throw new Error('Login failed - no user data received');
      }

      // Check if user is verified
      if (!AuthApiService.isUserVerified(user)) {
        setUnverifiedUser(user);
        setShowResendOptions(true);
        toast({
          title: 'Account Not Verified',
          description: 'Please verify your account to continue',
          variant: 'destructive',
        });
        return;
      }

      // Ensure profile exists
      await AuthApiService.ensureProfile();

      toast({
        title: 'Login Successful',
        description: 'Welcome back to AgriCure!',
      });

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: 'Login Failed',
        description: error.message || 'Invalid credentials',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async (type: 'email' | 'sms') => {
    if (resendCooldown > 0 || resendAttempts >= 3) {
      toast({
        title: 'Resend Limit Reached',
        description: resendAttempts >= 3 
          ? 'Maximum resend attempts reached. Please try again later.'
          : `Please wait ${resendCooldown} seconds before resending`,
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const resendData: any = { type };
      
      if (type === 'email') {
        resendData.email = isEmail(formData.identifier) 
          ? formData.identifier 
          : unverifiedUser?.email;
      } else {
        const phone = isEmail(formData.identifier) 
          ? unverifiedUser?.phone 
          : normalizePhoneNumber(formData.identifier).formatted;
        resendData.phone = phone;
      }

      const result = await AuthApiService.resendOtp(resendData);

      if (result.error) {
        throw result.error;
      }

      setResendAttempts(prev => prev + 1);
      setResendCooldown(60);

      // Start cooldown timer
      const timer = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      toast({
        title: 'Verification Code Sent',
        description: `New ${type === 'email' ? 'email' : 'SMS'} verification code sent`,
      });

      // Navigate to OTP verification
      onVerificationNeeded({
        type,
        email: type === 'email' ? (isEmail(formData.identifier) ? formData.identifier : unverifiedUser?.email) : undefined,
        phone: type === 'sms' ? (isEmail(formData.identifier) ? unverifiedUser?.phone : normalizePhoneNumber(formData.identifier).formatted) : undefined,
        userData: { identifier: formData.identifier },
      });

    } catch (error: any) {
      console.error('Resend OTP error:', error);
      toast({
        title: 'Resend Failed',
        description: error.message || 'Failed to resend verification code',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (showResendOptions) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">Account Not Verified</CardTitle>
          <CardDescription>
            Your account needs to be verified before you can sign in
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              Please verify your account using one of the methods below. You can resend the verification code if needed.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Button
              onClick={() => handleResendOtp('email')}
              disabled={isLoading || resendCooldown > 0 || resendAttempts >= 3}
              className="w-full flex items-center justify-center space-x-2 h-12"
              variant="outline"
            >
              <Mail className="h-5 w-5" />
              <span>
                {resendCooldown > 0 
                  ? `Resend Email OTP (${resendCooldown}s)` 
                  : 'Resend Email OTP'
                }
              </span>
            </Button>

            <Button
              onClick={() => handleResendOtp('sms')}
              disabled={isLoading || resendCooldown > 0 || resendAttempts >= 3}
              className="w-full flex items-center justify-center space-x-2 h-12"
              variant="outline"
            >
              <Smartphone className="h-5 w-5" />
              <span>
                {resendCooldown > 0 
                  ? `Resend SMS OTP (${resendCooldown}s)` 
                  : 'Resend SMS OTP'
                }
              </span>
            </Button>
          </div>

          {resendAttempts >= 3 && (
            <Alert>
              <AlertDescription>
                Maximum resend attempts reached. Please contact support if you continue to have issues.
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={() => {
              setShowResendOptions(false);
              setUnverifiedUser(null);
              setResendAttempts(0);
              setResendCooldown(0);
            }}
            variant="ghost"
            className="w-full"
          >
            Back to Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-gray-900">Welcome Back</CardTitle>
        <CardDescription>
          Sign in to your AgriCure account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="identifier">Email or Mobile Number *</Label>
            <Input
              id="identifier"
              type="text"
              placeholder="farmer@example.com or +919876543210"
              value={formData.identifier}
              onChange={(e) => handleInputChange('identifier', e.target.value)}
              className={errors.identifier ? 'border-red-500' : ''}
            />
            {errors.identifier && (
              <p className="text-sm text-red-600 mt-1">{errors.identifier}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={errors.password ? 'border-red-500' : ''}
            />
            {errors.password && (
              <p className="text-sm text-red-600 mt-1">{errors.password}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-grass-600 hover:bg-grass-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Signing In...</span>
              </div>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/auth/signup" className="text-grass-600 hover:text-grass-700 font-medium">
              Sign up here
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}