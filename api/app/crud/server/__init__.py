from .category import ServerCategoryOperations
from .minimal import ServerMinimalOperations
from .models import PaginationResult
from .operations import ServerOperations
from .recommendations import ServerRecommendationOperations
from .stats import ServerStats


class ServerCRUDUltraOptimized(
    ServerOperations,
    ServerStats,
    ServerMinimalOperations,
    ServerRecommendationOperations,
    ServerCategoryOperations,
):
    """Ultra optimized server CRUD class combining all operations"""

    pass


# Global instance
server_optimized = ServerCRUDUltraOptimized()

# Export main components
__all__ = [
    "ServerCRUDUltraOptimized",
    "server_optimized",
    "PaginationResult",
    "ServerMinimalOperations",
    "ServerRecommendationOperations",
    "ServerCategoryOperations",
]
