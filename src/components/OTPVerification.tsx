import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mail, Smartphone, RefreshCw, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { otpService } from "@/services/otpService";
import { authService, TempUserData } from "@/services/authService";
import { useLanguage } from "@/contexts/LanguageContext";
import EnhancedOTPInput from "./EnhancedOTPInput";

interface OTPVerificationProps {
  tempUserData: TempUserData;
  onVerificationComplete: () => void;
  onBack: () => void;
}

const OTPVerification = ({ tempUserData, onVerificationComplete, onBack }: OTPVerificationProps) => {
  const [selectedMethod, setSelectedMethod] = useState<'email' | 'phone'>('email');
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { toast } = useToast();
  const { t } = useLanguage();

  // Countdown timer for resend button
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const sendOTP = async () => {
    setIsLoading(true);
    try {
      let result;
      if (selectedMethod === 'email') {
        result = await otpService.sendEmailOTPForSignup(tempUserData.email);
      } else {
        const formattedPhone = tempUserData.mobileNumber.startsWith('+') 
          ? tempUserData.mobileNumber 
          : `+91${tempUserData.mobileNumber}`;
        result = await otpService.sendPhoneOTPForSignup(formattedPhone);
      }

      if (result.error) {
        throw result.error;
      }

      setOtpSent(true);
      setCountdown(60); // 60 seconds countdown
      toast({
        title: "OTP Sent",
        description: `Verification code sent to your ${selectedMethod === 'email' ? 'email' : 'mobile number'}`,
      });
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      toast({
        title: "Failed to Send OTP",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit OTP",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Verify OTP
      const verificationData = {
        type: selectedMethod,
        token: otp,
        email: selectedMethod === 'email' ? tempUserData.email : undefined,
        phone: selectedMethod === 'phone' 
          ? (tempUserData.mobileNumber.startsWith('+') ? tempUserData.mobileNumber : `+91${tempUserData.mobileNumber}`)
          : undefined,
      };

      const { data: verifyData, error: verifyError } = await otpService.verifyOTP(verificationData);
      
      if (verifyError) {
        throw verifyError;
      }

      // If verification successful, complete signup (user already created by OTP)
      if (verifyData.user) {
        const { data: signupData, error: signupError } = await authService.completeSignupAfterOTP({
          email: tempUserData.email,
          password: tempUserData.password,
          fullName: tempUserData.fullName,
          productId: tempUserData.productId,
          mobileNumber: tempUserData.mobileNumber,
        }, verifyData.user.id);

        if (signupError) {
          throw signupError;
        }
      }

      // Clear temporary data
      authService.clearTempUserData();

      toast({
        title: "Account Verified!",
        description: "Your account has been successfully created and verified.",
      });

      onVerificationComplete();
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid OTP. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resendOTP = async () => {
    setIsResending(true);
    try {
      const result = await otpService.resendOTPForSignup({
        type: selectedMethod,
        email: selectedMethod === 'email' ? tempUserData.email : undefined,
        phone: selectedMethod === 'phone' 
          ? (tempUserData.mobileNumber.startsWith('+') ? tempUserData.mobileNumber : `+91${tempUserData.mobileNumber}`)
          : undefined,
      });

      if (result.error) {
        throw result.error;
      }

      setCountdown(60);
      toast({
        title: "OTP Resent",
        description: `New verification code sent to your ${selectedMethod === 'email' ? 'email' : 'mobile number'}`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to Resend OTP",
        description: error.message || "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsResending(false);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    if (phone.length === 10) {
      return `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;
    }
    return phone;
  };

  const maskEmail = (email: string) => {
    const [username, domain] = email.split('@');
    const maskedUsername = username.slice(0, 2) + '*'.repeat(username.length - 2);
    return `${maskedUsername}@${domain}`;
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-0">
      <CardHeader className="text-center px-4 md:px-6">
        <div className="flex items-center justify-center mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="absolute left-4 top-4 flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CheckCircle className="h-12 w-12 text-grass-600" />
        </div>
        <CardTitle className="text-xl md:text-2xl font-bold text-gray-900">
          Verify Your Account
        </CardTitle>
        <CardDescription className="text-gray-600 text-sm md:text-base">
          Choose your preferred verification method
        </CardDescription>
      </CardHeader>
      
      <CardContent className="px-4 md:px-6 space-y-6">
        {!otpSent ? (
          <>
            {/* Verification Method Selection */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">Choose Verification Method</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={selectedMethod === 'email' ? 'default' : 'outline'}
                  onClick={() => setSelectedMethod('email')}
                  className="flex items-center space-x-2 h-auto py-3"
                >
                  <Mail className="h-4 w-4" />
                  <div className="text-left">
                    <div className="text-sm font-medium">Email</div>
                    <div className="text-xs opacity-70">{maskEmail(tempUserData.email)}</div>
                  </div>
                </Button>
                
                <Button
                  variant={selectedMethod === 'phone' ? 'default' : 'outline'}
                  onClick={() => setSelectedMethod('phone')}
                  className="flex items-center space-x-2 h-auto py-3"
                >
                  <Smartphone className="h-4 w-4" />
                  <div className="text-left">
                    <div className="text-sm font-medium">SMS</div>
                    <div className="text-xs opacity-70">{formatPhoneNumber(tempUserData.mobileNumber)}</div>
                  </div>
                </Button>
              </div>
            </div>

            {/* Send OTP Button */}
            <Button
              onClick={sendOTP}
              disabled={isLoading}
              className="w-full bg-grass-600 hover:bg-grass-700"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Sending OTP...</span>
                </div>
              ) : (
                `Send OTP via ${selectedMethod === 'email' ? 'Email' : 'SMS'}`
              )}
            </Button>
          </>
        ) : (
          <>
            {/* OTP Input */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2">
                {selectedMethod === 'email' ? (
                  <Mail className="h-5 w-5 text-grass-600" />
                ) : (
                  <Smartphone className="h-5 w-5 text-grass-600" />
                )}
                <Badge variant="secondary" className="bg-grass-100 text-grass-800">
                  OTP sent to {selectedMethod === 'email' ? maskEmail(tempUserData.email) : formatPhoneNumber(tempUserData.mobileNumber)}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-sm font-medium">
                  Enter 6-digit verification code
                </Label>
                <EnhancedOTPInput
                  value={otp}
                  onChange={setOtp}
                  length={6}
                  label=""
                  autoFocus={true}
                />
              </div>
            </div>

            {/* Verify Button */}
            <Button
              onClick={verifyOTP}
              disabled={isLoading || otp.length !== 6}
              className="w-full bg-grass-600 hover:bg-grass-700"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Verifying...</span>
                </div>
              ) : (
                "Verify & Create Account"
              )}
            </Button>

            {/* Resend OTP */}
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">Didn't receive the code?</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={resendOTP}
                disabled={isResending || countdown > 0}
                className="text-grass-600 hover:text-grass-700"
              >
                {isResending ? (
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Resending...</span>
                  </div>
                ) : countdown > 0 ? (
                  `Resend in ${countdown}s`
                ) : (
                  "Resend OTP"
                )}
              </Button>
            </div>

            {/* Change Method */}
            <div className="text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setOtpSent(false);
                  setOtp("");
                  setCountdown(0);
                }}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Change verification method
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default OTPVerification;