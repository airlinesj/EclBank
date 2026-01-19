# System Architecture

## High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          USER INTERFACE LAYER                            │
│  ┌──────────────┬──────────────┬──────────────┬──────────────────────┐  │
│  │  Dashboard   │   Banking    │   Macro      │   ECL / Reports /    │  │
│  │              │   Data       │   Variables  │   Audit              │  │
│  └──────────────┴──────────────┴──────────────┴──────────────────────┘  │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
┌────────────────────────────────▼────────────────────────────────────────┐
│                        SERVICE LAYER (Core Logic)                        │
│  ┌────────────────────┐  ┌────────────────────┐  ┌──────────────────┐  │
│  │  Banking Services  │  │  Macro Services    │  │  ECL Services    │  │
│  │  ├─ Banking System │  │  ├─ Macro Hub      │  │  ├─ Formula      │  │
│  │  │   Interface     │  │  │   Service       │  │  │   Service      │  │
│  │  └─ Data Repo      │  │  └─ Data Repo      │  │  ├─ Calculation  │  │
│  │                    │  │                    │  │  │   Service      │  │
│  │                    │  │                    │  │  └─ Audit Trail  │  │
│  └────────────────────┘  └────────────────────┘  └──────────────────┘  │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
┌────────────────────────────────▼────────────────────────────────────────┐
│                    PERSISTENT STORAGE & EXTERNAL APIs                    │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────────────┐   │
│  │  Local Storage │  │   HTTP Client  │  │  External Data Sources   │   │
│  │  (Cached Data) │  │   (REST APIs)  │  │  ├─ Core Banking API    │   │
│  │  ├─ Banking    │  │                │  │  ├─ IMF API             │   │
│  │  │  Data       │  │                │  │  ├─ World Bank API      │   │
│  │  ├─ Macro      │  │                │  │  ├─ OECD API            │   │
│  │  │  Data       │  │                │  │  └─ Central Bank API    │   │
│  │  ├─ ECL        │  │                │  └──────────────────────────┘   │
│  │  │  Formulas   │  │                │                                 │
│  │  └─ Audit      │  │                │                                 │
│  │     Trail      │  │                │                                 │
│  └────────────────┘  └────────────────┘                                 │
└─────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         USER INTERACTIONS                                 │
│                                                                            │
│  1. Load Dashboard    2. Extract Data   3. Calculate ECL   4. Export     │
└──────────────────────────────────────────────────────────────────────────┘
                        │              │              │            │
                        ▼              ▼              ▼            ▼
        ┌───────────────────────────────────────────────────────────────┐
        │                    SERVICE ORCHESTRATION                       │
        │                                                               │
        │  Dashboard          Banking Service    Macro Service ECL     │
        │  Component          (Extract & Store)  (Extract & Forecast) │
        │                                                               │
        └───────────────────────────────────────────────────────────────┘
                │                    │                    │
                ▼                    ▼                    ▼
        ┌──────────────┐      ┌──────────────┐     ┌──────────────┐
        │  Data        │      │  Macro       │     │  ECL         │
        │  Repository  │      │  Repository  │     │  Calculation │
        │  Service     │      │  Service     │     │  Service     │
        └──────────────┘      └──────────────┘     └──────────────┘
                │                    │                    │
                │         ┌──────────┼──────────┐         │
                │         │          │          │         │
                ▼         ▼          ▼          ▼         ▼
        ┌───────────────────────────────────────────────────────────────┐
        │                      LOCAL STORAGE                             │
        │                                                               │
        │  Banking Data | Macro Data | ECL Formulas | Audit Trail      │
        │                                                               │
        └───────────────────────────────────────────────────────────────┘
```

## Module Dependency Graph

```
┌─────────────────────────────────────────────────────────────────┐
│                     APP ROOT COMPONENT                           │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
        ┌───────▼────────┐  ┌──▼──────────┐  │
        │  DASHBOARD     │  │  ROUTING    │  │
        └───────┬────────┘  └──┬──────────┘  │
                │              │             │
                ▼              ▼             ▼
        ┌────────────────────────────────────────────────┐
        │   Banking    Macro    ECL    Reports  Audit    │
        │   Module    Module  Module   Module   Module    │
        └────────────────────────────────────────────────┘
                │         │         │         │         │
                └─────────┼─────────┼─────────┼─────────┘
                          │
                ┌─────────▼──────────┐
                │   CORE SERVICES    │
                │                    │
                │  ├─ Banking        │
                │  ├─ Macro          │
                │  ├─ ECL Formula    │
                │  ├─ ECL Calc       │
                │  └─ Audit Trail    │
                └─────────┬──────────┘
                          │
                ┌─────────▼──────────┐
                │   INTERFACES &     │
                │   MODELS           │
                │                    │
                │  ├─ Banking Types  │
                │  ├─ Macro Types    │
                │  ├─ ECL Types      │
                │  └─ Audit Types    │
                └────────────────────┘
```

## ECL Calculation Flow

```
                     START: Portfolio ECL Calculation
                                   │
                                   ▼
                    ┌───────────────────────────────┐
                    │ For Each Loan in Portfolio    │
                    └───────────────┬───────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │  1. Fetch Loan Details      │
                    │     (from Data Repository)  │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │  2. Fetch Borrower Info     │
                    │     (from Data Repository)  │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │  3. Determine IFRS 9 Stage  │
                    │     Stage 1/2/3             │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │  4. Calculate PD            │
                    │     Based on:               │
                    │     - Credit Score          │
                    │     - Default History       │
                    │     - Interest Rate         │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │  5. Calculate LGD           │
                    │     Based on:               │
                    │     - Loan Type             │
                    │     - LTV Ratio             │
                    │     - Collateral Value      │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │  6. Get Macro Variables     │
                    │     (from Macro Repository) │
                    │     - GDP Growth            │
                    │     - Inflation             │
                    │     - Unemployment          │
                    │     - House Price Index     │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │  7. Calculate Macro         │
                    │     Adjustment Factor       │
                    │                             │
                    │  Adjustment =               │
                    │  (GDP, Inflation, etc.)     │
                    │  weighted factors           │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │  8. Select Formula          │
                    │     (from Formula Service)  │
                    │                             │
                    │  Formula = Selected ECL     │
                    │            Formula          │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │  9. Prepare Parameters      │
                    │     PD, LGD, EAD, etc.      │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │ 10. Evaluate Formula        │
                    │     ECL = Formula(params)   │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │ 11. Store Calculation       │
                    │     (in Storage)            │
                    └──────────────┬──────────────┘
                                   │
                         ┌─────────▼─────────┐
                         │ More Loans?       │
                         └────────┬──────────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │ 12. Aggregate Results      │
                    │     - Total ECL            │
                    │     - By Stage             │
                    │     - By Loan Type         │
                    └──────────────┬──────────────┘
                                   │
                                   ▼
                     RETURN: ECL Summary Results
```

## Data Processing Pipeline

```
Raw Input Data                  Processed Data              Output Results
═══════════════                 ══════════════              ══════════════

Banking API                     Core Banking Service        Dashboard
├─ Loans          ────────────► ├─ Validation              ├─ Portfolio
├─ Transactions                  ├─ Transformation          │  Summary
└─ Borrowers                     └─ Storage                 ├─ ECL Values
                                                            └─ Risk Metrics

Macro APIs                      Macro Services             Reports
├─ GDP              ────────────► ├─ Aggregation           ├─ Portfolio
├─ Inflation                      ├─ Forecasting            │  Report
├─ Unemployment                   └─ Storage                ├─ Risk Report
└─ Rates                                                    └─ Forecast

Manual Input                    ECL Service                Audit Trail
├─ Formulas         ────────────► ├─ Validation            ├─ All
├─ Parameters                     ├─ Calculation           │  Activities
└─ Rules                          └─ Storage               └─ Changes

                                                           Exports
                                                           ├─ JSON
                                                           ├─ CSV
                                                           └─ HTML
```

## Component Interaction Diagram

```
              ┌──────────────────────────────┐
              │      Dashboard Component      │
              │  ▲                            │
              │  │ Displays Summary           │
              │  │ and KPIs                   │
              │  │                            │
              │  └────────────────┐           │
              └──────────────┬────┘           │
                             │                │
                    ┌────────▼──────────┐     │
                    │  Banking Module   │     │
                    │  ┌──────────────┐ │     │
                    │  │ Loads Data   │ │     │
                    │  │ Displays     │ │     │
                    │  │ Loan Info    │ │     │
                    │  └──────────────┘ │     │
                    └────────┬──────────┘     │
                             │                │
                    ┌────────▼──────────┐     │
                    │  Macro Module     │     │
                    │  ┌──────────────┐ │     │
                    │  │ Loads Macro  │ │     │
                    │  │ Variables &  │ │     │
                    │  │ Forecasts    │ │     │
                    │  └──────────────┘ │     │
                    └────────┬──────────┘     │
                             │                │
                    ┌────────▼──────────┐     │
                    │  ECL Module       │     │
                    │  ┌──────────────┐ │     │
                    │  │ Calculates   │ │     │
                    │  │ ECL Values   │ │     │
                    │  └──────────────┘ │     │
                    └────────┬──────────┘     │
                             │                │
                    ┌────────▼──────────┐     │
                    │  Reports Module   │ ────┘
                    │  ┌──────────────┐ │
                    │  │ Generates &  │ │
                    │  │ Exports      │ │
                    │  │ Reports      │ │
                    │  └──────────────┘ │
                    └────────┬──────────┘
                             │
                    ┌────────▼──────────┐
                    │  Audit Module     │
                    │  ┌──────────────┐ │
                    │  │ Logs & Tracks│ │
                    │  │ All Activity │ │
                    │  └──────────────┘ │
                    └───────────────────┘
```

## Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Browser)                        │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Angular 17 - Web Framework                             │ │
│  │   ├─ Components (Dashboard, Modules)                   │ │
│  │   ├─ Services (Business Logic)                         │ │
│  │   ├─ Routing (Navigation)                              │ │
│  │   └─ Dependency Injection (IoC)                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ RxJS - Reactive Programming                            │ │
│  │   ├─ Observables (Data Streams)                        │ │
│  │   ├─ Operators (map, filter, etc.)                     │ │
│  │   └─ BehaviorSubjects (State Management)               │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ TypeScript - Type-Safe JavaScript                      │ │
│  │   ├─ Interfaces (Type Contracts)                       │ │
│  │   ├─ Classes (OOP)                                      │ │
│  │   └─ Type Checking (Compile-time Safety)               │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ SCSS - Styling                                         │ │
│  │   ├─ Component Styling                                 │ │
│  │   ├─ Responsive Design                                 │ │
│  │   └─ Global Styles                                     │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ LocalStorage - Client-side Persistence                 │ │
│  │   └─ Cached Data (Banking, Macro, ECL, Audit)         │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP Requests
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Backend (External APIs)                     │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Core Banking System API                                │ │
│  │   ├─ GET /loans                                         │ │
│  │   ├─ GET /transactions                                  │ │
│  │   └─ GET /borrowers                                     │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Macroeconomic Data Sources                             │ │
│  │   ├─ IMF API                                            │ │
│  │   ├─ World Bank API                                     │ │
│  │   ├─ OECD API                                           │ │
│  │   └─ Central Bank API                                   │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Optional: Forecasting/ML Service                       │ │
│  │   └─ Advanced forecasting models                        │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

This architecture provides a scalable, modular, and maintainable system for ECL calculations and banking analytics.
