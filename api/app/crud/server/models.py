from dataclasses import dataclass
from typing import List, Optional

from prisma.models import Server


@dataclass
class PaginationResult:
    """Pagination result data class"""

    items: List[Server]
    has_next: bool
    has_prev: bool
    page: int
    page_size: int
    total: Optional[int] = None
