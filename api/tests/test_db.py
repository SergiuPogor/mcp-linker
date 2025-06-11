import asyncio
import os
import sys

# 添加项目根目录到PYTHONPATH
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# 确保环境变量被正确加载
from dotenv import load_dotenv

load_dotenv()

from app.core.config import settings
from app.core.database import engine


async def test_db_connection():
    print("测试数据库连接...")
    print(f"数据库URL: {settings.DATABASE_URL}")

    try:
        # 测试连接
        async with engine.begin() as conn:
            result = await conn.execute("SELECT 1")
            print("成功连接到数据库!")
            print(f"查询结果: {result.fetchone()}")
    except Exception as e:
        print(f"连接数据库时出错: {str(e)}")

    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(test_db_connection())
