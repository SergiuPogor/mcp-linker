#!/usr/bin/env python3
"""
Performance testing script for server_configs API endpoint
Run this script to measure and compare API response times
"""

import asyncio
import statistics
import time
from typing import List

import httpx


async def measure_endpoint_performance(url: str, num_requests: int = 10) -> dict:
    """Measure API endpoint performance with multiple requests"""
    response_times = []
    successful_requests = 0
    failed_requests = 0

    async with httpx.AsyncClient() as client:
        for i in range(num_requests):
            start_time = time.time()
            try:
                response = await client.get(url, timeout=30.0)
                end_time = time.time()

                if response.status_code == 200:
                    response_times.append(end_time - start_time)
                    successful_requests += 1
                    print(f"Request {i + 1}: {(end_time - start_time):.4f}s - Success")
                else:
                    failed_requests += 1
                    print(f"Request {i + 1}: Failed with status {response.status_code}")

            except Exception as e:
                failed_requests += 1
                print(f"Request {i + 1}: Exception - {str(e)}")

    if response_times:
        return {
            "successful_requests": successful_requests,
            "failed_requests": failed_requests,
            "avg_response_time": statistics.mean(response_times),
            "median_response_time": statistics.median(response_times),
            "min_response_time": min(response_times),
            "max_response_time": max(response_times),
            "std_deviation": statistics.stdev(response_times)
            if len(response_times) > 1
            else 0,
            "all_times": response_times,
        }
    else:
        return {
            "successful_requests": 0,
            "failed_requests": failed_requests,
            "error": "No successful requests",
        }


async def main():
    """Main performance testing function"""
    # Configuration
    base_url = "http://localhost:8000"  # Adjust this to your API server
    endpoints_to_test = [
        f"{base_url}/api/v1/server_configs/?server_id=1",
        f"{base_url}/api/v1/servers/?page=1&page_size=20&sort=github_stars&direction=desc",
    ]

    print("🚀 Starting API Performance Tests")
    print("=" * 50)

    for endpoint in endpoints_to_test:
        print(f"\n📊 Testing endpoint: {endpoint}")
        print("-" * 40)

        # Test with cold cache (first request)
        print("Cold cache test (1 request):")
        cold_results = await measure_endpoint_performance(endpoint, 1)
        if "error" not in cold_results:
            print(f"  Response time: {cold_results['avg_response_time']:.4f}s")

        # Test with warm cache (multiple requests)
        print("\nWarm cache test (10 requests):")
        warm_results = await measure_endpoint_performance(endpoint, 10)

        if "error" not in warm_results:
            print(f"  Average: {warm_results['avg_response_time']:.4f}s")
            print(f"  Median:  {warm_results['median_response_time']:.4f}s")
            print(f"  Min:     {warm_results['min_response_time']:.4f}s")
            print(f"  Max:     {warm_results['max_response_time']:.4f}s")
            print(f"  Std Dev: {warm_results['std_deviation']:.4f}s")
            print(f"  Success: {warm_results['successful_requests']}/10")

            # Performance assessment
            avg_ms = warm_results["avg_response_time"] * 1000
            if avg_ms < 100:
                print(f"  ✅ Excellent performance ({avg_ms:.1f}ms)")
            elif avg_ms < 500:
                print(f"  ✅ Good performance ({avg_ms:.1f}ms)")
            elif avg_ms < 1000:
                print(f"  ⚠️  Fair performance ({avg_ms:.1f}ms)")
            else:
                print(f"  ❌ Poor performance ({avg_ms:.1f}ms)")
        else:
            print(f"  ❌ {warm_results['error']}")


if __name__ == "__main__":
    asyncio.run(main())
