# PowerShell script to insert test data

Write-Host "Inserting test data to Spring Boot API..." -ForegroundColor Green

# Read JSON file with UTF-8 encoding (no BOM)
$testData = Get-Content -Path "test-data.json" -Raw -Encoding UTF8
$uri = "http://localhost:8080/api/posts/batch"

try {
    $response = Invoke-RestMethod -Uri $uri -Method Post -Body $testData -ContentType "application/json; charset=utf-8"

    Write-Host "`nSuccess! Inserted $($response.Count) posts" -ForegroundColor Green
    Write-Host "`nInserted posts:" -ForegroundColor Cyan

    foreach ($post in $response) {
        Write-Host "  - [$($post.community)] $($post.title)" -ForegroundColor White
    }

    Write-Host "`nYou can now view all posts at: http://localhost:8080/api/posts" -ForegroundColor Yellow

} catch {
    Write-Host "`nError inserting test data:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red

    if ($_.ErrorDetails.Message) {
        Write-Host "`nDetails:" -ForegroundColor Red
        Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    }
}
