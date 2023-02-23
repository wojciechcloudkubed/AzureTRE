locals {
  core_resource_group_name       = "rg-${var.tre_id}"

  import_approved_sys_topic_name   = "evgt-airlock-import-approved-${var.workspace_resource_name_suffix}"
  export_inprogress_sys_topic_name = "evgt-airlock-export-inprog-${var.workspace_resource_name_suffix}"
  export_rejected_sys_topic_name   = "evgt-airlock-export-rejected-${var.workspace_resource_name_suffix}"
  export_blocked_sys_topic_name    = "evgt-airlock-export-blocked-${var.workspace_resource_name_suffix}"

  blob_created_topic_name = "airlock-blob-created"

  # STorage AirLock IMport APProved
  import_approved_storage_name = "stalimapp${var.storage_account_name_suffix}"
  # STorage AirLock EXport INTernal
  export_internal_storage_name = "stalexint${var.storage_account_name_suffix}"
  # STorage AirLock EXport InProgress
  export_inprogress_storage_name = "stalexip${var.storage_account_name_suffix}"
  # STorage AirLock EXport REJected
  export_rejected_storage_name = "stalexrej${var.storage_account_name_suffix}"
  # STorage AirLock EXport BLOCKED
  export_blocked_storage_name = "stalexblocked${var.storage_account_name_suffix}"

  airlock_blob_data_contributor = [
    azurerm_storage_account.sa_import_approved.id,
    azurerm_storage_account.sa_export_internal.id,
    azurerm_storage_account.sa_export_inprogress.id,
    azurerm_storage_account.sa_export_rejected.id,
    azurerm_storage_account.sa_export_blocked.id
  ]

  api_sa_data_contributor = [
    azurerm_storage_account.sa_import_approved.id,
    azurerm_storage_account.sa_export_internal.id,
    azurerm_storage_account.sa_export_inprogress.id
  ]
}
