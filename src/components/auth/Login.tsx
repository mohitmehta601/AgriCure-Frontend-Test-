import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { AuthApiService } from '@/services/authApi';
import { loginSchema, type LoginFormData } from '@/utils/validators';
import { isEmail, normalizePhoneNumber, formatPhoneForDisplay } from '@/utils/phone';
import { Loader2, ArrowLeft, Mail, Smartphone, Eye, EyeOff, RefreshCw, X, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LoginProps {
  onVerificationNeeded: (data: { type: 'email' | 'sms'; email?: string; phone?: string; userData: any }) => void;
}

export default function Login({ onVerificationNeeded }: LoginProps) {
  const [formData, setFormData] = useState<LoginFormData>({
    identifier: '',
    password: '',
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showResendOptions, setShowResendOptions] = useState(false);
  const [unverifiedUser, setUnverifiedUser] = useState<any>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendAttempts, setResendAttempts] = useState(0);
  const [isResending, setIsResending] = useState(false);
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

    setIsResending(true);

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
      setIsResending(false);
    }
  };

  // Unverified User Screen
  if (showResendOptions) {
    return (
      <div className="w-full max-w-md mx-auto px-4 sm:px-0">
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowResendOptions(false);
              setUnverifiedUser(null);
              setResendAttempts(0);
              setResendCooldown(0);
            }}
            className="flex items-center space-x-2 text-gray-600 hover:text-grass-600"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Login</span>
          </Button>
        </div>

        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 p-3 bg-yellow-100 rounded-full w-fit">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
            <CardTitle className="text-xl md:text-2xl font-bold text-gray-900">
              Account Not Verified
            </CardTitle>
            <CardDescription className="text-gray-600 text-sm md:text-base">
              Your account needs to be verified before you can sign in
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-4 md:px-6">
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800 text-sm">
                Please verify your account using one of the methods below. You can resend the verification code if needed.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Button
                onClick={() => handleResendOtp('email')}
                disabled={isResending || resendCooldown > 0 || resendAttempts >= 3}
                className="w-full h-14 flex items-center justify-center space-x-3 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-300 text-blue-700 hover:text-blue-800 transition-all duration-200"
                variant="outline"
              >
                <Mail className="h-5 w-5" />
                <span className="font-medium">
                  {resendCooldown > 0 
                    ? `Resend Email OTP (${resendCooldown}s)` 
                    : 'Resend Email OTP'
                  }
                </span>
              </Button>

              <Button
                onClick={() => handleResendOtp('sms')}
                disabled={isResending || resendCooldown > 0 || resendAttempts >= 3}
                className="w-full h-14 flex items-center justify-center space-x-3 bg-green-50 hover:bg-green-100 border-2 border-green-200 hover:border-green-300 text-green-700 hover:text-green-800 transition-all duration-200"
                variant="outline"
              >
                <Smartphone className="h-5 w-5" />
                <span className="font-medium">
                  {resendCooldown > 0 
                    ? `Resend SMS OTP (${resendCooldown}s)` 
                    : 'Resend SMS OTP'
                  }
                </span>
              </Button>
            </div>

            {resendAttempts >= 3 && (
              <Alert className="border-red-200 bg-red-50">
                <X className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800 text-sm">
                  Maximum resend attempts reached. Please contact support if you continue to have issues.
                </AlertDescription>
              </Alert>
            )}

            {resendAttempts > 0 && resendAttempts < 3 && (
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  {3 - resendAttempts} attempts remaining
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main Login Form
  return (
    <div className="w-full max-w-md mx-auto px-4 sm:px-0">
      {/* Back Button */}
      <div className="mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-gray-600 hover:text-grass-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Back to Home</span>
        </Button>
      </div>

      <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-4 px-4 md:px-6">
          <CardTitle className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-gray-600 text-sm md:text-base">
            Sign in to your AgriCure account
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 md:px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
            {/* Email or Mobile Input */}
            <div className="space-y-2">
              <Label 
                htmlFor="identifier" 
                className="text-sm md:text-base font-medium text-gray-700"
              >
                Email or Mobile Number *
              </Label>
              <Input
                id="identifier"
                name="identifier"
                type="text"
                placeholder="farmer@example.com or +919876543210"
                value={formData.identifier}
                onChange={(e) => handleInputChange('identifier', e.target.value)}
                className={`h-11 md:h-12 text-sm md:text-base transition-all duration-200 ${
                  errors.identifier 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-grass-500 focus:ring-grass-500'
                }`}
                aria-describedby={errors.identifier ? 'identifier-error' : 'identifier-help'}
                disabled={isLoading}
              />
              {errors.identifier ? (
                <p id="identifier-error" className="text-sm text-red-600 flex items-center space-x-1">
                  <X className="h-3 w-3" />
                  <span>{errors.identifier}</span>
                </p>
              ) : (
                <p id="identifier-help" className="text-xs md:text-sm text-gray-500">
                  Enter your email address or mobile number
                </p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label 
                  htmlFor="password" 
                  className="text-sm md:text-base font-medium text-gray-700"
                >
                  Password *
                </Label>
                <Link 
                  to="/auth/forgot-password" 
                  className="text-xs md:text-sm text-grass-600 hover:text-grass-700 font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`h-11 md:h-12 text-sm md:text-base pr-12 transition-all duration-200 ${
                    errors.password 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-grass-500 focus:ring-grass-500'
                  }`}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p id="password-error" className="text-sm text-red-600 flex items-center space-x-1">
                  <X className="h-3 w-3" />
                  <span>{errors.password}</span>
                </p>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                className="border-gray-300 data-[state=checked]:bg-grass-600 data-[state=checked]:border-grass-600"
              />
              <Label 
                htmlFor="rememberMe" 
                className="text-sm md:text-base text-gray-700 cursor-pointer"
              >
                Remember me for 30 days
              </Label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 md:h-14 bg-grass-600 hover:bg-grass-700 active:bg-grass-800 text-white font-semibold text-sm md:text-base transition-all duration-200 hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
                  <span>Signing In...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </Button>

            {/* Sign Up Link */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-gray-600 text-sm md:text-base">
                Don't have an account?{' '}
                <Link 
                  to="/auth/signup" 
                  className="text-grass-600 hover:text-grass-700 font-semibold transition-colors"
                >
                  Sign up here
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}