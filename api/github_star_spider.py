#!/usr/bin/env python

# use GitHub API get star and store to redis

import os
from urllib.parse import urlparse

import redis
import scrapy

redis_conn = redis.Redis()

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")


class GitHubStarSpider(scrapy.Spider):
    name = "github_star_spider"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        with open("/tmp/github_urls.txt") as f:
            self.github_urls = [url.strip() for url in f]

    def start_requests(self):
        headers = {
            "Accept": "application/vnd.github.v3+json",
            "Authorization": f"token {GITHUB_TOKEN}",
        }

        for url in self.github_urls:
            parsed_url = urlparse(url)
            parts = parsed_url.path.strip("/").split("/")
            if len(parts) < 2:
                self.logger.warning(f"Invalid GitHub repo URL: {url}")
                continue
            owner, repo = parts[0], parts[1]
            api_url = f"https://api.github.com/repos/{owner}/{repo}"
            yield scrapy.Request(url=api_url, headers=headers, meta={"repo_url": url})

    def parse(self, response):
        repo_url = response.meta.get("repo_url")
        if response.status != 200:
            self.logger.error(f"Failed to fetch {repo_url} - status {response.status}")
            return

        data = response.json()
        stars = data.get("stargazers_count")
        if stars is not None:
            cache_key = f"github:stars:{repo_url}"
            redis_conn.set(cache_key, stars, ex=86400)  # 1 day
            self.logger.info(f"Stored stars for {repo_url}: {stars}")
        else:
            self.logger.warning(f"No stars info found for {repo_url}")
