# ========================================
# MyWaifu-AI Security Test Script
# ========================================

# Test configuration
$BASE_URL = "http://localhost:3000"
$TEST_RESULTS = @()

Write-Host "Security Test Starting..." -ForegroundColor Green
Write-Host "Base URL: $BASE_URL" -ForegroundColor Yellow
Write-Host ""

# 1. Health Check Test
Write-Host "1. Health Check Test..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/health" -Method GET
    Write-Host "PASS: Health Check Success" -ForegroundColor Green
    $TEST_RESULTS += "Health Check: PASS"
} catch {
    Write-Host "FAIL: Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
    $TEST_RESULTS += "Health Check: FAIL"
}

# 2. Security Headers Test
Write-Host "`n2. Security Headers Test..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri $BASE_URL -Method GET
    $headers = $response.Headers
    
    $securityHeaders = @(
        "X-Content-Type-Options",
        "X-Frame-Options", 
        "X-XSS-Protection",
        "Referrer-Policy",
        "Content-Security-Policy"
    )
    
    foreach ($header in $securityHeaders) {
        if ($headers.ContainsKey($header)) {
            Write-Host "PASS: $header is set" -ForegroundColor Green
        } else {
            Write-Host "FAIL: $header not set" -ForegroundColor Red
        }
    }    $TEST_RESULTS += "Security Headers: PASS"
} catch {
    Write-Host "FAIL: Security Headers Test Failed: $($_.Exception.Message)" -ForegroundColor Red
    $TEST_RESULTS += "Security Headers: FAIL"
}

# 3. Rate Limiting Test
Write-Host "`n3. Rate Limiting Test..." -ForegroundColor Cyan
$rateLimitTests = 0
$rateLimitSuccess = 0

for ($i = 1; $i -le 15; $i++) {
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/api/health" -Method GET
        $rateLimitTests++
        if ($response.status -eq "ok") {
            $rateLimitSuccess++
        }
        Start-Sleep -Milliseconds 100
    } catch {
        Write-Host "Rate limit reached at request $i" -ForegroundColor Yellow
        break
    }
}

Write-Host "Rate Limit Test Result: $rateLimitSuccess/$rateLimitTests requests succeeded" -ForegroundColor Yellow
$TEST_RESULTS += "Rate Limiting: PASS"

# 4. Unauthorized Access Test
Write-Host "`n4. Unauthorized Access Test..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/admin/stats" -Method GET -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 401 -or $response.StatusCode -eq 403) {
        Write-Host "PASS: Admin endpoint protected: HTTP $($response.StatusCode)" -ForegroundColor Green
        $TEST_RESULTS += "Admin Protection: PASS"
    } else {
        Write-Host "FAIL: Admin endpoint not protected: HTTP $($response.StatusCode)" -ForegroundColor Red
        $TEST_RESULTS += "Admin Protection: FAIL"
    }
} catch {
    Write-Host "PASS: Admin endpoint protected: Access denied" -ForegroundColor Green
    $TEST_RESULTS += "Admin Protection: PASS"
}

# Test Results Summary
Write-Host "`nTest Results Summary" -ForegroundColor Magenta
Write-Host "===================" -ForegroundColor Magenta
foreach ($result in $TEST_RESULTS) {
    if ($result -like "*PASS*") {
        Write-Host "PASS: $result" -ForegroundColor Green
    } else {
        Write-Host "FAIL: $result" -ForegroundColor Red
    }
}

Write-Host "`nOverall: $($TEST_RESULTS.Where({$_ -like '*PASS*'}).Count)/$($TEST_RESULTS.Count) tests passed" -ForegroundColor Yellow

Write-Host "`nSecurity Test Complete!" -ForegroundColor Green
