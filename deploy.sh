#!/bin/bash
# Comprehensive deployment script for Coupin app

echo "🚀 Starting deployment process..."

# Check for any TypeScript errors
echo "🔍 Checking for TypeScript errors..."
npx tsc --noEmit
if [ $? -ne 0 ]; then
  echo "❌ TypeScript errors found. Please fix them before deploying."
  exit 1
fi

# Build the application
echo "📦 Building the application..."
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
  echo "❌ Build failed. Aborting deployment."
  exit 1
fi

# Deploy Firestore rules
echo "🔒 Deploying Firestore security rules..."
# Use the fixed version of firestore rules
cp fixed-firestore.rules firestore.rules
firebase deploy --only firestore:rules

# Deploy Storage rules
echo "🗄️ Deploying Storage security rules..."
firebase deploy --only storage:rules

# Deploy Firebase hosting with improved caching
echo "🌐 Deploying to Firebase hosting..."
# Update firebase.json with improved caching settings
cat > firebase.json << EOF
{
  "storage": {
    "rules": "storage.rules"
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "hosting": {
    "public": "build",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      },
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=86400"
          }
        ]
      },
      {
        "source": "/",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache, no-store, must-revalidate"
          }
        ]
      }
    ]
  },
  "emulators": {
    "auth": {
      "port": 9099
    },
    "firestore": {
      "port": 8080
    },
    "storage": {
      "port": 9199
    },
    "ui": {
      "enabled": true
    }
  }
}
EOF

# Deploy to Firebase hosting
firebase deploy --only hosting

# Check required image assets
echo "🖼️ Checking required image assets..."
node src/scripts/checkImageAssets.js

echo "✅ Deployment completed successfully!"
