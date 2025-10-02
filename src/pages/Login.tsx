import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/authService";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await authService.signIn({ email, password });

      if (error) {
        throw error;
      }

      if (data.user) {
        toast({
          title: t("auth.loginSuccess"),
          description: t("auth.welcomeBack"),
        });
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: t("auth.loginFailed"),
        description: error.message || t("auth.invalidCredentials"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-3 xs:p-4 sm:p-6">
      <div className="w-full max-w-xs xs:max-w-sm sm:max-w-md">
        {/* Back Button */}
        <div className="mb-3 xs:mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="flex items-center space-x-1 xs:space-x-2 text-gray-600 hover:text-grass-600 text-xs xs:text-sm"
          >
            <ArrowLeft className="h-3 xs:h-4 w-3 xs:w-4" />
            <span>{t("auth.backToHome")}</span>
          </Button>
        </div>

        <div className="text-center mb-4 xs:mb-6 md:mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <img
              src="/logo.png"
              alt="AgriCure Logo"
              className="h-6 xs:h-7 sm:h-8 w-6 xs:w-7 sm:w-8"
            />
            <span className="text-xl xs:text-2xl sm:text-3xl font-bold text-grass-800">
              AgriCure
            </span>
          </Link>
          <div className="mt-3 xs:mt-4 flex justify-center">
            <LanguageSwitcher />
          </div>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="text-center px-3 xs:px-4 sm:px-6 py-4 xs:py-5 sm:py-6">
            <CardTitle className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
              {t("auth.welcomeBack")}
            </CardTitle>
            <CardDescription className="text-gray-600 text-xs xs:text-sm sm:text-base leading-relaxed mt-2">
              {t("auth.signInAccount")}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-3 xs:px-4 sm:px-6 pb-4 xs:pb-5 sm:pb-6">
            <form onSubmit={handleSubmit} className="space-y-3 xs:space-y-4">
              <div>
                <Label
                  htmlFor="email"
                  className="text-xs xs:text-sm sm:text-base font-medium"
                >
                  {t("auth.email")}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="farmer@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 h-8 xs:h-9 sm:h-10 text-xs xs:text-sm"
                />
              </div>
              <div>
                <Label
                  htmlFor="password"
                  className="text-xs xs:text-sm sm:text-base font-medium"
                >
                  {t("auth.password")}
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 h-8 xs:h-9 sm:h-10 text-xs xs:text-sm"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-grass-600 hover:bg-grass-700 text-xs xs:text-sm sm:text-base py-2 xs:py-3 sm:py-3 mt-4 xs:mt-5 sm:mt-6"
                disabled={isLoading}
              >
                {isLoading ? t("common.loading") : t("auth.login")}
              </Button>
            </form>

            <div className="mt-4 xs:mt-5 sm:mt-6 text-center">
              <p className="text-gray-600 text-xs xs:text-sm sm:text-base leading-relaxed">
                {t("auth.haveAccount")}{" "}
                <Link
                  to="/signup"
                  className="text-grass-600 hover:text-grass-700 font-medium"
                >
                  {t("auth.signupHere")}
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
