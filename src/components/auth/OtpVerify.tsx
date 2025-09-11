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
import { Loader2, Mail, Smartphone, ArrowLeft, RefreshCw, Clock, CheckCircle, X } from 'lucide-react';

interface OtpVerifyProps {
  type: 'email' | 'sms';
  email?: string;
  phone?: string;
  userData?: any;
  onBack: () => void;
  onSuccess: () => void;
}

export default function OtpVerify({ type, email, phone, userData, onBack, onSuccess }: OtpVerifyProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(45); // Start with 45 seconds
  const [resendAttempts, setResendAttempts] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Start initial cooldown
  useEffect(() => {
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

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are entered
    const otpString = newOtp.join('');
    if (otpString.length === 6) {
      handleVerify(otpString);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Move to previous input if current is empty
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current input
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');
    
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
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
    const codeToVerify = otpValue || otp.join('');
    
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
      // Clear OTP on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
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
      setResendCooldown(45);

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

      // Clear current OTP
      setOtp(['', '', '', '', '', '']);
      setError('');
      inputRefs.current[0]?.focus();

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

  const otpString = otp.join('');
  const isOtpComplete = otpString.length === 6;

  return (
    <div className="w-full max-w-md mx-auto px-4 sm:px-0">
      {/* Back Button */}
      <div className="mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-grass-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Back</span>
        </Button>
      </div>

      <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-4 px-4 md:px-6">
          <div className="mx-auto mb-4 p-3 bg-grass-100 rounded-full w-fit">
            {type === 'email' ? (
              <Mail className="h-8 w-8 text-grass-600" />
            ) : (
              <Smartphone className="h-8 w-8 text-grass-600" />
            )}
          </div>
          <CardTitle className="text-xl md:text-2xl font-bold text-gray-900">
            Verify Your {type === 'email' ? 'Email' : 'Mobile'}
          </CardTitle>
          <CardDescription className="text-gray-600 text-sm md:text-base">
            Enter the 6-digit code sent to{' '}
            <span className="font-semibold text-gray-800">{displayContact}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-4 md:px-6 pb-6">
          {/* OTP Input */}
          <div className="space-y-3">
            <Label className="text-sm md:text-base font-medium text-gray-700 block text-center">
              Verification Code
            </Label>
            
            {/* Mobile: Full width boxes, Desktop: Fixed width centered */}
            <div className="flex justify-center space-x-2 md:space-x-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={otp[index]}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className={`
                    w-12 h-12 md:w-14 md:h-14 text-center text-lg md:text-xl font-bold
                    transition-all duration-200 rounded-lg
                    ${error 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50' 
                      : otp[index] 
                        ? 'border-grass-500 bg-grass-50 text-grass-700'
                        : 'border-gray-300 focus:border-grass-500 focus:ring-grass-500'
                    }
                    ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:border-grass-400'}
                  `}
                  disabled={isLoading}
                  aria-label={`Digit ${index + 1} of verification code`}
                />
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <X className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800 text-sm">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Success Indicator */}
            {isOtpComplete && !error && !isLoading && (
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Code entered successfully</span>
              </div>
            )}

            {/* Helper Text */}
            <p className="text-xs md:text-sm text-gray-500 text-center">
              Enter the code or paste it in the first box
            </p>
          </div>

          {/* Verify Button */}
          <Button
            onClick={() => handleVerify()}
            disabled={isLoading || !isOtpComplete}
            className="w-full h-12 md:h-14 bg-grass-600 hover:bg-grass-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold text-sm md:text-base transition-all duration-200 hover:shadow-lg"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
                <span>Verifying...</span>
              </div>
            ) : (
              'Verify Code'
            )}
          </Button>

          {/* Resend Section */}
          <div className="text-center space-y-3 pt-2 border-t border-gray-200">
            <p className="text-sm md:text-base text-gray-600">
              Didn't receive the code?
            </p>
            
            {/* Timer Display */}
            {resendCooldown > 0 && (
              <div className="flex items-center justify-center space-x-2 text-gray-500">
                <Clock className="h-4 w-4" />
                <span className="text-sm">
                  Resend available in {Math.floor(resendCooldown / 60)}:
                  {(resendCooldown % 60).toString().padStart(2, '0')}
                </span>
              </div>
            )}
            
            <Button
              onClick={handleResendOtp}
              disabled={isResending || resendCooldown > 0 || resendAttempts >= 3}
              variant="outline"
              className="w-full h-12 border-grass-200 text-grass-600 hover:bg-grass-50 hover:border-grass-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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
                <div className="flex items-center space-x-2">
                  <X className="h-4 w-4" />
                  <span>Maximum attempts reached</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <RefreshCw className="h-4 w-4" />
                  <span>Resend Code</span>
                </div>
              )}
            </Button>

            {/* Attempts Counter */}
            {resendAttempts > 0 && resendAttempts < 3 && (
              <p className="text-xs text-gray-500">
                {3 - resendAttempts} attempts remaining
              </p>
            )}

            {/* Max Attempts Warning */}
            {resendAttempts >= 3 && (
              <Alert className="border-red-200 bg-red-50">
                <X className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800 text-sm">
                  Maximum resend attempts reached. Please contact support if you continue to have issues.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}