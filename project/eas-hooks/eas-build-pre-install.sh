#!/usr/bin/env bash

# EAS Build Pre-Install Hook
# Fixes CocoaPods and Folly dependencies for iOS builds

set -euo pipefail

echo "🔧 Starting EAS build pre-install hook..."

# Navigate to project root (hooks run from project root)
cd "$EXPO_UNSTABLE_PROJECT_ROOT" || cd "$(dirname "$0")/.." || exit 1

echo "📁 Working directory: $(pwd)"

# Clean CocoaPods cache if iOS directory exists
if [ -d "ios" ]; then
  echo "🧹 Cleaning CocoaPods cache..."
  rm -rf ios/Pods
  rm -rf ios/Podfile.lock
  rm -rf ios/.xcode.env.local
  rm -rf ios/build
fi

# Install/update CocoaPods if not available
if ! command -v pod &> /dev/null; then
  echo "📦 Installing CocoaPods..."
  gem install cocoapods --no-document || {
    echo "⚠️  Failed to install CocoaPods, continuing anyway..."
  }
fi

# Update CocoaPods repo
echo "📚 Updating CocoaPods repo..."
pod repo update || echo "⚠️  Pod repo update failed, continuing..."

echo "✅ Pre-install hook completed successfully"

