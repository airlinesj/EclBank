export interface ChurnPrediction {
  customerId: string;
  churnRiskScore: number; // 0-100
  churnProbability: number; // 0-1
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  predictedTimeToChurn: number; // days
  contributingFactors: ChurnFactor[];
  recommendedActions: string[];
  lastUpdated: Date;
}

export interface ChurnFactor {
  factor: string;
  weight: number; // relative importance 0-1
  value: string | number;
  trend: 'improving' | 'stable' | 'declining';
}

export interface ChurnAnalysisRequest {
  timeperiod?: string;
  customerSegment?: string;
  includeRecommendations?: boolean;
}

export interface ChurnAnalysisResponse {
  totalCustomers: number;
  averageChurnRisk: number;
  highRiskCount: number;
  criticalRiskCount: number;
  predictions: ChurnPrediction[];
  industryBenchmark: number;
  trendAnalysis: string;
}
