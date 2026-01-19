# Hilda - Quick Reference Guide

## 🤖 What is Hilda?
Hilda is an AI-powered financial assistant integrated into your Banking ECL system. She provides real-time analysis on financial markets, ECL trends, interest rates, and loss predictions.

## 🚀 Quick Start

### Access Hilda:
1. Go to **Reports** module
2. Click **"Hilda AI Assistant"** tab
3. Type your question and press Enter

## 💡 What Hilda Can Do

### Ask About:
- 📊 **ECL Analysis** - Market trends, loss predictions, provision recommendations
- 📈 **Interest Rates** - Current trends, 2026 forecasts, portfolio impact
- 💹 **Stock Markets** - Sector analysis, volatility, risk predictions
- 🌍 **Global Economy** - World Bank data, GDP, inflation, unemployment trends
- 📉 **Loss Forecasting** - 12-month outlooks, default rates, sector risks
- 🔮 **Financial Predictions** - Market movements, credit trends, sector performance

## 🎯 Example Questions

```
"What are the current ECL market trends?"
"Analyze interest rates and predict future movements"
"What's the stock market outlook for 2026?"
"Provide a 12-month loss forecast"
"How do economic indicators affect ECL?"
"What's the expected default rate?"
```

## 📥 Download Your Analysis

**Button: ⬇ Download**
- 📄 **JSON** - For data processing
- 📊 **CSV** - For spreadsheets
- 🌐 **HTML** - For reports/printing

## 🔧 Setup (First Time Only)

### Get Your API Key:
1. Visit: https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key

### Configure:
Edit these files and replace `YOUR_API_KEY_HERE`:
- `src/environments/environment.ts` (development)
- `src/environments/environment.prod.ts` (production)

```typescript
geminiApiKey: 'YOUR_API_KEY_HERE'
```

## 📚 Data Sources

Hilda pulls information from:
- World Bank
- International Monetary Fund (IMF)
- Federal Reserve
- European Central Bank (ECB)
- Bloomberg & Reuters
- Global Central Banks

## 🔑 Key Features

✅ Real-time AI responses
✅ Chat history tracking
✅ Suggested quick questions
✅ Export in multiple formats
✅ Offline fallback mode
✅ Professional reporting
✅ Mobile friendly
✅ Secure API integration

## 🎨 Interface Guide

```
┌─────────────────────────────────────┐
│ 🤖 Hilda - AI Financial Assistant   │  ← Header
│ Powered by Gemini API               │
├─────────────────────────────────────┤
│                                     │
│  Messages appear here...            │  ← Chat Area
│                                     │
├─────────────────────────────────────┤
│ [Type your question here...]    [📤] │  ← Input
│ 💡 Press Shift+Enter for new line  │
└─────────────────────────────────────┘
```

**Header Buttons:**
- ⬇ **Download** - Export chat conversation
- 🗑 **Clear** - Reset chat history

## 🎓 Tips for Better Responses

1. **Be Specific**
   - ❌ "Tell me about rates"
   - ✅ "What are 2026 interest rate predictions?"

2. **Include Time Frames**
   - ❌ "ECL trends"
   - ✅ "ECL market trends for 2026"

3. **Specify Sectors**
   - ❌ "What's the risk?"
   - ✅ "What's the risk in mortgage portfolios?"

4. **Ask for Sources**
   - ✅ "Provide analysis with source attribution"

## ⚠️ Troubleshooting

| Issue | Solution |
|-------|----------|
| No responses | Verify API key is configured correctly |
| Slow responses | Check internet connection |
| Error messages | Try refreshing the page |
| Missing data | Use fallback mode with suggested questions |

## 🔐 Security Notes

⚠️ **IMPORTANT:**
- Never share your API key
- Never commit keys to Git
- Use environment variables in production
- Rotate keys regularly

## 📞 Need Help?

1. Check `HILDA_SETUP.md` for detailed setup
2. Review `HILDA_IMPLEMENTATION.md` for technical details
3. Check browser console (F12) for error messages
4. Verify API key has correct permissions

## 🌟 Pro Tips

### For Analysts:
- Export reports as HTML for presentations
- Use CSV export for data analysis
- Ask for specific metrics with source data

### For Decision Makers:
- Use suggested questions for quick insights
- Export HTML reports for stakeholders
- Ask for risk assessments before major decisions

### For Risk Managers:
- Ask about sector-specific risks
- Request loss forecasts by segment
- Get default probability analysis
- Export data for regulatory reports

## 🔗 Related Resources

- 📘 Full Setup Guide: `HILDA_SETUP.md`
- 🔧 Implementation Details: `HILDA_IMPLEMENTATION.md`
- 🌐 Google AI: https://ai.google.dev/
- 🏦 World Bank: https://www.worldbank.org/
- 💰 IMF: https://www.imf.org/

## ✨ Recent Updates

- ✅ Gemini API integration
- ✅ Chat history export (JSON/CSV/HTML)
- ✅ Fallback financial data
- ✅ Responsive mobile design
- ✅ Sky blue banking theme
- ✅ Suggested questions
- ✅ Source attribution

---

**Version:** 1.0.0  
**Last Updated:** January 19, 2026  
**Status:** Ready to Use
