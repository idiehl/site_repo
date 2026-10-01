param([string]$WebRoot = (Join-Path $PSScriptRoot '../src/Atlas.Web/wwwroot'))
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$brandRoot = Join-Path $WebRoot 'brand'
$source = [System.Drawing.Bitmap]::new((Join-Path $brandRoot 'atlas-emblem.png'))
try {
    # Package the approved artwork; do not redraw, recolor, or remove its alpha.
    $sizes = @(16,32,48,64,96,128,180,192,256,512)
    $encoded = @{}
    foreach ($size in $sizes) {
        $bitmap = [System.Drawing.Bitmap]::new($size,$size,[System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
        $attributes = [System.Drawing.Imaging.ImageAttributes]::new()
        $stream = [System.IO.MemoryStream]::new()
        try {
            $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
            $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
            $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
            $attributes.SetWrapMode([System.Drawing.Drawing2D.WrapMode]::TileFlipXY)
            $graphics.DrawImage($source,[System.Drawing.Rectangle]::new(0,0,$size,$size),0,0,$source.Width,$source.Height,[System.Drawing.GraphicsUnit]::Pixel,$attributes)
            $bitmap.Save($stream,[System.Drawing.Imaging.ImageFormat]::Png)
            $encoded[$size] = $stream.ToArray()
        } finally { $stream.Dispose(); $attributes.Dispose(); $graphics.Dispose(); $bitmap.Dispose() }
    }
    foreach ($entry in @{'favicon-16.png'=16;'favicon-32.png'=32;'atlas-emblem-96.png'=96;'apple-touch-icon.png'=180;'icon-192.png'=192;'icon-512.png'=512}.GetEnumerator()) {
        [System.IO.File]::WriteAllBytes((Join-Path $brandRoot $entry.Key),$encoded[$entry.Value])
    }
    # ICO contains the same alpha-preserving PNG artwork at common native sizes.
    $iconSizes = @(16,32,48,64,128,256)
    $iconStream = [System.IO.File]::Create((Join-Path $WebRoot 'favicon.ico'))
    $writer = [System.IO.BinaryWriter]::new($iconStream)
    try {
        $writer.Write([uint16]0); $writer.Write([uint16]1); $writer.Write([uint16]$iconSizes.Count)
        $offset = 6 + 16 * $iconSizes.Count
        foreach ($size in $iconSizes) {
            $dimension = if ($size -eq 256) { 0 } else { $size }
            $writer.Write([byte]$dimension); $writer.Write([byte]$dimension)
            $writer.Write([byte]0); $writer.Write([byte]0)
            $writer.Write([uint16]1); $writer.Write([uint16]32)
            $writer.Write([uint32]$encoded[$size].Length); $writer.Write([uint32]$offset)
            $offset += $encoded[$size].Length
        }
        foreach ($size in $iconSizes) { $writer.Write([byte[]]$encoded[$size]) }
    } finally { $writer.Dispose(); $iconStream.Dispose() }
    # Keep old public URLs working for cached documents and saved shortcuts.
    Copy-Item -LiteralPath (Join-Path $brandRoot 'atlas-emblem.png') -Destination (Join-Path $WebRoot 'img/au-icon-atlas-globe-2048.png')
    Copy-Item -LiteralPath (Join-Path $brandRoot 'icon-512.png') -Destination (Join-Path $WebRoot 'img/logo-clean.png')
} finally { $source.Dispose() }
