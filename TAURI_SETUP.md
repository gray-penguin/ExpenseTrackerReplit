# Creating a macOS Native App with Tauri

## Current Status

✅ **Tauri CLI installed** - @tauri-apps/cli v2.7.1
✅ **Rust toolchain available** - Ready for compilation
✅ **Basic Tauri structure created** - src-tauri/ directory with configuration
⚠️ **Linux dependencies missing** - glib-2.0 required for Replit environment

## What Tauri Offers

Tauri is an excellent choice for creating a native macOS app from your React expense tracker:

### Key Benefits:
- **Small bundle size**: Apps can be as small as 600KB
- **Native performance**: Uses system webview instead of bundling Chromium
- **Cross-platform**: Build for macOS, Windows, Linux from same codebase  
- **Security-first**: Rust backend with configurable permissions
- **Native integrations**: File system, notifications, system tray, etc.

### Your App Would Get:
- Native macOS .app bundle
- Native window controls and menus
- System notifications for expense alerts
- File system access for CSV import/export
- Native look and feel with your existing React UI

## Setup Process for macOS Development

### On macOS (recommended for final builds):

1. **Install Prerequisites:**
   ```bash
   # Install Xcode Command Line Tools
   xcode-select --install
   
   # Install Rust
   curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh
   source ~/.cargo/env
   ```

2. **Development Commands:**
   ```bash
   # Start development (opens native app window)
   npx @tauri-apps/cli dev
   
   # Build for production (creates .app and .dmg)
   npx @tauri-apps/cli build
   ```

3. **Output Location:**
   - `.app` file: `src-tauri/target/release/bundle/macos/FinanceTracker.app`
   - `.dmg` installer: `src-tauri/target/release/bundle/dmg/FinanceTracker_..._.dmg`

## Current Files Created

The Tauri setup is ready with:

- ✅ `src-tauri/Cargo.toml` - Rust dependencies
- ✅ `src-tauri/tauri.conf.json` - App configuration  
- ✅ `src-tauri/src/main.rs` - Main entry point
- ✅ `src-tauri/src/lib.rs` - App logic
- ✅ `src-tauri/build.rs` - Build script
- ⚠️ `src-tauri/icons/` - Placeholder icons (need proper icons)

## Configuration Details

Your app is configured as:
- **Name**: FinanceTracker
- **Bundle ID**: com.financetracker.app
- **Window Size**: 1200x700 (min 800x600)
- **Web Source**: Your existing React app on port 5000
- **Build Output**: Uses your existing npm run build

## Next Steps for macOS App

### Option 1: Continue on macOS
Transfer this project to a macOS machine and run:
```bash
npx @tauri-apps/cli dev
```

### Option 2: Use GitHub Actions (Recommended)
Set up automated builds for all platforms including macOS using GitHub Actions.

### Option 3: Cloud macOS Build
Use services like MacStadium or GitHub Codespaces with macOS.

## Icon Requirements

For a polished app, you'll need:
- App icon in PNG format (1024x1024 recommended)
- Run: `npx @tauri-apps/cli icon path/to/your/icon.png`

## Why Tauri vs Electron?

| Feature | Tauri | Electron |
|---------|--------|----------|
| Bundle Size | ~600KB | ~100MB+ |
| Memory Usage | Low | High |
| Security | Rust + configurable permissions | Full Node.js access |
| Performance | Native webview | Bundled Chromium |
| Cross-platform | ✅ | ✅ |

## Replit Limitations

The current Replit Linux environment is missing system dependencies for Tauri:
- `glib-2.0` development libraries
- GTK development packages  
- Other Linux GUI dependencies

This is normal - Tauri desktop development is typically done on the target platform or CI/CD.

## Ready to Go!

Your expense tracker is perfectly suited for Tauri conversion. The existing React app will work seamlessly as the frontend, and you can add native features like:

- Native file dialogs for CSV import/export
- System notifications for spending alerts  
- Menu bar integration
- Auto-updates
- Native keyboard shortcuts

The setup is complete and ready for macOS development!