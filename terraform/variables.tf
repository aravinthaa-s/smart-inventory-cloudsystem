variable "primary_location" {
  description = "The primary Azure region for deployment"
  default     = "centralindia"
}

variable "dr_location" {
  description = "The disaster recovery Azure region for deployment"
  default     = "southindia"
}

variable "resource_group_name" {
  description = "Name of the resource group"
  default     = "rg-smart-inventory-cloud"
}

variable "aks_node_count" {
  description = "Number of nodes in AKS"
  default     = 2
}

variable "sql_admin_username" {
  description = "Admin username for SQL server"
  default     = "sqladmin"
}

variable "sql_admin_password" {
  description = "Admin password for SQL server"
  sensitive   = true
}
