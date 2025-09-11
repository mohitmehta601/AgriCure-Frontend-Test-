import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { AuthApiService } from '@/services/authApi';
import { otpSchema } from '@/utils/validators';
import { formatPhoneForDisplay } from '@/utils/phone';
import { Loader2, Mail, Smartphone, ArrowLeft, RefreshCw } from 'lucide-react';

interface OtpVerifyProps {
  type: 'email' | 'sms';
  email?: string;
  phone?: string;
  userData?: any;
  onBack: () => void;
  onSuccess: () => void;
}

export default function OtpVerify({ type, email, phone, userData, onBack, onSuccess }: OtpVerifyProps) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendAttempts, setResendAttempts] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Start initial cooldown
  useEffect(() => {
    setResendCooldown(60);
    const timer = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newOtp = otp.split('');
    newOtp[index] = value;
    const updatedOtp = newOtp.join('');
    
    setOtp(updatedOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are entered
    if (updatedOtp.length === 6) {
      handleVerify(updatedOtp);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
    
    if (pastedData.length === 6) {
      setOtp(pastedData);
      setError('');
      // Auto-submit pasted OTP
      handleVerify(pastedData);
    }
  };

  const validateOtp = (otpValue: string): boolean => {
    try {
      otpSchema.parse(otpValue);
      setError('');
      return true;
    } catch (error: any) {
      setError(error.errors?.[0]?.message || 'Invalid OTP format');
      return false;
    }
  };

  const handleVerify = async (otpValue?: string) => {
    const codeToVerify = otpValue || otp;
    
    if (!validateOtp(codeToVerify)) {
      return;
    }

    setIsLoading(true);

    try {
      const verifyData = {
        type,
        token: codeToVerify,
        email: type === 'email' ? email : undefined,
        phone: type === 'sms' ? phone : undefined,
      };

      const result = await AuthApiService.verifyOtpCode(verifyData);

      if (result.error) {
        throw result.error;
      }

      toast({
        title: 'Verification Successful',
        description: 'Your account has been verified successfully!',
      });

      onSuccess();
      navigate('/dashboard');
    } catch (error: any) {
      console.error('OTP verification error:', error);
      setError(error.message || 'Invalid verification code');
      toast({
        title: 'Verification Failed',
        description: error.message || 'Invalid verification code',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resendAttempts >= 3) {
      return;
    }

    setIsResending(true);

    try {
      const resendData = {
        type,
        email: type === 'email' ? email : undefined,
        phone: type === 'sms' ? phone : undefined,
      };

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
        title: 'Code Resent',
        description: `New verification code sent to your ${type === 'email' ? 'email' : 'mobile'}`,
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

  const displayContact = type === 'email' 
    ? email 
    : phone ? formatPhoneForDisplay(phone) : 'your mobile';

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          {type === 'email' ? (
            <Mail className="h-12 w-12 text-grass-600" />
          ) : (
            <Smartphone className="h-12 w-12 text-grass-600" />
          )}
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900">
          Verify Your {type === 'email' ? 'Email' : 'Mobile'}
        </CardTitle>
        <CardDescription>
          Enter the 6-digit code sent to {displayContact}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-sm font-medium text-gray-700">Verification Code</Label>
          <div className="flex space-x-2 mt-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={otp[index] || ''}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className={`w-12 h-12 text-center text-lg font-semibold ${
                  error ? 'border-red-500' : 'border-gray-300'
                } focus:border-grass-500 focus:ring-grass-500`}
                disabled={isLoading}
              />
            ))}
          </div>
          {error && (
            <p className="text-sm text-red-600 mt-2">{error}</p>
          )}
          <p className="text-xs text-gray-500 mt-2">
            Enter the code or paste it in the first box
          </p>
        </div>

        <Button
          onClick={() => handleVerify()}
          disabled={isLoading || otp.length !== 6}
          className="w-full bg-grass-600 hover:bg-grass-700"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Verifying...</span>
            </div>
          ) : (
            'Verify Code'
          )}
        </Button>

        <div className="text-center space-y-3">
          <p className="text-sm text-gray-600">
            Didn't receive the code?
          </p>
          
          <Button
            onClick={handleResendOtp}
            disabled={isResending || resendCooldown > 0 || resendAttempts >= 3}
            variant="outline"
            className="w-full"
          >
            {isResending ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Resending...</span>
              </div>
            ) : resendCooldown > 0 ? (
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4" />
                <span>Resend in {resendCooldown}s</span>
              </div>
            ) : resendAttempts >= 3 ? (
              'Maximum attempts reached'
            ) : (
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4" />
                <span>Resend Code</span>
              </div>
            )}
          </Button>

          {resendAttempts > 0 && resendAttempts < 3 && (
            <p className="text-xs text-gray-500">
              {3 - resendAttempts} attempts remaining
            </p>
          )}
        </div>

        <Button
          onClick={onBack}
          variant="ghost"
          className="w-full flex items-center justify-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
      </CardContent>
    </Card>
  );
}