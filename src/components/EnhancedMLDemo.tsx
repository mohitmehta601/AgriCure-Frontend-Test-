import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EnhancedRecommendationService } from "@/services/enhancedRecommendationService";
import { LocationSoilService } from "@/services/locationSoilService";
import { CROP_TYPES, SOIL_TYPES } from "@/services/fertilizerMLService";

interface FormData {
  temperature: number;
  humidity: number;
  moisture: number;
  soilType: string;
  cropType: string;
  nitrogen: number;
  potassium: number;
  phosphorus: number;
  pH: number;
  sowingDate: string;
  fieldSize: number;
  fieldUnit: string;
  bulkDensity: number;
  samplingDepth: number;
}

export const EnhancedMLDemo: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    temperature: 25,
    humidity: 80,
    moisture: 30,
    soilType: "Loamy",
    cropType: "Wheat",
    nitrogen: 85,
    potassium: 45,
    phosphorus: 35,
    pH: 6.5,
    sowingDate: "2024-03-01",
    fieldSize: 1.0,
    fieldUnit: "hectares",
    bulkDensity: 1.3,
    samplingDepth: 15.0,
  });

  const [results, setResults] = useState<any>(null);
  const [llmResults, setLlmResults] = useState<any>(null);
  const [locationData, setLocationData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<any>(null);

  // Check backend status on component mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await EnhancedRecommendationService.checkBackendHealth();
        setBackendStatus(status);
      } catch (err) {
        setBackendStatus({
          status: "unhealthy",
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    };
    checkStatus();
  }, []);

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getBasicRecommendation = async () => {
    setLoading(true);
    setError(null);

    try {
      const recommendation =
        await EnhancedRecommendationService.getBasicRecommendation(formData);
      setResults(recommendation);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const getLLMRecommendation = async () => {
    setLoading(true);
    setError(null);

    try {
      const recommendation =
        await EnhancedRecommendationService.getLLMRecommendation(formData);
      setLlmResults(recommendation);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const getLocationRecommendation = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get current location
      const location = await LocationSoilService.getCurrentLocation();
      const recommendation =
        await EnhancedRecommendationService.getLocationBasedRecommendation(
          location.latitude,
          location.longitude,
          formData
        );
      setLocationData(recommendation);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Enhanced ML Model Integration Demo</CardTitle>
          <CardDescription>
            Test the integration between frontend and the enhanced ML backend
          </CardDescription>
          {backendStatus && (
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  backendStatus.status === "healthy" ? "default" : "destructive"
                }
              >
                Backend: {backendStatus.status}
              </Badge>
              {backendStatus.model_loaded && (
                <Badge variant="outline">{backendStatus.model_type}</Badge>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div>
              <Label htmlFor="temperature">Temperature (°C)</Label>
              <Input
                id="temperature"
                type="number"
                value={formData.temperature}
                onChange={(e) =>
                  handleInputChange("temperature", Number(e.target.value))
                }
              />
            </div>

            <div>
              <Label htmlFor="humidity">Humidity (%)</Label>
              <Input
                id="humidity"
                type="number"
                value={formData.humidity}
                onChange={(e) =>
                  handleInputChange("humidity", Number(e.target.value))
                }
              />
            </div>

            <div>
              <Label htmlFor="moisture">Moisture (%)</Label>
              <Input
                id="moisture"
                type="number"
                value={formData.moisture}
                onChange={(e) =>
                  handleInputChange("moisture", Number(e.target.value))
                }
              />
            </div>

            <div>
              <Label htmlFor="soilType">Soil Type</Label>
              <Select
                value={formData.soilType}
                onValueChange={(value) => handleInputChange("soilType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select soil type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(SOIL_TYPES).map((soil) => (
                    <SelectItem key={soil} value={soil}>
                      {soil}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="cropType">Crop Type</Label>
              <Select
                value={formData.cropType}
                onValueChange={(value) => handleInputChange("cropType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select crop type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(CROP_TYPES).map((crop) => (
                    <SelectItem key={crop} value={crop}>
                      {crop}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="pH">pH</Label>
              <Input
                id="pH"
                type="number"
                step="0.1"
                value={formData.pH}
                onChange={(e) =>
                  handleInputChange("pH", Number(e.target.value))
                }
              />
            </div>

            <div>
              <Label htmlFor="nitrogen">Nitrogen</Label>
              <Input
                id="nitrogen"
                type="number"
                value={formData.nitrogen}
                onChange={(e) =>
                  handleInputChange("nitrogen", Number(e.target.value))
                }
              />
            </div>

            <div>
              <Label htmlFor="potassium">Potassium</Label>
              <Input
                id="potassium"
                type="number"
                value={formData.potassium}
                onChange={(e) =>
                  handleInputChange("potassium", Number(e.target.value))
                }
              />
            </div>

            <div>
              <Label htmlFor="phosphorus">Phosphorus</Label>
              <Input
                id="phosphorus"
                type="number"
                value={formData.phosphorus}
                onChange={(e) =>
                  handleInputChange("phosphorus", Number(e.target.value))
                }
              />
            </div>

            <div>
              <Label htmlFor="fieldSize">Field Size</Label>
              <Input
                id="fieldSize"
                type="number"
                step="0.1"
                value={formData.fieldSize}
                onChange={(e) =>
                  handleInputChange("fieldSize", Number(e.target.value))
                }
              />
            </div>

            <div>
              <Label htmlFor="sowingDate">Sowing Date</Label>
              <Input
                id="sowingDate"
                type="date"
                value={formData.sowingDate}
                onChange={(e) =>
                  handleInputChange("sowingDate", e.target.value)
                }
              />
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            <Button onClick={getBasicRecommendation} disabled={loading}>
              Get Basic Recommendation
            </Button>
            <Button
              onClick={getLLMRecommendation}
              disabled={loading}
              variant="outline"
            >
              Get LLM Enhanced Recommendation
            </Button>
            <Button
              onClick={getLocationRecommendation}
              disabled={loading}
              variant="secondary"
            >
              Get Location-based Recommendation
            </Button>
          </div>

          {error && (
            <Alert className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="basic" className="w-full">
            <TabsList>
              <TabsTrigger value="basic">Basic Results</TabsTrigger>
              <TabsTrigger value="llm">LLM Enhanced</TabsTrigger>
              <TabsTrigger value="location">Location-based</TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              {results && (
                <Card>
                  <CardHeader>
                    <CardTitle>Basic ML Predictions</CardTitle>
                    <CardDescription>
                      Enhanced ensemble model results
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Predictions:</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(results.predictions).map(
                            ([key, value]) => (
                              <div
                                key={key}
                                className="flex justify-between p-2 bg-gray-50 rounded"
                              >
                                <span className="font-medium">{key}:</span>
                                <Badge>{value as string}</Badge>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">
                          Confidence Scores:
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(results.confidences).map(
                            ([key, value]) => (
                              <div
                                key={key}
                                className="flex justify-between p-2 bg-gray-50 rounded"
                              >
                                <span className="font-medium">{key}:</span>
                                <Badge variant="outline">92%</Badge>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Model Info:</h4>
                        <p>
                          <strong>Type:</strong> {results.model_info.model_type}
                        </p>
                        <p>
                          <strong>Features:</strong>{" "}
                          {results.model_info.features_used.join(", ")}
                        </p>
                        <p>
                          <strong>Targets:</strong>{" "}
                          {results.model_info.targets.join(", ")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="llm">
              {llmResults && (
                <Card>
                  <CardHeader>
                    <CardTitle>LLM Enhanced Recommendations</CardTitle>
                    <CardDescription>
                      Comprehensive analysis with cost estimates
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold mb-2">
                          Primary Fertilizer:
                        </h4>
                        <div className="p-4 bg-green-50 rounded-lg">
                          <p>
                            <strong>Name:</strong>{" "}
                            {llmResults.primary_fertilizer.name}
                          </p>
                          <p>
                            <strong>NPK:</strong>{" "}
                            {llmResults.primary_fertilizer.npk}
                          </p>
                          <p>
                            <strong>Rate:</strong>{" "}
                            {llmResults.primary_fertilizer.rate_per_hectare}{" "}
                            kg/ha
                          </p>
                          <p>
                            <strong>Cost:</strong> ₹
                            {llmResults.primary_fertilizer.total_cost.toFixed(
                              2
                            )}
                          </p>
                          <p>
                            <strong>Notes:</strong>{" "}
                            {llmResults.primary_fertilizer.application_notes}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">
                          Secondary Fertilizer:
                        </h4>
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <p>
                            <strong>Name:</strong>{" "}
                            {llmResults.secondary_fertilizer.name}
                          </p>
                          <p>
                            <strong>NPK:</strong>{" "}
                            {llmResults.secondary_fertilizer.npk}
                          </p>
                          <p>
                            <strong>Rate:</strong>{" "}
                            {llmResults.secondary_fertilizer.rate_per_hectare}{" "}
                            kg/ha
                          </p>
                          <p>
                            <strong>Cost:</strong> ₹
                            {llmResults.secondary_fertilizer.total_cost.toFixed(
                              2
                            )}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">
                          Organic Alternatives:
                        </h4>
                        <div className="space-y-2">
                          {llmResults.organic_alternatives.map(
                            (organic: any, index: number) => (
                              <div
                                key={index}
                                className="p-3 bg-amber-50 rounded border"
                              >
                                <p>
                                  <strong>{organic.name}</strong>
                                </p>
                                <p>Rate: {organic.rate_per_hectare} kg/ha</p>
                                <p>Cost: ₹{organic.total_cost.toFixed(2)}</p>
                                <p>Benefits: {organic.benefits}</p>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">
                          Application Timing:
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(llmResults.application_timing).map(
                            ([stage, timing]) => (
                              <div
                                key={stage}
                                className="p-2 bg-gray-50 rounded"
                              >
                                <strong>{stage}:</strong> {timing as string}
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Cost Summary:</h4>
                        <div className="p-4 bg-gray-100 rounded-lg">
                          <p>
                            <strong>Total Cost:</strong> ₹
                            {llmResults.cost_summary.total.toFixed(2)}
                          </p>
                          <p>
                            <strong>Per Hectare:</strong> ₹
                            {llmResults.cost_summary.per_hectare.toFixed(2)}
                          </p>
                          <p>
                            Primary: ₹
                            {llmResults.cost_summary.primary_cost.toFixed(2)}
                          </p>
                          <p>
                            Secondary: ₹
                            {llmResults.cost_summary.secondary_cost.toFixed(2)}
                          </p>
                          <p>
                            Organic: ₹
                            {llmResults.cost_summary.organic_cost.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="location">
              {locationData && (
                <Card>
                  <CardHeader>
                    <CardTitle>Location-based Recommendations</CardTitle>
                    <CardDescription>
                      Soil data from your location
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Location Info:</h4>
                        <p>
                          <strong>Coordinates:</strong>{" "}
                          {locationData.location_data.latitude.toFixed(4)},{" "}
                          {locationData.location_data.longitude.toFixed(4)}
                        </p>
                        <p>
                          <strong>Address:</strong>{" "}
                          {locationData.soil_data.location_info.formatted_address.join(
                            ", "
                          )}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Detected Soil:</h4>
                        <div className="p-3 bg-orange-50 rounded">
                          <p>
                            <strong>Type:</strong>{" "}
                            {locationData.soil_data.soil_type}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">Recommendations:</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(locationData.predictions).map(
                            ([key, value]) => (
                              <div
                                key={key}
                                className="flex justify-between p-2 bg-gray-50 rounded"
                              >
                                <span className="font-medium">{key}:</span>
                                <Badge>{value as string}</Badge>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
