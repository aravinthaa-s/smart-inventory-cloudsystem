# Smart AI Powered Cloud Based Inventory Management System
**Phase 1: Architecture, Design & Costing Document (Review 1)**

## 1. Architecture Diagram
The architecture leverages Microsoft Azure services in a highly available and scalable setup.

```mermaid
graph TD
    Client[Client Browser / React App] --> |HTTPS| FrontDoor[Azure Front Door]
    FrontDoor --> |Routing| AKS[Azure Kubernetes Service - centralindia]
    FrontDoor -.-> |DR Routing| AKS_DR[Azure Kubernetes Service - southindia]
    
    subgraph AKS [Primary Region: centralindia]
        Ingress[Ingress Controller]
        Frontend[React Frontend Pods]
        Backend[Node.js Backend Pods]
        Ingress --> Frontend
        Ingress --> Backend
    \end
    
    Backend --> |SQL Query| SQL[Azure SQL Database]
    Backend --> |Blobs| Blob[Azure Blob Storage]
    Backend --> |API| OpenAI[Azure OpenAI]
    Backend --> |Secrets| KeyVault[Azure Key Vault]
    
    subgraph Monitoring [Observability]
        AppInsights[Application Insights]
        Monitor[Azure Monitor]
    \end
    
    Backend -.-> AppInsights
    AKS -.-> Monitor
    
    subgraph CI/CD
        GitHub[GitHub Actions] --> ACR[Azure Container Registry]
        ACR --> AKS
    \end
```

## 2. Azure Service Mapping Table

| Application Component | Azure Service Used | Purpose |
|-----------------------|--------------------|---------|
| Frontend Hosting | Azure Kubernetes Service (AKS) | Scalable container orchestration for the React.js web UI |
| Backend Hosting | Azure Kubernetes Service (AKS) | Containerized Node.js/Express.js APIs handling business logic |
| Relational Database | Azure SQL Database | Stores relational data for Users, Products, Transactions, Suppliers |
| Unstructured Storage | Azure Blob Storage | Stores images, generated invoices, and CSV/PDF report exports |
| AI / GenAI | Azure OpenAI | Provides low stock alerts, demand forecasting, reorder suggestions, and summaries |
| Container Registry | Azure Container Registry (ACR) | Secure repository for Docker images (Frontend & Backend) |
| Secrets Management | Azure Key Vault | Secure storage for DB connection strings, OpenAI keys, storage keys |
| Monitoring / Metrics | Azure Monitor + Application Insights | Tracks CPU > 70%, Error rate > 5%, Response time > 2 sec, logs traces |

## 3. Cost Estimate (Monthly, Pay-As-You-Go)
*Note: Estimates are approximations for production-ready setups.*

| Service | SKU / Tier | Est. Monthly Cost (USD) |
|---------|------------|-------------------------|
| Azure Kubernetes Service | Standard SLA + 2x DS2_v2 Nodes | ~$180 |
| Azure SQL Database | Standard S2 (50 DTUs) | ~$75 |
| Azure Blob Storage | Standard General Purpose v2 (100GB) | ~$2 |
| Azure OpenAI | GPT-4o / GPT-3.5-Turbo (Pay per token) | ~$30 (Variable) |
| Azure Container Registry | Basic Tier | ~$5 |
| Azure Key Vault | Standard | ~$1 |
| Azure Front Door | Standard | ~$35 |
| Application Insights/Monitor | 5GB Data Ingestion | ~$12 |
| **Total Estimated Cost** | | **~$340 / month** |

## 4. HA/DR (High Availability / Disaster Recovery) Strategy
- **Primary Region**: `centralindia`
- **Disaster Recovery Region**: `southindia`
- **Compute (AKS)**: We deploy a secondary AKS cluster in `southindia`. Azure Front Door handles global load balancing, directing traffic to `centralindia` primarily, and failing over to `southindia` if the primary region goes offline.
- **Database (Azure SQL)**: Azure SQL Database Geo-Replication is enabled, asynchronously replicating data from `centralindia` to `southindia`. In a disaster, the application connection string automatically points to the secondary region.
- **Storage (Blob Storage)**: Read-Access Geo-Redundant Storage (RA-GRS) is enabled to replicate blobs (images, invoices) to the DR region, ensuring data durability.

## 5. Security Design
- **Authentication**: JWT-based role-based access control (RBAC) separating Admin and Staff permissions.
- **Network Security**: Azure Virtual Network (VNet) integrates AKS. Database and Storage accounts are secured behind Private Endpoints, blocking direct public internet access.
- **Secrets**: Application code never hardcodes secrets. AKS retrieves connection strings directly from Azure Key Vault using Azure AD Workload Identity.
- **Code Security**: GitHub Actions pipeline runs CodeQL for Static Application Security Testing (SAST) and OWASP ZAP for Dynamic Application Security Testing (DAST) on every push.

## 6. Scalability Plan
- **Compute Scalability**: The AKS cluster is configured with the Cluster Autoscaler and Horizontal Pod Autoscaler (HPA). If CPU > 70%, HPA provisions more pods. If the node runs out of capacity, Cluster Autoscaler adds new VMs.
- **Database Scalability**: Azure SQL DTU scaling can be done without downtime to accommodate increased transaction volume. Read replicas can be enabled to offload reporting queries.
- **Storage**: Blob Storage is inherently scalable up to petabytes.
