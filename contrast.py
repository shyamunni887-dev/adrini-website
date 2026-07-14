def luminance(hex_color):
    hex_color = hex_color.lstrip('#')
    rgb = tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
    a = [v / 255 for v in rgb]
    a = [v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4 for v in a]
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722

def contrast(c1, c2):
    l1 = luminance(c1)
    l2 = luminance(c2)
    return (max(l1, l2) + 0.05) / (min(l1, l2) + 0.05)

print(f"Contrast #c9943a on #ffffff: {contrast('c9943a', 'ffffff')}")
print(f"Contrast #756a5b on #ffffff: {contrast('756a5b', 'ffffff')}")
print(f"Contrast #4a3c2e on #ffffff: {contrast('4a3c2e', 'ffffff')}")
print(f"Contrast #8a7d6b on #ffffff: {contrast('8a7d6b', 'ffffff')}")
