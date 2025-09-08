import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authService, TempUserData } from "@/services/authService";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import OTPVerification from "@/components/OTPVerification";

const Signup = () => {
  const [formData, setFormData] = useState({
    productId: "",
    name: "",
    mobileNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [tempUserData, setTempUserData] = useState<TempUserData | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Format mobile number (remove non-digits and limit to 10 digits)
    if (e.target.name === 'mobileNumber') {
      value = value.replace(/\D/g, '').slice(0, 10);
    }
    
    setFormData(prev => ({
      ...prev,
      [e.target.name]: value
    }));
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.productId.trim()) errors.push("Product ID is required");
    if (!formData.name.trim()) errors.push("Full name is required");
    if (!formData.email.trim()) errors.push("Email is required");
    if (!formData.mobileNumber.trim()) errors.push("Mobile number is required");
    if (formData.mobileNumber.length !== 10) errors.push("Mobile number must be 10 digits");
    if (!formData.password) errors.push("Password is required");
    if (formData.password.length < 6) errors.push("Password must be at least 6 characters");
    if (formData.password !== formData.confirmPassword) errors.push("Passwords do not match");
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.push("Please enter a valid email address");
    }
    
    return errors;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      toast({
        title: t('common.error'),
        description: validationErrors[0],
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Validate product ID first
      const { isValid, error: productError } = await authService.validateProductId(formData.productId);
      
      if (!isValid) {
        throw new Error('Invalid Product ID. Please check your Product ID and try again.');
      }

      // Store temporary user data
      const tempData: TempUserData = {
        productId: formData.productId,
        fullName: formData.name,
        mobileNumber: formData.mobileNumber.startsWith('+') ? formData.mobileNumber : `+91${formData.mobileNumber}`,
        email: formData.email,
        password: formData.password,
      };
      
      await authService.storeTempUserData(tempData);
      setTempUserData(tempData);
      setShowOTPVerification(true);
      
      toast({
        title: "Ready for Verification",
        description: "Please choose your verification method to complete registration",
      });
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: t('auth.signupFailed'),
        description: error.message || t('auth.failedToCreateAccount'),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationComplete = () => {
    toast({
      title: t('auth.accountCreated'),
      description: t('auth.welcomeToAgriCure'),
    });
    navigate("/login");
  };

  const handleBackFromOTP = () => {
    setShowOTPVerification(false);
    setTempUserData(null);
    authService.clearTempUserData();
  };
  const handleBack = () => {
    navigate("/");
  };

  if (showOTPVerification && tempUserData) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6 md:mb-8">
            <Link to="/" className="inline-flex items-center space-x-2">
              <img src="/logo.png" alt="AgriCure Logo" className="h-8 w-8" />
              <span className="text-2xl md:text-3xl font-bold text-grass-800">AgriCure</span>
            </Link>
          </div>
          <OTPVerification
            tempUserData={tempUserData}
            onVerificationComplete={handleVerificationComplete}
            onBack={handleBackFromOTP}
          />
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-grass-600"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t('auth.backToHome')}</span>
          </Button>
        </div>

        <div className="text-center mb-6 md:mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <img src="/logo.png" alt="AgriCure Logo" className="h-8 w-8" />
            <span className="text-2xl md:text-3xl font-bold text-grass-800">AgriCure</span>
          </Link>
          <div className="mt-4 flex justify-center">
            <LanguageSwitcher />
          </div>
        </div>
        
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center px-4 md:px-6">
            <CardTitle className="text-xl md:text-2xl font-bold text-gray-900">{t('auth.createAccount')}</CardTitle>
            <CardDescription className="text-gray-600 text-sm md:text-base">
              {t('auth.signupAccount')}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 md:px-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="productId" className="text-sm md:text-base">Product ID *</Label>
                <Input
                  id="productId"
                  name="productId"
                  type="text"
                  placeholder="Enter your product ID"
                  value={formData.productId}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="name" className="text-sm md:text-base">{t('auth.fullName')}</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="mobileNumber" className="text-sm md:text-base">Mobile Number *</Label>
                <div className="flex mt-1">
                  <div className="flex items-center px-3 bg-gray-50 border border-r-0 border-gray-300 rounded-l-md">
                    <span className="text-sm text-gray-600">+91</span>
                  </div>
                  <Input
                    id="mobileNumber"
                    name="mobileNumber"
                    type="tel"
                    placeholder="9876543210"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    required
                    className="rounded-l-none"
                    maxLength={10}
                  />
                </div>
                {formData.mobileNumber && formData.mobileNumber.length !== 10 && (
                  <p className="text-xs text-red-600 mt-1">Mobile number must be 10 digits</p>
                )}
              </div>
              <div>
                <Label htmlFor="email" className="text-sm md:text-base">{t('auth.email')}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="farmer@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="password" className="text-sm md:text-base">{t('auth.password')}</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a password (min 6 characters)"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="mt-1"
                  minLength={6}
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword" className="text-sm md:text-base">{t('auth.confirmPassword')}</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
                {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
                )}
              </div>
              <Button 
                type="submit" 
                className="w-full bg-grass-600 hover:bg-grass-700 text-sm md:text-base py-2 md:py-3"
                disabled={isLoading}
              >
                {isLoading ? "Validating..." : "Continue to Verification"}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm md:text-base">
                {t('auth.alreadyHaveAccount')}{" "}
                <Link to="/login" className="text-grass-600 hover:text-grass-700 font-medium">
                  {t('auth.signInHere')}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;