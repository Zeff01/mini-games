# GoHighLevel OAuth Token Management System

## Overview
Architecture diagram for managing GoHighLevel OAuth tokens, including installation flows, token exchange, refresh mechanisms, and API integration.

---

## System Architecture

```mermaid
flowchart TB
    subgraph "GoHighLevel"
        GHL_Market[GHL Marketplace]
        GHL_OAuth[OAuth Server]
        GHL_Webhook[Webhook System]
        GHL_API[GHL v2 API Endpoints]
    end

    subgraph "Your Application Backend"
        OAuth_Callback[OAuth Callback Endpoint]
        Webhook_Receiver[Webhook Receiver]
        Token_Service[Token Management Service]
        API_Wrapper[API Client Wrapper]
        Refresh_Job[Scheduled Refresh Job<br/>Cron/Scheduler]
        Business_Logic[Business Logic Layer]
    end

    subgraph "Secure Storage"
        Token_DB[(Token Database<br/>Encrypted)]
        Secret_Manager[Secret Manager<br/>client_id, client_secret]
    end

    subgraph "Decision Points"
        D1{userType?}
        D2{Token<br/>Expired?}
        D3{401/422<br/>Error?}
        D4{Refresh<br/>Success?}
    end

    %% Installation Flow
    GHL_Market -->|1. User Installs App| GHL_OAuth
    GHL_OAuth -->|2. Authorization Code<br/>Valid 15min| OAuth_Callback
    OAuth_Callback -->|3. Exchange Code<br/>POST /oauth/token| GHL_OAuth
    GHL_OAuth -->|4. Access Token 24h<br/>Refresh Token 1yr| Token_Service

    %% Webhook Flow
    GHL_Webhook -->|App Install Event<br/>locationId, companyId| Webhook_Receiver
    Webhook_Receiver -->|Trigger Token Exchange| Token_Service

    %% Token Type Decision
    Token_Service --> D1
    D1 -->|Company| Token_Service
    Token_Service -->|5. POST /oauth/locationToken<br/>companyId + locationId| GHL_OAuth
    GHL_OAuth -->|6. Location Token| Token_Service
    D1 -->|Location| Token_DB

    %% Storage
    Token_Service -->|7. Store Encrypted<br/>access_token, refresh_token<br/>expires_at, userType| Token_DB
    Secret_Manager -.->|Secure Credentials| Token_Service

    %% API Request Flow
    Business_Logic -->|Request API Call| API_Wrapper
    API_Wrapper -->|Retrieve Token| Token_DB
    API_Wrapper --> D2
    D2 -->|No| API_Wrapper
    D2 -->|Yes| Token_Service
    Token_Service -->|Refresh Token<br/>POST /oauth/token<br/>grant_type=refresh_token| GHL_OAuth
    GHL_OAuth -->|New Tokens| Token_Service

    %% API Call
    API_Wrapper -->|8. Authorized Request<br/>Authorization: Bearer| GHL_API
    GHL_API -->|Response| API_Wrapper
    API_Wrapper --> D3
    D3 -->|No| Business_Logic
    D3 -->|Yes - Unauthorized| Token_Service

    %% Refresh Verification
    Token_Service --> D4
    D4 -->|Yes| API_Wrapper
    D4 -->|No - Re-install| Business_Logic

    %% Scheduled Refresh
    Refresh_Job -->|Check Expiry<br/>30min before| Token_DB
    Token_DB -->|Tokens Near Expiry| Refresh_Job
    Refresh_Job -->|Trigger Refresh| Token_Service

    API_Wrapper -->|Success| Business_Logic

    style GHL_Market fill:#ff6b6b
    style GHL_OAuth fill:#ff6b6b
    style GHL_Webhook fill:#ff6b6b
    style GHL_API fill:#ff6b6b
    style Token_DB fill:#4ecdc4
    style Secret_Manager fill:#4ecdc4
    style D1 fill:#ffe66d
    style D2 fill:#ffe66d
    style D3 fill:#ffe66d
    style D4 fill:#ffe66d
```

---

## Installation Flow (Agency)

```mermaid
sequenceDiagram
    participant Agency as Agency Admin
    participant OAuth as OAuth Server
    participant App as Your App
    participant DB as Token Database

    Agency->>OAuth: Install App
    OAuth->>App: auth_code (15min)
    App->>OAuth: POST /oauth/token<br/>user_type=Company
    OAuth->>App: Company Token
    App->>OAuth: POST /oauth/locationToken<br/>+ locationId
    OAuth->>App: Location Token
    App->>DB: Store Encrypted
```

---

## Key Components

### 1. OAuth Callback
- Receives authorization code (15min validity)
- Exchanges for access + refresh tokens
- Stores securely in database

### 2. Webhook Receiver
- Receives App Install events
- Gets `locationId` and `companyId`
- Triggers location token exchange

### 3. Token Service
- Exchanges codes for tokens
- Converts Company → Location tokens
- Refreshes expired tokens
- Never logs sensitive data

### 4. API Wrapper
- Auto-injects tokens
- Auto-refresh on 401/422 errors
- Handles rate limiting

### 5. Scheduled Refresh Job
- Runs every 30 minutes
- Refreshes tokens before expiry
- Prevents service disruption

### 6. Token Database
```json
{
  "locationId": "string (PRIMARY KEY)",
  "companyId": "string",
  "access_token": "ENCRYPTED",
  "refresh_token": "ENCRYPTED",
  "expires_at": "timestamp",
  "userType": "Company | Location"
}
```

---

## API Specifications

### Token Lifetimes
- **Access Token:** 24 hours
- **Refresh Token:** 1 year (or until used)
- **Authorization Code:** 15 minutes

### Exchange Authorization Code
```
POST /oauth/token
Content-Type: application/x-www-form-urlencoded

client_id={YOUR_CLIENT_ID}
client_secret={YOUR_CLIENT_SECRET}
grant_type=authorization_code
code={AUTH_CODE}
user_type=Company|Location
redirect_uri={YOUR_REDIRECT_URI}
```

### Refresh Token
```
POST /oauth/token
Content-Type: application/x-www-form-urlencoded

client_id={YOUR_CLIENT_ID}
client_secret={YOUR_CLIENT_SECRET}
grant_type=refresh_token
refresh_token={REFRESH_TOKEN}
user_type=Company|Location
```

### Get Location Token
```
POST /oauth/locationToken
Authorization: Bearer {COMPANY_TOKEN}
Version: 2021-07-28

companyId={COMPANY_ID}
locationId={LOCATION_ID}
```

### Error Handling

| Code | Meaning | Action |
|------|---------|--------|
| 401 | Token expired | Refresh token |
| 422 | Invalid token | Refresh token |
| 400 | Bad request | Log & notify |
| 429 | Rate limit | Exponential backoff |

---

## Security Checklist

- ✅ AES-256 encryption at rest
- ✅ HTTPS only
- ✅ Tokens never in client-side code
- ✅ Tokens never logged
- ✅ Webhook signature verification
- ✅ Credentials in secret manager

---

## Implementation Checklist

### Setup
- [ ] Register app in GHL Marketplace
- [ ] Configure redirect URI & webhook URL
- [ ] Generate client_id and client_secret
- [ ] Define required scopes

### Core Components
- [ ] OAuth callback endpoint
- [ ] Webhook receiver endpoint
- [ ] Token Management Service
- [ ] Encrypted token database
- [ ] Secret manager setup

### API Integration
- [ ] API Client Wrapper
- [ ] Auto token injection
- [ ] Auto-refresh on errors
- [ ] Business logic integration

### Automation
- [ ] Scheduled refresh job (every 30min)
- [ ] Monitoring/alerting
- [ ] Logging (exclude tokens)

### Testing
- [ ] Agency installation flow
- [ ] Sub-account installation flow
- [ ] Token refresh mechanism
- [ ] Error handling (401/422)
- [ ] Security audit

---

## Installation Scenarios

| Aspect | Agency Install | Sub-account Install |
|--------|---------------|---------------------|
| **Who** | Agency admin | Sub-account user |
| **Token Type** | Company | Location |
| **Conversion** | Required | Not needed |
| **Use Case** | Multiple locations | Single location |

---

## Legend

- 🔴 Red: GHL Systems
- 🔵 Blue: Your Backend
- 🟢 Green: Secure Storage
- 🟡 Yellow: Decision Points

---

## Resources

- [GHL OAuth Docs](https://highlevel.stoplight.io/docs/integrations/00d0c0ecaa369-overview)
- [GHL API Reference](https://highlevel.stoplight.io/docs/integrations/)

---

## Document Info
- **Version:** 1.0
- **Last Updated:** 2025-11-17
- **Author:** Jzeff Kendrew F. Somera
- **Status:** Ready for Implementation
