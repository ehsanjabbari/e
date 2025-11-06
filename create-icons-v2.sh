#!/bin/bash

echo "Creating PWA icons from original logo..."

# Define the sizes we need
sizes=("72" "96" "128" "144" "152" "192" "384" "512" "1024")

for size in "${sizes[@]}"; do
    echo "Creating ${size}x${size} icon..."
    
    # Create white background and resize the original logo to fit
    convert -size ${size}x${size} xc:white \
        -gravity center \
        -resize ${size}x${size} -extent ${size}x${size} \
        /workspace/elishoes-logo.png \
        "icons/icon-${size}x${size}.png"
done

# Create Apple touch icons specifically for iOS
echo "Creating Apple Touch Icons..."

# Create 120x120 and 180x180 for iOS
convert -size 120x120 xc:white \
    -gravity center \
    -resize 120x120 -extent 120x120 \
    /workspace/elishoes-logo.png \
    "icons/apple-touch-icon-120x120.png"

convert -size 180x180 xc:white \
    -gravity center \
    -resize 180x180 -extent 180x180 \
    /workspace/elishoes-logo.png \
    "icons/apple-touch-icon-180x180.png"

# Create favicons
echo "Creating favicons..."

convert -size 32x32 xc:white \
    -gravity center \
    -resize 32x32 -extent 32x32 \
    /workspace/elishoes-logo.png \
    "icons/favicon-32x32.png"

convert -size 16x16 xc:white \
    -gravity center \
    -resize 16x16 -extent 16x16 \
    /workspace/elishoes-logo.png \
    "icons/favicon-16x16.png"

# Create larger favicon
convert -size 192x192 xc:white \
    -gravity center \
    -resize 192x192 -extent 192x192 \
    /workspace/elishoes-logo.png \
    "icons/android-chrome-192x192.png"

convert -size 512x512 xc:white \
    -gravity center \
    -resize 512x512 -extent 512x512 \
    /workspace/elishoes-logo.png \
    "icons/android-chrome-512x512.png"

echo "All icons created successfully!"