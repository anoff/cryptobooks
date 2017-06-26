#!/bin/sh
# Set up the azure space for collector function
# Prereqs: 
#   1. have `azurecli` python package installed (az binary)
set -e

RESOURCE_GROUP="cryptobooks1"
STORAGE_NAME="cb1oracle"
FUNCTION_APP="cb1collector"

az group create --name "$RESOURCE_GROUP" --location westeurope

az storage account create --name "$STORAGE_NAME" --location westeurope --resource-group "$RESOURCE_GROUP" --sku Standard_LRS

az functionapp create --name "$FUNCTION_APP" --storage-account "$STORAGE_NAME"  --resource-group "$RESOURCE_GROUP" --consumption-plan-location westeurope

az functionapp deployment source config --name "$FUNCTION_APP" --resource-group "$RESOURCE_GROUP" --repo-url https://github.com/anoff/cryptobooks --branch master --manual-integration
