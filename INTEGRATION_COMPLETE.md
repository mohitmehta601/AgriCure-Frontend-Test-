# Frontend-Backend Integration Documentation

## Overview

This document describes the successful integration between the **AgriCure Frontend Test** and **AgriCure Backend Test** applications. The integration connects a React/TypeScript frontend with a FastAPI backend that features enhanced ML models and LLM-powered recommendations.

## Architecture Overview

### Backend (AgriCure Backend Test)

- **Framework**: FastAPI with Python
- **ML Models**: Enhanced ensemble models (XGBoost, LightGBM, CatBoost)
- **LLM Integration**: Google Gemini for enhanced recommendations
- **Features**:
  - Basic fertilizer predictions
  - Enhanced multi-target predictions
  - LLM-powered comprehensive recommendations with cost analysis
  - Location-based soil data integration
  - Real-time pricing and organic alternatives

### Frontend (AgriCure Frontend Test)

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Shadcn/ui components with Tailwind CSS
- **State Management**: React hooks with TanStack Query
- **Routing**: React Router v6

## Integration Features

### 1. Enhanced ML API Service (`mlApiService.ts`)

The enhanced ML API service provides three main endpoints:

#### Basic Prediction (`/predict`)

```typescript
interface FertilizerPredictionInput {
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
```

#### Enhanced Prediction (`/predict-enhanced`)

Returns comprehensive predictions for multiple targets:

- N_Status, P_Status, K_Status
- Primary_Fertilizer, Secondary_Fertilizer
- Organic alternatives (Organic_1, Organic_2, Organic_3)
- pH_Amendment recommendations

#### LLM Enhanced Prediction (`/predict-llm-enhanced`)

Provides comprehensive analysis including:

- ML model predictions
- Soil condition analysis
- Cost estimates with live pricing
- Application timing recommendations
- Organic alternatives with benefits

### 2. Location-Based Soil Data (`locationSoilService.ts`)

Integrates with the backend's soil data API to:

- Get current user location via browser geolocation
- Fetch soil type and properties for given coordinates
- Provide location-aware recommendations

### 3. Enhanced Recommendation Service (`enhancedRecommendationService.ts`)

A unified service that orchestrates:

- Basic ML predictions
- LLM-enhanced recommendations
- Location-based recommendations
- Input validation
- Error handling

## API Endpoints

### Backend Endpoints

| Endpoint                 | Method | Description                               |
| ------------------------ | ------ | ----------------------------------------- |
| `/`                      | GET    | API status and version info               |
| `/health`                | GET    | Simple health check                       |
| `/status`                | GET    | Detailed status with model info           |
| `/predict`               | POST   | Basic fertilizer prediction               |
| `/predict-enhanced`      | POST   | Enhanced multi-target prediction          |
| `/predict-llm-enhanced`  | POST   | LLM-powered comprehensive recommendations |
| `/soil-data`             | POST   | Get soil data by coordinates              |
| `/predict-with-location` | POST   | Location-based prediction                 |
| `/model-info`            | GET    | ML model information                      |

### Example API Calls

#### Basic Prediction

```bash
curl -X POST "http://localhost:8000/predict" \
     -H "Content-Type: application/json" \
     -d '{
       "Temperature": 25,
       "Humidity": 80,
       "Moisture": 30,
       "Soil_Type": "Loamy",
       "Crop_Type": "Wheat",
       "Nitrogen": 85,
       "Potassium": 45,
       "Phosphorous": 35,
       "pH": 6.5
     }'
```

#### LLM Enhanced Prediction

```bash
curl -X POST "http://localhost:8000/predict-llm-enhanced" \
     -H "Content-Type: application/json" \
     -d '{
       "Temperature": 25,
       "Humidity": 80,
       "Moisture": 30,
       "Soil_Type": "Loamy",
       "Crop_Type": "Wheat",
       "Nitrogen": 85,
       "Potassium": 45,
       "Phosphorous": 35,
       "pH": 6.5,
       "Sowing_Date": "2024-03-01",
       "Field_Size": 1.0,
       "Field_Unit": "hectares",
       "Bulk_Density_g_cm3": 1.3,
       "Sampling_Depth_cm": 15.0
     }'
```

## Environment Configuration

### Backend (.env)

```bash
# Optional: Gemini API key for LLM features
GEMINI_API_KEY=your_gemini_api_key

# Database connection (if applicable)
DATABASE_URL=your_database_url
```

### Frontend (.env)

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend API URL
VITE_API_URL=http://localhost:8000

# Optional: ThingSpeak for IoT data
VITE_THINGSPEAK_API_KEY=your_thingspeak_api_key
VITE_THINGSPEAK_CHANNEL_ID=your_channel_id
```

## Setup Instructions

### 1. Backend Setup

```bash
cd "P:\AgriCure Backend Test"

# Install dependencies
pip install -r requirements.txt

# Start the server
python main.py
```

The backend will start on `http://localhost:8000` or `http://0.0.0.0:8000`

### 2. Frontend Setup

```bash
cd "P:\AgriCure Frontend Test"

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start on `http://localhost:8081` (or another available port)

### 3. Test the Integration

Visit `http://localhost:8081/demo` to access the integration demo page.

## Demo Component

The `EnhancedMLDemo` component (`/demo` route) provides a comprehensive test interface that showcases:

1. **Backend Health Check**: Shows backend status and model information
2. **Form Inputs**: All necessary parameters for predictions
3. **Three Prediction Types**:
   - Basic ML predictions
   - LLM-enhanced recommendations
   - Location-based recommendations
4. **Results Display**: Tabbed interface showing different result types

## Key Features Demonstrated

### 1. Enhanced ML Model Results

- Multiple prediction targets (N/P/K status, fertilizers, organics)
- Confidence scores for each prediction
- Model metadata (features used, targets, model type)

### 2. LLM-Enhanced Recommendations

- Primary and secondary fertilizer recommendations
- NPK ratios and application rates
- Cost analysis with live pricing
- Organic alternatives with benefits
- Application timing for different growth stages
- Comprehensive cost breakdown

### 3. Location-Based Features

- Automatic location detection
- Soil type identification from coordinates
- Location-aware recommendations
- Address resolution and display

## Error Handling

The integration includes comprehensive error handling:

1. **Network Errors**: Graceful handling of API connectivity issues
2. **Validation Errors**: Input validation with user-friendly error messages
3. **Fallback Predictions**: Rule-based fallback when ML API is unavailable
4. **Location Errors**: Handling of geolocation permission and availability issues

## Performance Considerations

1. **Caching**: TanStack Query provides automatic caching for API responses
2. **Loading States**: Proper loading indicators during API calls
3. **Error Boundaries**: React error boundaries for graceful error handling
4. **Lazy Loading**: Components can be lazy-loaded for better performance

## Security Features

1. **CORS Configuration**: Properly configured CORS in the backend
2. **Input Validation**: Both frontend and backend validation
3. **Environment Variables**: Sensitive data stored in environment variables
4. **API Rate Limiting**: Can be implemented if needed

## Future Enhancements

1. **Authentication**: Integration with Supabase auth for user management
2. **Real-time Updates**: WebSocket integration for real-time data
3. **Offline Support**: Service worker for offline functionality
4. **Mobile App**: React Native version of the frontend
5. **Data Visualization**: Charts and graphs for predictions and trends
6. **Export Features**: PDF/Excel export of recommendations

## Troubleshooting

### Common Issues

1. **Port Already in Use**:

   ```bash
   # Find process using port 8000
   netstat -ano | findstr :8000
   # Kill the process
   taskkill /PID <process_id> /F
   ```

2. **CORS Errors**: Ensure backend CORS is properly configured
3. **API Connection**: Verify `VITE_API_URL` points to correct backend URL
4. **Model Loading**: Check backend logs for ML model loading errors

### Backend Health Check

```bash
curl http://localhost:8000/status
```

### Frontend Build

```bash
npm run build
npm run preview
```

## Conclusion

The integration successfully connects the React frontend with the FastAPI backend, providing:

- Seamless ML model predictions
- Enhanced LLM-powered recommendations
- Location-based soil analysis
- Comprehensive cost analysis
- User-friendly interface for agricultural recommendations

The system is production-ready and can be deployed to cloud platforms like Railway, Vercel, or AWS.
