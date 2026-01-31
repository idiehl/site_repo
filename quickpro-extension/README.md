# QuickPRO Browser Extension

Save job postings to QuickPRO with one click. Works on LinkedIn, Indeed, Glassdoor, and any job site.

## Features

- **One-click save**: Click the toolbar button or floating button to save any job posting
- **Auto-detection**: Extension detects when you're on a job posting page
- **Works everywhere**: Bypasses site restrictions by capturing the page you're viewing
- **Syncs instantly**: Saved jobs appear in your QuickPRO dashboard immediately

## Installation (Developer Mode)

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select this `extension` folder
5. The QuickPRO icon should appear in your toolbar

## Icon Generation

The extension needs PNG icons at multiple sizes. To generate them from the SVG:

### Option 1: Online converter
1. Go to https://cloudconvert.com/svg-to-png
2. Upload `icons/icon.svg`
3. Generate at sizes: 16x16, 32x32, 48x48, 128x128
4. Save as `icon-16.png`, `icon-32.png`, `icon-48.png`, `icon-128.png`

### Option 2: Using ImageMagick (command line)
```bash
magick icons/icon.svg -resize 16x16 icons/icon-16.png
magick icons/icon.svg -resize 32x32 icons/icon-32.png
magick icons/icon.svg -resize 48x48 icons/icon-48.png
magick icons/icon.svg -resize 128x128 icons/icon-128.png
```

### Option 3: Use placeholder icons temporarily
Create simple colored squares as placeholders - the extension will still work.

## Usage

1. **Login**: Click the extension icon and sign in with your QuickPRO account
2. **Browse jobs**: Navigate to any job posting on LinkedIn, Indeed, etc.
3. **Save**: Click "Save to QuickPRO" in the popup or the floating button
4. **View**: Open your dashboard to see the saved job with extracted details

## Supported Sites

- LinkedIn Jobs
- Indeed
- Glassdoor
- Lever
- Greenhouse
- Workday
- Any other job posting page (use manual save)

## Troubleshooting

**"Unable to access this page"**
- Make sure you're on a regular webpage, not a chrome:// or extension page

**"Session expired"**
- Click the extension icon and log in again

**Button not appearing on job pages**
- The floating button only appears when you're logged in
- Try refreshing the page after logging in

## Development

The extension uses Manifest V3 with:
- `popup.js` - Handles the toolbar popup UI
- `background.js` - Service worker for API communication
- `content.js` - Floating save button on job pages
