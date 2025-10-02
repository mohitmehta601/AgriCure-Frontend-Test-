import { mlApiService } from './mlApiService';
import { LocationSoilService } from './locationSoilService';
import { authService } from './authService';

export interface IntegratedPredictionInput {
  // Farm information
  farmId: string;
  farmName: string;
  farmSize: number;
  farmUnit: string;
  cropType: string;
  soilType: string;
  sowingDate?: string;
  
  // Environmental conditions
  temperature: number;
  humidity: number;
  moisture: number;
  
  // Soil analysis
  pH: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  
  // Location (optional)
  latitude?: number;
  longitude?: number;
}

export interface IntegratedPredictionOutput {
  success: boolean;
  prediction_type: 'ml_only' | 'enhanced' | 'llm_enhanced';
  
  // Base ML prediction
  ml_prediction: {
    fertilizer: string;
    confidence: number;
    prediction_info: any;
  };
  
  // Enhanced predictions (if available)
  enhanced_predictions?: {
    predictions: Record<string, string>;
    confidences: Record<string, number>;
    prediction_info: any;
  };
  
  // LLM enhanced results (if available)
  llm_enhanced?: {
    ml_model_prediction: any;
    soil_condition: any;
    primary_fertilizer: any;
    secondary_fertilizer: any;
    organic_alternatives: any[];
    application_timing: any;
    cost_estimate: any;
    meta_info?: any;
  };
  
  // Soil data (if location provided)
  soil_data?: {
    location: any;
    soil_type: string;
    soil_properties: any;
    confidence: number;
    sources: string[];
    location_info: any;
  };
  
  // Processing metadata
  processing_time: number;
  timestamp: string;
  user_id?: string;
}

class IntegratedMLService {
  
  /**
   * Get comprehensive fertilizer recommendation with all available enhancements
   */
  async getComprehensivePrediction(input: IntegratedPredictionInput): Promise<IntegratedPredictionOutput> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();
    
    try {
      // Get current user for tracking
      const { user } = await authService.getCurrentUser();
      
      // Validate input
      this.validateInput(input);
      
      // Prepare base prediction input
      const basePredictionInput = {
        Temperature: input.temperature,
        Humidity: input.humidity,
        Moisture: input.moisture,
        Soil_Type: input.soilType,
        Crop_Type: input.cropType,
        Nitrogen: input.nitrogen,
        Potassium: input.potassium,
        Phosphorous: input.phosphorus,
        pH: input.pH,
      };
      
      let result: IntegratedPredictionOutput = {
        success: false,
        prediction_type: 'ml_only',
        ml_prediction: {
          fertilizer: 'Unknown',
          confidence: 0,
          prediction_info: {}
        },
        processing_time: 0,
        timestamp,
        user_id: user?.id
      };
      
      // Try to get soil data from location if provided
      if (input.latitude && input.longitude) {
        try {
          const soilData = await LocationSoilService.getSoilDataByLocation({
            latitude: input.latitude,
            longitude: input.longitude
          });
          result.soil_data = soilData;
          // Update soil type if location provides better data
          if (soilData.soil_type) {
            basePredictionInput.Soil_Type = soilData.soil_type;
          }
        } catch (error) {
          console.warn('Could not fetch soil data from location:', error);
        }
      }
      
      // Step 1: Try LLM Enhanced Prediction (most comprehensive)
      try {
        const llmInput = {
          ...basePredictionInput,
          Sowing_Date: input.sowingDate || new Date().toISOString().split('T')[0],
          Field_Size: input.farmSize,
          Field_Unit: input.farmUnit.toLowerCase(),
          Bulk_Density_g_cm3: 1.3, // Default
          Sampling_Depth_cm: 15.0  // Default
        };
        
        const llmResult = await mlApiService.getLLMEnhancedPrediction(llmInput);
        
        result.success = true;
        result.prediction_type = 'llm_enhanced';
        result.ml_prediction = {
          fertilizer: llmResult.ml_model_prediction?.primary_fertilizer || 'Unknown',
          confidence: 92,
          prediction_info: llmResult.ml_model_prediction || {}
        };
        result.llm_enhanced = llmResult;
        
        console.log('✅ LLM Enhanced prediction successful');
        
      } catch (llmError) {
        console.warn('LLM Enhanced prediction failed, falling back to enhanced prediction:', llmError);
        
        // Step 2: Try Enhanced Prediction
        try {
          const enhancedResult = await mlApiService.getEnhancedPrediction(basePredictionInput);
          
          result.success = true;
          result.prediction_type = 'enhanced';
          result.ml_prediction = {
            fertilizer: enhancedResult.predictions.Primary_Fertilizer || 'Unknown',
            confidence: enhancedResult.confidences.Primary_Fertilizer || 0,
            prediction_info: enhancedResult.prediction_info
          };
          result.enhanced_predictions = enhancedResult;
          
          console.log('✅ Enhanced prediction successful');
          
        } catch (enhancedError) {
          console.warn('Enhanced prediction failed, falling back to basic prediction:', enhancedError);
          
          // Step 3: Basic ML Prediction (fallback)
          try {
            const basicResult = await mlApiService.getPrediction(basePredictionInput);
            
            result.success = true;
            result.prediction_type = 'ml_only';
            result.ml_prediction = basicResult;
            
            console.log('✅ Basic ML prediction successful');
            
          } catch (basicError) {
            console.error('All prediction methods failed:', basicError);
            throw new Error('Unable to generate any fertilizer prediction');
          }
        }
      }
      
      // Calculate processing time
      result.processing_time = Date.now() - startTime;
      
      return result;
      
    } catch (error) {
      console.error('Comprehensive prediction failed:', error);
      
      return {
        success: false,
        prediction_type: 'ml_only',
        ml_prediction: {
          fertilizer: 'Error',
          confidence: 0,
          prediction_info: { error: error.message }
        },
        processing_time: Date.now() - startTime,
        timestamp,
        user_id: (await authService.getCurrentUser()).user?.id
      };
    }
  }
  
  /**
   * Test backend connectivity
   */
  async testBackendConnection(): Promise<{
    connected: boolean;
    status: string;
    model_loaded: boolean;
    model_type: string;
    response_time: number;
    timestamp: string;
  }> {
    const startTime = Date.now();
    
    try {
      const healthCheck = await mlApiService.healthCheck();
      
      return {
        connected: true,
        status: healthCheck.status,
        model_loaded: healthCheck.model_loaded,
        model_type: healthCheck.model_type,
        response_time: Date.now() - startTime,
        timestamp: healthCheck.timestamp
      };
      
    } catch (error) {
      return {
        connected: false,
        status: 'unreachable',
        model_loaded: false,
        model_type: 'Unknown',
        response_time: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }
  
  /**
   * Get model information from backend
   */
  async getModelInfo() {
    try {
      return await mlApiService.getModelInfo();
    } catch (error) {
      console.error('Failed to get model info:', error);
      throw error;
    }
  }
  
  /**
   * Get prediction with location-based soil data
   */
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
  }) {
    try {
      return await mlApiService.getPredictionWithLocation(data);
    } catch (error) {
      console.error('Failed to get location-based prediction:', error);
      throw error;
    }
  }
  
  /**
   * Validate input parameters
   */
  private validateInput(input: IntegratedPredictionInput): void {
    const errors: string[] = [];
    
    // Required fields
    if (!input.farmId) errors.push('Farm ID is required');
    if (!input.farmName) errors.push('Farm name is required');
    if (!input.cropType) errors.push('Crop type is required');
    if (!input.soilType) errors.push('Soil type is required');
    
    // Numeric validations
    if (input.temperature < -10 || input.temperature > 50) {
      errors.push('Temperature must be between -10 and 50°C');
    }
    if (input.humidity < 0 || input.humidity > 100) {
      errors.push('Humidity must be between 0 and 100%');
    }
    if (input.moisture < 0 || input.moisture > 100) {
      errors.push('Moisture must be between 0 and 100%');
    }
    if (input.pH < 3.0 || input.pH > 10.0) {
      errors.push('pH must be between 3.0 and 10.0');
    }
    if (input.nitrogen < 0 || input.nitrogen > 200) {
      errors.push('Nitrogen must be between 0 and 200');
    }
    if (input.phosphorus < 0 || input.phosphorus > 150) {
      errors.push('Phosphorus must be between 0 and 150');
    }
    if (input.potassium < 0 || input.potassium > 200) {
      errors.push('Potassium must be between 0 and 200');
    }
    if (input.farmSize <= 0 || input.farmSize > 10000) {
      errors.push('Farm size must be between 0 and 10000');
    }
    
    // Location validation (if provided)
    if (input.latitude !== undefined) {
      if (input.latitude < -90 || input.latitude > 90) {
        errors.push('Latitude must be between -90 and 90');
      }
    }
    if (input.longitude !== undefined) {
      if (input.longitude < -180 || input.longitude > 180) {
        errors.push('Longitude must be between -180 and 180');
      }
    }
    
    if (errors.length > 0) {
      throw new Error(`Validation errors: ${errors.join(', ')}`);
    }
  }
  
  /**
   * Format prediction output for display
   */
  formatPredictionForDisplay(prediction: IntegratedPredictionOutput) {
    const formatCurrency = (amount: number | string) => {
      if (typeof amount === 'string') {
        return amount;
      }
      return `₹${amount.toLocaleString('en-IN')}`;
    };
    
    const formatAmount = (amount: number | string, unit: string = 'kg') => {
      if (typeof amount === 'string') {
        return amount;
      }
      return `${amount} ${unit}`;
    };
    
    return {
      ...prediction,
      formatted: {
        primary_fertilizer: prediction.llm_enhanced?.primary_fertilizer ? {
          name: prediction.llm_enhanced.primary_fertilizer.name,
          amount: formatAmount(prediction.llm_enhanced.primary_fertilizer.rate_per_hectare),
          cost: formatCurrency(prediction.llm_enhanced.primary_fertilizer.total_cost),
          npk: prediction.llm_enhanced.primary_fertilizer.npk
        } : null,
        secondary_fertilizer: prediction.llm_enhanced?.secondary_fertilizer ? {
          name: prediction.llm_enhanced.secondary_fertilizer.name,
          amount: formatAmount(prediction.llm_enhanced.secondary_fertilizer.rate_per_hectare),
          cost: formatCurrency(prediction.llm_enhanced.secondary_fertilizer.total_cost),
          npk: prediction.llm_enhanced.secondary_fertilizer.npk
        } : null,
        total_cost: prediction.llm_enhanced?.cost_estimate ? 
          formatCurrency(prediction.llm_enhanced.cost_estimate.total) : 'N/A',
        confidence: `${Math.round(prediction.ml_prediction.confidence)}%`
      }
    };
  }
}

export const integratedMLService = new IntegratedMLService();
export default integratedMLService;