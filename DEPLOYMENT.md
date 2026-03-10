# Deployment Instructions

## Overview
This is a modern, static frontend web application requiring no backend servers. All computations are handled perfectly on the client side using JavaScript.

## Hosting Options

### 1. Vercel
1. Install [Vercel CLI](https://vercel.com/cli) or use the Vercel dashboard.
2. In the project directory (`c:\Users\IT LAND\web-calulator`), run `vercel`.
3. Follow the prompts. It will instantly deploy the static files globally.

### 2. GitHub Pages
1. Initialize a git repository in this folder.
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```
2. Create a repository on GitHub and push these files.
3. In your GitHub repository settings, navigate to the **Pages** section.
4. Set the source branch to `main` (or `master`) and save. The site will be available via `yourusername.github.io/repository-name`.

### 3. Netlify
1. Create an account at [Netlify](https://www.netlify.com/).
2. Drag and drop the `web-calulator` folder directly into the deploy area on the bottom of the Netlify dashboard.
3. It will be instantly hosted.

## PWA Setup (Optional)
To convert this app to a Progressive Web App (PWA):
1. **Create an `icons` folder** with app icons (e.g., `192x192.png`, `512x512.png`).
2. **Add a `manifest.json`** file in the root directory.
3. **Register a Service Worker** in `script.js` to cache `index.html`, `styles.css`, and `script.js` for full offline availability natively.

*Current execution already supports 100% offline usage since no server requests are made after the page load!*
