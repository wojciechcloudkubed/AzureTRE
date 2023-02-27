data "azurerm_virtual_network" "core" {
  name                = local.core_vnet
  resource_group_name = local.core_resource_group_name
}

data "azurerm_subnet" "core_webapps" {
  name                 = "WebAppSubnet"
  virtual_network_name = "vnet-${var.tre_id}"
  resource_group_name  = "rg-${var.tre_id}"
}

data "azurerm_subnet" "shared" {
  resource_group_name  = local.core_resource_group_name
  virtual_network_name = local.core_vnet
  name                 = "SharedSubnet"
}

data "azurerm_subnet" "bastion" {
  resource_group_name  = local.core_resource_group_name
  virtual_network_name = local.core_vnet
  name                 = "AzureBastionSubnet"
}

data "azurerm_subnet" "resourceprocessor" {
  resource_group_name  = local.core_resource_group_name
  virtual_network_name = local.core_vnet
  name                 = "ResourceProcessorSubnet"
}

data "azurerm_subnet" "airlockprocessor" {
  resource_group_name  = local.core_resource_group_name
  virtual_network_name = local.core_vnet
  name                 = "AirlockProcessorSubnet"
}

data "azurerm_route_table" "rt" {
  name                = "rt-${var.tre_id}"
  resource_group_name = local.core_resource_group_name
}

data "azurerm_private_dns_zone" "azurewebsites" {
  name                = "privatelink.azurewebsites.us"
  resource_group_name = local.core_resource_group_name
}

data "azurerm_private_dns_zone" "filecore" {
  name                = "privatelink.file.core.usgovcloudapi.net"
  resource_group_name = local.core_resource_group_name
}

data "azurerm_private_dns_zone" "blobcore" {
  name                = "privatelink.blob.core.usgovcloudapi.net"
  resource_group_name = local.core_resource_group_name
}

data "azurerm_private_dns_zone" "dfscore" {
  name                = "privatelink.dfs.core.usgovcloudapi.net"
  resource_group_name = local.core_resource_group_name
}

data "azurerm_private_dns_zone" "vaultcore" {
  name                = "privatelink.vaultcore.usgovcloudapi.net"
  resource_group_name = local.core_resource_group_name
}

data "azurerm_private_dns_zone" "azurecr" {
  name                = "privatelink.azurecr.us"
  resource_group_name = local.core_resource_group_name
}

data "azurerm_private_dns_zone" "azureml" {
  name                = "privatelink.api.ml.azure.us"
  resource_group_name = local.core_resource_group_name
}

data "azurerm_private_dns_zone" "azuremlcert" {
  name                = "privatelink.cert.api.ml.azure.us"
  resource_group_name = local.core_resource_group_name
}

data "azurerm_private_dns_zone" "notebooks" {
  name                = "privatelink.notebooks.usgovcloudapi.net"
  resource_group_name = local.core_resource_group_name
}

data "azurerm_private_dns_zone" "mysql" {
  name                = "privatelink.mysql.database.usgovcloudapi.net"
  resource_group_name = local.core_resource_group_name
}

data "azurerm_private_dns_zone" "postgres" {
  name                = "privatelink.postgres.database.usgovcloudapi.net"
  resource_group_name = local.core_resource_group_name
}

data "azurerm_private_dns_zone" "nexus" {
  name                = "nexus-${var.tre_id}.${var.location}.cloudapp.usgovcloudapi.net"
  resource_group_name = local.core_resource_group_name
}

data "azurerm_private_dns_zone" "health" {
  name                = "privatelink.azurehealthcareapis.us"
  resource_group_name = local.core_resource_group_name
}

data "azurerm_private_dns_zone" "dicom" {
  name                = "privatelink.dicom.azurehealthcareapis.us"
  resource_group_name = local.core_resource_group_name
}

data "azurerm_private_dns_zone" "databricks" {
  name                = "privatelink.databricks.azure.us"
  resource_group_name = local.core_resource_group_name
}
