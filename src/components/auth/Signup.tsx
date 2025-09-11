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
import { Loader2, Mail, Smartphone, ArrowLeft } from 'lucide-react';
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
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">Choose Verification Method</CardTitle>
          <CardDescription>
            How would you like to verify your account?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => handleVerificationChoice('email')}
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 h-12"
            variant="outline"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Mail className="h-5 w-5" />
                <span>Verify by Email</span>
              </>
            )}
          </Button>
          
          <Button
            onClick={() => handleVerificationChoice('sms')}
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 h-12"
            variant="outline"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Smartphone className="h-5 w-5" />
                <span>Verify by SMS</span>
              </>
            )}
          </Button>

          <Button
            onClick={() => setShowVerificationChoice(false)}
            variant="ghost"
            className="w-full"
          >
            Back to Form
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Back Button */}
      <div className="mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-gray-600 hover:text-grass-600"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Button>
      </div>

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">Create Account</CardTitle>
          <CardDescription>
            Sign up for your AgriCure account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="productId">Product ID *</Label>
              <Input
                id="productId"
                type="text"
                placeholder="Enter your product ID"
                value={formData.productId}
                onChange={(e) => handleInputChange('productId', e.target.value)}
                className={errors.productId ? 'border-red-500' : ''}
              />
              {errors.productId && (
                <p className="text-sm text-red-600 mt-1">{errors.productId}</p>
              )}
            </div>

            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className={errors.fullName ? 'border-red-500' : ''}
              />
              {errors.fullName && (
                <p className="text-sm text-red-600 mt-1">{errors.fullName}</p>
              )}
            </div>

            <div>
              <Label htmlFor="mobile">Mobile Number *</Label>
              <Input
                id="mobile"
                type="tel"
                placeholder="+919876543210 or 9876543210"
                value={formData.mobile}
                onChange={(e) => handleInputChange('mobile', e.target.value)}
                className={errors.mobile ? 'border-red-500' : ''}
              />
              {errors.mobile && (
                <p className="text-sm text-red-600 mt-1">{errors.mobile}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Enter with country code (e.g., +91 for India)
              </p>
            </div>

            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="farmer@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={errors.password ? 'border-red-500' : ''}
              />
              {errors.password && (
                <p className="text-sm text-red-600 mt-1">{errors.password}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Must contain uppercase, lowercase, number, and special character
              </p>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={errors.confirmPassword ? 'border-red-500' : ''}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>
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
                  <span>Creating Account...</span>
                </div>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/auth/login" className="text-grass-600 hover:text-grass-700 font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}