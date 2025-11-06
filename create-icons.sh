#!/bin/bash

# Create PWA icons in different sizes
echo "Creating PWA icons..."

# Define the sizes we need
sizes=("72" "96" "128" "144" "152" "192" "384" "512" "1024")

for size in "${sizes[@]}"; do
    echo "Creating ${size}x${size} icon..."
    
    # Create square canvas with white background
    convert -size ${size}x${size} xc:white \
        -gravity center \
        -pointsize $((size * 0.6)) \
        -fill "#dc2626" \
        -font Arial-Bold \
        -annotate +0+0 "Eli" \
        "icons/icon-${size}x${size}.png"
done

# Create special iOS apple-touch-icons
echo "Creating Apple Touch Icons..."

# iOS specific sizes
convert -size 120x120 xc:white \
    -gravity center \
    -pointsize 80 \
    -fill "#dc2626" \
    -font Arial-Bold \
    -annotate +0+0 "Eli" \
    "icons/apple-touch-icon-120x120.png"

convert -size 180x180 xc:white \
    -gravity center \
    -pointsize 120 \
    -fill "#dc2626" \
    -font Arial-Bold \
    -annotate +0+0 "Eli" \
    "icons/apple-touch-icon-180x180.png"

# Create favicon
echo "Creating favicon..."
convert -size 32x32 xc:white \
    -gravity center \
    -pointsize 20 \
    -fill "#dc2626" \
    -font Arial-Bold \
    -annotate +0+0 "E" \
    "icons/favicon-32x32.png"

convert -size 16x16 xc:white \
    -gravity center \
    -pointsize 10 \
    -fill "#dc2626" \
    -font Arial-Bold \
    -annotate +0+0 "E" \
    "icons/favicon-16x16.png"

echo "All icons created successfully!"