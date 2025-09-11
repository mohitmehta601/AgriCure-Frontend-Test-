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
    <div className="min-h-screen bg-gradient-to-br from-grass-50 via-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md lg:max-w-lg">
        {/* Logo Header */}
        <div className="text-center mb-6 md:mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center space-x-3 group transition-all duration-300 hover:scale-105"
          >
            <div className="p-2 bg-white rounded-full shadow-lg group-hover:shadow-xl transition-shadow duration-300">
              <img src="/logo.png" alt="AgriCure Logo" className="h-8 w-8 md:h-10 md:w-10" />
            </div>
            <div className="text-left">
              <span className="text-2xl md:text-3xl font-bold text-grass-800 block">AgriCure</span>
              <span className="text-xs md:text-sm text-gray-600">Smart Farming Solutions</span>
            </div>
          </Link>
        </div>

        {/* Auth Steps */}
        <div className="relative">
          {/* Step Indicator */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
              <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                currentStep === 'signup' ? 'bg-grass-600' : 'bg-gray-300'
              }`} />
              <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                currentStep === 'otp' ? 'bg-grass-600' : 'bg-gray-300'
              }`} />
              <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                currentStep === 'login' ? 'bg-grass-600' : 'bg-gray-300'
              }`} />
            </div>
          </div>

          {/* Content */}
          <div className="transition-all duration-300">
            {currentStep === 'signup' && (
              <div className="animate-in slide-in-from-right-5 duration-300">
                <Signup onVerificationNeeded={handleVerificationNeeded} />
                <div className="mt-6 text-center">
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentStep('login')}
                    className="text-grass-600 hover:text-grass-700 font-medium transition-colors"
                  >
                    Already have an account? Sign in
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 'login' && (
              <div className="animate-in slide-in-from-left-5 duration-300">
                <Login onVerificationNeeded={handleVerificationNeeded} />
                <div className="mt-6 text-center">
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentStep('signup')}
                    className="text-grass-600 hover:text-grass-700 font-medium transition-colors"
                  >
                    Don't have an account? Sign up
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 'otp' && verificationData && (
              <div className="animate-in slide-in-from-bottom-5 duration-300">
                <OtpVerify
                  type={verificationData.type}
                  email={verificationData.email}
                  phone={verificationData.phone}
                  userData={verificationData.userData}
                  onBack={verificationData.userData?.identifier ? handleBackToLogin : handleBackToSignup}
                  onSuccess={handleVerificationSuccess}
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-xs md:text-sm text-gray-500">
          <p>
            By continuing, you agree to our{' '}
            <Link to="/terms" className="text-grass-600 hover:text-grass-700 underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-grass-600 hover:text-grass-700 underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}