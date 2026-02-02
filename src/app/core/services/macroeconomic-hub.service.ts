import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';
import { MacroVariable, MacroForecast, MacroEconomicHubResponse, ForecastPoint } from '../interfaces/macro.interface';

/**
 * Macroeconomic Hub Service
 * Extracts and consolidates macro variables from various sources (IMF, World Bank, OECD, etc.)
 * Provides forecasting capabilities for macro variables
 */
@Injectable({
  providedIn: 'root'
})
export class MacroeconomicHubService {
  // TODO: Configure these with actual API endpoints
  private imfApiUrl = '/api/imf';
  private worldBankApiUrl = '/api/worldbank';
  private oecdApiUrl = '/api/oecd';
  private centralBankApiUrl = '/api/centralbank';

  private requestTimeout = 30000;

  constructor(private http: HttpClient) {}

  /**
   * Extract GDP growth rate from IMF
   * TODO: Integrate with actual IMF API
   */
  extractGDPGrowth(country: string): Promise<MacroVariable> {
    // Using mock data for development - replace with actual API call when backend is available
    return Promise.resolve(this.getMockGDPGrowth(country));
  }

  /**
   * Extract inflation rate from World Bank
   * TODO: Integrate with actual World Bank API
   */
  extractInflationRate(country: string): Promise<MacroVariable> {
    return this.http
      .get<MacroVariable>(`${this.worldBankApiUrl}/inflation?country=${country}`)
      .pipe(
        timeout(this.requestTimeout),
        catchError(() => of(this.getMockInflationRate(country)))
      )
      .toPromise()
      .then(data => data || this.getMockInflationRate(country));
  }

  /**
   * Extract unemployment rate
   * TODO: Integrate with actual data source API
   */
  extractUnemploymentRate(country: string): Promise<MacroVariable> {
    return this.http
      .get<MacroVariable>(`${this.worldBankApiUrl}/unemployment?country=${country}`)
      .pipe(
        timeout(this.requestTimeout),
        catchError(() => of(this.getMockUnemploymentRate(country)))
      )
      .toPromise()
      .then(data => data || this.getMockUnemploymentRate(country));
  }

  /**
   * Extract interest rate from Central Bank
   * TODO: Integrate with actual Central Bank API
   */
  extractInterestRate(country: string): Promise<MacroVariable> {
    return this.http
      .get<MacroVariable>(`${this.centralBankApiUrl}/interest-rate?country=${country}`)
      .pipe(
        timeout(this.requestTimeout),
        catchError(() => of(this.getMockInterestRate(country)))
      )
      .toPromise()
      .then(data => data || this.getMockInterestRate(country));
  }

  /**
   * Extract credit growth rate
   * TODO: Integrate with actual data source API
   */
  extractCreditGrowth(country: string): Promise<MacroVariable> {
    return this.http
      .get<MacroVariable>(`${this.centralBankApiUrl}/credit-growth?country=${country}`)
      .pipe(
        timeout(this.requestTimeout),
        catchError(() => of(this.getMockCreditGrowth(country)))
      )
      .toPromise()
      .then(data => data || this.getMockCreditGrowth(country));
  }

  /**
   * Extract house price index
   * TODO: Integrate with actual data source API
   */
  extractHousePriceIndex(country: string): Promise<MacroVariable> {
    return this.http
      .get<MacroVariable>(`${this.oecdApiUrl}/house-price-index?country=${country}`)
      .pipe(
        timeout(this.requestTimeout),
        catchError(() => of(this.getMockHousePriceIndex(country)))
      )
      .toPromise()
      .then(data => data || this.getMockHousePriceIndex(country));
  }

  /**
   * Forecast macro variable using ARIMA or other time-series models
   * TODO: Integrate with actual forecasting API or implement forecasting algorithm
   */
  forecastMacroVariable(variableId: string, historicalData: MacroVariable[], periods: number = 4): Promise<MacroForecast> {
    // Simple moving average forecast for demo
    const forecastPoints: ForecastPoint[] = [];
    const history = historicalData[historicalData.length - 1]?.historical || [];

    if (history.length < 2) {
      return Promise.reject(new Error('Insufficient historical data for forecasting'));
    }

    const recentValues = history.slice(-8).map(h => h.value);
    const avgValue = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
    const volatility = Math.sqrt(
      recentValues.reduce((sum, val) => sum + Math.pow(val - avgValue, 2), 0) / recentValues.length
    );

    for (let i = 1; i <= periods; i++) {
      const nextPeriod = this.getNextPeriod(history[history.length - 1].period, i);
      const trend = (recentValues[recentValues.length - 1] - recentValues[0]) / recentValues.length;
      const forecastValue = avgValue + trend * i;

      forecastPoints.push({
        period: nextPeriod,
        forecastValue: Number(forecastValue.toFixed(2)),
        lowerBound: Number((forecastValue - volatility * 1.96).toFixed(2)),
        upperBound: Number((forecastValue + volatility * 1.96).toFixed(2))
      });
    }

    return Promise.resolve({
      variableId,
      variableName: historicalData[historicalData.length - 1]?.name || 'Unknown',
      forecastPeriods: forecastPoints,
      methodology: 'Time-Series Moving Average with Trend',
      confidenceLevel: 85,
      generatedDate: new Date()
    });
  }

  /**
   * Extract all macro variables and consolidate data
   */
  extractAllMacroVariables(country: string = 'Global'): Promise<MacroEconomicHubResponse> {
    return Promise.all([
      this.extractGDPGrowth(country),
      this.extractInflationRate(country),
      this.extractUnemploymentRate(country),
      this.extractInterestRate(country),
      this.extractCreditGrowth(country),
      this.extractHousePriceIndex(country)
    ])
      .then((variables: MacroVariable[]) => ({
        variables: variables as [MacroVariable, MacroVariable, MacroVariable, MacroVariable, MacroVariable, MacroVariable],
        forecasts: [],
        lastSync: new Date(),
        status: 'success' as const
      }))
      .catch(error => ({
        variables: [],
        forecasts: [],
        lastSync: new Date(),
        status: 'failed' as const,
        errorMessage: error.message
      }));
  }

  /**
   * Forecast all macro variables
   */
  async forecastAllVariables(country: string = 'Global', periods: number = 4): Promise<MacroForecast[]> {
    const macroData = await this.extractAllMacroVariables(country);
    const forecasts: MacroForecast[] = [];

    for (const variable of macroData.variables) {
      try {
        const forecast = await this.forecastMacroVariable(variable.variableId, [variable], periods);
        forecasts.push(forecast);
      } catch (error) {
        console.error(`Failed to forecast ${variable.name}:`, error);
      }
    }

    return forecasts;
  }

  /**
   * Get next period string (Q1 2024 -> Q2 2024, etc.)
   */
  private getNextPeriod(currentPeriod: string, increment: number): string {
    // Handle quarterly format (e.g., "Q4 2024")
    if (currentPeriod.includes('Q')) {
      const [quarter, year] = currentPeriod.split(' ');
      const q = parseInt(quarter.substring(1));
      const y = parseInt(year);

      let nextQ = (q + increment - 1) % 4 + 1;
      let nextY = y + Math.floor((q + increment - 1) / 4);

      return `Q${nextQ} ${nextY}`;
    }

    // Handle yearly format
    const year = parseInt(currentPeriod);
    return (year + increment).toString();
  }

  /**
   * Mock data methods for development
   */
  private getMockGDPGrowth(country: string): MacroVariable {
    return {
      variableId: 'GDP_GROWTH',
      name: 'GDP Growth Rate',
      description: `Real GDP growth rate for ${country}`,
      value: 2.5,
      unit: '%',
      period: 'Q4 2024',
      source: 'IMF',
      lastUpdated: new Date(),
      historical: [
        { period: 'Q2 2024', value: 2.3, timestamp: new Date('2024-06-30') },
        { period: 'Q3 2024', value: 2.4, timestamp: new Date('2024-09-30') },
        { period: 'Q4 2024', value: 2.5, timestamp: new Date('2024-12-31') }
      ]
    };
  }

  private getMockInflationRate(country: string): MacroVariable {
    return {
      variableId: 'INFLATION_RATE',
      name: 'Inflation Rate',
      description: `Annual inflation rate for ${country}`,
      value: 3.2,
      unit: '%',
      period: '2024-12',
      source: 'WORLD_BANK',
      lastUpdated: new Date(),
      historical: [
        { period: '2024-10', value: 3.5, timestamp: new Date('2024-10-31') },
        { period: '2024-11', value: 3.3, timestamp: new Date('2024-11-30') },
        { period: '2024-12', value: 3.2, timestamp: new Date('2024-12-31') }
      ]
    };
  }

  private getMockUnemploymentRate(country: string): MacroVariable {
    return {
      variableId: 'UNEMPLOYMENT_RATE',
      name: 'Unemployment Rate',
      description: `Unemployment rate for ${country}`,
      value: 4.5,
      unit: '%',
      period: '2024-12',
      source: 'WORLD_BANK',
      lastUpdated: new Date(),
      historical: [
        { period: '2024-10', value: 4.6, timestamp: new Date('2024-10-31') },
        { period: '2024-11', value: 4.5, timestamp: new Date('2024-11-30') },
        { period: '2024-12', value: 4.5, timestamp: new Date('2024-12-31') }
      ]
    };
  }

  private getMockInterestRate(country: string): MacroVariable {
    return {
      variableId: 'INTEREST_RATE',
      name: 'Policy Interest Rate',
      description: `Central bank policy rate for ${country}`,
      value: 4.75,
      unit: '%',
      period: '2024-12',
      source: 'CENTRAL_BANK',
      lastUpdated: new Date(),
      historical: [
        { period: '2024-10', value: 5.0, timestamp: new Date('2024-10-31') },
        { period: '2024-11', value: 4.75, timestamp: new Date('2024-11-30') },
        { period: '2024-12', value: 4.75, timestamp: new Date('2024-12-31') }
      ]
    };
  }

  private getMockCreditGrowth(country: string): MacroVariable {
    return {
      variableId: 'CREDIT_GROWTH',
      name: 'Credit Growth Rate',
      description: `Year-on-year credit growth for ${country}`,
      value: 6.2,
      unit: '%',
      period: '2024-12',
      source: 'CENTRAL_BANK',
      lastUpdated: new Date(),
      historical: [
        { period: '2024-10', value: 5.8, timestamp: new Date('2024-10-31') },
        { period: '2024-11', value: 6.0, timestamp: new Date('2024-11-30') },
        { period: '2024-12', value: 6.2, timestamp: new Date('2024-12-31') }
      ]
    };
  }

  private getMockHousePriceIndex(country: string): MacroVariable {
    return {
      variableId: 'HOUSE_PRICE_INDEX',
      name: 'House Price Index',
      description: `Residential house price index for ${country}`,
      value: 145.5,
      unit: '2015=100',
      period: 'Q4 2024',
      source: 'OECD',
      lastUpdated: new Date(),
      historical: [
        { period: 'Q2 2024', value: 142.3, timestamp: new Date('2024-06-30') },
        { period: 'Q3 2024', value: 144.1, timestamp: new Date('2024-09-30') },
        { period: 'Q4 2024', value: 145.5, timestamp: new Date('2024-12-31') }
      ]
    };
  }
}
