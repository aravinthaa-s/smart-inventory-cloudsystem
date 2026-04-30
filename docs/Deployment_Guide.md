# Deployment Guide (Review 2)

This guide provides instructions to deploy the Smart Inventory Cloud System to Microsoft Azure.

## Prerequisites
- Azure CLI installed and authenticated (`az login`)
- Terraform installed
- Docker installed
- kubectl installed

## Step 1: Provision Infrastructure with Terraform
1. Navigate to the `terraform/` directory.
2. Initialize Terraform:
   ```bash
   terraform init
   ```
3. Plan and apply the configuration:
   ```bash
   terraform apply -auto-approve
   ```
   *(Note: You will be prompted to enter the `sql_admin_password` securely).*
4. Once applied, Terraform will output the `acr_login_server`, `aks_cluster_name`, `sql_server_fqdn`, and `app_insights_instrumentation_key`.

## Step 2: Push Docker Images
1. Login to Azure Container Registry:
   ```bash
   az acr login --name acrsmartinventory
   ```
2. Build and push backend:
   ```bash
   cd backend
   docker build -t acrsmartinventory.azurecr.io/backend:latest .
   docker push acrsmartinventory.azurecr.io/backend:latest
   ```
3. Build and push frontend:
   ```bash
   cd ../frontend
   docker build -t acrsmartinventory.azurecr.io/frontend:latest .
   docker push acrsmartinventory.azurecr.io/frontend:latest
   ```

## Step 3: Deploy to Kubernetes (AKS)
1. Get AKS credentials:
   ```bash
   az aks get-credentials --resource-group rg-smart-inventory-cloud --name aks-smart-inventory
   ```
2. Create Secrets for Database:
   ```bash
   kubectl create secret generic backend-secrets \
     --from-literal=db_server="<your_sql_server_fqdn>" \
     --from-literal=db_user="sqladmin" \
     --from-literal=db_password="<your_password>"
   ```
3. Apply Kubernetes Manifests:
   ```bash
   kubectl apply -f kubernetes/deployment.yaml
   kubectl apply -f kubernetes/service.yaml
   kubectl apply -f kubernetes/ingress.yaml
   ```

## Step 4: Verify Deployment
Get the IP address of the Ingress controller to access the application:
```bash
kubectl get ingress
```
Navigate to the provided IP address in your browser to view the application.
