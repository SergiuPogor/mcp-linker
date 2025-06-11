import redis

r = redis.Redis()
github_urls = r.keys("github:stars:*")
github_urls = [url.decode("utf-8") for url in github_urls]
print(github_urls)
