# Fix ECONNREFUSED Errors in Banking System

## Problem
The Angular frontend is configured to proxy API requests to `http://localhost:3000`, but no backend server is running on that port. This causes ECONNREFUSED errors in webpack-dev-server logs.

## Solution
Modify the services to use mock data directly instead of attempting HTTP calls to non-existent backend.

## Tasks
- [x] Update CoreBankingService to return mock data without HTTP calls
- [x] Update MacroeconomicHubService to return mock data without HTTP calls
- [x] Test that the application works with mock data
- [ ] Update proxy.conf.json or remove it if not needed

## Files to Modify
- src/app/core/services/core-banking.service.ts
- src/app/core/services/macroeconomic-hub.service.ts
- proxy.conf.json (optional)
