import logging
from typing import Callable, Type

from azure.cosmos.aio import CosmosClient
from azure.mgmt.cosmosdb.aio import CosmosDBManagementClient
from fastapi import Depends, FastAPI, HTTPException
from fastapi import Request, status
from core import config, credentials
from db.errors import UnableToAccessDatabase
from db.repositories.base import BaseRepository
from resources import strings
from msrestazure.azure_cloud import AZURE_US_GOV_CLOUD


async def connect_to_db() -> CosmosClient:
    logging.debug(f"Connecting to {config.STATE_STORE_ENDPOINT}")
    logging.exception(" before got_credentials")
    try:
        async with credentials.get_credential_async() as credential:
            logging.exception("got_credentials")
            primary_master_key = await get_store_key(credential)
            logging.exception("got store key")
        if config.STATE_STORE_SSL_VERIFY:
            cosmos_client = CosmosClient(
                url=config.STATE_STORE_ENDPOINT, credential=primary_master_key
            )
        else:
            # ignore TLS (setup is a pain) when using local Cosmos emulator.
            cosmos_client = CosmosClient(
                config.STATE_STORE_ENDPOINT, primary_master_key, connection_verify=False
            )
        logging.debug("Connection established")
        return cosmos_client
    except Exception:
        logging.exception("Connection to state store could not be established.")


async def get_store_key(credential) -> str:
    if config.STATE_STORE_KEY:
        primary_master_key = config.STATE_STORE_KEY
    else:
        async with CosmosDBManagementClient(
            credential,
            subscription_id=config.SUBSCRIPTION_ID,
            base_url=AZURE_US_GOV_CLOUD.endpoints.resource_manager,
            credential_scopes=[
                AZURE_US_GOV_CLOUD.endpoints.resource_manager + ".default"
            ]
        ) as cosmosdb_mng_client:
            logging.exception("got cosmos client")
            database_keys = await cosmosdb_mng_client.database_accounts.list_keys(
                resource_group_name=config.RESOURCE_GROUP_NAME,
                account_name=config.COSMOSDB_ACCOUNT_NAME,
            )
            logging.exception("got cosmos client keys")
            primary_master_key = database_keys.primary_master_key
            logging.exception("got cosmos primary keys" + primary_master_key)
    logging.exception("using state store key from config")
    return primary_master_key


async def get_db_client(app: FastAPI) -> CosmosClient:
    if not app.state.cosmos_client:
        app.state.cosmos_client = await connect_to_db()
    return app.state.cosmos_client


async def get_db_client_from_request(request: Request) -> CosmosClient:
    return await get_db_client(request.app)


def get_repository(
    repo_type: Type[BaseRepository],
) -> Callable[[CosmosClient], BaseRepository]:
    async def _get_repo(
        client: CosmosClient = Depends(get_db_client_from_request),
    ) -> BaseRepository:
        try:
            return await repo_type.create(client)
        except UnableToAccessDatabase:
            logging.exception(strings.STATE_STORE_ENDPOINT_NOT_RESPONDING)
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=strings.STATE_STORE_ENDPOINT_NOT_RESPONDING,
            )

    return _get_repo
