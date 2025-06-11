FROM python:3.11-slim

WORKDIR /app

# 安装等待脚本依赖
RUN apt-get update && apt-get install -y netcat-openbsd && rm -rf /var/lib/apt/lists/*

# 提前安装依赖以利用缓存
COPY requirements.txt .
RUN pip install -r requirements.txt

# 再复制项目源码
COPY . .

# 生成 prisma 客户端
RUN prisma generate

# 设置环境变量
ENV PYTHONUNBUFFERED=1

# 启动命令
CMD sh -c 'uvicorn app.main:app --host 0.0.0.0 --port $PORT'