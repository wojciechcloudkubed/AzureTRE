# Azure Provider source and version being used
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "=3.40.0"
    }
  }

  backend "azurerm" {
    environment     = "usgovernment"
  }
}

provider "azurerm" {
  environment     = "usgovernment"
  features {}
}
