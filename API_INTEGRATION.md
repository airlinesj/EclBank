# API Integration Checklist

This document provides a step-by-step guide for integrating your actual banking and macro APIs into the system.

## Banking System Integration

### Step 1: Update API Endpoint
**File**: `src/app/core/services/core-banking.service.ts` (Line ~25)

```typescript
// BEFORE:
private bankingApiUrl = '/api/banking';

// AFTER:
private bankingApiUrl = 'https://your-banking-system.com/api/v1';
```

### Step 2: Update HttpClient Configuration
**File**: Same as above

Add HttpClient provider in your main.ts or component:

```typescript
import { HttpClientModule } from '@angular/common/http';

// In your module/component imports
imports: [HttpClientModule, ...]
```

### Step 3: Implement Actual API Calls

Replace mock methods. Example for `extractLoanBalances()`:

```typescript
// BEFORE (mock):
extractLoanBalances(): Promise<LoanBalance[]> {
  return this.http
    .get<LoanBalance[]>(`${this.bankingApiUrl}/loans`)
    .pipe(
      timeout(this.requestTimeout),
      catchError(this.handleError)
    )
    .toPromise()
    .then(data => data || this.getMockLoanBalances());
}

// AFTER (production):
extractLoanBalances(): Promise<LoanBalance[]> {
  return this.http
    .get<LoanBalance[]>(`${this.bankingApiUrl}/loans`, {
      headers: this.getAuthHeaders()
    })
    .pipe(
      timeout(this.requestTimeout),
      catchError(this.handleError)
    )
    .toPromise()
    .then(data => data || []);
}

// Add authentication helper
private getAuthHeaders(): any {
  const token = localStorage.getItem('auth_token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}
```

### Step 4: Test Banking Integration

```typescript
// In your component or test file
this.coreBanking.extractAllBankingData().then(data => {
  console.log('Banking data:', data);
  if (data.status === 'success') {
    console.log('✓ Banking integration working');
  }
});
```

## Macroeconomic Data Integration

### Step 1: Configure API Endpoints
**File**: `src/app/core/services/macroeconomic-hub.service.ts` (Lines ~20-23)

```typescript
// IMF API
private imfApiUrl = 'https://www.imf.org/external/datamapper/api/v1';

// World Bank API
private worldBankApiUrl = 'https://api.worldbank.org/v2';

// OECD API (if available)
private oecdApiUrl = 'https://stats.oecd.org/sdmx-json/data';

// Central Bank API (country-specific)
private centralBankApiUrl = 'https://your-central-bank.gov/api/v1';
```

### Step 2: Implement Data Extraction Methods

Replace mock methods. Example for GDP Growth:

```typescript
// BEFORE (mock):
extractGDPGrowth(country: string): Promise<MacroVariable> {
  return this.http
    .get<MacroVariable>(`${this.imfApiUrl}/gdp-growth?country=${country}`)
    .pipe(
      timeout(this.requestTimeout),
      catchError(() => of(this.getMockGDPGrowth(country)))
    )
    .toPromise()
    .then(data => data || this.getMockGDPGrowth(country));
}

// AFTER (production - example with World Bank):
extractGDPGrowth(country: string): Promise<MacroVariable> {
  return this.http
    .get<any>(
      `${this.worldBankApiUrl}/country/${country}/indicators/NY.GDP.MKTP.KD.ZG?format=json`
    )
    .pipe(
      timeout(this.requestTimeout),
      map(response => this.parseWorldBankGDPResponse(response, country)),
      catchError(error => {
        console.error('Error fetching GDP:', error);
        return of(this.getDefaultMacroVariable('GDP_GROWTH', 'GDP Growth Rate'));
      })
    )
    .toPromise()
    .then(data => data || this.getDefaultMacroVariable('GDP_GROWTH', 'GDP Growth Rate'));
}

// Helper method to parse World Bank response
private parseWorldBankGDPResponse(response: any[], country: string): MacroVariable {
  const latestData = response[1]?.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )[0];

  return {
    variableId: 'GDP_GROWTH',
    name: 'GDP Growth Rate',
    description: `Real GDP growth rate for ${country}`,
    value: parseFloat(latestData?.value) || 2.5,
    unit: '%',
    period: latestData?.date || new Date().getFullYear().toString(),
    source: 'WORLD_BANK',
    lastUpdated: new Date(),
    historical: [] // Optional: fetch historical data
  };
}
```

### Step 3: Implement Forecasting with Real Data

The system includes a basic time-series forecasting method. For production:

```typescript
// BEFORE: Uses simple moving average
forecastMacroVariable(
  variableId: string, 
  historicalData: MacroVariable[], 
  periods: number = 4
): Promise<MacroForecast> {
  // Current implementation uses moving average
}

// AFTER: Consider using external forecasting service or ML model
forecastMacroVariable(
  variableId: string, 
  historicalData: MacroVariable[], 
  periods: number = 4
): Promise<MacroForecast> {
  // Option 1: Call your forecasting API
  return this.http.post<MacroForecast>(
    `${this.forecastingApiUrl}/forecast`,
    {
      variableId,
      historicalData,
      periods
    }
  ).toPromise();

  // Option 2: Use a Python-based service via REST
  // Option 3: Implement ARIMA/Prophet locally
}
```

### Step 4: Test Macro Integration

```typescript
// In your component
this.macroHub.extractAllMacroVariables('YourCountry').then(data => {
  console.log('Macro data:', data);
  if (data.status === 'success') {
    console.log('✓ Macro data integration working');
    
    // Now test forecasting
    return this.macroHub.forecastAllVariables('YourCountry');
  }
}).then(forecasts => {
  console.log('Forecasts:', forecasts);
});
```

## API Authentication

### Option 1: Bearer Token (JWT)

```typescript
// In your auth service
private getAuthHeaders(): HttpHeaders {
  const token = localStorage.getItem('auth_token');
  return new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });
}

// Use in HTTP calls
this.http.get<T>(url, { headers: this.getAuthHeaders() });
```

### Option 2: API Key

```typescript
private getAuthHeaders(): HttpHeaders {
  const apiKey = environment.bankingApiKey;
  return new HttpHeaders({
    'X-API-Key': apiKey,
    'Content-Type': 'application/json'
  });
}
```

### Option 3: OAuth2

```typescript
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    
    return next.handle(request);
  }
}
```

## Error Handling

```typescript
private handleError(error: HttpErrorResponse): Observable<never> {
  let errorMessage = 'An error occurred';
  
  if (error.error instanceof ErrorEvent) {
    // Client-side error
    errorMessage = `Error: ${error.error.message}`;
  } else {
    // Server-side error
    if (error.status === 401) {
      // Unauthorized - redirect to login
      this.authService.logout();
    } else if (error.status === 403) {
      // Forbidden - insufficient permissions
      errorMessage = 'You do not have permission to access this resource';
    } else if (error.status === 404) {
      // Not found
      errorMessage = 'The requested resource was not found';
    } else if (error.status === 500) {
      // Server error
      errorMessage = 'Server error occurred. Please try again later.';
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
  }
  
  console.error(errorMessage);
  return throwError(() => new Error(errorMessage));
}
```

## Environment Configuration

### Create environment files

**File**: `src/environments/environment.ts`
```typescript
export const environment = {
  production: false,
  bankingApiUrl: 'http://localhost:3000/api/banking',
  macroApiUrls: {
    imf: 'https://imf-test.example.com/api',
    worldBank: 'https://api.worldbank.org/v2',
    oecd: 'https://stats.oecd.org/sdmx-json/data',
    centralBank: 'http://localhost:3001/api'
  },
  apiTimeout: 30000,
  authTokenKey: 'banking_auth_token'
};
```

**File**: `src/environments/environment.prod.ts`
```typescript
export const environment = {
  production: true,
  bankingApiUrl: 'https://banking-api.yourbank.com/api',
  macroApiUrls: {
    imf: 'https://imf.org/api',
    worldBank: 'https://api.worldbank.org/v2',
    oecd: 'https://stats.oecd.org/sdmx-json/data',
    centralBank: 'https://central-bank.gov/api'
  },
  apiTimeout: 30000,
  authTokenKey: 'banking_auth_token'
};
```

### Use environment in services

```typescript
import { environment } from '../../../environments/environment';

export class CoreBankingService {
  private bankingApiUrl = environment.bankingApiUrl;
  private requestTimeout = environment.apiTimeout;
  // ...
}
```

## Testing Your Integration

```typescript
// Test file example
describe('Banking Integration', () => {
  let service: CoreBankingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CoreBankingService],
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(CoreBankingService);
  });

  it('should fetch loan balances', async () => {
    const loans = await service.extractLoanBalances();
    expect(loans).toBeDefined();
    expect(Array.isArray(loans)).toBe(true);
  });

  it('should handle API errors gracefully', async () => {
    try {
      await service.extractLoanBalances();
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
```

## Monitoring & Logging

```typescript
// Add logging to track API calls
private logApiCall(endpoint: string, method: string, status: string): void {
  this.auditTrail.logAction(
    `API Call: ${method} ${endpoint}`,
    'SYSTEM',
    'API',
    endpoint,
    status as 'success' | 'failed'
  );
}

// Usage
extractLoanBalances(): Promise<LoanBalance[]> {
  return this.http
    .get<LoanBalance[]>(`${this.bankingApiUrl}/loans`)
    .pipe(
      tap(() => this.logApiCall('/loans', 'GET', 'success')),
      catchError(error => {
        this.logApiCall('/loans', 'GET', 'failed');
        return throwError(() => error);
      })
    )
    .toPromise()
    .then(data => data || []);
}
```

## Data Transformation

If your APIs return data in different formats, create mappers:

```typescript
// Mapper to convert API response to application model
private mapBankingResponse(apiData: any): LoanBalance {
  return {
    loanId: apiData.id,
    borrowerId: apiData.borrower_id,
    principal: parseFloat(apiData.principal_amount),
    outstandingBalance: parseFloat(apiData.outstanding),
    interestRate: parseFloat(apiData.rate),
    currency: apiData.currency_code,
    loanType: this.mapLoanType(apiData.type),
    originationDate: new Date(apiData.originated_date),
    maturityDate: new Date(apiData.maturity_date),
    status: this.mapLoanStatus(apiData.status)
  };
}

private mapLoanType(type: string): 'retail' | 'corporate' | 'mortgage' {
  const typeMap: Record<string, 'retail' | 'corporate' | 'mortgage'> = {
    'CONSUMER': 'retail',
    'BUSINESS': 'corporate',
    'REAL_ESTATE': 'mortgage',
    'PERSONAL': 'retail'
  };
  return typeMap[type] || 'retail';
}
```

## Deployment Considerations

1. **CORS Configuration**: Ensure APIs allow CORS from your domain
2. **Rate Limiting**: Implement request queuing for high-volume scenarios
3. **Caching**: Add cache headers and implement client-side caching
4. **Backup**: Implement fallback to cached data if API fails
5. **Monitoring**: Set up alerts for API failures
6. **Load Testing**: Test with realistic data volumes

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| CORS errors | Configure CORS on backend or use proxy |
| Authentication failures | Check token expiration and refresh logic |
| Timeout errors | Increase timeout or optimize API calls |
| Data format mismatches | Implement proper mappers/transformers |
| Rate limiting | Implement request queuing or retry logic |

---

**Need Help?** Check the service implementations and the README.md for more details.
