# Hilda AI Assistant - Setup Guide

## Overview
Hilda is an AI-powered financial assistant integrated into the Banking ECL system. It provides intelligent analysis on:
- Expected Credit Loss (ECL) trends and predictions
- Interest rate analysis and forecasting
- Stock market and financial market insights
- Global economic data from World Bank and other credited sources
- Loss predictions and risk forecasting

## Getting Started

### 1. Obtain Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy your API key

### 2. Configure API Key
Update the API key in two locations:

**Development:**
```
src/environments/environment.ts
```

**Production:**
```
src/environments/environment.prod.ts
```

Replace:
```typescript
geminiApiKey: 'YOUR_API_KEY_HERE'
```

### 3. Enable APIs
Ensure the following APIs are enabled in your Google Cloud project:
- Generative Language API (for Gemini)

## Features

### Chat Interface
- Real-time conversation with Hilda
- Suggested questions for quick analysis
- Full chat history tracking

### Data Analysis
Hilda provides comprehensive analysis on:
1. **ECL Analysis**: Current trends, market predictions, loss forecasting
2. **Interest Rates**: Current rates, future trends, impact on credit
3. **Stock Markets**: Sector analysis, equity trends, volatility forecasts
4. **Financial Forecasts**: 12-month outlook, default rates, loss scenarios
5. **Risk Assessment**: Default probability, sector vulnerabilities

### Download Options
Export your analysis in multiple formats:
- **JSON**: Structured data format for processing
- **CSV**: Spreadsheet-compatible format
- **HTML**: Formatted report for viewing/printing

### Data Sources
Information sourced from:
- World Bank
- International Monetary Fund (IMF)
- Federal Reserve
- European Central Bank (ECB)
- Central Banks globally
- Bloomberg & Reuters financial data

## Usage

### Basic Query
1. Click "Hilda AI Assistant" tab in Reports module
2. Type your question in the chat box
3. Press Enter or click Send
4. Review the analysis from Hilda

### Suggested Queries
Click any suggested question to quickly get analysis on:
- ECL market trends
- Interest rate analysis
- Stock market predictions
- 12-month loss forecasts
- Global economic impact on ECL
- Default rate expectations

### Download Reports
1. Click the "Download" button in the chat header
2. Select desired format:
   - JSON (for data processing)
   - CSV (for spreadsheet analysis)
   - HTML (for reports)

### Clear Chat
Click "Clear" to reset conversation history and start fresh.

## Performance Tips
- Keep questions specific for more targeted analysis
- Include time frames (e.g., "2026 forecast")
- Specify sectors or loan types for detailed analysis
- Ask for source attribution for compliance

## Troubleshooting

### API Not Responding
- Verify API key is correctly configured
- Check that Gemini API is enabled in Google Cloud
- Ensure no API rate limits have been exceeded

### Fallback Mode
If API is unavailable, Hilda operates in fallback mode with pre-built financial analysis templates covering:
- Current market conditions
- Standard ECL metrics
- Rate predictions
- Market risk assessments

## Security Notes
- Never commit API keys to version control
- Use environment variables in production
- Implement API key rotation regularly
- Monitor API usage for unusual patterns

## Integration Architecture
```
Reports Component
    ↓
Hilda AI Chat Component
    ↓
Gemini AI Service
    ↓
Google Generative Language API
    ↓
Gemini Pro Model
```

## Future Enhancements
- Multi-language support
- Real-time data feed integration
- Custom financial models
- Portfolio-specific analysis
- Regulatory compliance reporting

## Support
For issues with Gemini API:
- Check [Google AI Documentation](https://ai.google.dev/)
- Review rate limits and quotas
- Verify API key permissions

For application issues:
- Check browser console for errors
- Review network requests in DevTools
- Verify component imports in Reports module

## API Costs
Google offers free tier with:
- 60 requests per minute
- 1500 requests per day

For production, review [Google AI Pricing](https://ai.google.dev/pricing)
