import { mlApiService, EnhancedFertilizerInput, LLMEnhancedOutput } from './mlApiService';

export interface MLPredictionInput {
  temperature: number;
  humidity: number;
  moisture: number;
  soilType: number;
  cropType: number;
  nitrogen: number;
  potassium: number;
  phosphorus: number;
  pH?: number;
}

export interface EnhancedMLPredictionInput extends MLPredictionInput {
  sowingDate?: string;
  fieldSize?: number;
  fieldUnit?: string;
  bulkDensity?: number;
  samplingDepth?: number;
}

export interface MLPredictionResult {
  fertilizer: string;
  confidence: number;
}

export interface EnhancedMLPredictionResult {
  predictions: Record<string, string>;
  confidences: Record<string, number>;
  prediction_info: {
    model_type: string;
    features_used: string[];
    targets: string[];
  };
}

export interface LLMEnhancedMLResult {
  ml_predictions: Record<string, any>;
  soil_analysis: Record<string, any>;
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
  application_timing: Record<string, string>;
  cost_summary: {
    primary_cost: number;
    secondary_cost: number;
    organic_cost: number;
    total: number;
    per_hectare: number;
    currency: string;
  };
}

export const CROP_TYPES = {
  'Tea': 0,
  'Cotton': 1,
  'Maize': 2,
  'Groundnut': 3,
  'Pulses': 4,
  'Millets': 5,
  'Rice': 6,
  'Soybean': 7,
  'Sugarcane': 8,
  'Wheat': 9,
  'Coffee': 10
};

export const SOIL_TYPES = {
  'Clayey': 0,
  'Loamy': 1,
  'Red': 2,
  'Black': 3,
  'Sandy': 4
};

export const FERTILIZER_INFO = {
  'Urea': {
    description: 'High nitrogen content fertilizer (46% N)',
    application: 'Apply 2-3 weeks before planting or as top dressing during vegetative growth',
    benefits: 'Promotes leaf growth and green color',
    precautions: 'Avoid over-application to prevent burning',
    npk: '46-0-0'
  },
  'DAP': {
    description: 'Diammonium Phosphate (18% N, 46% P2O5)',
    application: 'Apply at planting time or during soil preparation',
    benefits: 'Excellent for root development and early plant growth',
    precautions: 'Best applied in slightly acidic to neutral soils',
    npk: '18-46-0'
  },
  'TSP': {
    description: 'Triple Super Phosphate (46% P2O5)',
    application: 'Apply during soil preparation, 2-3 weeks before planting',
    benefits: 'Promotes strong root system and flowering',
    precautions: 'May reduce availability in alkaline soils',
    npk: '0-46-0'
  },
  'Superphosphate': {
    description: 'Single Super Phosphate (16% P2O5, 12% S)',
    application: 'Apply during soil preparation or at planting',
    benefits: 'Provides phosphorus and sulfur for plant growth',
    precautions: 'Less concentrated than other phosphate fertilizers',
    npk: '0-16-0'
  },
  'Potassium sulfate': {
    description: 'Sulfate of Potash (50% K2O, 18% S)',
    application: 'Apply during fruit development stage',
    benefits: 'Improves fruit quality and disease resistance',
    precautions: 'Suitable for chloride-sensitive crops',
    npk: '0-0-50'
  },
  'Potassium chloride': {
    description: 'Muriate of Potash (60% K2O)',
    application: 'Apply 2-4 weeks before planting',
    benefits: 'Enhances water regulation and disease resistance',
    precautions: 'Avoid for salt-sensitive crops',
    npk: '0-0-60'
  },
  '28-28': {
    description: 'Balanced NPK fertilizer (28% N, 28% P2O5)',
    application: 'Apply at planting and during active growth periods',
    benefits: 'Provides balanced nutrition for overall plant health',
    precautions: 'Monitor soil pH for optimal nutrient uptake',
    npk: '28-28-0'
  },
  '20-20': {
    description: 'Balanced fertilizer (20% N, 20% P2O5)',
    application: 'Apply during planting and early growth stages',
    benefits: 'Good starter fertilizer for young plants',
    precautions: 'May need supplementation during peak growth',
    npk: '20-20-0'
  },
  '17-17-17': {
    description: 'Complete NPK fertilizer (17% each of N, P2O5, K2O)',
    application: 'Apply throughout the growing season',
    benefits: 'Provides complete nutrition for all growth stages',
    precautions: 'Adjust application rate based on soil test results',
    npk: '17-17-17'
  },
  '15-15-15': {
    description: 'Balanced NPK fertilizer (15% each of N, P2O5, K2O)',
    application: 'Apply at regular intervals during growing season',
    benefits: 'Suitable for maintenance feeding of established plants',
    precautions: 'Monitor for nutrient deficiencies in heavy feeders',
    npk: '15-15-15'
  },
  '14-35-14': {
    description: 'High phosphorus fertilizer (14% N, 35% P2O5, 14% K2O)',
    application: 'Apply during flowering and fruit set stages',
    benefits: 'Promotes flowering, fruiting, and root development',
    precautions: 'Best used when soil phosphorus levels are low',
    npk: '14-35-14'
  },
  '14-14-14': {
    description: 'Balanced NPK fertilizer (14% each of N, P2O5, K2O)',
    application: 'Apply as general purpose fertilizer throughout season',
    benefits: 'Good all-around fertilizer for various crops',
    precautions: 'May need supplementation for specific nutrient needs',
    npk: '14-14-14'
  },
  '10-26-26': {
    description: 'High P-K fertilizer (10% N, 26% P2O5, 26% K2O)',
    application: 'Apply during reproductive growth stages',
    benefits: 'Excellent for fruit and seed development',
    precautions: 'Use when nitrogen requirements are lower',
    npk: '10-26-26'
  },
  '10-10-10': {
    description: 'Balanced NPK fertilizer (10% each of N, P2O5, K2O)',
    application: 'Apply as maintenance fertilizer for established crops',
    benefits: 'Gentle, balanced nutrition for sensitive plants',
    precautions: 'May need higher rates for heavy feeding crops',
    npk: '10-10-10'
  }
};

// Fallback prediction function for when ML API is not available
const fallbackPrediction = async (input: MLPredictionInput): Promise<MLPredictionResult> => {
  const { temperature, humidity, moisture, soilType, cropType, nitrogen, potassium, phosphorus } = input;

  let predictedFertilizer = 'Urea';
  let confidence = 85;

  if (cropType === 0 || cropType === 4) {
    if (nitrogen < 50) {
      predictedFertilizer = 'Urea';
      confidence = 92;
    } else if (phosphorus < 30) {
      predictedFertilizer = 'DAP';
      confidence = 88;
    } else {
      predictedFertilizer = 'TSP';
      confidence = 85;
    }
  } else if (cropType === 1) {
    if (phosphorus < 20) {
      predictedFertilizer = 'DAP';
      confidence = 94;
    } else if (nitrogen < 30) {
      predictedFertilizer = '28-28';
      confidence = 89;
    } else {
      predictedFertilizer = '20-20';
      confidence = 86;
    }
  } else if (cropType === 10) {
    if (potassium < 30) {
      predictedFertilizer = 'Potassium sulfate';
      confidence = 91;
    } else if (nitrogen > 100) {
      predictedFertilizer = 'DAP';
      confidence = 87;
    } else {
      predictedFertilizer = '14-35-14';
      confidence = 84;
    }
  } else if (cropType === 5 || cropType === 13 || cropType === 16) {
    if (phosphorus > 30) {
      predictedFertilizer = '14-14-14';
      confidence = 90;
    } else if (potassium < 20) {
      predictedFertilizer = '10-26-26';
      confidence = 88;
    } else {
      predictedFertilizer = 'TSP';
      confidence = 85;
    }
  } else if (cropType === 3) {
    predictedFertilizer = '15-15-15';
    confidence = 93;
  } else if (cropType === 11) {
    if (nitrogen > 80) {
      predictedFertilizer = 'Urea';
      confidence = 95;
    } else {
      predictedFertilizer = 'DAP';
      confidence = 89;
    }
  } else {
    if (nitrogen < 20 && phosphorus < 20 && potassium < 20) {
      predictedFertilizer = '17-17-17';
      confidence = 87;
    } else if (nitrogen < 15) {
      predictedFertilizer = 'Urea';
      confidence = 90;
    } else if (phosphorus < 15) {
      predictedFertilizer = 'DAP';
      confidence = 88;
    } else if (potassium < 15) {
      predictedFertilizer = 'Potassium sulfate';
      confidence = 86;
    } else {
      predictedFertilizer = '14-14-14';
      confidence = 83;
    }
  }

  if (temperature < 15 || temperature > 40) confidence -= 5;
  if (humidity < 30 || humidity > 90) confidence -= 3;
  if (moisture < 20 || moisture > 90) confidence -= 4;

  confidence = Math.max(75, Math.min(98, confidence));

  return {
    fertilizer: predictedFertilizer,
    confidence
  };
};

export const predictFertilizer = async (input: MLPredictionInput): Promise<MLPredictionResult> => {
  try {
    const { temperature, humidity, moisture, soilType, cropType, nitrogen, potassium, phosphorus, pH } = input;
    
    const cropName = Object.keys(CROP_TYPES).find(key => CROP_TYPES[key as keyof typeof CROP_TYPES] === cropType) || 'Wheat';
    const soilName = Object.keys(SOIL_TYPES).find(key => SOIL_TYPES[key as keyof typeof SOIL_TYPES] === soilType) || 'Loamy';
    
    const mlInput = {
      Temperature: temperature,
      Humidity: humidity,
      Moisture: moisture,
      Soil_Type: soilName,
      Crop_Type: cropName,
      Nitrogen: nitrogen,
      Potassium: potassium,
      Phosphorous: phosphorus,
      pH: pH || 6.5
    };

    const response = await mlApiService.getPrediction(mlInput);
    
    return {
      fertilizer: response.fertilizer,
      confidence: response.confidence
    };
  } catch (error) {
    console.error('ML API prediction failed, falling back to rule-based prediction:', error);
    return await fallbackPrediction(input);
  }
};

export const predictFertilizerEnhanced = async (input: MLPredictionInput): Promise<EnhancedMLPredictionResult> => {
  try {
    const { temperature, humidity, moisture, soilType, cropType, nitrogen, potassium, phosphorus, pH } = input;
    
    const cropName = Object.keys(CROP_TYPES).find(key => CROP_TYPES[key as keyof typeof CROP_TYPES] === cropType) || 'Wheat';
    const soilName = Object.keys(SOIL_TYPES).find(key => SOIL_TYPES[key as keyof typeof SOIL_TYPES] === soilType) || 'Loamy';
    
    const mlInput = {
      Temperature: temperature,
      Humidity: humidity,
      Moisture: moisture,
      Soil_Type: soilName,
      Crop_Type: cropName,
      Nitrogen: nitrogen,
      Potassium: potassium,
      Phosphorous: phosphorus,
      pH: pH || 6.5
    };

    const response = await mlApiService.getEnhancedPrediction(mlInput);
    
    return {
      predictions: response.predictions,
      confidences: response.confidences,
      prediction_info: response.prediction_info
    };
  } catch (error) {
    console.error('Enhanced ML API prediction failed:', error);
    throw error;
  }
};

export const predictFertilizerWithLLM = async (input: EnhancedMLPredictionInput): Promise<LLMEnhancedMLResult> => {
  try {
    const { 
      temperature, humidity, moisture, soilType, cropType, 
      nitrogen, potassium, phosphorus, pH,
      sowingDate, fieldSize, fieldUnit, bulkDensity, samplingDepth 
    } = input;
    
    const cropName = Object.keys(CROP_TYPES).find(key => CROP_TYPES[key as keyof typeof CROP_TYPES] === cropType) || 'Wheat';
    const soilName = Object.keys(SOIL_TYPES).find(key => SOIL_TYPES[key as keyof typeof SOIL_TYPES] === soilType) || 'Loamy';
    
    const enhancedInput: EnhancedFertilizerInput = {
      Temperature: temperature,
      Humidity: humidity,
      Moisture: moisture,
      Soil_Type: soilName,
      Crop_Type: cropName,
      Nitrogen: nitrogen,
      Potassium: potassium,
      Phosphorous: phosphorus,
      pH: pH || 6.5,
      Sowing_Date: sowingDate,
      Field_Size: fieldSize || 1.0,
      Field_Unit: fieldUnit || 'hectares',
      Bulk_Density_g_cm3: bulkDensity || 1.3,
      Sampling_Depth_cm: samplingDepth || 15.0
    };

    const response = await mlApiService.getLLMEnhancedPrediction(enhancedInput);
    
    return {
      ml_predictions: response.ml_model_prediction,
      soil_analysis: response.soil_condition,
      primary_fertilizer: response.primary_fertilizer,
      secondary_fertilizer: response.secondary_fertilizer,
      organic_alternatives: response.organic_alternatives,
      application_timing: response.application_timing,
      cost_summary: response.cost_estimate
    };
  } catch (error) {
    console.error('LLM Enhanced ML API prediction failed:', error);
    throw error;
  }
};

export const getCropTypeOptions = () => {
  return Object.keys(CROP_TYPES).map(crop => ({
    value: crop,
    label: crop
  }));
};

export const getSoilTypeOptions = () => {
  return Object.keys(SOIL_TYPES).map(soil => ({
    value: soil,
    label: soil
  }));
};
