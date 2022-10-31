output "nexus_fqdn" {
  value = azurerm_private_dns_a_record.nexus_vm.fqdn
}

output "shared_address_prefixes" {
  value = jsonencode(data.azurerm_subnet.shared.address_prefixes)
}
