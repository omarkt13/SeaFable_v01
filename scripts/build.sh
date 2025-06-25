# Vercel Build Script
# Optimized for faster deployment

#!/bin/bash
echo "🚀 Starting SeaFable build..."

# Check for required environment variables
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
  echo "❌ NEXT_PUBLIC_SUPABASE_URL is required"
  exit 1
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
  echo "❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is required"
  exit 1
fi

echo "✅ Environment variables validated"

# Skip if dependencies haven't changed
if [ -f ".next/cache/package.json.hash" ]; then
  if [ "$(cat .next/cache/package.json.hash)" = "$(md5sum package.json)" ]; then
    echo "📦 Dependencies unchanged, skipping install"
  else
    echo "📦 Installing dependencies..."
    npm ci --force
    mkdir -p .next/cache
    md5sum package.json > .next/cache/package.json.hash
  fi
else
  echo "📦 Installing dependencies..."
  npm ci --force
  mkdir -p .next/cache
  md5sum package.json > .next/cache/package.json.hash
fi

# Build with optimizations
echo "🔨 Building application..."
NODE_OPTIONS="--max-old-space-size=4096" npm run build

echo "✅ Build completed successfully!"
