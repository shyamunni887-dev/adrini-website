import cv2
import numpy as np

img = cv2.imread('images/mobile_hero.jpg')
h, w, _ = img.shape

# Convert to HSV to find the red/brown button color
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

# The button in the screenshot is a muted red/brown.
# Let's find the bounding box of the non-background area in that region.
# A simpler way: we know it's near the left and middle vertically.
# Let's just crop to the left half and middle third, and look for edges.
roi = img[int(h*0.4):int(h*0.6), 0:int(w*0.5)]

# Since we want precise percentages, let's just find the text "EXPLORE COLLECTION".
# Or, let's just use a color mask for the red/brown box.
# Let's use lower and upper bounds for the reddish brown color.
# BGR color of button from screenshot looks like roughly R=150, G=80, B=80 ?
# Let's write the image to a small file, or better yet, I can just use OCR (pytesseract) to find the text "EXPLORE".

# Let's do a simple edge detection and contour finding on the ROI
gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
blur = cv2.GaussianBlur(gray, (5,5), 0)
edges = cv2.Canny(blur, 50, 150)

contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

best_rect = None
max_area = 0

for cnt in contours:
    x, y, bw, bh = cv2.boundingRect(cnt)
    area = bw * bh
    # The button is a long rectangle
    if bw > 100 and bh > 15 and bw/bh > 3:
        if area > max_area:
            max_area = area
            best_rect = (x, y + int(h*0.4), bw, bh) # adjust y back to full image

if best_rect:
    x, y, bw, bh = best_rect
    print(f"Found rect: x={x}, y={y}, w={bw}, h={bh}")
    print(f"Percentages: left={x/w*100:.2f}%, top={(y+bh/2)/h*100:.2f}%, width={bw/w*100:.2f}%, height={bh/h*100:.2f}%")
else:
    print("Could not find button automatically.")
