import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Leaf,
  AlertCircle,
  DollarSign,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import { FERTILIZER_INFO } from "@/services/fertilizerMLService";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";

interface FormData {
  fieldName: string;
  fieldSize: string;
  sizeUnit: string;
  cropType: string;
  soilPH: string;
  nitrogen: string;
  phosphorus: string;
  potassium: string;
  soilType: string;
  temperature: string;
  humidity: string;
  soilMoisture: string;
}

interface EnhancedRecommendation {
  primaryFertilizer: {
    name: string;
    amount: string;
    reason: string;
    applicationMethod: string;
  };
  secondaryFertilizer: {
    name: string;
    amount: string;
    reason: string;
    applicationMethod: string;
  };
  organicOptions: Array<{
    name: string;
    amount: string;
    benefits: string;
    applicationTiming: string;
  }>;
  applicationTiming: {
    primary: string;
    secondary: string;
    organic: string;
  };
  costEstimate: {
    primary: string;
    secondary: string;
    organic: string;
    total: string;
  };
  soilConditionAnalysis: {
    phStatus: string;
    nutrientDeficiency: string[];
    moistureStatus: string;
    recommendations: string[];
  };
  mlPrediction: {
    fertilizer: string;
    confidence: number;
  };
}

interface DetailedFertilizerRecommendationsProps {
  recommendations: EnhancedRecommendation | null;
  formData: FormData | null;
  isFromHistory?: boolean;
}

const DetailedFertilizerRecommendations = ({
  recommendations,
  formData,
  isFromHistory = false,
}: DetailedFertilizerRecommendationsProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  if (!recommendations || !formData) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
          <AlertCircle className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mb-4" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
            {t("dashboard.noRecommendationsYet")}
          </h3>
          <p className="text-sm sm:text-base text-gray-600 text-center">
            {t("dashboard.completeFormForRecommendations")}
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleBack = () => {
    if (isFromHistory) {
      navigate("/dashboard", { state: { activeTab: "overview" } });
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 max-w-7xl">
        {/* Header with Back Button */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center space-x-2 sm:space-x-4 mb-4">
            <Button
              onClick={handleBack}
              variant="outline"
              size="sm"
              className="flex items-center space-x-1 sm:space-x-2 bg-white hover:bg-gray-50 border border-gray-200 text-xs sm:text-sm"
            >
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
          </div>
        </div>

        {/* Main Title and Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-2 sm:mb-4">
            <img
              src="/logo.png"
              alt="AgriCure Logo"
              className="h-8 w-8 sm:h-10 sm:w-10"
            />
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-600">
              AgriCure
            </h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600 px-4 sm:px-0">
            Advanced ML + LLM Powered Agricultural Intelligence
          </p>
        </div>

        {/* AI-Powered Analysis Header */}
        <Card className="mb-4 sm:mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <CardTitle className="text-lg sm:text-xl text-blue-900">
                  AI-Powered Analysis
                </CardTitle>
              </div>
              <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs sm:text-sm w-fit">
                Enhanced ML + LLM
              </Badge>
            </div>
            <CardDescription className="text-blue-700 text-sm sm:text-base">
              Advanced soil data learning with large language model enhancement
              for North Field
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="text-center bg-white p-3 sm:p-4 rounded-lg border">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">
                  5.5 acres
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  Field Size
                </div>
              </div>
              <div className="text-center bg-white p-3 sm:p-4 rounded-lg border">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-600">
                  Wheat
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Crop</div>
              </div>
              <div className="text-center bg-white p-3 sm:p-4 rounded-lg border">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-amber-600">
                  Clayey
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  Soil Type
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Soil Analysis */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <CardTitle className="text-lg sm:text-xl">
                Soil Analysis
              </CardTitle>
            </div>
            <CardDescription className="text-sm sm:text-base">
              Comprehensive soil condition assessment with nutrient conversions
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-4 sm:space-y-6">
              {/* Current Status */}
              <div>
                <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">
                  Current Status
                </h4>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-1 sm:space-y-0">
                    <span className="text-xs sm:text-sm font-medium">
                      pH Status:
                    </span>
                    <Badge className="bg-green-100 text-green-800 w-fit text-xs">
                      Needs amendment
                    </Badge>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-1 sm:space-y-0">
                    <span className="text-xs sm:text-sm font-medium">
                      Moisture Status:
                    </span>
                    <Badge className="bg-green-100 text-green-800 w-fit text-xs">
                      Optimal
                    </Badge>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-1 sm:space-y-0">
                    <span className="text-xs sm:text-sm font-medium">
                      Nutrient Deficiencies:
                    </span>
                    <Badge className="bg-red-500 text-white w-fit text-xs">
                      Nitrogen
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Soil Test Values */}
              <div>
                <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">
                  Soil Test Values
                </h4>
                <div className="bg-blue-50 p-3 sm:p-4 rounded-lg mb-3 sm:mb-4">
                  <div className="text-xs sm:text-sm text-blue-700 mb-2">
                    Conversion Parameters:
                  </div>
                  <div className="text-xs sm:text-sm text-blue-600 space-y-1">
                    <div>Bulk Density: 1.3 g/cm³</div>
                    <div>Sampling Depth: 15 cm</div>
                  </div>
                </div>

                <div className="bg-white border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[280px]">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-700">
                            Nutrient
                          </th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-medium text-gray-700">
                            mg/kg
                          </th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-medium text-gray-700">
                            kg/ha
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium">
                            N
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm">
                            8
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm text-green-600 font-medium">
                            15.6
                          </td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium">
                            P
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm">
                            65
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm text-green-600 font-medium">
                            126.75
                          </td>
                        </tr>
                        <tr>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium">
                            K
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm">
                            58
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm text-green-600 font-medium">
                            113.1
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Expert Recommendations */}
              <div>
                <h4 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">
                  Expert Recommendations
                </h4>
                <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                    <span>
                      Apply pH amendment: Sulphur (Tea prefers acidic)
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                    <span>Maintain current moisture levels</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                    <span>Address Nitrogen deficiency</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                    <span>
                      Regular soil testing every 6 months is recommended
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 sm:mt-2 flex-shrink-0"></div>
                    <span>Consider crop rotation to maintain soil health</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Primary and Secondary Fertilizers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Primary Fertilizer */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <CardTitle className="text-lg sm:text-xl text-green-900">
                  Primary Fertilizer
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="bg-white p-4 sm:p-6 rounded-lg border">
                <h3 className="text-lg sm:text-xl font-bold text-green-800 mb-2">
                  Ammonium Sulphate
                </h3>
                <div className="text-base sm:text-lg font-semibold text-green-600 mb-3 sm:mb-4">
                  688 kg for 5.5 acres
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      Why this fertilizer:
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600">
                      ML model detected too low levels. Selected as primary
                      fertilizer based on soil analysis and crop requirements
                      for vegetative growth and protein synthesis.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      Application Method:
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Apply 2-3 split doses as top dressing during vegetative
                      growth.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Secondary Fertilizer */}
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <CardTitle className="text-lg sm:text-xl text-blue-900">
                  Secondary Fertilizer
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="bg-white p-4 sm:p-6 rounded-lg border">
                <h3 className="text-lg sm:text-xl font-bold text-blue-800 mb-2">
                  Rhizobium
                </h3>
                <div className="text-base sm:text-lg font-semibold text-blue-600 mb-3 sm:mb-4">
                  330 kg for 5.5 acres
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      Why this fertilizer:
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600">
                      ML model detected optimal levels. Selected as secondary
                      fertilizer based on soil analysis and crop requirements.
                      Provides balanced nutrition according to soil test
                      recommendations.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      Application Method:
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Follow label guidance and local agronomy recommendations.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Organic Alternatives */}
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center space-x-2">
              <Leaf className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              <CardTitle className="text-lg sm:text-xl">
                Organic Alternatives
              </CardTitle>
            </div>
            <CardDescription className="text-sm sm:text-base">
              Sustainable and eco-friendly fertilizer options
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-green-50 p-3 sm:p-4 rounded-lg border">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 sm:mb-3 space-y-1 sm:space-y-0">
                  <h4 className="font-semibold text-green-800 text-sm sm:text-base">
                    Vermicompost
                  </h4>
                  <Badge className="bg-green-100 text-green-800 text-xs w-fit">
                    500 kg
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                  Incorporate into topsoil 2-3 weeks before sowing for
                  mineralization.
                </p>
                <div className="text-xs text-green-700">
                  <strong>Application:</strong> Apply over land preparation or
                  at basal before sowing
                </div>
              </div>

              <div className="bg-green-50 p-3 sm:p-4 rounded-lg border">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 sm:mb-3 space-y-1 sm:space-y-0">
                  <h4 className="font-semibold text-green-800 text-sm sm:text-base">
                    Mustard cake
                  </h4>
                  <Badge className="bg-green-100 text-green-800 text-xs w-fit">
                    183 kg
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                  Potent field guidance and local agronomy recommendations.
                </p>
                <div className="text-xs text-green-700">
                  <strong>Application:</strong> Apply over land preparation or
                  at basal before sowing
                </div>
              </div>

              <div className="bg-green-50 p-3 sm:p-4 rounded-lg border sm:col-span-2 lg:col-span-1">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 sm:mb-3 space-y-1 sm:space-y-0">
                  <h4 className="font-semibold text-green-800 text-sm sm:text-base">
                    Compost
                  </h4>
                  <Badge className="bg-green-100 text-green-800 text-xs w-fit">
                    2200 kg
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                  Incorporate into topsoil 2-3 weeks before sowing for
                  mineralization.
                </p>
                <div className="text-xs text-green-700">
                  <strong>Application:</strong> Apply over land preparation or
                  at basal before sowing
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Application Timing and Cost Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Application Timing */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                <CardTitle className="text-lg sm:text-xl">
                  Application Timing
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-1 sm:mb-2 text-sm sm:text-base">
                    Primary Fertilizer
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Best main fertilizer before 2025-06-10 and again in 2 a
                    small doses as crop grows.
                  </p>
                </div>

                <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-1 sm:mb-2 text-sm sm:text-base">
                    Secondary Fertilizer
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Use during flowering or fruiting stage 2024-08-10 when the
                    crop needs extra boost.
                  </p>
                </div>

                <div className="bg-amber-50 p-3 sm:p-4 rounded-lg">
                  <h4 className="font-semibold text-amber-800 mb-1 sm:mb-2 text-sm sm:text-base">
                    Organic Options
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Mix into soil 2-3 weeks before 2025-10-10 to fit breaks down
                    in time.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cost Analysis */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                <CardTitle className="text-lg sm:text-xl">
                  Cost Analysis
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded">
                  <span className="font-medium text-sm sm:text-base">
                    Primary:
                  </span>
                  <span className="font-semibold text-green-600 text-sm sm:text-base">
                    ₹16,519
                  </span>
                </div>

                <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded">
                  <span className="font-medium text-sm sm:text-base">
                    Secondary:
                  </span>
                  <span className="font-semibold text-blue-600 text-sm sm:text-base">
                    ₹4,950
                  </span>
                </div>

                <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded">
                  <span className="font-medium text-sm sm:text-base">
                    Organic:
                  </span>
                  <span className="font-semibold text-amber-600 text-sm sm:text-base">
                    ₹53,000
                  </span>
                </div>

                <div className="bg-green-50 p-3 sm:p-4 rounded-lg border-2 border-green-200">
                  <div className="flex justify-between items-center mb-1 sm:mb-2">
                    <span className="font-bold text-green-800 text-sm sm:text-base">
                      Total Estimate:
                    </span>
                    <span className="text-lg sm:text-xl font-bold text-green-600">
                      ₹74,462
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    For 2.23 hectares (5.5 acres). These fertilizer prices may
                    be the provider when available. Select to find new state
                    like Gujarat.
                  </p>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <h4 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">
                    Detailed Breakdown
                  </h4>

                  <div className="bg-green-100 p-2 sm:p-3 rounded">
                    <div className="font-medium text-green-800 text-xs sm:text-sm">
                      Primary - Ammonium Sulphate
                    </div>
                    <div className="text-xs text-green-600">
                      688 kg × ₹24 = ₹16,512
                    </div>
                  </div>

                  <div className="bg-blue-100 p-2 sm:p-3 rounded">
                    <div className="font-medium text-blue-800 text-xs sm:text-sm">
                      Secondary - Rhizobium
                    </div>
                    <div className="text-xs text-blue-600">
                      330 kg × ₹15 = ₹4,950
                    </div>
                  </div>

                  <div className="bg-orange-100 p-2 sm:p-3 rounded">
                    <div className="font-medium text-orange-800 text-xs sm:text-sm">
                      Organic (3 options)
                    </div>
                    <div className="text-xs text-orange-600">
                      Best value for ₹53,000
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DetailedFertilizerRecommendations;
