import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ChurnPrediction, ChurnFactor, ChurnAnalysisRequest, ChurnAnalysisResponse } from '@core/interfaces/churn.interface';

@Injectable({
  providedIn: 'root'
})
export class ChurnPredictionService {

  constructor() { }

  /**
   * Predict churn risk for a specific customer
   */
  predictCustomerChurn(customerId: string): Observable<ChurnPrediction> {
    // Simulate churn prediction algorithm
    const prediction = this.generateChurnPrediction(customerId);
    return of(prediction);
  }

  /**
   * Analyze churn patterns for a portfolio or segment
   */
  analyzeChurnPatterns(request: ChurnAnalysisRequest = {}): Observable<ChurnAnalysisResponse> {
    const analysis = this.generateChurnAnalysis(request);
    return of(analysis);
  }

  /**
   * Get churn prevention recommendations
   */
  getChurnPreventionRecommendations(churnRisk: number): string[] {
    const recommendations: string[] = [];

    if (churnRisk >= 80) {
      recommendations.push('Immediate outreach from relationship manager required');
      recommendations.push('Offer loyalty incentives or product upgrades');
      recommendations.push('Schedule VIP consultation within 24 hours');
      recommendations.push('Review and improve service quality metrics');
    } else if (churnRisk >= 60) {
      recommendations.push('Proactive engagement campaign');
      recommendations.push('Personalized product recommendations');
      recommendations.push('Review account activity and identify pain points');
      recommendations.push('Offer customized solutions for improved experience');
    } else if (churnRisk >= 40) {
      recommendations.push('Monitor engagement metrics closely');
      recommendations.push('Regular communication touchpoints');
      recommendations.push('Highlight new features and benefits');
    } else {
      recommendations.push('Standard customer engagement strategy');
      recommendations.push('Maintain quality service delivery');
    }

    return recommendations;
  }

  /**
   * Generate detailed churn risk report for a customer segment
   */
  generateChurnReport(segment: string = 'all'): Observable<string> {
    const report = this.createDetailedReport(segment);
    return of(report);
  }

  private generateChurnPrediction(customerId: string): ChurnPrediction {
    // Simulate churn factors
    const factors: ChurnFactor[] = [
      {
        factor: 'Account Activity',
        weight: 0.25,
        value: 'Low (2 transactions/month)',
        trend: 'declining'
      },
      {
        factor: 'Product Usage',
        weight: 0.20,
        value: '15% of available products',
        trend: 'stable'
      },
      {
        factor: 'Customer Satisfaction',
        weight: 0.15,
        value: '6.5/10 (below average)',
        trend: 'declining'
      },
      {
        factor: 'Account Tenure',
        weight: 0.15,
        value: '3.2 years',
        trend: 'stable'
      },
      {
        factor: 'Competitive Offers',
        weight: 0.15,
        value: '2 known competitive offers',
        trend: 'improving'
      },
      {
        factor: 'Service Complaints',
        weight: 0.10,
        value: '3 complaints in last 6 months',
        trend: 'declining'
      }
    ];

    // Calculate weighted churn score
    const churnScore = Math.min(100, Math.max(0, 
      factors.reduce((sum, f) => sum + (Math.random() * 40 + 30) * f.weight, 0)
    ));

    const riskLevel = this.getRiskLevel(churnScore);
    const recommendations = this.getChurnPreventionRecommendations(churnScore);

    return {
      customerId,
      churnRiskScore: Math.round(churnScore),
      churnProbability: churnScore / 100,
      riskLevel,
      predictedTimeToChurn: churnScore > 70 ? Math.round(30 + Math.random() * 60) : 180,
      contributingFactors: factors,
      recommendedActions: recommendations,
      lastUpdated: new Date()
    };
  }

  private generateChurnAnalysis(request: ChurnAnalysisRequest): ChurnAnalysisResponse {
    const totalCustomers = 5000;
    const highRiskCount = Math.floor(totalCustomers * 0.15);
    const criticalRiskCount = Math.floor(totalCustomers * 0.05);
    const averageChurnRisk = 42.5;

    const predictions: ChurnPrediction[] = [];
    for (let i = 0; i < 10; i++) {
      predictions.push(this.generateChurnPrediction(`CUST-${1000 + i}`));
    }

    return {
      totalCustomers,
      averageChurnRisk,
      highRiskCount,
      criticalRiskCount,
      predictions,
      industryBenchmark: 18.5,
      trendAnalysis: `Current churn rate of 42.5% is 2.3x higher than industry benchmark of 18.5%. 
        Key drivers: Declining customer satisfaction (-8% QoQ), increased competitive pressure (+12% offers), 
        and service quality issues (+15% complaints). Recommend immediate intervention for critical risk segment.`
    };
  }

  private getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }

  private createDetailedReport(segment: string): string {
    return `CHURN RISK ANALYSIS REPORT - ${segment.toUpperCase()}
    
Generated: ${new Date().toISOString()}

EXECUTIVE SUMMARY
- Average Churn Risk Score: 42.5/100
- Total Customers Analyzed: 5,000
- Critical Risk Customers: 250 (5%)
- High Risk Customers: 750 (15%)
- Industry Benchmark: 18.5%
- Current vs Benchmark: 2.3x Higher

KEY FINDINGS
1. Declining Engagement: 35% of customers showing reduced activity
2. Product Underutilization: Avg usage only 28% of available products  
3. Service Quality: 22% above-average complaint rate
4. Competitive Pressure: 45% of high-risk segment received competitive offers
5. Tenure Risk: Newer customers (1-3 years) show 3.2x higher churn

RISK DISTRIBUTION
- Segment A (Premium): 8% average risk
- Segment B (Standard): 45% average risk  
- Segment C (Basic): 62% average risk

TOP CONTRIBUTING FACTORS (by weight)
1. Account Activity Level (25%) - PRIMARY DRIVER
2. Product Usage Ratio (20%)
3. Customer Satisfaction Score (15%)
4. Account Tenure (15%)
5. Competitive Offers (15%)

RECOMMENDATIONS
1. Implement personalized engagement for high-risk customers
2. Launch retention campaigns for Segment C
3. Enhance service quality - address complaint drivers
4. Create loyalty programs for at-risk premium customers
5. Competitive response strategy for customers with external offers

PROJECTED IMPACT
- With interventions: Potential 8-12% churn reduction
- ROI: 3.5:1 on retention investments
- Expected customer lifetime value recovery: $2.3M annually`;
  }
}
