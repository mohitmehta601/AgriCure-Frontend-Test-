import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-900 text-white py-8 xs:py-10 sm:py-12">
      <div className="container mx-auto px-3 xs:px-4 sm:px-6">
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 xs:gap-7 sm:gap-8">
          <div className="col-span-1 xs:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-3 xs:mb-4">
              <img
                src="/logo.png"
                alt="AgriCure Logo"
                className="h-6 xs:h-7 sm:h-8 w-6 xs:w-7 sm:w-8"
              />
              <span className="text-lg xs:text-xl sm:text-2xl font-bold">
                AgriCure
              </span>
            </Link>
            <p className="text-gray-400 text-xs xs:text-sm sm:text-base leading-relaxed pr-0 xs:pr-4 lg:pr-0">
              {t("footer.tagline")}
            </p>
          </div>

          <div>
            <h3 className="text-sm xs:text-base sm:text-lg font-semibold mb-3 xs:mb-4">
              {t("footer.product")}
            </h3>
            <ul className="space-y-2 text-gray-400 text-xs xs:text-sm sm:text-base">
              <li>
                <a
                  href="#features"
                  className="hover:text-white transition-colors"
                >
                  {t("footer.features")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  {t("footer.pricing")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  {t("footer.api")}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm xs:text-base sm:text-lg font-semibold mb-3 xs:mb-4">
              {t("footer.support")}
            </h3>
            <ul className="space-y-2 text-gray-400 text-xs xs:text-sm sm:text-base">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  {t("footer.helpCenter")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  {t("footer.contactUs")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  {t("footer.community")}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm xs:text-base sm:text-lg font-semibold mb-3 xs:mb-4">
              {t("footer.company")}
            </h3>
            <ul className="space-y-2 text-gray-400 text-xs xs:text-sm sm:text-base">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  {t("footer.about")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  {t("footer.blog")}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  {t("footer.careers")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-6 xs:mt-7 sm:mt-8 pt-6 xs:pt-7 sm:pt-8 text-center text-gray-400 text-xs xs:text-sm sm:text-base">
          <p>{t("footer.copyright")}</p>
          <div className="mt-2">
            <Link
              to="/integration-test"
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Backend Integration Status
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
