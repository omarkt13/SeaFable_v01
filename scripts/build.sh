#!/bin/bash
set -e  # Exit on any error

echo "🚀 Starting SeaFable optimized build process..."

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check Node.js version
NODE_VERSION=$(node --version)
print_status "Node.js version: $NODE_VERSION"

# Validate required environment variables
required_vars=(
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "NEXT_PUBLIC_APP_URL"
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        print_error "$var is required but not set"
        exit 1
    fi
done

print_success "Environment variables validated"

# Clean previous builds
print_status "Cleaning previous builds..."
rm -rf .next
rm -rf out
rm -rf node_modules/.cache

# Check if package.json has changed
PACKAGE_HASH=""
if [ -f "package.json" ]; then
    PACKAGE_HASH=$(md5sum package.json | cut -d' ' -f1)
fi

CACHE_FILE=".next/cache/package.json.hash"
SKIP_INSTALL=false

if [ -f "$CACHE_FILE" ]; then
    CACHED_HASH=$(cat "$CACHE_FILE")
    if [ "$PACKAGE_HASH" = "$CACHED_HASH" ]; then
        print_status "Dependencies unchanged, checking node_modules..."
        if [ -d "node_modules" ] && [ -f "package-lock.json" ]; then
            SKIP_INSTALL=true
            print_success "Skipping dependency installation"
        fi
    fi
fi

# Install dependencies if needed
if [ "$SKIP_INSTALL" = false ]; then
    print_status "Installing dependencies..."
    
    # Use npm ci for faster, reliable installs
    if [ -f "package-lock.json" ]; then
        npm ci --silent --no-audit --no-fund
    else
        npm install --silent --no-audit --no-fund
    fi
    
    # Cache the package hash
    mkdir -p .next/cache
    echo "$PACKAGE_HASH" > "$CACHE_FILE"
    print_success "Dependencies installed"
fi

# Type checking
print_status "Running type checks..."
if ! npm run type-check; then
    print_error "Type checking failed"
    exit 1
fi
print_success "Type checking passed"

# Linting
print_status "Running linter..."
if ! npm run lint; then
    print_warning "Linting issues found, but continuing build..."
fi

# Build the application
print_status "Building application..."

# Set build optimizations
export NODE_OPTIONS="--max-old-space-size=4096"
export NEXT_TELEMETRY_DISABLED=1

# Build with error handling
if ! npm run build; then
    print_error "Build failed"
    
    # Try to provide helpful error information
    if [ -f ".next/build-manifest.json" ]; then
        print_status "Partial build detected, cleaning and retrying..."
        rm -rf .next
        npm run build
    else
        exit 1
    fi
fi

print_success "Build completed successfully!"

# Build analysis (if enabled)
if [ "$ANALYZE" = "true" ]; then
    print_status "Running bundle analysis..."
    npm run build:analyze
fi

# Post-build optimizations
print_status "Running post-build optimizations..."

# Compress static assets if available
if command -v gzip &> /dev/null; then
    find .next/static -name "*.js" -o -name "*.css" | while read file; do
        gzip -k -f "$file"
    done
    print_success "Static assets compressed"
fi

# Generate build report
BUILD_SIZE=$(du -sh .next | cut -f1)
STATIC_SIZE=$(du -sh .next/static 2>/dev/null | cut -f1 || echo "0")

print_success "Build completed!"
print_status "Build size: $BUILD_SIZE"
print_status "Static assets size: $STATIC_SIZE"
print_status "Build timestamp: $(date)"

# Health check
print_status "Running post-build health check..."
if [ -f ".next/BUILD_ID" ]; then
    BUILD_ID=$(cat .next/BUILD_ID)
    print_success "Build ID: $BUILD_ID"
else
    print_warning "Build ID not found"
fi

echo "✅ SeaFable build process completed successfully!"
