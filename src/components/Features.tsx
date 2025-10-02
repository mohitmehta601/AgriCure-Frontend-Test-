import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Leaf,
  Target,
  BarChart3,
  Users,
  Smartphone,
  Shield,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Features = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: (
        <Target className="h-5 xs:h-6 sm:h-7 md:h-8 w-5 xs:w-6 sm:w-7 md:w-8 text-grass-600" />
      ),
      title: t("features.preciseAnalysis.title"),
      description: t("features.preciseAnalysis.description"),
    },
    {
      icon: (
        <Leaf className="h-5 xs:h-6 sm:h-7 md:h-8 w-5 xs:w-6 sm:w-7 md:w-8 text-grass-600" />
      ),
      title: t("features.smartRecommendations.title"),
      description: t("features.smartRecommendations.description"),
    },
    {
      icon: (
        <BarChart3 className="h-5 xs:h-6 sm:h-7 md:h-8 w-5 xs:w-6 sm:w-7 md:w-8 text-grass-600" />
      ),
      title: t("features.yieldTracking.title"),
      description: t("features.yieldTracking.description"),
    },
    {
      icon: (
        <Smartphone className="h-5 xs:h-6 sm:h-7 md:h-8 w-5 xs:w-6 sm:w-7 md:w-8 text-grass-600" />
      ),
      title: t("features.mobileDesign.title"),
      description: t("features.mobileDesign.description"),
    },
    {
      icon: (
        <Users className="h-5 xs:h-6 sm:h-7 md:h-8 w-5 xs:w-6 sm:w-7 md:w-8 text-grass-600" />
      ),
      title: t("features.expertSupport.title"),
      description: t("features.expertSupport.description"),
    },
    {
      icon: (
        <Shield className="h-5 xs:h-6 sm:h-7 md:h-8 w-5 xs:w-6 sm:w-7 md:w-8 text-grass-600" />
      ),
      title: t("features.dataSecurity.title"),
      description: t("features.dataSecurity.description"),
    },
  ];

  return (
    <section
      id="features"
      className="py-8 xs:py-10 sm:py-12 md:py-16 lg:py-20 bg-white"
    >
      <div className="container mx-auto px-3 xs:px-4 sm:px-6">
        <div className="text-center mb-8 xs:mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 xs:mb-4 leading-tight">
            {t("features.title")}
          </h2>
          <p className="text-sm xs:text-base sm:text-lg md:text-xl text-gray-600 max-w-sm xs:max-w-lg sm:max-w-xl md:max-w-2xl mx-auto leading-relaxed px-2 xs:px-0">
            {t("features.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-5 sm:gap-6 md:gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md h-full hover:scale-105"
            >
              <CardHeader className="pb-3 xs:pb-4 p-4 xs:p-5 sm:p-6">
                <div className="mb-3 xs:mb-4">{feature.icon}</div>
                <CardTitle className="text-base xs:text-lg sm:text-xl text-gray-900 leading-tight">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 p-4 xs:p-5 sm:p-6">
                <CardDescription className="text-gray-600 text-xs xs:text-sm sm:text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
