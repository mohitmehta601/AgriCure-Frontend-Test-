import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Signup from './Signup';
import Login from './Login';
import OtpVerify from './OtpVerify';

type AuthStep = 'signup' | 'login' | 'otp';

interface VerificationData {
  type: 'email' | 'sms';
  email?: string;
  phone?: string;
  userData?: any;
}

interface AuthLayoutProps {
  initialStep?: AuthStep;
}

export default function AuthLayout({ initialStep = 'signup' }: AuthLayoutProps) {
  const [currentStep, setCurrentStep] = useState<AuthStep>(initialStep);
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null);

  const handleVerificationNeeded = (data: VerificationData) => {
    setVerificationData(data);
    setCurrentStep('otp');
  };

  const handleVerificationSuccess = () => {
    // This will be handled by the OtpVerify component navigation
  };

  const handleBackToSignup = () => {
    setCurrentStep('signup');
    setVerificationData(null);
  };

  const handleBackToLogin = () => {
    setCurrentStep('login');
    setVerificationData(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-grass-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <img src="/logo.png" alt="AgriCure Logo" className="h-10 w-10" />
            <span className="text-3xl font-bold text-grass-800">AgriCure</span>
          </Link>
          <p className="text-gray-600 mt-2">Smart Farming Solutions</p>
        </div>

        {/* Auth Steps */}
        {currentStep === 'signup' && (
          <div>
            <Signup onVerificationNeeded={handleVerificationNeeded} />
            <div className="mt-4 text-center">
              <Button
                variant="ghost"
                onClick={() => setCurrentStep('login')}
                className="text-grass-600 hover:text-grass-700"
              >
                Already have an account? Sign in
              </Button>
            </div>
          </div>
        )}

        {currentStep === 'login' && (
          <div>
            <Login onVerificationNeeded={handleVerificationNeeded} />
            <div className="mt-4 text-center">
              <Button
                variant="ghost"
                onClick={() => setCurrentStep('signup')}
                className="text-grass-600 hover:text-grass-700"
              >
                Don't have an account? Sign up
              </Button>
            </div>
          </div>
        )}

        {currentStep === 'otp' && verificationData && (
          <OtpVerify
            type={verificationData.type}
            email={verificationData.email}
            phone={verificationData.phone}
            userData={verificationData.userData}
            onBack={verificationData.userData?.identifier ? handleBackToLogin : handleBackToSignup}
            onSuccess={handleVerificationSuccess}
          />
        )}
      </div>
    </div>
  );
}