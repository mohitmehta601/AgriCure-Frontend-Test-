# AgriCure Frontend-Backend Integration Guide

## Overview

The AgriCure Frontend and Backend are now fully integrated and working together. This document provides a comprehensive overview of the integration setup, configuration, and available features.

## Current Integration Status ✅

### Backend Configuration

- **Platform**: Railway (Production)
- **URL**: `https://agricure-backend-production-63c7.up.railway.app`
- **Status**: ✅ Active and Running
- **Framework**: FastAPI with Python 3.12
- **ML Model**: Enhanced Ensemble Model (v2.0.0)
- **Features**:
  - ✅ Basic fertilizer predictions
  - ✅ Enhanced multi-target predictions
  - ✅ LLM-powered recommendation reports
  - ✅ Location-based soil analysis
  - ✅ Cost estimation and organic alternatives
  - ✅ Real-time health monitoring

### Frontend Configuration

- **Platform**: Local Development (Vite + React)
- **URL**: `http://localhost:8080`
- **Status**: ✅ Active and Running
- **Framework**: React 18 + TypeScript + Vite
- **UI Library**: Shadcn/ui + Tailwind CSS
- **Features**:
  - ✅ ML API integration service
  - ✅ Real-time prediction dashboard
  - ✅ Interactive forms with validation
  - ✅ Location-based soil detection
  - ✅ Cost analysis visualization
  - ✅ Supabase authentication

## API Endpoints

### Available Backend Endpoints

1. **Health Check**

   - `GET /health` - Simple health check
   - `GET /status` - Detailed status with model info
   - `GET /readiness` - Readiness probe

2. **Model Information**

   - `GET /model-info` - Get model features and capabilities

3. **Prediction Endpoints**

   - `POST /predict` - Basic fertilizer prediction
   - `POST /predict-enhanced` - Enhanced multi-target prediction
   - `POST /predict-llm-enhanced` - LLM-powered comprehensive recommendations
   - `POST /predict-with-location` - Location-based prediction with soil data

4. **Soil Data**
   - `POST /soil-data` - Get soil data for geographic coordinates

## Integration Testing

### Automated Test Suite

A comprehensive integration test suite is available at `/integration-test` that verifies:

1. **Connection Status** - Backend accessibility
2. **Health Checks** - Service health and model status
3. **Basic Predictions** - Simple fertilizer recommendations
4. **Enhanced Predictions** - Multi-target ML predictions
5. **LLM Integration** - AI-powered detailed reports
6. **Location Services** - Geographic soil data integration

### Running Tests

1. Navigate to `http://localhost:8080/integration-test`
2. Click "Run Integration Tests"
3. View detailed results for each test case

## Environment Configuration

### Backend Environment Variables

```bash
# Already configured in Railway deployment
PORT=8000
GEMINI_API_KEY=<configured>
```

### Frontend Environment Variables

```bash
# .env file in AgriCure Frontend Test
VITE_SUPABASE_URL=https://byngrjkkxbmtwypmlqbj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_URL=https://agricure-backend-production-63c7.up.railway.app
```

## Development Workflow

### Starting the Application

1. **Backend** (Already running on Railway):

   ```bash
   # Backend is automatically deployed and running
   # Status: https://agricure-backend-production-63c7.up.railway.app/health
   ```

2. **Frontend**:
   ```bash
   cd "p:\AgriCure Frontend Test"
   npm install
   npm run dev
   # Starts on http://localhost:8080
   ```

### Making API Calls

The frontend uses a centralized API service (`mlApiService.ts`) that handles all backend communication:

```typescript
import { mlApiService } from "@/services/mlApiService";

// Example: Get basic prediction
const prediction = await mlApiService.getPrediction({
  Temperature: 25.0,
  Humidity: 80.0,
  Moisture: 30.0,
  Soil_Type: "Loamy",
  Crop_Type: "Rice",
  Nitrogen: 85.0,
  Potassium: 45.0,
  Phosphorous: 35.0,
  pH: 6.5,
});
```

## Features Integration

### 1. ML Prediction Integration

- ✅ Basic predictions with confidence scores
- ✅ Enhanced multi-target predictions (Primary/Secondary fertilizers, quantities)
- ✅ Input validation on both frontend and backend
- ✅ Error handling and user feedback

### 2. LLM-Enhanced Recommendations

- ✅ AI-powered detailed recommendation reports
- ✅ Cost analysis and organic alternatives
- ✅ Application timing recommendations
- ✅ Field-specific calculations

### 3. Location-Based Services

- ✅ Geographic coordinate input
- ✅ Automatic soil type detection
- ✅ Location-aware predictions
- ✅ Real-time soil data integration

### 4. Real-Time Data

- ✅ Live model health monitoring
- ✅ Performance metrics tracking
- ✅ Connection status indicators
- ✅ Automatic error recovery

## Deployment Architecture

```
┌─────────────────────┐    HTTP/HTTPS     ┌──────────────────────┐
│   Frontend (Vite)   │ ◄────────────────► │   Backend (FastAPI)  │
│   localhost:8080    │                   │   Railway Cloud      │
└─────────────────────┘                   └──────────────────────┘
│                                         │
├─ React + TypeScript                     ├─ Python 3.12
├─ Shadcn/ui Components                   ├─ FastAPI Framework
├─ Tailwind CSS                           ├─ ML Models (Ensemble)
├─ React Router                           ├─ LLM Integration
└─ API Service Layer                      └─ Soil Data API
```

## Security & Performance

### CORS Configuration

- Backend allows all origins for development
- Production should restrict to specific domains

### API Rate Limiting

- Currently unlimited for development
- Consider implementing rate limiting for production

### Caching

- Frontend caches model info and health status
- Backend uses in-memory model caching

## Troubleshooting

### Common Issues

1. **Backend Connection Failed**

   - Check if Railway deployment is active
   - Verify VITE_API_URL in frontend .env
   - Test: `https://agricure-backend-production-63c7.up.railway.app/health`

2. **Model Loading Issues**

   - Check backend logs in Railway dashboard
   - Verify ML model files are deployed correctly
   - Test: `/status` endpoint for model status

3. **CORS Errors**

   - Ensure backend CORS middleware is properly configured
   - Check browser developer tools for specific errors

4. **Prediction Errors**
   - Validate input data ranges on frontend
   - Check API response format matches TypeScript interfaces
   - Use integration test dashboard for debugging

### Debug Tools

- Integration Test Dashboard: `/integration-test`
- Backend Health Check: `/health`
- Model Status: `/status`
- Browser Developer Tools Network tab

## Next Steps

### Recommended Enhancements

1. **Production Deployment**

   - Deploy frontend to Vercel/Netlify
   - Configure production environment variables
   - Set up proper CORS restrictions

2. **Monitoring & Analytics**

   - Add application performance monitoring
   - Implement user analytics
   - Set up error tracking (Sentry)

3. **Testing**

   - Add automated E2E tests
   - Implement API integration tests
   - Set up CI/CD pipeline

4. **Security**
   - Implement API authentication
   - Add input sanitization
   - Set up rate limiting

## Contact & Support

For integration issues or questions:

- Check the Integration Test Dashboard first
- Review this documentation
- Check browser developer tools
- Verify backend status on Railway

---

**Integration Status**: ✅ **COMPLETE AND OPERATIONAL**  
**Last Updated**: September 26, 2025  
**Version**: Frontend v0.0.0, Backend v2.0.0
