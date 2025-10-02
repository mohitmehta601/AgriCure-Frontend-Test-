import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Brain,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertTriangle,
  Wheat,
  Mountain,
} from "lucide-react";
import { mlApiService, ModelInfo } from "@/services/mlApiService";
import { useToast } from "@/hooks/use-toast";

const MLModelStatus = () => {
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const { toast } = useToast();

  // Define all 11 crop types
  const cropTypes = [
    { name: "Tea", color: "bg-green-100 text-green-800" },
    { name: "Cotton", color: "bg-blue-100 text-blue-800" },
    { name: "Maize", color: "bg-yellow-100 text-yellow-800" },
    { name: "Groundnut", color: "bg-orange-100 text-orange-800" },
    { name: "Pulses", color: "bg-purple-100 text-purple-800" },
    { name: "Millets", color: "bg-amber-100 text-amber-800" },
    { name: "Rice", color: "bg-gray-100 text-gray-800" },
    { name: "Soybean", color: "bg-lime-100 text-lime-800" },
    { name: "Sugarcane", color: "bg-emerald-100 text-emerald-800" },
    { name: "Wheat", color: "bg-yellow-100 text-yellow-800" },
    { name: "Coffee", color: "bg-amber-100 text-amber-800" },
  ];

  // Define all 10 soil types
  const soilTypes = [
    { name: "Sandy", color: "bg-yellow-100 text-yellow-800" },
    { name: "Silty", color: "bg-gray-100 text-gray-800" },
    { name: "Laterite", color: "bg-red-100 text-red-800" },
    { name: "Alkaline", color: "bg-blue-100 text-blue-800" },
    { name: "Black", color: "bg-slate-100 text-slate-800" },
    { name: "Clayey", color: "bg-orange-100 text-orange-800" },
    { name: "Saline", color: "bg-cyan-100 text-cyan-800" },
    { name: "Loamy", color: "bg-amber-100 text-amber-800" },
    { name: "Red", color: "bg-red-100 text-red-800" },
    { name: "Peaty", color: "bg-green-100 text-green-800" },
  ];

  const checkModelStatus = async () => {
    setIsLoading(true);
    try {
      const health = await mlApiService.healthCheck();
      setIsConnected(health.model_loaded);

      if (health.model_loaded) {
        try {
          const info = await mlApiService.getModelInfo();
          setModelInfo(info);
        } catch (modelInfoError) {
          console.warn(
            "Failed to get model info, but model is loaded:",
            modelInfoError
          );
          setModelInfo(null);
        }
      } else {
        setModelInfo(null);
      }

      setLastChecked(new Date());
    } catch (error) {
      console.error("Failed to check ML model status:", error);
      setIsConnected(false);
      setModelInfo(null);
      toast({
        title: "ML Model Status",
        description:
          "Unable to connect to ML model. Using fallback predictions.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkModelStatus();

    const interval = setInterval(checkModelStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
          <Brain className="h-5 w-5 text-purple-600" />
          <span>ML Model Status</span>
        </CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Real-time status of the machine learning prediction model
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <div className="space-y-4">
          {/* Connection Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <span className="font-medium">
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
            <Button
              onClick={checkModelStatus}
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </Button>
          </div>

          {/* Supported Crop Types */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Wheat className="h-4 w-4 text-green-600" />
              <span className="font-medium text-sm">Supported Crop Types</span>
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800 text-xs"
              >
                {cropTypes.length} Types
              </Badge>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-1">
              {cropTypes.map((crop, index) => (
                <div
                  key={crop.name}
                  className={`flex items-center justify-center px-2 py-1 rounded border transition-all duration-200 hover:scale-105 ${crop.color}`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <span className="text-xs font-medium">{crop.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Supported Soil Types */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Mountain className="h-4 w-4 text-orange-600" />
              <span className="font-medium text-sm">Supported Soil Types</span>
              <Badge
                variant="secondary"
                className="bg-orange-100 text-orange-800 text-xs"
              >
                {soilTypes.length} Types
              </Badge>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-1">
              {soilTypes.map((soil, index) => (
                <div
                  key={soil.name}
                  className={`flex items-center justify-center px-2 py-1 rounded border transition-all duration-200 hover:scale-105 ${soil.color}`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <span className="text-xs font-medium">{soil.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Model Information */}
          {modelInfo && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Model Type:</span>
                  <Badge variant="secondary">
                    {modelInfo.model_type || "Unknown"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Features:</span>
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-800"
                  >
                    {modelInfo.features?.length || 0}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Targets:</span>
                  <span className="text-sm font-medium">
                    {modelInfo.targets?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Label Encoders:</span>
                  <span className="text-sm font-medium">
                    {Object.keys(modelInfo.label_encoders || {}).length}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Fallback Warning */}
          {!isConnected && (
            <div className="flex items-start space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Using Fallback Predictions
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  The ML model is unavailable. Predictions are using rule-based
                  algorithms with reduced accuracy.
                </p>
              </div>
            </div>
          )}

          {/* Last Checked */}
          {lastChecked && (
            <div className="text-xs text-gray-500 flex items-center space-x-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span>Last checked: {lastChecked.toLocaleTimeString()}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MLModelStatus;
