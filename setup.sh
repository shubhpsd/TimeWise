#!/bin/bash
# TimeWise Extension Setup Script
# Run this from the Timewise directory

echo "⏱ Setting up TimeWise Extension..."

# Create directory structure
mkdir -p popup dashboard libs icons

# Download Chart.js
echo "📦 Downloading Chart.js..."
curl -sL "https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js" -o libs/chart.min.js

# Generate icon sizes from the source icon
ICON_SOURCE="$1"
if [ -z "$ICON_SOURCE" ]; then
  echo "⚠️  No icon source provided. You'll need to manually add icons to the icons/ folder."
  echo "   Usage: ./setup.sh /path/to/icon.png"
else
  echo "🎨 Generating icon sizes..."
  if command -v sips &> /dev/null; then
    # macOS sips tool
    cp "$ICON_SOURCE" icons/icon128.png
    sips -z 128 128 icons/icon128.png > /dev/null 2>&1
    cp "$ICON_SOURCE" icons/icon48.png
    sips -z 48 48 icons/icon48.png > /dev/null 2>&1
    cp "$ICON_SOURCE" icons/icon16.png
    sips -z 16 16 icons/icon16.png > /dev/null 2>&1
    echo "✅ Icons generated!"
  else
    echo "⚠️  sips not available. Please manually resize the icon to 16x16, 48x48, and 128x128."
  fi
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "To install the extension:"
echo "1. Open Chrome/Brave/Edge"
echo "2. Go to chrome://extensions"
echo "3. Enable 'Developer mode' (toggle in top right)"
echo "4. Click 'Load unpacked'"
echo "5. Select this folder: $(pwd)"
echo ""
echo "Happy time tracking! ⏱"
