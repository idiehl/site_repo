#!/usr/bin/env python3
"""Generate PNG icons for browser extension using PIL."""

import os
from PIL import Image, ImageDraw

def create_icon(size):
    """Create the QuickPRO Q compass icon at the specified size."""
    # Create image with dark background
    img = Image.new('RGBA', (size, size), (13, 13, 18, 255))  # #0d0d12
    draw = ImageDraw.Draw(img)
    
    # Scale factor
    scale = size / 64
    
    # Colors
    purple = (94, 107, 241)  # #5e6bf1
    cyan = (6, 182, 212)     # #06b6d4
    
    # Q circle center and radius
    cx, cy = int(32 * scale), int(30 * scale)
    outer_r = int(20 * scale)
    stroke = max(2, int(4 * scale))
    
    # Draw Q circle (ring)
    for i in range(stroke):
        draw.ellipse(
            [cx - outer_r + i, cy - outer_r + i, cx + outer_r - i, cy + outer_r - i],
            outline=purple,
            width=1
        )
    
    # Draw Q tail (line from bottom-right of circle to corner)
    tail_start = (int(42 * scale), int(40 * scale))
    tail_end = (int(56 * scale), int(54 * scale))
    line_width = max(2, int(5 * scale))
    draw.line([tail_start, tail_end], fill=cyan, width=line_width)
    
    # Draw center dot
    dot_r = max(2, int(4 * scale))
    draw.ellipse([cx - dot_r, cy - dot_r, cx + dot_r, cy + dot_r], fill=cyan)
    
    return img


def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    icons_dir = os.path.join(script_dir, "icons")
    
    os.makedirs(icons_dir, exist_ok=True)
    
    sizes = [16, 32, 48, 128]
    
    for size in sizes:
        img = create_icon(size)
        png_path = os.path.join(icons_dir, f"icon-{size}.png")
        img.save(png_path, 'PNG')
        print(f"Created {png_path} ({size}x{size})")
    
    print("\nDone! Icons generated.")


if __name__ == "__main__":
    main()
