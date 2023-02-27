locals {
  myip = var.public_deployment_ip_address != "" ? var.public_deployment_ip_address : chomp(data.http.myip[0].response_body)
  tre_core_tags = {
    tre_id              = var.tre_id
    tre_core_service_id = var.tre_id
  }
  api_diagnostic_categories_enabled = [
    "AppServiceHTTPLogs", "AppServiceConsoleLogs", "AppServiceAppLogs", "AppServiceFileAuditLogs",
    "AppServiceAuditLogs", "AppServiceIPSecAuditLogs", "AppServicePlatformLogs", "AppServiceAntivirusScanAuditLogs"
  ]
  docker_registry_server = "${var.acr_name}.azurecr.us"

  # https://learn.microsoft.com/en-us/azure/cosmos-db/how-to-configure-firewall#allow-requests-from-the-azure-portal
  azure_portal_cosmos_ips = "104.42.195.92,40.76.54.131,52.176.6.30,52.169.50.45,52.187.184.26"

  # we define some zones in core despite not used by the core infra because
  # it's the easier way to make them available to other services in the system.
  private_dns_zone_names_non_core = toset([
    "privatelink.purview.azure.com",
    "privatelink.purviewstudio.azure.com",
    "privatelink.sql.azuresynapse.usgovcloudapi.net",
    "privatelink.dev.azuresynapse.usgovcloudapi.net",
    "privatelink.azuresynapse.net",
    "privatelink.dfs.core.usgovcloudapi.net",
    "privatelink.azurehealthcareapis.us",
    "privatelink.dicom.azurehealthcareapis.us",
    "privatelink.api.ml.azure.us",
    "privatelink.cert.api.ml.azure.us",
    "privatelink.notebooks.usgovcloudapi.net",
    "privatelink.postgres.database.usgovcloudapi.net",
    "nexus-${var.tre_id}.${var.location}.cloudapp.usgovcloudapi.net",
    "privatelink.mysql.database.usgovcloudapi.net",
    "privatelink.databricks.azure.us"
  ])
}
