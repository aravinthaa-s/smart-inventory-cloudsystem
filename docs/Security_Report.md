# Security Report & Configuration (Review 3)

## 1. SAST - Static Application Security Testing
We have integrated **GitHub CodeQL** to automatically analyze our codebase for security vulnerabilities on every push to the `main` branch. 
- **Tool**: GitHub CodeQL Action
- **Coverage**: Scans `javascript` and `typescript` logic in both Node.js Backend and React Frontend.
- **Workflow Location**: `.github/workflows/codeql.yml`

## 2. DAST - Dynamic Application Security Testing
We integrated **OWASP ZAP** (Zed Attack Proxy) Baseline Scan.
- **Tool**: OWASP ZAP Baseline Docker action
- **Coverage**: Scans the deployed endpoints for common web vulnerabilities (e.g., XSS, SQLi, missing headers).
- **Workflow Location**: `.github/workflows/owasp-zap.yml`

## 3. Data Protection Strategies
- **In Transit**: All traffic is enforced to use HTTPS via Azure Front Door and the Ingress controller.
- **At Rest**: 
  - Azure SQL Database enables Transparent Data Encryption (TDE) by default.
  - Azure Blob Storage encrypts data at rest using Microsoft-managed keys.
- **Secrets Management**: 
  - Application connection strings are never hardcoded. They are stored securely in Kubernetes Secrets or Azure Key Vault and injected as environment variables at runtime.
