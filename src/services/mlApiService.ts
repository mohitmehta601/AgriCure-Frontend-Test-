export interface FertilizerPredictionInput {
  Temperature: number;
  Humidity: number;
  Moisture: number;
  Soil_Type: string;
  Crop_Type: string;
  Nitrogen: number;
  Potassium: number;
  Phosphorous: number;
  pH?: number;
}

export interface EnhancedFertilizerInput extends FertilizerPredictionInput {
  Sowing_Date?: string;
  Field_Size?: number;
  Field_Unit?: string;
  Bulk_Density_g_cm3?: number;
  Sampling_Depth_cm?: number;
}

export interface FertilizerPredictionOutput {
  fertilizer: string;
  confidence: number;
  prediction_info: {
    model_type: string;
    all_predictions: Record<string, string>;
    all_confidences: Record<string, number>;
    features_used: string[];
    targets: string[];
  };
}

export interface EnhancedFertilizerOutput {
  predictions: Record<string, string>;
  confidences: Record<string, number>;
  prediction_info: {
    model_type: string;
    features_used: string[];
    targets: string[];
    cv_scores: Record<string, Record<string, number>>;
  };
}

export interface LLMEnhancedOutput {
  ml_model_prediction: Record<string, any>;
  soil_condition: Record<string, any>;
  primary_fertilizer: {
    name: string;
    npk: string;
    rate_per_hectare: number;
    cost_per_hectare: number;
    total_cost: number;
    application_notes: string;
  };
  secondary_fertilizer: {
    name: string;
    npk: string;
    rate_per_hectare: number;
    cost_per_hectare: number;
    total_cost: number;
    application_notes: string;
  };
  organic_alternatives: Array<{
    name: string;
    rate_per_hectare: number;
    cost_per_hectare: number;
    total_cost: number;
    benefits: string;
  }>;
  application_timing: {
    sowing: string;
    vegetative: string;
    flowering: string;
    maturity: string;
  };
  cost_estimate: {
    primary_cost: number;
    secondary_cost: number;
    organic_cost: number;
    total: number;
    per_hectare: number;
    currency: string;
  };
  meta_info?: Record<string, any>;
}

export interface ModelInfo {
  model_type: string;
  features: string[];
  targets: string[];
  cv_scores: Record<string, Record<string, number>>;
  available_models: Record<string, string[]>;
  label_encoders: Record<string, string[]>;
}

class MLApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  }

  async getPrediction(input: FertilizerPredictionInput): Promise<FertilizerPredictionOutput> {
    try {
      const response = await fetch(`${this.baseUrl}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting prediction:', error);
      throw error;
    }
  }

  async getEnhancedPrediction(input: FertilizerPredictionInput): Promise<EnhancedFertilizerOutput> {
    try {
      const response = await fetch(`${this.baseUrl}/predict-enhanced`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting enhanced prediction:', error);
      throw error;
    }
  }

  async getLLMEnhancedPrediction(input: EnhancedFertilizerInput): Promise<LLMEnhancedOutput> {
    try {
      const response = await fetch(`${this.baseUrl}/predict-llm-enhanced`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting LLM enhanced prediction:', error);
      throw error;
    }
  }

  async getPredictionWithLocation(data: {
    latitude: number;
    longitude: number;
    Temperature?: number;
    Humidity?: number;
    Moisture?: number;
    Crop_Type?: string;
    Nitrogen?: number;
    Potassium?: number;
    Phosphorous?: number;
    pH?: number;
  }): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/predict-with-location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting location-based prediction:', error);
      throw error;
    }
  }

  async getModelInfo(): Promise<ModelInfo> {
    try {
      const response = await fetch(`${this.baseUrl}/model-info`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting model info:', error);
      throw error;
    }
  }

  async healthCheck(): Promise<{status: string; model_loaded: boolean; model_type: string; timestamp: string}> {
    try {
      const response = await fetch(`${this.baseUrl}/status`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return {
        status: data.status,
        model_loaded: data.model_loaded || false,
        model_type: data.model_type || 'Unknown',
        timestamp: data.timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        status: 'unhealthy',
        model_loaded: false,
        model_type: 'Unknown',
        timestamp: new Date().toISOString()
      };
    }
  }

  validateInput(input: FertilizerPredictionInput): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (input.Temperature < 0 || input.Temperature > 50) {
      errors.push('Temperature must be between 0 and 50°C');
    }

    if (input.Humidity < 0 || input.Humidity > 100) {
      errors.push('Humidity must be between 0 and 100%');
    }

    if (input.Moisture < 0 || input.Moisture > 100) {
      errors.push('Moisture must be between 0 and 100%');
    }

    if (input.Nitrogen < 0 || input.Nitrogen > 150) {
      errors.push('Nitrogen must be between 0 and 150');
    }

    if (input.Potassium < 0 || input.Potassium > 100) {
      errors.push('Potassium must be between 0 and 100');
    }

    if (input.Phosphorous < 0 || input.Phosphorous > 100) {
      errors.push('Phosphorous must be between 0 and 100');
    }

    if (input.pH !== undefined && (input.pH < 4.0 || input.pH > 9.0)) {
      errors.push('pH must be between 4.0 and 9.0');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validateEnhancedInput(input: EnhancedFertilizerInput): { isValid: boolean; errors: string[] } {
    const baseValidation = this.validateInput(input);
    const errors = [...baseValidation.errors];

    if (input.Field_Size !== undefined && (input.Field_Size < 0.1 || input.Field_Size > 1000)) {
      errors.push('Field size must be between 0.1 and 1000');
    }

    if (input.Bulk_Density_g_cm3 !== undefined && (input.Bulk_Density_g_cm3 < 0.5 || input.Bulk_Density_g_cm3 > 2.5)) {
      errors.push('Bulk density must be between 0.5 and 2.5 g/cm³');
    }

    if (input.Sampling_Depth_cm !== undefined && (input.Sampling_Depth_cm < 5 || input.Sampling_Depth_cm > 50)) {
      errors.push('Sampling depth must be between 5 and 50 cm');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const mlApiService = new MLApiService();
export default mlApiService;