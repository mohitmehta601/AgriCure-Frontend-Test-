import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { AuthApiService } from '@/services/authApi';
import { signupSchema, type SignupFormData } from '@/utils/validators';
import { normalizePhoneNumber } from '@/utils/phone';
import { Loader2, Eye, EyeOff, ArrowLeft, Shield, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SignupProps {
  onVerificationNeeded: (data: { type: 'email' | 'sms'; email?: string; phone?: string; userData: any }) => void;
}

export default function Signup({ onVerificationNeeded }: SignupProps) {
  const [formData, setFormData] = useState<SignupFormData>({
    productId: '',
    fullName: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showVerificationChoice, setShowVerificationChoice] = useState(false);
  const [signupData, setSignupData] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (field: keyof SignupFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    try {
      signupSchema.parse(formData);
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

  const getPasswordStrength = (password: string) => {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };

    Object.values(checks).forEach(check => check && score++);

    return {
      score,
      checks,
      strength: score < 2 ? 'weak' : score < 4 ? 'medium' : 'strong'
    };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form',
        variant: 'destructive',
      });
      return;
    }

    setSignupData(formData);
    setShowVerificationChoice(true);
  };

  const handleVerificationChoice = async (type: 'email' | 'sms') => {
    setIsLoading(true);
    
    try {
      let result;
      
      if (type === 'email') {
        result = await AuthApiService.signUpWithEmail({
          email: signupData.email,
          password: signupData.password,
          fullName: signupData.fullName,
          mobile: signupData.mobile,
          productId: signupData.productId,
        });
      } else {
        const phoneResult = normalizePhoneNumber(signupData.mobile);
        if (!phoneResult.isValid) {
          throw new Error(phoneResult.error || 'Invalid phone number');
        }

        result = await AuthApiService.signUpWithPhone({
          phone: phoneResult.formatted!,
          password: signupData.password,
          fullName: signupData.fullName,
          email: signupData.email,
          productId: signupData.productId,
        });
      }

      if (result.error) {
        throw result.error;
      }

      toast({
        title: 'Verification Code Sent',
        description: `Please check your ${type === 'email' ? 'email' : 'SMS'} for the verification code`,
      });

      // Navigate to OTP verification
      onVerificationNeeded({
        type,
        email: type === 'email' ? signupData.email : undefined,
        phone: type === 'sms' ? normalizePhoneNumber(signupData.mobile).formatted : undefined,
        userData: signupData,
      });

    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: 'Signup Failed',
        description: error.message || 'Failed to create account',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (showVerificationChoice) {
    return (
      <div className="w-full max-w-md mx-auto">
        {/* Back Button */}
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowVerificationChoice(false)}
            className="flex items-center space-x-2 text-gray-600 hover:text-grass-600"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Form</span>
          </Button>
        </div>

        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 p-3 bg-grass-100 rounded-full w-fit">
              <Shield className="h-8 w-8 text-grass-600" />
            </div>
            <CardTitle className="text-xl md:text-2xl font-bold text-gray-900">
              Choose Verification Method
            </CardTitle>
            <CardDescription className="text-gray-600 text-sm md:text-base">
              How would you like to verify your account?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-4 md:px-6">
            {/* Email Verification Option */}
            <Button
              onClick={() => handleVerificationChoice('email')}
              disabled={isLoading}
              className="w-full h-16 md:h-20 flex flex-col items-center justify-center space-y-2 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-300 text-blue-700 hover:text-blue-800 transition-all duration-200"
              variant="outline"
            >
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-200 rounded-full">
                      <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-sm md:text-base">Verify by Email</div>
                      <div className="text-xs md:text-sm opacity-75">{signupData?.email}</div>
                    </div>
                  </div>
                </>
              )}
            </Button>
            
            {/* SMS Verification Option */}
            <Button
              onClick={() => handleVerificationChoice('sms')}
              disabled={isLoading}
              className="w-full h-16 md:h-20 flex flex-col items-center justify-center space-y-2 bg-green-50 hover:bg-green-100 border-2 border-green-200 hover:border-green-300 text-green-700 hover:text-green-800 transition-all duration-200"
              variant="outline"
            >
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-200 rounded-full">
                      <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-sm md:text-base">Verify by SMS</div>
                      <div className="text-xs md:text-sm opacity-75">{signupData?.mobile}</div>
                    </div>
                  </div>
                </>
              )}
            </Button>

            <div className="text-center pt-2">
              <p className="text-xs text-gray-500">
                A verification code will be sent to your chosen method
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto px-4 sm:px-0">
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
            Create Your Account
          </CardTitle>
          <CardDescription className="text-gray-600 text-sm md:text-base">
            Join AgriCure and start optimizing your farm
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 md:px-6 pb-6">
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
            {/* Product ID and Full Name - Grid on larger screens */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label 
                  htmlFor="productId" 
                  className="text-sm md:text-base font-medium text-gray-700"
                >
                  Product ID *
                </Label>
                <Input
                  id="productId"
                  name="productId"
                  type="text"
                  placeholder="Enter product ID"
                  value={formData.productId}
                  onChange={(e) => handleInputChange('productId', e.target.value)}
                  className={`h-11 md:h-12 text-sm md:text-base transition-all duration-200 ${
                    errors.productId 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-grass-500 focus:ring-grass-500'
                  }`}
                  aria-describedby={errors.productId ? 'productId-error' : undefined}
                  disabled={isLoading}
                />
                {errors.productId && (
                  <p id="productId-error" className="text-sm text-red-600 flex items-center space-x-1">
                    <X className="h-3 w-3" />
                    <span>{errors.productId}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label 
                  htmlFor="fullName" 
                  className="text-sm md:text-base font-medium text-gray-700"
                >
                  Full Name *
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className={`h-11 md:h-12 text-sm md:text-base transition-all duration-200 ${
                    errors.fullName 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-grass-500 focus:ring-grass-500'
                  }`}
                  aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                  disabled={isLoading}
                />
                {errors.fullName && (
                  <p id="fullName-error" className="text-sm text-red-600 flex items-center space-x-1">
                    <X className="h-3 w-3" />
                    <span>{errors.fullName}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Mobile Number */}
            <div className="space-y-2">
              <Label 
                htmlFor="mobile" 
                className="text-sm md:text-base font-medium text-gray-700"
              >
                Mobile Number *
              </Label>
              <Input
                id="mobile"
                name="mobile"
                type="tel"
                placeholder="+919876543210 or 9876543210"
                value={formData.mobile}
                onChange={(e) => handleInputChange('mobile', e.target.value)}
                className={`h-11 md:h-12 text-sm md:text-base transition-all duration-200 ${
                  errors.mobile 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-grass-500 focus:ring-grass-500'
                }`}
                aria-describedby={errors.mobile ? 'mobile-error' : 'mobile-help'}
                disabled={isLoading}
              />
              {errors.mobile ? (
                <p id="mobile-error" className="text-sm text-red-600 flex items-center space-x-1">
                  <X className="h-3 w-3" />
                  <span>{errors.mobile}</span>
                </p>
              ) : (
                <p id="mobile-help" className="text-xs md:text-sm text-gray-500">
                  Enter with country code (e.g., +91 for India)
                </p>
              )}
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <Label 
                htmlFor="email" 
                className="text-sm md:text-base font-medium text-gray-700"
              >
                Email Address *
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="farmer@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`h-11 md:h-12 text-sm md:text-base transition-all duration-200 ${
                  errors.email 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-grass-500 focus:ring-grass-500'
                }`}
                aria-describedby={errors.email ? 'email-error' : undefined}
                disabled={isLoading}
              />
              {errors.email && (
                <p id="email-error" className="text-sm text-red-600 flex items-center space-x-1">
                  <X className="h-3 w-3" />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label 
                htmlFor="password" 
                className="text-sm md:text-base font-medium text-gray-700"
              >
                Password *
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`h-11 md:h-12 text-sm md:text-base pr-12 transition-all duration-200 ${
                    errors.password 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-grass-500 focus:ring-grass-500'
                  }`}
                  aria-describedby={errors.password ? 'password-error' : 'password-help'}
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

              {/* Password Strength Meter */}
              {formData.password && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          passwordStrength.strength === 'weak' ? 'bg-red-500 w-1/3' :
                          passwordStrength.strength === 'medium' ? 'bg-yellow-500 w-2/3' :
                          'bg-green-500 w-full'
                        }`}
                      />
                    </div>
                    <span className={`text-xs font-medium ${
                      passwordStrength.strength === 'weak' ? 'text-red-600' :
                      passwordStrength.strength === 'medium' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {passwordStrength.strength.charAt(0).toUpperCase() + passwordStrength.strength.slice(1)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(passwordStrength.checks).map(([key, passed]) => (
                      <div key={key} className={`flex items-center space-x-1 ${passed ? 'text-green-600' : 'text-gray-400'}`}>
                        {passed ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        <span>
                          {key === 'length' ? '8+ chars' :
                           key === 'uppercase' ? 'Uppercase' :
                           key === 'lowercase' ? 'Lowercase' :
                           key === 'number' ? 'Number' :
                           'Special char'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {errors.password && (
                <p id="password-error" className="text-sm text-red-600 flex items-center space-x-1">
                  <X className="h-3 w-3" />
                  <span>{errors.password}</span>
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label 
                htmlFor="confirmPassword" 
                className="text-sm md:text-base font-medium text-gray-700"
              >
                Confirm Password *
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`h-11 md:h-12 text-sm md:text-base pr-12 transition-all duration-200 ${
                    errors.confirmPassword 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-grass-500 focus:ring-grass-500'
                  }`}
                  aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p id="confirmPassword-error" className="text-sm text-red-600 flex items-center space-x-1">
                  <X className="h-3 w-3" />
                  <span>{errors.confirmPassword}</span>
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 md:h-14 bg-grass-600 hover:bg-grass-700 text-white font-semibold text-sm md:text-base transition-all duration-200 hover:shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
                  <span>Creating Account...</span>
                </div>
              ) : (
                'Create Account'
              )}
            </Button>

            {/* Sign In Link */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-gray-600 text-sm md:text-base">
                Already have an account?{' '}
                <Link 
                  to="/auth/login" 
                  className="text-grass-600 hover:text-grass-700 font-semibold transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}