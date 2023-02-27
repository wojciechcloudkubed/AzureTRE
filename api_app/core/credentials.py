from contextlib import asynccontextmanager
from core import config
from azure.core.credentials import TokenCredential
import logging

from azure.identity import (
    DefaultAzureCredential,
    ManagedIdentityCredential,
    ChainedTokenCredential,
    AzureAuthorityHosts
)
from azure.identity.aio import (
    DefaultAzureCredential as DefaultAzureCredentialASync,
    ManagedIdentityCredential as ManagedIdentityCredentialASync,
    ChainedTokenCredential as ChainedTokenCredentialASync,
)


def get_credential() -> TokenCredential:
    managed_identity = config.MANAGED_IDENTITY_CLIENT_ID
    if managed_identity:
        logging.exception("getting managed identity client")
        return ChainedTokenCredential(
            ManagedIdentityCredential(client_id=managed_identity, authority=AzureAuthorityHosts.AZURE_GOVERNMENT)
        )
    else:
        logging.exception("getting defaulkt identity client")
        return DefaultAzureCredential(authority=AzureAuthorityHosts.AZURE_GOVERNMENT)


@asynccontextmanager
async def get_credential_async() -> TokenCredential:
    """
    Context manager which yields the default credentials.
    """
    managed_identity = config.MANAGED_IDENTITY_CLIENT_ID
    credential = (
        ChainedTokenCredentialASync(
            ManagedIdentityCredentialASync(client_id=managed_identity, authority=AzureAuthorityHosts.AZURE_GOVERNMENT)
        )
        if managed_identity
        else
        DefaultAzureCredentialASync(authority=AzureAuthorityHosts.AZURE_GOVERNMENT)
    )
    yield credential
    await credential.close()
