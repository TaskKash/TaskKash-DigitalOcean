
Add-Type -AssemblyName System.Drawing

$sourcePath = "C:\Users\ahmed\.gemini\antigravity\brain\9c1fc347-b774-42d5-b412-89b5a3ea698e\media__1773025094083.png"
$resBase = "C:\Users\ahmed\Downloads\TK_2026\WebSite\TaskKash-DigitalOcean\android\app\src\main\res"

$sourceImg = [System.Drawing.Image]::FromFile($sourcePath)

# 1. Update App Icons
$densities = @{
    "mipmap-mdpi"    = 48
    "mipmap-hdpi"    = 72
    "mipmap-xhdpi"   = 96
    "mipmap-xxhdpi"  = 144
    "mipmap-xxxhdpi" = 192
}

foreach ($folderName in $densities.Keys) {
    $size = $densities[$folderName]
    $destFolder = Join-Path $resBase $folderName
    if (-not (Test-Path $destFolder)) { New-Item -ItemType Directory -Path $destFolder -Force }

    # Standard and Round Icons (with 30% padding to prevent cropping)
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    
    # Fill background white so transparency doesn't turn black
    $g.Clear([System.Drawing.Color]::White)
    
    # Calculate 70% inner size
    $innerSize = [int]($size * 0.70)
    $innerOffset = [int](($size - $innerSize) / 2)
    
    $g.DrawImage($sourceImg, $innerOffset, $innerOffset, $innerSize, $innerSize)
    $bmp.Save((Join-Path $destFolder "ic_launcher.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Save((Join-Path $destFolder "ic_launcher_round.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose(); $bmp.Dispose()

    # Foreground Icon (Adaptive)
    $foregroundSize = [int]($size * 2.25)
    $bmpFg = New-Object System.Drawing.Bitmap($foregroundSize, $foregroundSize)
    $gFg = [System.Drawing.Graphics]::FromImage($bmpFg)
    $gFg.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $logoSize = [int]($size * 1.5)
    $offset = [int](($foregroundSize - $logoSize) / 2)
    $gFg.DrawImage($sourceImg, $offset, $offset, $logoSize, $logoSize)
    $bmpFg.Save((Join-Path $destFolder "ic_launcher_foreground.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $gFg.Dispose(); $bmpFg.Dispose()
    Write-Host "Generated icons for $folderName"
}

# 2. Update Splash Screens
$splashDensities = @{
    "mdpi"    = @{w = 320; h = 480 }
    "hdpi"    = @{w = 480; h = 800 }
    "xhdpi"   = @{w = 720; h = 1280 }
    "xxhdpi"  = @{w = 960; h = 1600 }
    "xxxhdpi" = @{w = 1280; h = 1920 }
}

foreach ($density in $splashDensities.Keys) {
    $w = $splashDensities[$density].w
    $h = $splashDensities[$density].h

    # Portrait
    $portFolder = Join-Path $resBase "drawable-port-$density"
    if (Test-Path $portFolder) {
        $bmp = New-Object System.Drawing.Bitmap($w, $h)
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        $g.Clear([System.Drawing.Color]::White)
        $logoWidth = [int]($w * 0.6)
        $logoHeight = [int]($sourceImg.Height * ($logoWidth / $sourceImg.Width))
        $g.DrawImage($sourceImg, [int](($w - $logoWidth) / 2), [int](($h - $logoHeight) / 2), $logoWidth, $logoHeight)
        $bmp.Save((Join-Path $portFolder "splash.png"), [System.Drawing.Imaging.ImageFormat]::Png)
        $g.Dispose(); $bmp.Dispose()
    }

    # Landscape
    $landFolder = Join-Path $resBase "drawable-land-$density"
    if (Test-Path $landFolder) {
        $bmp = New-Object System.Drawing.Bitmap($h, $w)
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        $g.Clear([System.Drawing.Color]::White)
        $logoHeight = [int]($w * 0.5)
        $logoWidth = [int]($sourceImg.Width * ($logoHeight / $sourceImg.Height))
        $g.DrawImage($sourceImg, [int](($h - $logoWidth) / 2), [int](($w - $logoHeight) / 2), $logoWidth, $logoHeight)
        $bmp.Save((Join-Path $landFolder "splash.png"), [System.Drawing.Imaging.ImageFormat]::Png)
        $g.Dispose(); $bmp.Dispose()
    }
    Write-Host "Generated splash screens for $density"
}

$sourceImg.Dispose()
Write-Host "✅ Icons and Splash Screens successfully updated."
