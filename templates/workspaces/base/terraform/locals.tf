locals {
  workspace_unique_identifier_suffix = var.unique_identifier_suffix == "" ? substr(var.tre_resource_id, -6, -1) : var.unique_identifier_suffix
  workspace_resource_name_suffix     = "${var.tre_id}-ws-${local.workspace_unique_identifier_suffix}"
  storage_account_name_suffix        = "ws${local.workspace_unique_identifier_suffix}"
  storage_name                       = lower("stg${local.storage_account_name_suffix}")
  keyvault_name                      = lower("kv-${substr("ws-${local.workspace_unique_identifier_suffix}", -20, -1)}")
  redacted_senstive_value            = "REDACTED"
  tre_workspace_tags = {
    tre_id           = var.tre_id
    tre_workspace_id = var.tre_resource_id
  }
}
