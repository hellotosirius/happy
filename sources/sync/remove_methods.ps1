$filePath = "sync.ts"
$content = Get-Content $filePath -Raw

$lines = $content -split "`r`n"
$newLines = @()
$skip = $false

for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    
    # Skip purchaseProduct method
    if ($line -match "^\s*purchaseProduct = async") {
        $skip = $true
        Write-Host "Skipping purchaseProduct method at line $($i+1)"
        continue
    }
    
    # Skip getOfferings method
    if ($line -match "^\s*getOfferings = async") {
        $skip = $true
        Write-Host "Skipping getOfferings method at line $($i+1)"
        continue
    }
    
    # Skip presentPaywall method
    if ($line -match "^\s*presentPaywall = async") {
        $skip = $true
        Write-Host "Skipping presentPaywall method at line $($i+1)"
        continue
    }
    
    # Skip syncPurchases method
    if ($line -match "^\s*private syncPurchases = async") {
        $skip = $true
        Write-Host "Skipping syncPurchases method at line $($i+1)"
        continue
    }
    
    # Skip registerPushToken method
    if ($line -match "^\s*private registerPushToken = async") {
        $skip = $true
        Write-Host "Skipping registerPushToken method at line $($i+1)"
        continue
    }
    
    # Stop skipping when we hit next method
    if ($skip -and ($line -match "^\s*private fetchMessages = async|^\s*private subscribeToUpdates = async")) {
        $skip = $false
        Write-Host "Resuming at line $($i+1)"
    }
    
    if (-not $skip) {
        $newLines += $line
    }
}

$content = $newLines -join "`r`n"
Set-Content $filePath $content
Write-Host "Successfully removed payment and push methods from sync.ts"
