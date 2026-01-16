# How to Add Your Favicon

## Quick Steps

### Step 1: Save Your Image
1. Save your attached logo image to your computer
2. Name it: `favicon-source.png` (or `.jpg` if needed)

### Step 2: Generate Favicon Files

**Easiest Method - Use Online Tool:**

1. Go to: **https://realfavicongenerator.net/**
2. Click "Select your Favicon image" and upload your `favicon-source.png`
3. Scroll down and click "Generate your Favicons and HTML code"
4. Download the package (ZIP file)
5. Extract the ZIP file
6. Copy these files to `/static/img/` folder:
   - `favicon.ico`
   - `favicon-16x16.png` 
   - `favicon-32x32.png`
   - `apple-touch-icon.png` (or `apple-touch-icon-180x180.png` - rename it to `apple-touch-icon.png`)
   - `android-chrome-192x192.png`
   - `android-chrome-512x512.png`

### Step 3: Verify

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Open browser and check the tab - favicon should appear next to "ScopeDocs"

3. Hard refresh if needed:
   - Mac: `Cmd + Shift + R`
   - Windows: `Ctrl + Shift + R`

## File Locations

All favicon files should be in:
```
/Users/simaha/Downloads/landing_page/static/img/
```

## Current Setup

✅ HTML is already configured in `index.html`
✅ Files will be served from `/img/` path (Vite serves from `/static/`)

## What You Need to Add

Place these files in `/static/img/`:
- [ ] `favicon.png` (or `favicon.ico` - either works)
- [ ] `apple-touch-icon.png` (180x180 for iOS)

**Note:** The online tool will generate all sizes. You only need the main `favicon.png` or `favicon.ico` for it to work, but having multiple sizes ensures best compatibility across all devices.
