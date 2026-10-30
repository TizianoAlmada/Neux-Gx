param(
    [string]$OutputDir = "$PSScriptRoot\..\build"
)

Add-Type -AssemblyName System.Drawing

if (!(Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

$size = 512
$bmp = New-Object System.Drawing.Bitmap $size, $size
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

# Clear background with transparent
$g.Clear([System.Drawing.Color]::Transparent)

# Outer Hexagonal Gamer Shield
$shieldRect = New-Object System.Drawing.Rectangle 16, 16, 480, 480
$darkBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 12, 12, 20))
$g.FillEllipse($darkBrush, $shieldRect)

# Neon Glow Ring
$glowPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(180, 255, 0, 85)), 14
$g.DrawEllipse($glowPen, 26, 26, 460, 460)

# Cyan Inner Ring
$cyanPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(220, 0, 240, 255)), 6
$g.DrawEllipse($cyanPen, 38, 38, 436, 436)

# Central "GX" Monogram
$fontFamily = New-Object System.Drawing.FontFamily "Arial"
$font = New-Object System.Drawing.Font $fontFamily, 140, ([System.Drawing.FontStyle]::Bold)
$sf = New-Object System.Drawing.StringFormat
$sf.Alignment = [System.Drawing.StringAlignment]::Center
$sf.LineAlignment = [System.Drawing.StringAlignment]::Center

# Glow behind text
$textGlowBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(120, 255, 0, 85))
$textRectGlow = New-Object System.Drawing.RectangleF 18, 22, 480, 480
$g.DrawString("GX", $font, $textGlowBrush, $textRectGlow, $sf)

# White/Pink Gradient foreground text
$textBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
$textRect = New-Object System.Drawing.RectangleF 16, 16, 480, 480
$g.DrawString("GX", $font, $textBrush, $textRect, $sf)

# Small "NEXUS" text on top
$smallFont = New-Object System.Drawing.Font $fontFamily, 28, ([System.Drawing.FontStyle]::Bold)
$cyanBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 0, 240, 255))
$smallRect = New-Object System.Drawing.RectangleF 16, 100, 480, 60
$g.DrawString("NEXUS", $smallFont, $cyanBrush, $smallRect, $sf)

# Save PNG
$pngPath = Join-Path $OutputDir "icon.png"
$bmp.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)

# Convert to 256x256 for ICO
$bmp256 = New-Object System.Drawing.Bitmap $bmp, 256, 256
$hIcon = $bmp256.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hIcon)

$icoPath = Join-Path $OutputDir "icon.ico"
$fs = New-Object System.IO.FileStream $icoPath, ([System.IO.FileMode]::Create)
$icon.Save($fs)
$fs.Close()

$g.Dispose()
$bmp.Dispose()
$bmp256.Dispose()

Write-Host "Icons generated successfully at $OutputDir"
