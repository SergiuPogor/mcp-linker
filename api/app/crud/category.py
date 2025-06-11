from app.core.prisma_utils import PrismaCRUD


class CategoryCRUD(PrismaCRUD):
    """CRUD for Category model"""

    def __init__(self):
        super().__init__("Category")


category = CategoryCRUD()
