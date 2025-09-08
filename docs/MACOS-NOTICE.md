# macOS Users: Unsigned App Notice

⚠️ **Important Information for macOS Users**

This version is **not yet signed or notarized** by Apple. You may see this warning when launching the application.

## What This Means

Don't worry — the app is safe. You can [follow this simple workaround](https://github.com/milisp/mcp-linker/issues/11) to bypass Gatekeeper and open it.

## Apple Notarization Status

🎯 Once the project reaches **200 stars**, a notarized version will be provided.

If you find this tool helpful, please support with a star! [![Star](https://img.shields.io/github/stars/milisp/mcp-linker?style=social)](https://github.com/milisp/mcp-linker/stargazers)

## How to Open Unsigned Apps on macOS

1. Try to open the app normally
2. If blocked, go to System Preferences → Security & Privacy
3. Click "Open Anyway" next to the blocked app message
4. Or use the command line: `xattr -d com.apple.quarantine /path/to/app`

For detailed instructions, see [this guide](https://github.com/milisp/mcp-linker/issues/11).
