def luminance(hex_color):
    hex_color = hex_color.lstrip('#')
    rgb = tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
    a = [v / 255 for v in rgb]
    a = [v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4 for v in a]
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722

def contrast(l1, l2):
    return (max(l1, l2) + 0.05) / (min(l1, l2) + 0.05)

l_white = luminance('ffffff')

# original gold is #c9943a (R: 201, G: 148, B: 58)
r, g, b = 201, 148, 58

# darken it until contrast is > 4.5
while True:
    hex_color = f"{r:02x}{g:02x}{b:02x}"
    if contrast(l_white, luminance(hex_color)) >= 4.5:
        print(f"Found passing gold: #{hex_color} (Contrast: {contrast(l_white, luminance(hex_color)):.2f})")
        break
    r = max(0, int(r * 0.95))
    g = max(0, int(g * 0.95))
    b = max(0, int(b * 0.95))
