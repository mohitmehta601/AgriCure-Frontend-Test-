// Quick integration test script
import { mlApiService } from './src/services/mlApiService.js';

console.log('🚀 Starting AgriCure Integration Test...');

// Test data
const testData = {
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

async function runQuickTest() {
  try {
    console.log('📡 Testing backend connection...');
    const health = await mlApiService.healthCheck();
    console.log('✅ Health Check:', health);

    console.log('🔮 Testing basic prediction...');
    const prediction = await mlApiService.getPrediction(testData);
    console.log('✅ Prediction Result:', {
      fertilizer: prediction.fertilizer,
      confidence: prediction.confidence,
      model_type: prediction.prediction_info.model_type
    });

    console.log('🎯 Testing enhanced prediction...');
    const enhanced = await mlApiService.getEnhancedPrediction(testData);
    console.log('✅ Enhanced Prediction:', {
      predictions_count: Object.keys(enhanced.predictions).length,
      primary: enhanced.predictions.Primary_Fertilizer,
      secondary: enhanced.predictions.Secondary_Fertilizer
    });

    console.log('🌱 All tests completed successfully!');
    console.log('✅ Frontend-Backend Integration is WORKING PERFECTLY! 🎉');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

runQuickTest();