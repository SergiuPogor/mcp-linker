from typing import Any, Dict, Generic, List, Optional, TypeVar, Union

from fastapi import HTTPException
from pydantic import BaseModel

from .prisma_config import get_prisma

ModelType = TypeVar("ModelType")
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)


class PrismaCRUD(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    """
    Base class for CRUD operations with Prisma models
    """

    def __init__(self, model_name: str):
        """
        Initialize with the model name to operate on
        """
        self.model_name = model_name

    async def _get_client(self):
        """Get Prisma client instance"""
        return await get_prisma()

    async def get(self, id: Any) -> Optional[ModelType]:
        """
        Get a record by ID
        """
        client = await self._get_client()
        model_client = getattr(client, self.model_name.lower())
        return await model_client.find_unique(where={"id": id})

    async def get_or_404(self, id: Any, detail: str = "Item not found") -> ModelType:
        """
        Get a record by ID or raise 404 exception
        """
        obj = await self.get(id)
        if obj is None:
            raise HTTPException(status_code=404, detail=detail)
        return obj

    async def list(
        self, *, offset: int = 0, limit: int = 100, **filters
    ) -> List[ModelType]:
        """
        Get a list of records with optional filtering
        """
        client = await self._get_client()
        model_client = getattr(client, self.model_name.lower())
        where_clause = self._build_where_clause(filters) if filters else {}
        return await model_client.find_many(where=where_clause, skip=offset, take=limit)

    async def create(
        self, *, obj_in: Union[CreateSchemaType, Dict[str, Any]]
    ) -> ModelType:
        """
        Create a new record
        """
        obj_in_data = obj_in if isinstance(obj_in, dict) else obj_in.model_dump()
        client = await self._get_client()
        model_client = getattr(client, self.model_name.lower())
        return await model_client.create(data=obj_in_data)

    async def update(
        self, *, id: Any, obj_in: Union[UpdateSchemaType, Dict[str, Any]]
    ) -> ModelType:
        """
        Update a record
        """
        obj_data = (
            obj_in
            if isinstance(obj_in, dict)
            else obj_in.model_dump(exclude_unset=True)
        )

        client = await self._get_client()
        model_client = getattr(client, self.model_name.lower())
        return await model_client.update(where={"id": id}, data=obj_data)

    async def delete(self, *, id: Any) -> bool:
        """
        Delete a record by ID
        """
        try:
            client = await self._get_client()
            model_client = getattr(client, self.model_name.lower())
            await model_client.delete(where={"id": id})
            return True
        except Exception:
            return False

    async def count(self, **filters) -> int:
        """
        Count records with optional filtering
        """
        client = await self._get_client()
        model_client = getattr(client, self.model_name.lower())
        where_clause = self._build_where_clause(filters) if filters else {}
        return await model_client.count(where=where_clause)

    def _build_where_clause(self, filters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Build Prisma where clause from filters
        """
        where = {}
        for key, value in filters.items():
            if value is not None:
                where[key] = value
        return where
