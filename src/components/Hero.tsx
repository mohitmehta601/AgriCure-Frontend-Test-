import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const Hero = () => {
  const { t } = useLanguage();

  return (
    <section
      id="home"
      className="py-8 xs:py-10 sm:py-12 md:py-16 lg:py-20 xl:py-24 2xl:py-32 gradient-bg"
    >
      <div className="container mx-auto px-3 xs:px-4 sm:px-6">
        <div className="text-center animate-fade-in">
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-3 xs:mb-4 md:mb-6 leading-tight">
            {t("hero.title")}
            <span className="text-grass-600 block xs:block sm:inline">
              {" "}
              {t("hero.titleHighlight")}
            </span>
          </h1>
          <p className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 mb-4 xs:mb-6 md:mb-8 max-w-xs xs:max-w-sm sm:max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto leading-relaxed px-2 xs:px-0">
            {t("hero.subtitle")}
          </p>
          <div className="flex flex-col xs:flex-col sm:flex-row gap-3 xs:gap-4 justify-center animate-slide-up max-w-sm xs:max-w-md sm:max-w-none mx-auto">
            <Button
              asChild
              size="lg"
              className="bg-grass-600 hover:bg-grass-700 text-sm xs:text-base md:text-lg px-4 xs:px-6 md:px-8 py-3 xs:py-4 md:py-6 w-full sm:w-auto"
            >
              <Link to="/signup">{t("hero.startTrial")}</Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="bg-grass-600 hover:bg-grass-700 text-sm xs:text-base md:text-lg px-4 xs:px-6 md:px-8 py-3 xs:py-4 md:py-6 w-full sm:w-auto"
            >
              <Link to="/video">{t("hero.viewDemo")}</Link>
            </Button>
          </div>
        </div>

        <div className="mt-8 xs:mt-10 sm:mt-12 md:mt-16 relative">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl xs:rounded-2xl shadow-xl xs:shadow-2xl p-4 xs:p-6 md:p-8 max-w-xs xs:max-w-sm sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto animate-slide-up">
            <div className="grid grid-cols-1 xs:grid-cols-3 gap-3 xs:gap-4 md:gap-6 text-center">
              <div className="p-2 xs:p-3 md:p-4">
                <div className="text-xl xs:text-2xl md:text-3xl font-bold text-grass-600 mb-1 xs:mb-2">
                  98%
                </div>
                <div className="text-gray-600 text-xs xs:text-sm md:text-base leading-tight">
                  {t("hero.accuracyRate")}
                </div>
              </div>
              <div className="p-2 xs:p-3 md:p-4">
                <div className="text-xl xs:text-2xl md:text-3xl font-bold text-grass-600 mb-1 xs:mb-2">
                  25%
                </div>
                <div className="text-gray-600 text-xs xs:text-sm md:text-base leading-tight">
                  {t("hero.yieldIncrease")}
                </div>
              </div>
              <div className="p-2 xs:p-3 md:p-4">
                <div className="text-xl xs:text-2xl md:text-3xl font-bold text-grass-600 mb-1 xs:mb-2">
                  15+
                </div>
                <div className="text-gray-600 text-xs xs:text-sm md:text-base leading-tight">
                  {t("hero.cropTypesSupported")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
