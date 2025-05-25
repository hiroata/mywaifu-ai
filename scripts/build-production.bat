@echo off
echo 🚀 Starting production build for Windows...

echo 📦 Installing dependencies...
call npm ci --omit=dev --ignore-scripts
if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to install dependencies
    exit /b 1
)

echo 🔄 Generating Prisma client...
call npx prisma generate
if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to generate Prisma client
    exit /b 1
)

echo 📊 Running database migrations...
call npx prisma migrate deploy
if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to run database migrations
    exit /b 1
)

echo 🏗️ Building Next.js application...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to build Next.js application
    exit /b 1
)

echo ✅ Production build completed successfully!
