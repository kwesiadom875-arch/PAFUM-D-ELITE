# AI Endpoints Test Script
# Run this after integrating the endpoints into index.js

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing Parfum D'Elite AI Endpoints" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:5000"
$testsRun = 0
$testsPassed = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Endpoint,
        [hashtable]$Body = $null,
        [string]$Token = $null
    )
    
    $global:testsRun++
    Write-Host "Testing: $Name" -ForegroundColor Yellow
    
    try {
        $headers = @{
            "Content-Type" = "application/json"
        }
        
        if ($Token) {
            $headers["Authorization"] = $Token
        }
        
        $params = @{
            Uri = "$baseUrl$Endpoint"
            Method = $Method
            Headers = $headers
            TimeoutSec = 10
        }
        
        if ($Body) {
            $params["Body"] = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-RestMethod @params
        Write-Host "✅ PASS: $Name" -ForegroundColor Green
        Write-Host "   Response: $($response | ConvertTo-Json -Compress | Select-Object -First 100)..." -ForegroundColor Gray
        $global:testsPassed++
    }
    catch {
        Write-Host "❌ FAIL: $Name" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "`n=== PHASE 2: Customer-Facing AI ===" -ForegroundColor Magenta

Test-Endpoint `
    -Name "Signature Scent Finder" `
    -Method "POST" `
    -Endpoint "/api/ai/signature-scent" `
    -Body @{ description = "A warm, cozy evening by the fireplace" }

Test-Endpoint `
    -Name "Note Matchmaker" `
    -Method "POST" `
    -Endpoint "/api/ai/note-matchmaker" `
    -Body @{ query = "Fresh ocean breeze on a summer morning" }

# Note: Layering Advisor requires authentication, will show error if not logged in
Test-Endpoint `
    -Name "Layering Advisor (requires auth)" `
    -Method "POST" `
    -Endpoint "/api/ai/layering-advisor" `
    -Body @{ productId = 1 }

Write-Host "`n=== PHASE 3: Loyalty & Personalization ===" -ForegroundColor Magenta

# These require authentication
Test-Endpoint `
    -Name "Loyalty Tier Welcome (requires auth)" `
    -Method "POST" `
    -Endpoint "/api/ai/loyalty-tier-welcome"

Test-Endpoint `
    -Name "Purchase Milestones (requires auth)" `
    -Method "POST" `
    -Endpoint "/api/ai/purchase-milestones"

Write-Host "`n=== PHASE 4: Content Intelligence ===" -ForegroundColor Magenta

# Review submission requires auth
Test-Endpoint `
    -Name "Submit Review (requires auth)" `
    -Method "POST" `
    -Endpoint "/api/reviews" `
    -Body @{ 
        productId = "1"
        rating = 5
        reviewText = "Amazing longevity and projection! Lasts all day."
    }

Test-Endpoint `
    -Name "Get Reviews for Product" `
    -Method "GET" `
    -Endpoint "/api/reviews/1"

Test-Endpoint `
    -Name "Review Summary for Product" `
    -Method "GET" `
    -Endpoint "/api/ai/review-summary/1"

Test-Endpoint `
    -Name "Extract Notes (Admin)" `
    -Method "POST" `
    -Endpoint "/api/ai/extract-notes" `
    -Body @{ description = "This luxurious fragrance opens with bright bergamot and lemon, transitions to elegant rose and jasmine, and settles into a warm vanilla and sandalwood base." }

Write-Host "`n=== PHASE 5: Admin Intelligence ===" -ForegroundColor Magenta

Test-Endpoint `
    -Name "Carousel Curator" `
    -Method "GET" `
    -Endpoint "/api/ai/carousel-curator"

Test-Endpoint `
    -Name "A/B Test Copy Generator" `
    -Method "POST" `
    -Endpoint "/api/ai/ab-test-copy/1"

Test-Endpoint `
    -Name "Restock Predictor" `
    -Method "GET" `
    -Endpoint "/api/ai/restock-predictor"

Test-Endpoint `
    -Name "Admin Daily Summary" `
    -Method "GET" `
    -Endpoint "/api/ai/admin-daily-summary"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test Results: $testsPassed/$testsRun passed" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

if ($testsPassed -eq $testsRun) {
    Write-Host "🎉 All tests passed!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some tests failed. Check endpoints marked 'requires auth' - those need a valid auth token." -ForegroundColor Yellow
    Write-Host "   The other failures may indicate the endpoints haven't been added to index.js yet." -ForegroundColor Yellow
}
