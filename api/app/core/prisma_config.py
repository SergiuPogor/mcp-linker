from prisma import Prisma

# Global Prisma client instance
prisma = Prisma()


async def init_prisma():
    """Initialize Prisma client connection"""
    await prisma.connect()


async def close_prisma():
    """Close Prisma client connection"""
    await prisma.disconnect()


async def get_prisma() -> Prisma:
    """Get Prisma client instance"""
    return prisma
