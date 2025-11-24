#!/usr/bin/env bash

# EAS Build Post-Install Hook
# Fixes Folly coroutine issues for iOS builds

set -euo pipefail

echo "🔧 Starting EAS build post-install hook..."

# Navigate to project root
cd "$EXPO_UNSTABLE_PROJECT_ROOT" || cd "$(dirname "$0")/.." || exit 1

echo "📁 Working directory: $(pwd)"

# Fix Folly coroutine issue for iOS
if [ -d "ios" ] && [ -f "ios/Podfile" ]; then
  echo "🔨 Fixing Folly coroutine configuration in Podfile..."
  
  # Check if post_install already exists in Podfile
  if grep -q "FOLLY_CFG_NO_COROUTINES" ios/Podfile; then
    echo "⚠️  Folly coroutine fix already applied"
  else
    # Append post_install hook to Podfile
    cat >> ios/Podfile << 'EOF'

# Fix for Folly coroutine issue with react-native-reanimated
post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] ||= ['$(inherited)']
      config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'FOLLY_CFG_NO_COROUTINES=1'
    end
  end
end
EOF
    echo "✅ Added Folly coroutine fix to Podfile"
  fi
fi

echo "✅ Post-install hook completed successfully"

