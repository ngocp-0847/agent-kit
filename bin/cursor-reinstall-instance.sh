#!/usr/bin/env bash
set -euo pipefail

# OS guard – must be macOS
if [ "$(uname)" != "Darwin" ]; then
  echo "This command only works on macOS." >&2
  exit 1
fi

# === Parse arguments ===
SKIP_CONFIRM=false
NEW_APP_NAME=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    -y|--yes|--force)
      SKIP_CONFIRM=true
      shift
      ;;
    *)
      NEW_APP_NAME="$1"
      shift
      ;;
  esac
done

if [ -z "$NEW_APP_NAME" ]; then
  echo "Usage: $0 [-y|--yes] \"App Name (e.g. Cursor Enterprise)\"" >&2
  exit 1
fi

APP_PATH="$HOME/Applications/$NEW_APP_NAME.app"

# Calculate slug and paths (must match cursor-new-instance logic)
SLUG="$(echo "$NEW_APP_NAME" | tr '[:upper:]' '[:lower:]' | tr -cd '[:alnum:]')"
[ -z "$SLUG" ] && SLUG="custom"

BUNDLE_ID="com.cursor.$SLUG"
DATA_DIR="$HOME/Library/Application Support/${NEW_APP_NAME// /}"

# Verify instance exists
if [ ! -d "$APP_PATH" ]; then
  echo "❌ Instance not found at: $APP_PATH" >&2
  exit 1
fi

echo "This will reinstall:"
echo "  App bundle: $APP_PATH"
echo "  Bundle ID:  $BUNDLE_ID"
echo "  Data dir:   $DATA_DIR (preserved)"
echo

# Skip confirmation if --yes flag is provided
if [ "$SKIP_CONFIRM" = true ]; then
  ans="y"
else
  read -r -p "Are you sure? [y/N] " ans
fi

case "$ans" in
  y|Y|yes|YES)
    echo "🔄 Reinstalling $NEW_APP_NAME..."
    
    # === Step 1: Remove the app bundle ===
    echo "🗑️  Removing old app bundle..."
    rm -rf "$APP_PATH"

    # === Step 2: Copy the original app bundle ===
    echo "📦 Copying fresh app bundle..."
    if [ ! -d "/Applications/Cursor.app" ]; then
      echo "❌ Original Cursor.app not found at /Applications/Cursor.app" >&2
      exit 1
    fi
    cp -R "/Applications/Cursor.app" "$APP_PATH"

    # === Step 3: Give the app its identity ===
    APP="$APP_PATH"
    PLIST="$APP/Contents/Info.plist"
    
    echo "📝 Setting CFBundleIdentifier to $BUNDLE_ID..."
    if /usr/libexec/PlistBuddy -c "Set :CFBundleIdentifier $BUNDLE_ID" "$PLIST"; then
      echo "✅ CFBundleIdentifier updated."
    else
      echo "ℹ️  CFBundleIdentifier not found, adding..."
      /usr/libexec/PlistBuddy -c "Add :CFBundleIdentifier string $BUNDLE_ID" "$PLIST"
      echo "✅ CFBundleIdentifier added."
    fi
    
    echo "🔏 Re-signing app (ad-hoc signature)..."
    codesign --force --deep --sign - "$APP"

    # === Step 4: Launch with existing data ===
    echo "🚀 Launching $NEW_APP_NAME with preserved data..."
    open -n "$APP" --args --user-data-dir "$DATA_DIR"
    
    echo "✅ Done."
    ;;
  *)
    echo "Cancelled."
    exit 0
    ;;
esac