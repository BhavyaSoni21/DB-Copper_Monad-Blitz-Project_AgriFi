# Quick Deployment Script for Vercel
# Run this after deploying your smart contracts

Write-Host "🚀 AgriFi Vercel Deployment Helper" -ForegroundColor Cyan
Write-Host "===================================`n" -ForegroundColor Cyan

# Check if in frontend directory
if (!(Test-Path ".\package.json")) {
    Write-Host "❌ Error: Please run this script from the frontend directory" -ForegroundColor Red
    Write-Host "Run: cd frontend" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Vercel CLI installed" -ForegroundColor Green

# Check for .env.local
if (!(Test-Path ".\.env.local")) {
    Write-Host "⚠️  .env.local not found. Creating from example..." -ForegroundColor Yellow
    Copy-Item ".\.env.local.example" ".\.env.local"
    Write-Host "📝 Update .env.local with your contract addresses before deploying" -ForegroundColor Yellow
} else {
    Write-Host "✅ .env.local exists" -ForegroundColor Green
}

Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Login to Vercel: vercel login" -ForegroundColor White
Write-Host "2. Deploy: vercel" -ForegroundColor White
Write-Host "3. Follow the prompts (accept defaults)" -ForegroundColor White
Write-Host "4. For production: vercel --prod" -ForegroundColor White

Write-Host "`n🔐 Don't forget to set environment variables in Vercel Dashboard:" -ForegroundColor Yellow
Write-Host "   - NEXT_PUBLIC_LOAN_CONTRACT_ADDRESS" -ForegroundColor White
Write-Host "   - NEXT_PUBLIC_CREDIT_NFT_CONTRACT_ADDRESS" -ForegroundColor White

Write-Host "`n📚 Full guide: ../VERCEL_DEPLOYMENT.md" -ForegroundColor Cyan
Write-Host ""

$deploy = Read-Host "Deploy now? (y/n)"
if ($deploy -eq "y" -or $deploy -eq "Y") {
    Write-Host "`n🚀 Starting Vercel deployment..." -ForegroundColor Cyan
    vercel
} else {
    Write-Host "`n👍 Run 'vercel' when ready to deploy!" -ForegroundColor Green
}
