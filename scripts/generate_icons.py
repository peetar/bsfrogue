import os
from PIL import Image, ImageDraw, ImageFont

os.makedirs('public/icons', exist_ok=True)

def create_icon(size):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Rounded background
    padding = size // 16
    radius = size // 5
    bg_color = (30, 58, 138, 255) # Deep navy #1e3a8a
    
    # Draw rounded rect
    draw.rounded_rectangle([padding, padding, size - padding, size - padding], radius=radius, fill=bg_color)
    
    # Draw open book pages in white / soft gold
    center_x = size // 2
    center_y = size // 2
    book_w = int(size * 0.55)
    book_h = int(size * 0.40)
    
    left = center_x - book_w // 2
    right = center_x + book_w // 2
    top = center_y - book_h // 2
    bottom = center_y + book_h // 2
    
    # Left page
    draw.rounded_rectangle([left, top, center_x - 3, bottom], radius=size//30, fill=(248, 250, 252, 255))
    # Right page
    draw.rounded_rectangle([center_x + 3, top, right, bottom], radius=size//30, fill=(248, 250, 252, 255))
    
    # Ribbon bookmark (amber/gold)
    ribbon_w = max(4, size // 28)
    ribbon_x = center_x - ribbon_w // 2
    ribbon_top = top - size // 24
    ribbon_bottom = bottom + size // 10
    draw.polygon([
        (ribbon_x, ribbon_top),
        (ribbon_x + ribbon_w, ribbon_top),
        (ribbon_x + ribbon_w, ribbon_bottom),
        (center_x, ribbon_bottom - size // 20),
        (ribbon_x, ribbon_bottom)
    ], fill=(217, 119, 6, 255)) # amber-600
    
    # Lines on pages (representing text)
    line_color = (203, 213, 225, 255)
    line_margin = size // 30
    line_h = max(2, size // 60)
    for i in range(4):
        ly = top + (i + 1) * (book_h // 5)
        # Left page lines
        draw.rounded_rectangle([left + line_margin, ly, center_x - line_margin - 4, ly + line_h], radius=line_h//2, fill=line_color)
        # Right page lines
        draw.rounded_rectangle([center_x + line_margin + 4, ly, right - line_margin, ly + line_h], radius=line_h//2, fill=line_color)

    return img

icon512 = create_icon(512)
icon512.save('public/icons/icon-512.png')

icon192 = create_icon(192)
icon192.save('public/icons/icon-192.png')

icon180 = create_icon(180)
icon180.save('public/apple-touch-icon.png')

icon32 = create_icon(32)
icon32.save('public/favicon.ico')

print("Generated PWA icons successfully!")
