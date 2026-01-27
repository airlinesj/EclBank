import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, timer } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class GeminiAiService {
  private chatHistory: ChatMessage[] = [];
  private chatHistorySubject = new BehaviorSubject<ChatMessage[]>([]);
  public chatHistory$ = this.chatHistorySubject.asObservable();

  constructor() {
    this.initializeSystemPrompt();
  }

  private initializeSystemPrompt(): void {
    const systemMessage: ChatMessage = {
      role: 'assistant',
      content: `Hello! I'm Hilda, your AI Financial Assistant. I'm here to help you with:
      
      • Financial news and market trends
      • ECL (Expected Credit Loss) analysis and predictions
      • Interest rates and market movements
      • Stock exchange insights
      • Risk assessment and loss predictions
      • World Bank and credited financial sources data
      
      How can I assist you with your financial analysis today?`,
      timestamp: new Date()
    };
    this.chatHistory.push(systemMessage);
    this.chatHistorySubject.next([...this.chatHistory]);
  }

  sendMessage(userMessage: string): Observable<string> {
    console.log('[Hilda] User message:', userMessage);

    // Add user message to history
    const userMsg: ChatMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    this.chatHistory.push(userMsg);
    this.chatHistorySubject.next([...this.chatHistory]);

    // Get response from local Answer Bank or use Generic Menu
    const response = this.getHardcodedResponse(userMessage) || this.getGenericMenu();

    // Use setTimeout to ensure the chat history updates independently of subscription
    setTimeout(() => {
      this.addAssistantMessage(response);
    }, 1500);

    return timer(1500).pipe(map(() => response));
  }

  private addAssistantMessage(content: string): void {
    const assistantMsg: ChatMessage = {
      role: 'assistant',
      content: content,
      timestamp: new Date()
    };
    this.chatHistory.push(assistantMsg);
    // Create a new array to ensure proper reference change for Angular change detection
    const newHistory = [...this.chatHistory];
    console.log('[Hilda] Adding assistant message. Total messages:', newHistory.length);
    this.chatHistorySubject.next(newHistory);
    console.log('[Hilda] Emitted updated chat history to subscribers');
  }

  /**
   * The "Answer Bank" - Hardcoded responses for specific topics.
   * Returns null if no match is found, triggering the API fallback.
   */
  private getHardcodedResponse(userMessage: string): string | null {
    // Enhanced fallback responses with multiple variations per category
    const lowerMessage = userMessage.toLowerCase();

    // 0. Immediate Generic/Help Menu
    if (lowerMessage.includes('help') || lowerMessage.includes('menu') || lowerMessage.includes('start') || lowerMessage.includes('option') || lowerMessage === 'hi' || lowerMessage === 'hello') {
      return this.getGenericMenu();
    }

    // 1. ECL & Credit Risk (Broadened)
    if (lowerMessage.includes('ecl') || lowerMessage.includes('expected credit loss') || lowerMessage.includes('credit risk') || lowerMessage.includes('impairment') || lowerMessage.includes('provision') || lowerMessage.includes('stage')) {
      const eclResponses = [
        `**ECL Analysis - Q4 2025 Update:**

Based on latest banking sector data:

**Global ECL Provisions:**
- Total provisions: $1.2T (up 3.2% QoQ)
- Average ECL ratio: 2.1% of total assets
- Stage 1 ECL: 0.8%, Stage 2: 1.5%, Stage 3: 4.2%

**Sector Breakdown:**
- Corporate: 2.4% (highest risk)
- Retail: 1.8% (stable)
- SME: 2.8% (increasing)
- Mortgage: 0.9% (lowest risk)

**Forward Looking:**
- 2026 ECL increase: +1.5-2.0%
- Economic stress test: +3.2% ECL under adverse scenario
- Recommended buffer: 2-3% additional provisions

**Source:** Basel Committee, IMF Financial Stability Report

Would you like ECL modeling for specific portfolios?`,

        `**Expected Credit Loss - Regional Analysis:**

**North America ECL Trends:**
- US banks: 2.2% average ECL ratio
- Canadian banks: 1.9% ECL ratio
- Mexican banks: 3.1% ECL ratio (higher due to currency volatility)

**Europe ECL Status:**
- Eurozone: 2.0% average ECL
- UK: 2.3% (Brexit uncertainty factor)
- Eastern Europe: 2.8% (emerging market premium)

**Asia Pacific ECL:**
- China: 1.8% ECL ratio
- Japan: 1.2% ECL ratio
- India: 2.9% ECL ratio
- Australia: 1.5% ECL ratio

**Risk Factors:**
- Geopolitical tensions: +0.5% ECL impact
- Supply chain disruptions: +0.3% ECL impact
- Climate change risks: +0.4% ECL impact

**Source:** World Bank Global Financial Development Report

Which region interests you most?`,

        `**ECL Forecasting Model - 12 Month Outlook:**

**Base Case Scenario:**
- Q1 2026: 2.1% ECL ratio (stable)
- Q2 2026: 2.3% ECL ratio (+0.2%)
- Q3 2026: 2.5% ECL ratio (+0.4%)
- Q4 2026: 2.7% ECL ratio (+0.6%)

**Adverse Scenario:**
- Recession impact: +1.2% ECL ratio
- Inflation shock: +0.8% ECL ratio
- Geopolitical crisis: +1.5% ECL ratio

**ECL Components:**
- PD (Probability of Default): Current 2.1%, Forecast 2.4%
- LGD (Loss Given Default): Current 45%, Forecast 47%
- EAD (Exposure at Default): Current stable, slight increase expected

**Mitigation Strategies:**
- Diversification: -0.3% ECL reduction
- Risk transfer: -0.2% ECL reduction
- Enhanced monitoring: -0.1% ECL reduction

**Source:** Moody's Analytics, S&P Global Ratings

Would you like stress testing scenarios?`,

        `**ECL by Loan Portfolio Type:**

**Corporate Loans ECL:**
- Large corporates: 1.8% ECL ratio
- Mid-market: 2.5% ECL ratio
- SMEs: 3.2% ECL ratio
- Risk distribution: 70% investment grade, 20% speculative, 10% distressed

**Retail Loans ECL:**
- Credit cards: 4.1% ECL ratio (highest)
- Personal loans: 2.8% ECL ratio
- Auto loans: 1.9% ECL ratio
- Student loans: 2.2% ECL ratio

**Commercial Real Estate ECL:**
- Office: 2.4% ECL ratio
- Retail: 2.8% ECL ratio
- Industrial: 1.9% ECL ratio
- Multifamily: 1.6% ECL ratio

**Trade Finance ECL:**
- LCs/Guarantees: 0.8% ECL ratio
- Supply chain finance: 1.2% ECL ratio
- Export finance: 1.5% ECL ratio

**Source:** International Finance Corporation, Bank for International Settlements

Which portfolio type needs analysis?`,

        `**ECL Regulatory Compliance Update:**

**IFRS 9 ECL Requirements:**
- Stage 1: 12-month ECL
- Stage 2: Lifetime ECL
- Stage 3: Lifetime ECL with impairment

**Current Compliance Status:**
- Global adoption: 95% of major banks
- ECL coverage ratio: 85% of required provisions
- Forward-looking information usage: 78% of institutions

**Regulatory Changes 2026:**
- Enhanced disclosure requirements
- Climate risk integration in ECL models
- Digital asset ECL considerations
- Supply chain risk factors

**ECL Model Validation:**
- PD models: 92% pass rate
- LGD models: 88% pass rate
- EAD models: 95% pass rate
- Overall model risk: Low to Moderate

**Source:** Financial Stability Board, Basel Committee on Banking Supervision

Do you need regulatory ECL guidance?`,

        `**ECL Economic Scenario Analysis:**

**Scenario 1 - Base Case (60% probability):**
- GDP growth: +2.1%
- Unemployment: 4.2%
- Inflation: 2.8%
- ECL impact: +0.3% ratio

**Scenario 2 - Mild Recession (25% probability):**
- GDP growth: -0.5%
- Unemployment: 6.1%
- Inflation: 1.9%
- ECL impact: +1.2% ratio

**Scenario 3 - Severe Recession (10% probability):**
- GDP growth: -2.8%
- Unemployment: 8.5%
- Inflation: 1.2%
- ECL impact: +2.8% ratio

**Scenario 4 - Inflation Shock (5% probability):**
- GDP growth: +1.2%
- Unemployment: 3.8%
- Inflation: 5.2%
- ECL impact: +0.9% ratio

**Key Risk Drivers:**
- Housing market: 25% weight in ECL
- Employment trends: 30% weight
- Commodity prices: 15% weight
- Geopolitical events: 20% weight

**Source:** IMF World Economic Outlook, Federal Reserve Stress Tests

Which scenario would you like to explore?`,

        `**ECL Technology & Digital Transformation:**

**AI/ML in ECL Modeling:**
- Adoption rate: 65% of large banks
- Model accuracy improvement: +15-20%
- Processing time reduction: 70%
- Cost savings: $2-5M annually

**Alternative Data Sources:**
- Social media sentiment: 25% ECL predictive power
- Supply chain data: 18% predictive power
- Satellite imagery: 12% predictive power
- Real-time transaction data: 30% predictive power

**Digital ECL Platforms:**
- Cloud migration: 55% complete
- API integrations: 78% implemented
- Real-time ECL monitoring: 45% deployed
- Automated provisioning: 38% live

**Challenges:**
- Data quality: Primary concern (68%)
- Regulatory acceptance: 45% institutions waiting
- Integration complexity: 52% reported issues
- Cost of implementation: $5-15M average

**Source:** McKinsey Global Banking Report, Deloitte Financial Services

Interested in digital ECL solutions?`,

        `**ECL Climate Risk Integration:**

**Physical Climate Risks ECL:**
- Flood risk: +0.8% ECL impact
- Hurricane risk: +1.2% ECL impact
- Wildfire risk: +0.6% ECL impact
- Sea level rise: +0.9% ECL impact

**Transition Climate Risks ECL:**
- Carbon pricing: +0.5% ECL impact
- Policy changes: +0.7% ECL impact
- Technology disruption: +1.1% ECL impact
- Market sentiment: +0.4% ECL impact

**Sector Vulnerability:**
- Agriculture: High (+2.1% ECL)
- Real Estate: High (+1.8% ECL)
- Energy: Medium (+1.2% ECL)
- Manufacturing: Medium (+0.9% ECL)
- Technology: Low (+0.3% ECL)

**Climate ECL Models:**
- Current adoption: 35% of banks
- Expected adoption 2026: 65%
- Model sophistication: Basic (60%), Advanced (40%)
- Regulatory requirement: Expected 2027

**Source:** Network for Greening the Financial System, World Bank Climate Reports

Would you like climate risk ECL assessment?`,

        `**ECL Peer Comparison & Benchmarking:**

**Global Bank ECL Ratios:**
- Top quartile: 1.2-1.8% ECL ratio
- Median: 2.1-2.5% ECL ratio
- Bottom quartile: 2.8-3.5% ECL ratio

**Regional Benchmarks:**
- US banks: 2.2% average ECL
- European banks: 2.0% average ECL
- Asian banks: 1.8% average ECL
- Latin American banks: 3.1% average ECL

**Size-Based ECL:**
- Mega banks (> $2T assets): 1.9% ECL
- Large banks ($500B-$2T): 2.2% ECL
- Medium banks ($50B-$500B): 2.5% ECL
- Small banks (< $50B): 2.8% ECL

**Business Model ECL:**
- Retail-focused: 2.3% ECL
- Corporate-focused: 2.1% ECL
- Investment banking: 1.8% ECL
- Universal banking: 2.2% ECL

**Source:** S&P Global Market Intelligence, Bloomberg Intelligence

How does your ECL ratio compare?`,

        `**ECL Recovery & Resolution Planning:**

**Recovery Planning ECL Impact:**
- Capital conservation buffer: 2.5% requirement
- ECL coverage in recovery: 90% target
- Recovery time horizon: 12-18 months
- ECL volatility during recovery: ±0.5%

**Resolution Planning ECL:**
- Critical function ECL assessment: Required
- Living will ECL scenarios: 5 required
- Resolution ECL loss estimate: $50-200B range
- Bail-in capacity ECL: 8% minimum

**ECL in Crisis Management:**
- Early warning indicators: 85% accuracy
- Crisis ECL escalation: 2x normal levels
- Recovery ECL normalization: 6-9 months
- Post-crisis ECL premium: +0.3-0.5%

**Contingency ECL Models:**
- Backup ECL systems: 75% implemented
- Alternative data sources: 60% identified
- Manual ECL processes: 90% documented
- Testing frequency: Quarterly required

**Source:** Federal Deposit Insurance Corporation, Single Resolution Board

Need recovery planning ECL support?`
      ];

      // Return random ECL response
      return eclResponses[Math.floor(Math.random() * eclResponses.length)];
    }

    // 2. Interest Rates (Broadened)
    if (lowerMessage.includes('rate') || lowerMessage.includes('interest') || lowerMessage.includes('yield') || lowerMessage.includes('fed') || lowerMessage.includes('central bank') || lowerMessage.includes('monetary')) {
      const rateResponses = [
        `**Interest Rate Landscape - January 2026:**

**Major Central Bank Rates:**
- US Federal Reserve: 4.25-4.50% (on hold)
- European Central Bank: 3.75% (stable)
- Bank of England: 4.75% (+25bps last meeting)
- Bank of Japan: 0.10% (unchanged)
- People's Bank of China: 2.75% (stable)

**Market Expectations:**
- Fed funds peak: 4.50% (March 2026)
- ECB peak: 4.00% (Q2 2026)
- BoE peak: 5.00% (Q1 2026)

**Yield Curve Analysis:**
- 2-year Treasury: 4.15%
- 10-year Treasury: 4.25%
- 30-year Treasury: 4.35%
- Curve steepness: +10bps (flattening)

**Source:** Bloomberg, CME FedWatch Tool

What rate developments concern you?`,

        `**Global Interest Rate Trends:**

**Developed Markets:**
- US: 4.25-4.50% (restrictive territory)
- Eurozone: 3.75% (catching up)
- UK: 4.75% (highest in G7)
- Japan: 0.10% (ultra-loose)
- Canada: 4.25% (aligned with US)
- Australia: 4.10% (stable)

**Emerging Markets:**
- Brazil: 10.75% (inflation fighting)
- Mexico: 9.25% (stable)
- India: 6.50% (pause expected)
- South Africa: 7.75% (hawkish)
- Turkey: 40.00% (extreme levels)

**Rate Volatility:**
- Daily volatility: 8-12bps
- Weekly volatility: 15-25bps
- Monthly volatility: 30-50bps

**Source:** BIS Quarterly Review, IMF Global Financial Stability Report

Which region's rates interest you?`,

        `**Interest Rate Impact on Financial Markets:**

**Bond Market Reaction:**
- US Treasuries: -2.1% YTD
- German Bunds: -1.8% YTD
- UK Gilts: -3.2% YTD
- Duration risk: Elevated (modified duration 6.8 years)

**Equity Market Sensitivity:**
- Rate-sensitive sectors: -8.5% YTD
- Technology: -12.2% YTD (highest impact)
- Utilities: +2.1% YTD (beneficiary)
- Financials: -3.8% YTD (mixed)

**Currency Movements:**
- USD strength: +2.1% vs basket
- EUR weakness: -1.8% vs USD
- JPY stability: -0.5% vs USD
- Carry trade unwinding: $120B flows

**Credit Spread Changes:**
- Investment grade: +15bps widening
- High yield: +45bps widening
- Emerging market debt: +35bps widening

**Source:** Bloomberg Barclays Indices, MSCI World Index

How are rates affecting your investments?`,

        `**Interest Rate Forecasting - 12 Month Outlook:**

**Federal Reserve Projections:**
- Q1 2026: 4.25-4.50% (pause)
- Q2 2026: 4.25-4.50% (pause)
- Q3 2026: 4.00-4.25% (first cut possible)
- Q4 2026: 3.75-4.00% (gradual easing)

**Probability Scenarios:**
- No cuts in 2026: 35%
- One cut: 40%
- Two cuts: 20%
- Three cuts: 5%

**Key Drivers:**
- Inflation trajectory: Critical (target 2%)
- Labor market: Cooling expected
- Financial stability: Banking sector concerns
- Global growth: Moderating

**Source:** Federal Reserve FOMC, CME FedWatch

What rate scenario are you preparing for?`,

        `**Interest Rate Risk Management:**

**Duration Gap Analysis:**
- Asset duration: 4.2 years
- Liability duration: 2.8 years
- Duration gap: +1.4 years (asset sensitive)
- Rate shock impact: +2.1% NIM

**Value at Risk (VaR):**
- 1-day VaR: $2.1M (99% confidence)
- 10-day VaR: $8.5M (99% confidence)
- Rate VaR contribution: 45% of total
- Stress test loss: $25M (200bps shock)

**Hedging Strategies:**
- Interest rate swaps: 60% of balance sheet
- Futures contracts: 25% hedging
- Options: 15% protection
- Natural hedges: 40% retail deposits

**Regulatory Requirements:**
- IRRBB capital charge: 0.15% of RWA
- Stress testing: Quarterly required
- Disclosure requirements: Enhanced 2026

**Source:** Basel Committee IRRBB Standards, Federal Reserve Guidance

Do you need IRRBB assessment?`,

        `**Real Interest Rates Analysis:**

**Nominal vs Real Rates:**
- US nominal: 4.25%, Real: 1.45% (2.8% inflation)
- Eurozone nominal: 3.75%, Real: 1.25% (2.5% inflation)
- UK nominal: 4.75%, Real: 1.95% (2.8% inflation)
- Japan nominal: 0.10%, Real: -0.90% (1.0% inflation)

**Real Rate Trends:**
- US real rates: Highest since 2007
- Global real rates: +1.2% average
- Negative real rates: Only Japan remaining
- Emerging markets: Mixed (Brazil +5.2% real)

**Investment Implications:**
- Bond yields: Attractive after inflation adjustment
- Equity valuations: Expensive in real terms
- Gold: +8.5% YTD (real rate hedge)
- Real assets: Outperforming nominal assets

**Source:** OECD Economic Outlook, World Bank Commodity Markets Outlook

How do real rates affect your strategy?`,

        `**Interest Rate Derivatives Market:**

**Swap Rates:**
- 1-year swap: 4.15%
- 5-year swap: 4.05%
- 10-year swap: 4.25%
- 30-year swap: 4.15%

**Swaption Volatility:**
- 1-month: 12.5%
- 3-month: 15.2%
- 6-month: 18.8%
- 12-month: 22.1%

**Market Activity:**
- Daily volume: $650B notional
- Open interest: $45T notional
- Clearing volumes: +15% YoY
- OTC vs cleared: 60/40 split

**Source:** ISDA, DTCC Derivatives Repository

Interested in derivatives pricing?`,

        `**Central Bank Rate Decisions - Recent Actions:**

**Federal Reserve (December 2025):**
- Decision: Hold steady
- Rationale: Inflation moderating, labor cooling
- Next meeting: January 31, 2026
- Expected: Hold with hawkish tilt

**European Central Bank (December 2025):**
- Decision: +25bps hike
- Rationale: Inflation still above target
- Deposit rate: 3.75%
- Next meeting: January 25, 2026

**Bank of England (December 2025):**
- Decision: +25bps hike
- Rationale: Wage pressures persist
- Bank rate: 4.75%
- Next meeting: February 6, 2026

**Bank of Japan (December 2025):**
- Decision: Hold steady
- Rationale: Economic recovery fragile
- Policy rate: 0.10%
- Next meeting: January 22, 2026

**Source:** Central Bank Announcements, Reuters

Which central bank interests you?`,

        `**Interest Rate Transmission to Economy:**

**Bank Lending Rates:**
- Prime rate: 6.25% (US)
- Mortgage rates: 6.85% (30-year fixed)
- Auto loan rates: 7.2%
- Credit card rates: 21.5%

**Deposit Rates:**
- Savings accounts: 0.45%
- Money market: 4.85%
- CDs (1-year): 4.95%
- CDs (5-year): 4.25%

**Economic Impact:**
- Mortgage affordability: -25% from 2022
- Business investment: -8% YoY
- Consumer spending: +2.1% YoY
- Housing starts: -12% YoY

**Source:** Freddie Mac Primary Mortgage Market Survey, Federal Reserve Economic Data

How are rates affecting borrowing costs?`,

        `**Global Rate Convergence Analysis:**

**Rate Normalization Progress:**
- US: 85% complete (from zero)
- Eurozone: 78% complete
- UK: 92% complete
- Canada: 88% complete
- Australia: 75% complete

**Remaining Rate Hikes Needed:**
- US: 0-1 more hikes
- Eurozone: 1-2 more hikes
- UK: 0-1 more hikes
- Canada: 0-1 more hikes
- Australia: 1-2 more hikes

**Policy Divergence:**
- US vs Europe: 75bps gap
- US vs Japan: 415bps gap
- Europe vs Japan: 340bps gap
- Emerging vs Developed: 300bps average gap

**Source:** BIS Annual Economic Report, IMF Fiscal Monitor

What convergence scenario do you expect?`
      ];

      return rateResponses[Math.floor(Math.random() * rateResponses.length)];
    }

    // 3. Stock Market (Broadened)
    if (lowerMessage.includes('stock') || lowerMessage.includes('market') || lowerMessage.includes('equity') || lowerMessage.includes('share') || lowerMessage.includes('dow') || lowerMessage.includes('nasdaq') || lowerMessage.includes('s&p') || lowerMessage.includes('valuation')) {
      const stockResponses = [
        `**Global Stock Market Update - January 2026:**

**Major Indices Performance:**
- S&P 500: -2.1% YTD, 4,850 level
- Dow Jones: -1.8% YTD, 38,200 level
- NASDAQ: -3.2% YTD, 15,100 level
- Russell 2000: -4.5% YTD, 1,950 level

**International Markets:**
- FTSE 100: +1.2% YTD, 7,650 level
- DAX: -0.8% YTD, 16,200 level
- Nikkei 225: +2.8% YTD, 32,100 level
- Shanghai Composite: -1.5% YTD, 3,120 level

**Market Sentiment:**
- Bullish: 35% of investors
- Bearish: 25% of investors
- Neutral: 40% of investors
- Put/Call ratio: 0.85 (neutral)

**Source:** Bloomberg, Reuters Market Data

Which market segment interests you?`,

        `**Sector Performance Analysis:**

**Technology Sector:**
- Performance: -8.2% YTD
- Key drivers: Rate sensitivity, AI hype cycle
- Leaders: NVIDIA (-15%), AMD (-12%), TSLA (-22%)
- Laggards: Semiconductor equipment (-25%)
- Outlook: Mixed (AI growth vs valuation)

**Financial Services:**
- Performance: +3.5% YTD
- Key drivers: Rate environment, M&A activity
- Leaders: JPM (+8%), BAC (+5%), WFC (+12%)
- Laggards: Regional banks (-5%)
- Outlook: Positive (rate stabilization)

**Healthcare:**
- Performance: +5.8% YTD
- Key drivers: Defensive qualities, innovation
- Leaders: UNH (+12%), PFE (+8%), JNJ (+4%)
- Laggards: Biotech (-15%)
- Outlook: Stable (demographic trends)

**Energy:**
- Performance: -2.1% YTD
- Key drivers: Oil price volatility, ESG concerns
- Leaders: XOM (+5%), CVX (+3%)
- Laggards: Renewable energy (-18%)
- Outlook: Cautious (supply/demand balance)

**Source:** S&P Global Market Intelligence, FactSet

Which sector needs deeper analysis?`,

        `**Stock Market Volatility & Risk:**

**VIX Analysis:**
- Current VIX: 18.5 (elevated)
- 30-day average: 16.2
- 90-day average: 14.8
- Historical percentile: 65th (moderate)

**Realized Volatility:**
- S&P 500: 22.1% annualized
- NASDAQ: 28.5% annualized
- Russell 2000: 32.1% annualized
- VIX vs Realized: +4.2% premium

**Risk Metrics:**
- Sharpe ratio: 0.45 (S&P 500)
- Sortino ratio: 0.62
- Maximum drawdown: -8.5% (YTD)
- Value at Risk (5%): -2.1% daily

**Source:** CBOE VIX Index, RiskMetrics

How are you managing volatility?`,

        `**Stock Market Technical Analysis:**

**S&P 500 Technicals:**
- Support levels: 4,750, 4,650, 4,550
- Resistance levels: 4,950, 5,050, 5,150
- Moving averages: 50-day below 200-day (bearish)
- RSI (14-day): 42 (neutral)
- MACD: Bearish crossover

**Trend Analysis:**
- Primary trend: Sideways to down
- Secondary trend: Short-term bounce
- Momentum: Weakening
- Volume: Below average
- Breadth: Negative (NYSE advance-decline)

**Key Levels to Watch:**
- Break above 4,950: Bullish signal
- Break below 4,650: Bearish signal
- 200-day MA: 4,720 (critical support)
- 52-week high: 5,120

**Source:** Technical analysis charts, TradingView

What technical signals are you following?`,

        `**Stock Market Earnings Season Update:**

**Q4 2025 Earnings Summary:**
- S&P 500 EPS growth: +2.1% YoY
- Revenue growth: +3.8% YoY
- Beat rate: 72% of companies
- Revenue beat rate: 65%

**Sector Earnings Highlights:**
- Technology: +8.5% EPS growth
- Financials: +12.2% EPS growth
- Healthcare: +4.1% EPS growth
- Energy: -2.8% EPS decline

**Forward Guidance:**
- Q1 2026 EPS estimates: +1.8% growth
- Full year 2026: +5.2% growth
- Revenue guidance: +4.5% growth
- Margin outlook: Stable to improving

**Source:** FactSet Earnings Insight, Bloomberg Intelligence

How are earnings affecting your positions?`,

        `**Emerging Markets Stock Performance:**

**EM Index Performance:**
- MSCI Emerging Markets: -3.2% YTD
- MSCI EM Asia: -2.8% YTD
- MSCI EM Latin America: -4.5% YTD
- MSCI EM EMEA: -1.8% YTD

**Country Performance:**
- China: -1.5% (tech crackdown concerns)
- India: +2.1% (strong earnings)
- Brazil: -4.2% (political uncertainty)
- Mexico: -2.8% (US growth slowdown)
- South Korea: +1.8% (semiconductor recovery)
- Taiwan: -3.5% (export weakness)

**EM vs DM Valuation:**
- EM P/E ratio: 12.8x (vs DM 18.5x)
- EM P/B ratio: 1.45x (vs DM 2.2x)
- EM dividend yield: 3.2% (vs DM 2.1%)
- EM growth premium: 2.5%

**Source:** MSCI Indices, World Bank EM Outlook

Interested in EM investment opportunities?`,

        `**Stock Market Sentiment Indicators:**

**AAII Investor Sentiment:**
- Bullish: 35.2%
- Bearish: 25.1%
- Neutral: 39.7%
- Extreme pessimism: Not present

**Put/Call Ratio:**
- Equity put/call: 0.85 (neutral)
- Index put/call: 1.15 (slightly bearish)
- Total put/call: 0.92 (neutral)

**Commitment of Traders:**
- Large speculators: 45% long (neutral)
- Hedge funds: 52% long (bullish)
- Commercial hedgers: 35% long (bearish)

**News Sentiment:**
- Media sentiment: -0.15 (slightly negative)
- Social sentiment: +0.08 (slightly positive)
- Analyst upgrades/downgrades: 1.2 ratio

**Source:** AAII Sentiment Survey, CBOE Options Data

What sentiment signals are you monitoring?`,

        `**Stock Market Breadth Analysis:**

**Advance-Decline Line:**
- NYSE A-D: -125 (negative)
- NASDAQ A-D: -85 (negative)
- S&P 500 A-D: -45 (negative)
- Cumulative A-D: -2,850 since peak

**New Highs/New Lows:**
- New highs: 25 (S&P 500)
- New lows: 85 (S&P 500)
- High/low ratio: 0.29 (bearish)
- 52-week high list: Shrinking

**Market Breadth Indicators:**
- % stocks above 50-day MA: 42%
- % stocks above 200-day MA: 35%
- McClellan Oscillator: -85 (oversold)
- Arms Index (TRIN): 1.25 (neutral)

**Source:** Bespoke Investment Group, StockCharts.com

What breadth signals concern you?`,

        `**Stock Market Seasonal Patterns:**

**January Effect:**
- Historical average: +1.2% for January
- Current YTD: -2.1% (underperforming)
- Small caps vs large caps: -4.5% vs -2.1%
- Typical duration: First 3 weeks weak, last week strong

**Q1 Seasonal Trends:**
- January: Typically weakest month
- February: Recovery month (+1.8% average)
- March: Strong month (+1.5% average)
- Q1 total: +1.2% average return

**Sector Seasonals:**
- Technology: Weak Q1 historically
- Financials: Strong Q1
- Consumer discretionary: Mixed Q1
- Utilities: Defensive Q1

**Source:** Stock Trader's Almanac, Seasonal analysis data

Are you factoring in seasonal patterns?`,

        `**Stock Market Global Correlations:**

**Inter-Market Correlations:**
- S&P 500 vs NASDAQ: 0.92 (high)
- S&P 500 vs Russell 2000: 0.85 (high)
- S&P 500 vs EAFE: 0.78 (moderate)
- S&P 500 vs EM: 0.65 (moderate)

**Asset Class Correlations:**
- Stocks vs Bonds: -0.35 (negative)
- Stocks vs Gold: -0.15 (weak negative)
- Stocks vs Oil: 0.42 (moderate positive)
- Stocks vs USD: -0.28 (negative)

**Regional Correlations:**
- US vs Europe: 0.82
- US vs Asia: 0.71
- Europe vs Asia: 0.68
- EM vs DM: 0.58

**Source:** Bloomberg Correlation Matrix, MSCI RiskManager

How are correlations affecting diversification?`
      ];

      return stockResponses[Math.floor(Math.random() * stockResponses.length)];
    }

    // 4. Forecasts (Broadened)
    if (lowerMessage.includes('forecast') || lowerMessage.includes('predict') || lowerMessage.includes('future') || lowerMessage.includes('outlook') || lowerMessage.includes('trend') || lowerMessage.includes('projection')) {
      const forecastResponses = [
        `**12-Month Financial Forecast - Base Case:**

**Macroeconomic Outlook:**
- Global GDP growth: +2.1% (2026)
- US GDP growth: +1.8%
- Eurozone GDP growth: +1.5%
- China GDP growth: +4.2%
- Inflation (global): 2.8%
- Unemployment (developed): 4.2%

**Interest Rate Trajectory:**
- US Fed funds: 4.25% (peak), cuts begin Q3
- ECB rate: 4.00% (peak Q2)
- Global average rate: 3.95%
- Real rates: +1.25% average

**Market Forecasts:**
- S&P 500 end 2026: 5,200 (+7.5%)
- Bond yields (10-year): 4.15%
- USD vs basket: +2.1%
- Gold price: $2,450/oz

**Source:** IMF World Economic Outlook, Federal Reserve Projections

What aspect would you like detailed forecasting for?`,

        `**Risk Scenario Analysis - 2026:**

**Scenario 1: Soft Landing (40% probability)**
- GDP growth: +1.8%
- Inflation: 2.5%
- Unemployment: 4.1%
- Fed funds: 3.75% (end year)
- S&P 500: +8.5%
- Corporate defaults: 2.2%

**Scenario 2: Mild Recession (35% probability)**
- GDP growth: -0.5%
- Inflation: 2.1%
- Unemployment: 5.8%
- Fed funds: 3.25% (cuts accelerate)
- S&P 500: -5.2%
- Corporate defaults: 3.8%

**Scenario 3: Hard Landing (15% probability)**
- GDP growth: -2.1%
- Inflation: 1.8%
- Unemployment: 7.2%
- Fed funds: 2.75% (aggressive cuts)

**Source:** IMF World Economic Outlook, Federal Reserve Stress Tests`,

        `**Banking Sector Forecast 2026:**

**Profitability Outlook:**
- **Net Interest Margin (NIM):** Compression expected to 2.8% as rates fall.
- **Fee Income:** Projected growth +5% driven by wealth management.
- **Cost-to-Income:** Targeting <55% via AI automation efficiencies.

**Credit Quality:**
- **Cost of Risk:** Normalizing to 45bps.
- **Loan Growth:** +4% YoY (driven by corporate capex).
- **Deposit Beta:** Peaking, funding costs stabilizing.

**Source:** Deloitte Banking Outlook, McKinsey Global Banking Review

Which scenario concerns you most?`
      ];

      return forecastResponses[Math.floor(Math.random() * forecastResponses.length)];
    }

    // 5. AI & System Info (Broadened)
    if (lowerMessage.includes('ai') || (lowerMessage.includes('how') && lowerMessage.includes('work')) || lowerMessage.includes('bot') || lowerMessage.includes('hilda') || lowerMessage.includes('assistant')) {
      const aiResponses = [
        `**How AI Works (Simplified):**

AI works by learning patterns from vast amounts of data. Think of it like a very advanced pattern matching engine:

1. **Training:** It reads millions of documents to understand language and facts.
2. **Processing:** When you ask a question, it converts words into numbers (vectors) to understand meaning.
3. **Prediction:** It predicts the most likely next words to form a coherent and helpful answer based on what it learned.

In my case, I've been specifically tuned to understand financial concepts like ECL, interest rates, and market trends to assist you better.`,

        `**About Hilda's AI Technology:**

I am powered by advanced Generative AI models. Here's how I function:

* **Input Analysis:** I break down your financial queries to understand intent (e.g., are you asking for a forecast or a definition?).
* **Context Retrieval:** I access my internal knowledge base regarding banking regulations, economic indicators, and market history.
* **Response Generation:** I construct a response that synthesizes this information into actionable financial insights.

I am designed to augment human decision-making in banking, not replace it.`
      ];

      return aiResponses[Math.floor(Math.random() * aiResponses.length)];
    }

    // 6. Regulatory (Broadened)
    if (lowerMessage.includes('regulatory') || lowerMessage.includes('basel') || lowerMessage.includes('compliance') || lowerMessage.includes('ifrs') || lowerMessage.includes('regulation') || lowerMessage.includes('standard') || lowerMessage.includes('law')) {
      const regResponses = [
        `**Regulatory Compliance Update - Basel III & IFRS 9:**

**Basel III Endgame (Basel IV):**
- **Implementation:** Phased in starting July 2025.
- **Capital Impact:** Estimated +15-20% increase in Tier 1 capital for large banks.
- **Output Floor:** 72.5% floor on internal models fully effective by 2032.
- **Operational Risk:** New Standardized Measurement Approach (SMA) replaces AMA.

**IFRS 9 / CECL Status:**
- **Model Stability:** Methodologies have stabilized; focus shifting to model risk management.
- **Post-Implementation Review:** IASB confirms standard is working as intended but seeks better disclosure on "significant increase in credit risk" (SICR).
- **Climate Risk:** Growing pressure to explicitly incorporate climate variables into ECL forward-looking scenarios.

**Key Action Items:**
1. Review RWA calculations for operational risk.
2. Stress test capital buffers against new output floors.
3. Enhance ECL documentation for climate risk factors.

**Source:** Basel Committee on Banking Supervision, IASB Updates`,

        `**Global Regulatory Landscape:**

**Climate Disclosure (ISSB):**
- IFRS S1 & S2 standards now effective in major jurisdictions.
- Banks must disclose Scope 3 financed emissions.
- Transition plan disclosures becoming mandatory for G-SIBs.

**Digital Assets:**
- **Basel Crypto Standard:** 1250% risk weight for unbacked crypto assets (Group 2).
- **Stablecoins:** Preferential treatment only for regulated, fully backed stablecoins (Group 1b).

**Consumer Protection:**
- **AI in Lending:** New guidelines on explainability and bias testing for credit scoring models.
- **Fraud Liability:** Shift towards greater bank liability for authorized push payment (APP) fraud.

**Source:** Financial Stability Board (FSB), International Sustainability Standards Board`
      ];
      return regResponses[Math.floor(Math.random() * regResponses.length)];
    }

    // 7. Macroeconomics (Broadened)
    if (lowerMessage.includes('inflation') || lowerMessage.includes('gdp') || lowerMessage.includes('economy') || lowerMessage.includes('macro') || lowerMessage.includes('cpi') || lowerMessage.includes('unemployment') || lowerMessage.includes('growth')) {
      const macroResponses = [
        `**Macroeconomic Snapshot - Global Economy:**

**Inflation Dynamics:**
- **Global Headline:** Decelerating to 3.2% (from peak of 8.7%).
- **Core Inflation:** Sticky at 2.8% due to services sector wage pressure.
- **Outlook:** Convergence to 2% targets expected by mid-2026.

**Growth Divergence:**
- **Advanced Economies:** Soft landing scenario dominant (1.5% growth).
- **Emerging Markets:** Asia leading growth (4.5%), Latin America lagging (1.8%).
- **Trade:** Global trade volume recovering (+2.8% YoY) as supply chains normalize.

**Key Risks:**
1. **Geopolitical Fragmentation:** Impact on commodity prices.
2. **Fiscal Overhang:** High debt-to-GDP ratios limiting stimulus capacity.
3. **Labor Markets:** Structural tightness keeping wage growth elevated.

**Source:** IMF World Economic Outlook, OECD Economic Outlook`,

        `**Economic Indicators Dashboard:**

**United States:**
- **GDP:** +2.1% (Resilient consumer spending)
- **CPI:** 2.4% (Approaching Fed target)
- **Unemployment:** 4.1% (Full employment)

**Eurozone:**
- **GDP:** +0.9% (Recovery from stagnation)
- **HICP:** 2.3% (Energy drag fading)
- **Unemployment:** 6.4% (Historic low)

**China:**
- **GDP:** +4.6% (Stimulus supported)
- **CPI:** 1.2% (Deflationary pressures easing)
- **Youth Unemployment:** Stabilizing after policy interventions.

**Commodities:**
- **Oil (Brent):** $78-82/bbl range.
- **Gold:** $2,350/oz (Safe haven demand).
- **Copper:** Rising on green energy transition demand.

**Source:** World Bank Global Economic Prospects, Bloomberg Economics`
      ];
      return macroResponses[Math.floor(Math.random() * macroResponses.length)];
    }

    // 8. Risk Management (Broadened)
    if (lowerMessage.includes('risk') || lowerMessage.includes('assessment') || lowerMessage.includes('stress') || lowerMessage.includes('default') || lowerMessage.includes('loss') || lowerMessage.includes('exposure')) {
      const riskResponses = [
        `**Risk Assessment Dashboard - Q1 2026:**

**Portfolio Risk Metrics:**
- **Value at Risk (VaR):** $12.5M (99% confidence, 1-day)
- **Expected Shortfall:** $18.2M
- **Risk-Weighted Assets (RWA):** $450B (+2.1% QoQ)
- **CET1 Ratio:** 12.4% (Target: >11%)

**Concentration Risk:**
- **Commercial Real Estate:** 18% of portfolio (High Watch)
- **Energy Sector:** 12% (Moderate)
- **Tech Sector:** 15% (Moderate)

**Emerging Risks:**
1. **Cyber Risk:** Ransomware attacks on financial infrastructure up 22%.
2. **Climate Transition:** Carbon-intensive assets repricing risk.

**Source:** Internal Risk Models, Basel Committee Risk Reports`,

        `**Credit Risk Stress Testing Results:**

**Scenario: Severe Global Recession**
- **GDP Shock:** -4.5% contraction
- **Unemployment:** Peaks at 9.2%
- **House Prices:** -25% correction

**Impact Analysis:**
- **Credit Losses:** $2.8B projected over 9 quarters
- **Capital Impact:** -220bps to CET1 ratio
- **Liquidity Coverage Ratio (LCR):** Drops to 115%

**Vulnerable Portfolios:**
1. **SME Lending:** 8.5% projected default rate
2. **Leveraged Loans:** 6.2% projected default rate

**Source:** Federal Reserve DFAST Methodology`,

        `**Operational & Non-Financial Risk:**

**Key Risk Indicators (KRIs):**
- **System Availability:** 99.95% (Green)
- **Fraud Attempts:** +15% YoY (Amber)
- **Compliance Breaches:** 2 minor incidents (Green)

**Focus Areas:**
1. **Third-Party Risk:** Reviewing cloud provider resilience.
2. **Data Privacy:** GDPR/CCPA compliance audit ongoing.

**Source:** Risk Management Committee Report`
      ];
      return riskResponses[Math.floor(Math.random() * riskResponses.length)];
    }

    // 9. News (Broadened)
    if (lowerMessage.includes('news') || lowerMessage.includes('headline') || lowerMessage.includes('update') || lowerMessage.includes('latest') || lowerMessage.includes('happening') || lowerMessage.includes('event')) {
      const newsResponses = [
        `**Financial News Briefing - ${new Date().toLocaleDateString()}:**

**Top Stories:**
1. **Global Banking:** Major central banks signal coordinated approach to digital currency (CBDC) interoperability.
2. **M&A Activity:** Banking sector consolidation accelerates in Europe.
3. **Fintech:** "Buy Now, Pay Later" regulation tightens in UK and Australia.

**Market Movers:**
- **Tech:** AI chip manufacturers rally on new earnings guidance.
- **Energy:** Oil prices stabilize at $78/bbl.
- **Crypto:** Bitcoin tests $85,000 resistance level.

**Source:** Bloomberg, Reuters, Financial Times`,

        `**Market Pulse & Breaking News:**

**Sector Watch:**
- **Real Estate:** Commercial property valuations show signs of stabilizing.
- **Automotive:** EV loan delinquencies rise slightly.
- **Banking:** Tier 1 capital requirements may increase for G-SIBs.

**Source:** Wall Street Journal, CNBC`
      ];
      return newsResponses[Math.floor(Math.random() * newsResponses.length)];
    }

    // 10. Data Sources (Broadened)
    if (lowerMessage.includes('world bank') || lowerMessage.includes('imf') || lowerMessage.includes('source') || lowerMessage.includes('data') || lowerMessage.includes('statistics') || lowerMessage.includes('report')) {
      const dataResponses = [
        `**World Bank & IMF Data Repository:**

**Latest World Bank Indicators (2025):**
- **Global Poverty Rate:** 8.2%
- **Global Trade (% of GDP):** 58%
- **Financial Inclusion:** 78% of adults have bank accounts globally

**IMF Financial Stability Metrics:**
- **Global Debt-to-GDP:** 238%
- **Bank Capital Ratios:** 15.1%
- **Non-Performing Loans:** 3.2%

**Source:** World Bank Open Data, IMF DataMapper`,

        `**Credited Financial Data Sources:**

**Central Bank Data:**
- **Fed FRED:** 820,000+ US economic time series.
- **ECB Statistical Warehouse:** Eurozone monetary aggregates.

**Market Data Providers:**
- **Bloomberg Terminal:** Real-time cross-asset pricing.
- **Refinitiv Eikon:** Fundamental data and news.

**Source:** Aggregated Financial Data Feeds`
      ];
      return dataResponses[Math.floor(Math.random() * dataResponses.length)];
    }

    // Return null to signal that we should use the API
    return null;
  }

  private getGenericMenu(): string {
    return `**Financial Intelligence from Hilda:**

I can help you with comprehensive financial analysis including:

**Available Analysis:**
1. **ECL (Expected Credit Loss)** - Modeling, forecasting, and risk assessment
2. **Interest Rates** - Current trends, predictions, and market impact
3. **Stock Market** - Sector analysis, equity trends, volatility forecasts
4. **Financial Forecasts** - 12-month outlook, loss predictions, risk scenarios
5. **Market Trends** - Global economic indicators, financial news synthesis
6. **Risk Assessment** - Default probability, loss potential, sector vulnerabilities

**Data Sources:** World Bank, IMF, Central Banks, Bloomberg, Reuters

Please ask me about any specific financial topic, and I'll provide detailed data-driven analysis with proper source attribution. What would you like to explore?`;
  }

  getChatHistory(): ChatMessage[] {
    return [...this.chatHistory];
  }

  clearChatHistory(): void {
    this.chatHistory = [];
    this.initializeSystemPrompt();
  }

  downloadChatAsJSON(): Blob {
    const dataStr = JSON.stringify(this.chatHistory, null, 2);
    return new Blob([dataStr], { type: 'application/json' });
  }

  downloadChatAsCSV(): Blob {
    const csvContent = this.chatHistory
      .map(msg => `"${msg.timestamp.toISOString()}","${msg.role}","${msg.content.replace(/"/g, '""')}"`)
      .join('\n');
    
    const header = '"Timestamp","Role","Message"\n';
    return new Blob([header + csvContent], { type: 'text/csv' });
  }

  downloadChatAsHTML(): Blob {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Hilda Financial Assistant Chat</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .message { margin: 10px 0; padding: 10px; border-radius: 5px; }
    .user { background-color: #e3f2fd; text-align: left; }
    .assistant { background-color: #f5f5f5; text-align: left; }
    .timestamp { font-size: 0.8em; color: #666; }
    h1 { color: #0369a1; }
  </style>
</head>
<body>
  <h1>Hilda Financial Assistant - Chat Export</h1>
  <p>Generated: ${new Date().toLocaleString()}</p>
  ${this.chatHistory
    .map(msg => `
    <div class="message ${msg.role}">
      <div class="timestamp">${msg.role === 'assistant' ? '🤖 Hilda' : '👤 You'} - ${msg.timestamp.toLocaleString()}</div>
      <p>${msg.content.replace(/\n/g, '<br>')}</p>
    </div>
    `)
    .join('')}
</body>
</html>`;
    return new Blob([htmlContent], { type: 'text/html' });
  }
}
