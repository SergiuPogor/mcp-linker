// scripts/bump.ts
import { exec } from "child_process";
import { readFileSync, writeFileSync } from "fs";

const newVersion = process.argv[2];
if (!newVersion) {
  console.error("❌ Usage: node scripts/bump.ts 1.1.0");
  process.exit(1);
}

const configPath = "tauri-app/src-tauri/tauri.conf.json";
const json = JSON.parse(readFileSync(configPath, "utf8"));

json.version = newVersion;

writeFileSync(configPath, JSON.stringify(json, null, 2) + "\n");

console.log(`✅ Updated tauri.conf.json to version ${newVersion}`);

const execPromise = (command: string) =>
  new Promise<void>((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${stderr}`);
      } else {
        resolve();
      }
    });
  });

await execPromise(`git add ${configPath}`);
await execPromise(`git commit -m "chore: bump version to ${newVersion}"`);
await execPromise(`git tag v${newVersion}`);
await execPromise(`git push origin v${newVersion}`);
