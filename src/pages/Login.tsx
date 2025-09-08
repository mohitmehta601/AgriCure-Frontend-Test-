import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/authService";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const Login = () => {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  const validateInput = () => {
    if (!emailOrPhone.trim()) {
      toast({
        title: t('common.error'),
        description: "Please enter your email or mobile number",
        variant: "destructive"
      });
      return false;
    }
    
    if (!password) {
      toast({
        title: t('common.error'),
        description: "Please enter your password",
        variant: "destructive"
      });
      return false;
    }
    
    // Validate email format if it contains @
    if (emailOrPhone.includes('@')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailOrPhone)) {
        toast({
          title: t('common.error'),
          description: "Please enter a valid email address",
          variant: "destructive"
        });
        return false;
      }
    } else {
      // Validate mobile number format (should be 10 digits)
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(emailOrPhone)) {
        toast({
          title: t('common.error'),
          description: "Please enter a valid 10-digit mobile number",
          variant: "destructive"
        });
        return false;
      }
    }
    
    return true;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateInput()) {
      return;
    }
    
    setIsLoading(true);

    try {
      // Format the input properly
      const formattedInput = emailOrPhone.includes('@') 
        ? emailOrPhone 
        : (emailOrPhone.startsWith('+') ? emailOrPhone : `+91${emailOrPhone}`);
        
      const { data, error } = await authService.signIn({ 
        emailOrPhone: formattedInput, 
        password 
      });
      
      if (error) {
        throw error;
      }

      if (data.user) {
        toast({
          title: t('auth.loginSuccess'),
          description: `Welcome back!`,
        });
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: t('auth.loginFailed'),
        description: error.message || 'Invalid credentials. Please check your email/mobile and password.',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInputPlaceholder = () => {
    return emailOrPhone.includes('@') || emailOrPhone.length === 0 
      ? "Enter email or mobile number" 
      : "Enter 10-digit mobile number";
  };

  const getInputType = () => {
    return emailOrPhone.includes('@') ? "email" : "tel";
  };
  const handleBack = () => {
    navigate("/");
  };

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
            <CardTitle className="text-xl md:text-2xl font-bold text-gray-900">{t('auth.welcomeBack')}</CardTitle>
            <CardDescription className="text-gray-600 text-sm md:text-base">
              {t('auth.signInAccount')}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 md:px-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="emailOrPhone" className="text-sm md:text-base">
                  Email or Mobile Number *
                </Label>
                <Input
                  id="emailOrPhone"
                  type={getInputType()}
                  placeholder={getInputPlaceholder()}
                  value={emailOrPhone}
                  onChange={(e) => {
                    let value = e.target.value;
                    // If it's not an email (no @), format as mobile number
                    if (!value.includes('@')) {
                      value = value.replace(/\D/g, '').slice(0, 10);
                    }
                    setEmailOrPhone(value);
                  }}
                  required
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  You can use either your email address or 10-digit mobile number
                </p>
              </div>
              <div>
                <Label htmlFor="password" className="text-sm md:text-base">{t('auth.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-grass-600 hover:bg-grass-700 text-sm md:text-base py-2 md:py-3"
                disabled={isLoading}
              >
                {isLoading ? t('common.loading') : t('auth.login')}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm md:text-base">
                {t('auth.haveAccount')}{" "}
                <Link to="/signup" className="text-grass-600 hover:text-grass-700 font-medium">
                  {t('auth.signupHere')}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;