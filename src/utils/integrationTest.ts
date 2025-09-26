import { mlApiService } from '../services/mlApiService';

export interface IntegrationTestResult {
  test: string;
  status: 'success' | 'error';
  result?: any;
  error?: string;
  timing?: number;
}

export class IntegrationTestSuite {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  }

  async runAllTests(): Promise<IntegrationTestResult[]> {
    const results: IntegrationTestResult[] = [];

    // Test 1: Health Check
    results.push(await this.testHealthCheck());

    // Test 2: Model Info
    results.push(await this.testModelInfo());

    // Test 3: Basic Prediction
    results.push(await this.testBasicPrediction());

    // Test 4: Enhanced Prediction
    results.push(await this.testEnhancedPrediction());

    // Test 5: LLM Enhanced Prediction
    results.push(await this.testLLMEnhancedPrediction());

    // Test 6: Location-based Prediction
    results.push(await this.testLocationBasedPrediction());

    return results;
  }

  private async testHealthCheck(): Promise<IntegrationTestResult> {
    const startTime = Date.now();
    try {
      const result = await mlApiService.healthCheck();
      const timing = Date.now() - startTime;
      
      if (result.status === 'healthy') {
        return {
          test: 'Health Check',
          status: 'success',
          result,
          timing
        };
      } else {
        return {
          test: 'Health Check',
          status: 'error',
          error: 'Service is not healthy',
          timing
        };
      }
    } catch (error) {
      return {
        test: 'Health Check',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timing: Date.now() - startTime
      };
    }
  }

  private async testModelInfo(): Promise<IntegrationTestResult> {
    const startTime = Date.now();
    try {
      const result = await mlApiService.getModelInfo();
      const timing = Date.now() - startTime;
      
      return {
        test: 'Model Info',
        status: 'success',
        result: {
          model_type: result.model_type,
          features_count: result.features.length,
          targets_count: result.targets.length,
          features: result.features
        },
        timing
      };
    } catch (error) {
      return {
        test: 'Model Info',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timing: Date.now() - startTime
      };
    }
  }

  private async testBasicPrediction(): Promise<IntegrationTestResult> {
    const startTime = Date.now();
    try {
      const testInput = {
        Temperature: 25.0,
        Humidity: 80.0,
        Moisture: 30.0,
        Soil_Type: 'Loamy',
        Crop_Type: 'Rice',
        Nitrogen: 85.0,
        Potassium: 45.0,
        Phosphorous: 35.0,
        pH: 6.5
      };

      const result = await mlApiService.getPrediction(testInput);
      const timing = Date.now() - startTime;
      
      return {
        test: 'Basic Prediction',
        status: 'success',
        result: {
          fertilizer: result.fertilizer,
          confidence: result.confidence,
          model_type: result.prediction_info.model_type
        },
        timing
      };
    } catch (error) {
      return {
        test: 'Basic Prediction',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timing: Date.now() - startTime
      };
    }
  }

  private async testEnhancedPrediction(): Promise<IntegrationTestResult> {
    const startTime = Date.now();
    try {
      const testInput = {
        Temperature: 25.0,
        Humidity: 80.0,
        Moisture: 30.0,
        Soil_Type: 'Loamy',
        Crop_Type: 'Rice',
        Nitrogen: 85.0,
        Potassium: 45.0,
        Phosphorous: 35.0,
        pH: 6.5
      };

      const result = await mlApiService.getEnhancedPrediction(testInput);
      const timing = Date.now() - startTime;
      
      return {
        test: 'Enhanced Prediction',
        status: 'success',
        result: {
          predictions_count: Object.keys(result.predictions).length,
          targets: Object.keys(result.predictions),
          model_type: result.prediction_info.model_type
        },
        timing
      };
    } catch (error) {
      return {
        test: 'Enhanced Prediction',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timing: Date.now() - startTime
      };
    }
  }

  private async testLLMEnhancedPrediction(): Promise<IntegrationTestResult> {
    const startTime = Date.now();
    try {
      const testInput = {
        Temperature: 25.0,
        Humidity: 80.0,
        Moisture: 30.0,
        Soil_Type: 'Loamy',
        Crop_Type: 'Rice',
        Nitrogen: 85.0,
        Potassium: 45.0,
        Phosphorous: 35.0,
        pH: 6.5,
        Field_Size: 2.0,
        Field_Unit: 'hectares',
        Sowing_Date: '2024-01-15'
      };

      const result = await mlApiService.getLLMEnhancedPrediction(testInput);
      const timing = Date.now() - startTime;
      
      return {
        test: 'LLM Enhanced Prediction',
        status: 'success',
        result: {
          primary_fertilizer: result.primary_fertilizer.name,
          secondary_fertilizer: result.secondary_fertilizer.name,
          total_cost: result.cost_estimate.total,
          organic_alternatives_count: result.organic_alternatives.length
        },
        timing
      };
    } catch (error) {
      return {
        test: 'LLM Enhanced Prediction',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timing: Date.now() - startTime
      };
    }
  }

  private async testLocationBasedPrediction(): Promise<IntegrationTestResult> {
    const startTime = Date.now();
    try {
      const testData = {
        latitude: 14.5995,
        longitude: 120.9842, // Manila, Philippines coordinates
        Temperature: 28.0,
        Humidity: 85.0,
        Moisture: 35.0,
        Crop_Type: 'Rice',
        Nitrogen: 90.0,
        Potassium: 50.0,
        Phosphorous: 40.0,
        pH: 6.8
      };

      const result = await mlApiService.getPredictionWithLocation(testData);
      const timing = Date.now() - startTime;
      
      return {
        test: 'Location-based Prediction',
        status: 'success',
        result: {
          soil_type: result.soil_data?.soil_type,
          predictions_count: Object.keys(result.predictions || {}).length,
          location: result.location
        },
        timing
      };
    } catch (error) {
      return {
        test: 'Location-based Prediction',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timing: Date.now() - startTime
      };
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const result = await fetch(`${this.baseUrl}/health`);
      return result.ok;
    } catch {
      return false;
    }
  }

  getBackendUrl(): string {
    return this.baseUrl;
  }
}

export const integrationTestSuite = new IntegrationTestSuite();