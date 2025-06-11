import asyncio
import json
import os
from typing import Any, Dict

from app.core.prisma_config import prisma


class ConfigUpdater:
    def __init__(self):
        self.stats = {"created": 0, "updated": 0, "skipped": 0, "errors": 0}
        self.prisma = prisma

    async def load_config_data(self, file_path: str) -> list:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Config file not found: {file_path}")
        print(f"📖 Loading config data from: {file_path}")
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            print(f"✅ Loaded {len(data)} config entries")
            return data
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON in config file: {e}")
        except Exception as e:
            raise RuntimeError(f"Error reading config file: {e}")

    async def get_existing_data(self):
        print("🔍 Fetching existing servers and configs...")

        servers, configs = await asyncio.gather(
            self.prisma.server.find_many(), self.prisma.serverconfig.find_many()
        )

        servers_by_source = {s.source: s for s in servers}
        configs_by_server_id = {c.server_id: c for c in configs}

        print(f"📊 Found {len(servers)} servers and {len(configs)} existing configs")
        return servers_by_source, configs_by_server_id

    async def process_configs_batch(
        self,
        configs_data: list,
        servers_by_source: Dict[str, Any],
        configs_by_server_id: Dict[int, Any],
    ):
        print("⚡ Processing config updates...")

        for config_item in configs_data:
            url = None
            try:
                url = config_item.get("url")
                if not url:
                    print(f"⚠️  Config item missing URL, skipping")
                    self.stats["skipped"] += 1
                    continue

                if url not in servers_by_source:
                    print(f"⚠️  Server not found, skipping: {url}")
                    self.stats["skipped"] += 1
                    continue

                server = servers_by_source[url]
                existing = configs_by_server_id.get(server.id)

                # Get the config_items array which contains the actual config items
                config_data = config_item.get("config_items", [])

                # Validate config_data
                if config_data is None:
                    config_data = []
                elif not isinstance(config_data, (list, dict)):
                    print(f"⚠️  Invalid config data type for {url}, using empty list")
                    config_data = []

                print(
                    f"🔄 Processing {url} with {len(config_data) if isinstance(config_data, list) else 'dict'} config items"
                )

                if existing:
                    await self.prisma.serverconfig.update(
                        where={"id": existing.id},
                        data={"config_items": json.dumps(config_data)},
                    )
                    self.stats["updated"] += 1
                    print(f"✅ Updated config for {url}")
                else:
                    # Ensure server_id is valid
                    if not server or not server.id:
                        print(f"❌ Invalid server data for {url}")
                        self.stats["errors"] += 1
                        continue

                    # Convert the config data to JSON string before saving
                    await self.prisma.serverconfig.create(
                        data={
                            "server_id": server.id,
                            "config_items": json.dumps(config_data),
                        }
                    )
                    self.stats["created"] += 1
                    print(f"✅ Created config for {url}")

            except Exception as e:
                error_url = url if url else "unknown"
                print(f"❌ Error processing config for {error_url}: {e}")
                print(f"   Error type: {type(e).__name__}")
                self.stats["errors"] += 1
                continue

    async def import_server_configs(self, config_file_path: str):
        try:
            await self.prisma.connect()
            configs_data = await self.load_config_data(config_file_path)
            servers_by_source, configs_by_server_id = await self.get_existing_data()
            await self.process_configs_batch(
                configs_data, servers_by_source, configs_by_server_id
            )
            print("\n📊 Import Summary:")
            print(f"   ✅ Created: {self.stats['created']} configs")
            print(f"   🔄 Updated: {self.stats['updated']} configs")
            print(f"   ⏭️  Skipped: {self.stats['skipped']} configs")
            print(f"   ❌ Errors:  {self.stats['errors']} configs")
            print(f"   📈 Total processed: {sum(self.stats.values())} items")
            return self.stats
        finally:
            await self.prisma.disconnect()


async def async_main():
    from app.core.config import settings

    CONFIG_FILE = "/Users/gpt/projects/docs/mcp-server-prepare/out/unknown_configs.json"

    print(f"🔗 Database: {settings.DATABASE_URL[:50]}...")
    print("🚀 Starting server configs batch import...")

    updater = ConfigUpdater()
    try:
        stats = await updater.import_server_configs(CONFIG_FILE)
        if stats["errors"] == 0:
            print("🎉 All configs imported successfully!")
        else:
            print(f"⚠️  Import completed with {stats['errors']} errors")
    except FileNotFoundError as e:
        print(f"📁 File error: {e}")
        print("💡 Please check if the config file path is correct")
    except Exception as e:
        print(f"💥 Import failed: {e}")
        raise


def main():
    try:
        asyncio.run(async_main())
    except KeyboardInterrupt:
        print("\n🛑 Import cancelled by user")
    except Exception as e:
        print(f"💥 Fatal error: {e}")
        exit(1)


if __name__ == "__main__":
    main()
