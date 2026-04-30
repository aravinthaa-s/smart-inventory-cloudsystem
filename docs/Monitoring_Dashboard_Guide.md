# Monitoring and Dashboard Guide (Review 3)

## 1. Application Insights Integration
The backend Node.js application is fully instrumented with Azure Application Insights to capture telemetry, distributed traces, exceptions, and performance metrics.
- The initialization code is in `backend/server.js`.
- It dynamically uses the `APPINSIGHTS_INSTRUMENTATIONKEY` injected via environment variables.

## 2. Setting Up Azure Monitor Alert Rules

As per requirements, we configure alerts for 3 core metrics:

### Alert 1: High CPU Usage
- **Scope**: Azure Kubernetes Service (aks-smart-inventory)
- **Condition**: CPU Percentage > 70%
- **Aggregation**: Average over 5 minutes.
- **Action**: Send email to the Operations team and trigger auto-scaling.

### Alert 2: High Error Rate (5xx HTTP Responses)
- **Scope**: Application Insights
- **Condition**: Failed Requests > 5%
- **Aggregation**: Average over 5 minutes.
- **Action**: Create an incident ticket and notify the dev team.

### Alert 3: Slow Response Time
- **Scope**: Application Insights
- **Condition**: Server Response Time > 2000 ms (2 seconds)
- **Aggregation**: Average over 5 minutes.
- **Action**: Alert DevOps to investigate database performance or query optimization.

## 3. Creating the Dashboard
1. Go to **Azure Portal** -> **Dashboard**.
2. Click **New Dashboard**.
3. Add a **Metrics Chart** for the AKS Cluster (CPU Utilization).
4. Add a **Metrics Chart** for App Insights (Server Response Time).
5. Add a **Metrics Chart** for App Insights (Failed Requests).
6. Save and publish the dashboard to monitor system health in real-time.
