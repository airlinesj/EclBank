/**
 * Macroeconomic Variables Interface
 * Defines the structure for macro variables from various sources
 */

export interface MacroVariable {
  variableId: string;
  name: string;
  description: string;
  value: number;
  unit: string;
  period: string; // e.g., '2024-Q4', '2024-12'
  source: 'IMF' | 'WORLD_BANK' | 'OECD' | 'CENTRAL_BANK' | 'OTHER';
  lastUpdated: Date;
  historical?: MacroDataPoint[];
}

export interface MacroDataPoint {
  period: string;
  value: number;
  timestamp: Date;
}

export interface MacroForecast {
  variableId: string;
  variableName: string;
  forecastPeriods: ForecastPoint[];
  methodology: string;
  confidenceLevel: number; // 0-100%
  generatedDate: Date;
}

export interface ForecastPoint {
  period: string;
  forecastValue: number;
  lowerBound: number;
  upperBound: number;
}

export interface MacroEconomicHubResponse {
  variables: MacroVariable[];
  forecasts: MacroForecast[];
  lastSync: Date;
  status: 'success' | 'partial' | 'failed';
  errorMessage?: string;
}

export interface MacroVariableType {
  GDP_GROWTH: string;
  INFLATION_RATE: string;
  UNEMPLOYMENT_RATE: string;
  INTEREST_RATE: string;
  EXCHANGE_RATE: string;
  STOCK_MARKET_INDEX: string;
  CREDIT_SPREAD: string;
  HOUSE_PRICE_INDEX: string;
  COMMODITY_INDEX: string;
  CREDIT_GROWTH: string;
}
