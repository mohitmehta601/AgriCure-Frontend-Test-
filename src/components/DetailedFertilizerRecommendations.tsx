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
  Droplets,
  Thermometer,
  Brain,
  Beaker,
  Zap,
  Target,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Info,
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

  const convertToHectares = (size: number, unit: string): number => {
    switch (unit) {
      case "acres":
        return size * 0.404686;
      case "bigha":
        return size * 0.1338;
      case "hectares":
      default:
        return size;
    }
  };

  const fieldSizeInHectares = convertToHectares(
    parseFloat(formData.fieldSize),
    formData.sizeUnit
  );
  const fertilizerInfo =
    FERTILIZER_INFO[
      recommendations.mlPrediction.fertilizer as keyof typeof FERTILIZER_INFO
    ];

  const handleBack = () => {
    if (isFromHistory) {
      navigate("/dashboard", { state: { activeTab: "overview" } });
    } else {
      navigate(-1);
    }
  };

  // Calculate progress values for nutrients
  const getNutrientProgress = (value: number, type: string) => {
    const numValue = value;
    switch (type) {
      case "nitrogen":
        return Math.min(100, (numValue / 200) * 100);
      case "phosphorus":
        return Math.min(100, (numValue / 150) * 100);
      case "potassium":
        return Math.min(100, (numValue / 300) * 100);
      default:
        return 0;
    }
  };

  const getNutrientStatus = (value: number, type: string) => {
    const numValue = value;
    let optimal, warning, critical;

    switch (type) {
      case "nitrogen":
        optimal = numValue >= 80 && numValue <= 180;
        warning =
          (numValue >= 30 && numValue < 80) ||
          (numValue > 180 && numValue <= 240);
        critical = numValue < 30 || numValue > 240;
        break;
      case "phosphorus":
        optimal = numValue >= 110 && numValue <= 350;
        warning =
          (numValue >= 15 && numValue < 110) ||
          (numValue > 350 && numValue <= 400);
        critical = numValue < 15 || numValue > 400;
        break;
      case "potassium":
        optimal = numValue >= 120 && numValue <= 350;
        warning =
          (numValue >= 60 && numValue < 120) ||
          (numValue > 350 && numValue <= 400);
        critical = numValue < 60 || numValue > 400;
        break;
      default:
        return {
          status: "unknown",
          color: "text-gray-600",
          bgColor: "bg-gray-100",
        };
    }

    if (optimal)
      return {
        status: "Optimal",
        color: "text-green-600",
        bgColor: "bg-green-100",
      };
    if (warning)
      return {
        status: "Needs Attention",
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
      };
    if (critical)
      return {
        status: "Critical",
        color: "text-red-600",
        bgColor: "bg-red-100",
      };
    return {
      status: "Unknown",
      color: "text-gray-600",
      bgColor: "bg-gray-100",
    };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button
              onClick={handleBack}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2 bg-white hover:bg-gray-50 border border-gray-200 text-black hover:text-black"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="whitespace-nowrap">{t("common.back")}</span>
            </Button>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Fertilizer Recommendations
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              AI-powered recommendations for your field - {formData.fieldName}
            </p>
          </div>

          {/* AgriCure Branding */}
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <img
                src="/logo.png"
                alt="AgriCure Logo"
                className="h-8 w-8 sm:h-10 sm:w-10"
              />
              <h2 className="text-xl sm:text-2xl font-bold text-grass-600">
                AgriCure
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 text-center">
              Advanced ML + LLM Powered Agricultural Intelligence
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* AI-Powered Analysis Section */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Brain className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <span className="text-blue-900">AI-Powered Analysis</span>
                  <Badge className="ml-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs">
                    Enhanced ML + LLM
                  </Badge>
                </div>
              </CardTitle>
              <CardDescription>
                Advanced soil data learning with large language model
                enhancement for {formData.fieldName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {recommendations.mlPrediction.confidence}%
                    </div>
                    <div className="text-sm text-gray-600">Confidence</div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">
                      {parseFloat(formData.fieldSize).toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formData.sizeUnit}
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-600">
                      {formData.cropType}
                    </div>
                    <div className="text-sm text-gray-600">Crop</div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <div className="text-center">
                    <div className="text-lg font-bold text-amber-600">
                      {formData.soilType}
                    </div>
                    <div className="text-sm text-gray-600">Soil Type</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ML Model Prediction */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Target className="h-5 w-5 text-green-600" />
                </div>
                <span className="text-green-900">ML Model Prediction</span>
              </CardTitle>
              <CardDescription>
                AI-powered fertilizer recommendation based on your soil and crop
                data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-white p-6 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-green-800">
                      {recommendations.mlPrediction.fertilizer}
                    </h3>
                    <div className="text-lg font-semibold text-green-600">
                      {recommendations.mlPrediction.confidence}%
                    </div>
                    <div className="text-sm text-gray-600">confidence</div>
                  </div>
                  {fertilizerInfo && (
                    <Badge variant="secondary" className="text-sm">
                      NPK: {fertilizerInfo.npk}
                    </Badge>
                  )}
                </div>
                {fertilizerInfo && (
                  <p className="text-gray-600">{fertilizerInfo.description}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Soil Condition Analysis */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Beaker className="h-5 w-5 text-amber-600" />
                </div>
                <span>Soil Analysis</span>
              </CardTitle>
              <CardDescription>
                Comprehensive soil condition assessment with nutrient
                conversions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Current Status */}
                <div>
                  <h4 className="font-semibold mb-4">Current Status</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">pH Status:</span>
                        <Badge
                          className={`${
                            recommendations.soilConditionAnalysis.phStatus ===
                            "Optimal"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {recommendations.soilConditionAnalysis.phStatus}
                        </Badge>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">
                          Moisture Status:
                        </span>
                        <Badge
                          className={`${
                            recommendations.soilConditionAnalysis
                              .moistureStatus === "Optimal"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {recommendations.soilConditionAnalysis.moistureStatus}
                        </Badge>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">
                          Nutrient Deficiencies:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {recommendations.soilConditionAnalysis
                            .nutrientDeficiency.length > 0 ? (
                            recommendations.soilConditionAnalysis.nutrientDeficiency.map(
                              (nutrient, index) => (
                                <Badge
                                  key={index}
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  {nutrient}
                                </Badge>
                              )
                            )
                          ) : (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              None
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Soil Test Values */}
                <div>
                  <h4 className="font-semibold mb-4">Soil Test Values</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Nitrogen */}
                    <div className="bg-white p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Nitrogen</span>
                        <span className="text-sm font-semibold">
                          {formData.nitrogen} mg/kg
                        </span>
                      </div>
                      <Progress
                        value={getNutrientProgress(
                          parseFloat(formData.nitrogen),
                          "nitrogen"
                        )}
                        className="h-2 mb-2"
                      />
                      <div className="flex justify-between items-center">
                        <span className="text-xs">N</span>
                        <Badge
                          className={`text-xs ${
                            getNutrientStatus(
                              parseFloat(formData.nitrogen),
                              "nitrogen"
                            ).bgColor
                          } ${
                            getNutrientStatus(
                              parseFloat(formData.nitrogen),
                              "nitrogen"
                            ).color
                          }`}
                        >
                          {
                            getNutrientStatus(
                              parseFloat(formData.nitrogen),
                              "nitrogen"
                            ).status
                          }
                        </Badge>
                      </div>
                    </div>

                    {/* Phosphorus */}
                    <div className="bg-white p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Phosphorus</span>
                        <span className="text-sm font-semibold">
                          {formData.phosphorus} mg/kg
                        </span>
                      </div>
                      <Progress
                        value={getNutrientProgress(
                          parseFloat(formData.phosphorus),
                          "phosphorus"
                        )}
                        className="h-2 mb-2"
                      />
                      <div className="flex justify-between items-center">
                        <span className="text-xs">P</span>
                        <Badge
                          className={`text-xs ${
                            getNutrientStatus(
                              parseFloat(formData.phosphorus),
                              "phosphorus"
                            ).bgColor
                          } ${
                            getNutrientStatus(
                              parseFloat(formData.phosphorus),
                              "phosphorus"
                            ).color
                          }`}
                        >
                          {
                            getNutrientStatus(
                              parseFloat(formData.phosphorus),
                              "phosphorus"
                            ).status
                          }
                        </Badge>
                      </div>
                    </div>

                    {/* Potassium */}
                    <div className="bg-white p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Potassium</span>
                        <span className="text-sm font-semibold">
                          {formData.potassium} mg/kg
                        </span>
                      </div>
                      <Progress
                        value={getNutrientProgress(
                          parseFloat(formData.potassium),
                          "potassium"
                        )}
                        className="h-2 mb-2"
                      />
                      <div className="flex justify-between items-center">
                        <span className="text-xs">K</span>
                        <Badge
                          className={`text-xs ${
                            getNutrientStatus(
                              parseFloat(formData.potassium),
                              "potassium"
                            ).bgColor
                          } ${
                            getNutrientStatus(
                              parseFloat(formData.potassium),
                              "potassium"
                            ).color
                          }`}
                        >
                          {
                            getNutrientStatus(
                              parseFloat(formData.potassium),
                              "potassium"
                            ).status
                          }
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expert Recommendations */}
                <div>
                  <h4 className="font-semibold mb-3">Expert Recommendations</h4>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <ul className="space-y-2">
                      {recommendations.soilConditionAnalysis.recommendations.map(
                        (rec, index) => (
                          <li
                            key={index}
                            className="flex items-start space-x-2 text-sm"
                          >
                            <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span>{rec}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Primary and Secondary Fertilizers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Primary Fertilizer */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Zap className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="text-green-900">Primary Fertilizer</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white p-6 rounded-lg border border-green-200">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-green-800 mb-1">
                      {recommendations.primaryFertilizer.name}
                    </h3>
                    <div className="text-lg font-semibold text-green-600">
                      {recommendations.primaryFertilizer.amount} for{" "}
                      {parseFloat(formData.fieldSize).toFixed(1)}{" "}
                      {formData.sizeUnit}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">
                        Reason:
                      </h4>
                      <p className="text-sm text-gray-600">
                        {recommendations.primaryFertilizer.reason}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">
                        Application Method:
                      </h4>
                      <p className="text-sm text-gray-600">
                        {recommendations.primaryFertilizer.applicationMethod}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Secondary Fertilizer */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-blue-900">Secondary Fertilizer</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white p-6 rounded-lg border border-blue-200">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-blue-800 mb-1">
                      {recommendations.secondaryFertilizer.name}
                    </h3>
                    <div className="text-lg font-semibold text-blue-600">
                      {recommendations.secondaryFertilizer.amount}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">
                        Reason:
                      </h4>
                      <p className="text-sm text-gray-600">
                        {recommendations.secondaryFertilizer.reason}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">
                        Application Method:
                      </h4>
                      <p className="text-sm text-gray-600">
                        {recommendations.secondaryFertilizer.applicationMethod}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Organic Alternatives */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Leaf className="h-5 w-5 text-green-600" />
                </div>
                <span>Organic Alternatives</span>
              </CardTitle>
              <CardDescription>
                Sustainable and eco-friendly fertilizer options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recommendations.organicOptions.map((option, index) => (
                  <div
                    key={index}
                    className="bg-green-50 p-4 rounded-lg border border-green-200"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-green-800">
                        {option.name}
                      </h4>
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        {option.amount}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {option.benefits}
                    </p>
                    <div className="text-xs text-green-700">
                      <strong>Timing:</strong> {option.applicationTiming}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Application Timing and Cost Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Application Timing */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <span>Application Timing</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-2">
                      Primary Fertilizer
                    </h4>
                    <p className="text-sm text-gray-600">
                      {recommendations.applicationTiming.primary}
                    </p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">
                      Secondary Fertilizer
                    </h4>
                    <p className="text-sm text-gray-600">
                      {recommendations.applicationTiming.secondary}
                    </p>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <h4 className="font-semibold text-amber-800 mb-2">
                      Organic Options
                    </h4>
                    <p className="text-sm text-gray-600">
                      {recommendations.applicationTiming.organic}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cost Analysis */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <DollarSign className="h-5 w-5 text-orange-600" />
                  </div>
                  <span>Cost Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-white p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Primary:</span>
                      <span className="font-semibold text-green-600">
                        {recommendations.costEstimate.primary}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Secondary:</span>
                      <span className="font-semibold text-blue-600">
                        {recommendations.costEstimate.secondary}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Organic:</span>
                      <span className="font-semibold text-amber-600">
                        {recommendations.costEstimate.organic}
                      </span>
                    </div>
                  </div>

                  <div className="bg-grass-50 p-4 border-2 border-grass-200 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-grass-800">
                        Total Estimate:
                      </span>
                      <span className="text-xl font-bold text-grass-600">
                        {recommendations.costEstimate.total}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      For {fieldSizeInHectares.toFixed(2)} hectares (
                      {formData.fieldSize} {formData.sizeUnit})
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Information */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Info className="h-5 w-5 text-amber-600" />
                </div>
                <span className="text-amber-900">
                  Have you applied the fertilizer?
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                  Yes
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-amber-300 text-amber-700 hover:bg-amber-50"
                >
                  No
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DetailedFertilizerRecommendations;
