import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Leaf,
  AlertCircle,
  DollarSign,
  Calendar,
  Droplets,
  Brain,
  TrendingUp,
  Clock,
  Target,
  Sprout,
  Calculator,
  Info,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FormData {
  selectedFarmId: string;
  soilPH: string;
  nitrogen: string;
  phosphorus: string;
  potassium: string;
  temperature: string;
  humidity: string;
  soilMoisture: string;
  mlPrediction?: string;
  llmEnhancedResult?: any;
}

interface Farm {
  id: string;
  name: string;
  size: number;
  unit: string;
  crop_type: string;
  soil_type: string;
  sowing_date?: string;
  location?: string;
}

interface LLMEnhancedFertilizerRecommendationsProps {
  data: (FormData & { farm: Farm }) | null;
}

const LLMEnhancedFertilizerRecommendations = ({
  data,
}: LLMEnhancedFertilizerRecommendationsProps) => {
  const { t } = useLanguage();

  if (!data || !data.llmEnhancedResult) {
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

  const result = data.llmEnhancedResult;
  const farm = data.farm;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ML Model Prediction Header */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
            <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 animate-pulse" />
            <span>🤖 AI-Powered Analysis</span>
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
              Enhanced ML + LLM
            </Badge>
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Advanced machine learning with large language model enhancement for{" "}
            {farm.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">
                {result.ml_model_prediction?.confidence_percent || "N/A"}%
              </div>
              <div className="text-xs text-gray-500">ML Confidence</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border border-purple-200">
              <div className="text-lg font-semibold text-gray-800">
                {farm.size} {farm.unit}
              </div>
              <div className="text-xs text-gray-500">Field Size</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border border-purple-200">
              <div className="text-lg font-semibold text-gray-800">
                {farm.crop_type}
              </div>
              <div className="text-xs text-gray-500">Crop Type</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border border-purple-200">
              <div className="text-lg font-semibold text-gray-800">
                {farm.soil_type}
              </div>
              <div className="text-xs text-gray-500">Soil Type</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Soil Condition Analysis */}
      <Card>
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
            <Droplets className="h-5 w-5 text-blue-600" />
            <span>🧪 Soil Analysis</span>
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Comprehensive soil condition assessment with nutrient conversions
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-sm sm:text-base">
                Current Status
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base">pH Status:</span>
                  <Badge variant="secondary" className="text-xs sm:text-sm">
                    {result.soil_condition?.ph_status || "Optimal"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base">Moisture Status:</span>
                  <Badge variant="secondary" className="text-xs sm:text-sm">
                    {result.soil_condition?.moisture_status || "Optimal"}
                  </Badge>
                </div>
                {result.soil_condition?.nutrient_deficiencies && (
                  <div>
                    <span className="font-medium text-sm sm:text-base">
                      Nutrient Deficiencies:
                    </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {result.soil_condition.nutrient_deficiencies.length >
                      0 ? (
                        result.soil_condition.nutrient_deficiencies.map(
                          (nutrient: string, index: number) => (
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
                        <Badge variant="secondary" className="text-xs">
                          None Detected
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Soil Test Values Conversion */}
            {result.soil_condition?.soil_test_values && (
              <div>
                <h4 className="font-semibold mb-3 text-sm sm:text-base">
                  Soil Test Values
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="font-medium text-blue-800">
                      Conversion Parameters:
                    </div>
                    <div className="text-blue-600 text-xs mt-1">
                      Bulk Density:{" "}
                      {
                        result.soil_condition.soil_test_values
                          .bulk_density_g_cm3
                      }{" "}
                      g/cm³
                      <br />
                      Sampling Depth:{" "}
                      {
                        result.soil_condition.soil_test_values.sampling_depth_cm
                      }{" "}
                      cm
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center font-medium">Nutrient</div>
                    <div className="text-center font-medium">mg/kg</div>
                    <div className="text-center font-medium">kg/ha</div>

                    <div className="text-center">N</div>
                    <div className="text-center">
                      {result.soil_condition.soil_test_values.N?.mg_per_kg}
                    </div>
                    <div className="text-center font-medium text-green-600">
                      {result.soil_condition.soil_test_values.N?.kg_per_ha}
                    </div>

                    <div className="text-center">P</div>
                    <div className="text-center">
                      {result.soil_condition.soil_test_values.P?.mg_per_kg}
                    </div>
                    <div className="text-center font-medium text-green-600">
                      {result.soil_condition.soil_test_values.P?.kg_per_ha}
                    </div>

                    <div className="text-center">K</div>
                    <div className="text-center">
                      {result.soil_condition.soil_test_values.K?.mg_per_kg}
                    </div>
                    <div className="text-center font-medium text-green-600">
                      {result.soil_condition.soil_test_values.K?.kg_per_ha}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recommendations */}
          {result.soil_condition?.recommendations && (
            <div className="mt-6">
              <h4 className="font-semibold mb-3 text-sm sm:text-base">
                Expert Recommendations
              </h4>
              <ul className="space-y-1 text-xs sm:text-sm">
                {result.soil_condition.recommendations.map(
                  (rec: string, index: number) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  )
                )}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Primary and Secondary Fertilizers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="border-2 border-green-200">
          <CardHeader className="px-4 sm:px-6 bg-green-50">
            <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
              <Target className="h-5 w-5 text-green-600" />
              <span>🥇 Primary Fertilizer</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 py-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-xl text-green-800">
                  {result.primary_fertilizer?.name || "Not specified"}
                </h3>
                <p className="text-green-600 font-medium text-lg">
                  {result.primary_fertilizer?.amount_kg || 0} kg for {farm.size}{" "}
                  {farm.unit}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-600">
                  Why this fertilizer:
                </h4>
                <p className="text-sm">
                  {result.primary_fertilizer?.reason ||
                    "Based on soil analysis"}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-600">
                  Application Method:
                </h4>
                <p className="text-sm">
                  {result.primary_fertilizer?.application_method ||
                    "Follow standard practices"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200">
          <CardHeader className="px-4 sm:px-6 bg-blue-50">
            <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span>🥈 Secondary Fertilizer</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 py-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-xl text-blue-800">
                  {result.secondary_fertilizer?.name || "Not specified"}
                </h3>
                <p className="text-blue-600 font-medium text-lg">
                  {result.secondary_fertilizer?.amount_kg || 0} kg for{" "}
                  {farm.size} {farm.unit}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-600">
                  Why this fertilizer:
                </h4>
                <p className="text-sm">
                  {result.secondary_fertilizer?.reason ||
                    "Supplementary nutrition"}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-gray-600">
                  Application Method:
                </h4>
                <p className="text-sm">
                  {result.secondary_fertilizer?.application_method ||
                    "Follow standard practices"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Organic Alternatives */}
      <Card>
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
            <Sprout className="h-5 w-5 text-green-600" />
            <span>🌱 Organic Alternatives</span>
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Sustainable and eco-friendly fertilizer options
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          {result.organic_alternatives &&
          result.organic_alternatives.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {result.organic_alternatives.map((option: any, index: number) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg bg-green-50 border-green-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm sm:text-base text-green-800">
                      {option.name}
                    </h4>
                    <Badge variant="secondary" className="text-xs">
                      {option.amount_kg} kg
                    </Badge>
                  </div>
                  <p className="text-xs sm:text-sm text-green-700 mb-2">
                    {option.reason || "Organic nutrition source"}
                  </p>
                  <div className="text-xs text-green-600">
                    <strong>Application:</strong> {option.timing || "As needed"}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                No specific organic alternatives recommended by the model.
                Consider general organic options like compost or vermicompost.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Application Timing and Cost */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
              <Calendar className="h-5 w-5 text-purple-600" />
              <span>📅 Application Timing</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="space-y-4">
              {result.application_timing?.primary && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-medium text-sm text-green-800 mb-1">
                    Primary Fertilizer
                  </h4>
                  <p className="text-xs sm:text-sm text-green-700">
                    {result.application_timing.primary}
                  </p>
                </div>
              )}

              {result.application_timing?.secondary && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-sm text-blue-800 mb-1">
                    Secondary Fertilizer
                  </h4>
                  <p className="text-xs sm:text-sm text-blue-700">
                    {result.application_timing.secondary}
                  </p>
                </div>
              )}

              {result.application_timing?.organics && (
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h4 className="font-medium text-sm text-yellow-800 mb-1">
                    Organic Options
                  </h4>
                  <p className="text-xs sm:text-sm text-yellow-700">
                    {result.application_timing.organics}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
              <Calculator className="h-5 w-5 text-green-600" />
              <span>💰 Cost Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            {result.cost_estimate ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span>Primary:</span>
                    <span className="font-medium">
                      {result.cost_estimate.primary || "₹0"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Secondary:</span>
                    <span className="font-medium">
                      {result.cost_estimate.secondary || "₹0"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Organics:</span>
                    <span className="font-medium">
                      {result.cost_estimate.organics || "₹0"}
                    </span>
                  </div>
                </div>

                <hr className="my-3" />

                <div className="flex justify-between items-center">
                  <span className="font-bold text-base">Total Estimate:</span>
                  <span className="font-bold text-green-600 text-lg">
                    {result.cost_estimate.total || "₹0"}
                  </span>
                </div>

                {result.cost_estimate.notes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
                    <p className="text-xs text-gray-600">
                      {result.cost_estimate.notes}
                    </p>
                  </div>
                )}

                {/* Detailed Breakdown */}
                {result.cost_estimate.breakdown && (
                  <div className="mt-4">
                    <h5 className="font-medium text-sm mb-2">
                      Detailed Breakdown:
                    </h5>
                    <div className="space-y-2 text-xs">
                      {result.cost_estimate.breakdown.primary_details && (
                        <div className="p-2 bg-green-50 rounded border border-green-200">
                          <div className="font-medium text-green-800">
                            Primary:{" "}
                            {
                              result.cost_estimate.breakdown.primary_details
                                .fertilizer
                            }
                          </div>
                          <div className="text-green-600">
                            {
                              result.cost_estimate.breakdown.primary_details
                                .amount_kg
                            }{" "}
                            kg ×{" "}
                            {
                              result.cost_estimate.breakdown.primary_details
                                .price_per_kg
                            }{" "}
                            ={" "}
                            {
                              result.cost_estimate.breakdown.primary_details
                                .cost
                            }
                          </div>
                        </div>
                      )}

                      {result.cost_estimate.breakdown.secondary_details && (
                        <div className="p-2 bg-blue-50 rounded border border-blue-200">
                          <div className="font-medium text-blue-800">
                            Secondary:{" "}
                            {
                              result.cost_estimate.breakdown.secondary_details
                                .fertilizer
                            }
                          </div>
                          <div className="text-blue-600">
                            {
                              result.cost_estimate.breakdown.secondary_details
                                .amount_kg
                            }{" "}
                            kg ×{" "}
                            {
                              result.cost_estimate.breakdown.secondary_details
                                .price_per_kg
                            }{" "}
                            ={" "}
                            {
                              result.cost_estimate.breakdown.secondary_details
                                .cost
                            }
                          </div>
                        </div>
                      )}

                      {result.cost_estimate.breakdown.organics_details && (
                        <div className="p-2 bg-yellow-50 rounded border border-yellow-200">
                          <div className="font-medium text-yellow-800">
                            Organics (
                            {
                              result.cost_estimate.breakdown.organics_details
                                .options_count
                            }{" "}
                            options)
                          </div>
                          <div className="text-yellow-600">
                            Total:{" "}
                            {
                              result.cost_estimate.breakdown.organics_details
                                .total_amount_kg
                            }{" "}
                            kg ={" "}
                            {
                              result.cost_estimate.breakdown.organics_details
                                .cost
                            }
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Cost estimation not available. Please check pricing data
                  sources.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Meta Information */}
      {result._meta && (
        <Card className="border-gray-200">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="flex items-center space-x-2 text-sm">
              <Info className="h-4 w-4 text-gray-500" />
              <span>Analysis Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600">
              <div>
                <span className="font-medium">Generated:</span>{" "}
                {result._meta.generated_at
                  ? new Date(result._meta.generated_at).toLocaleString()
                  : "N/A"}
              </div>
              <div>
                <span className="font-medium">Region:</span>{" "}
                {result._meta.region || "Default"}
              </div>
              <div>
                <span className="font-medium">Currency:</span>{" "}
                {result._meta.currency || "₹"}
              </div>
              <div>
                <span className="font-medium">Price Source:</span>{" "}
                {result._meta.price_source || "Local rates"}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LLMEnhancedFertilizerRecommendations;
