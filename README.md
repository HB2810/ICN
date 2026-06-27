# CSSD Management System

This project is a CSSD Management application built with React, Vite, and TanStack Router.

## Demo Credentials

You can use the following credentials to access different roles within the application during testing:

- **ICN User (Admin/Manager):**
  - Username: `icn`
  - Password: `Icn@2026`
- **CSSD Staff (Operator):**
  - Username: `cssd`
  - Password: `Cssd@2026`
- **Auditor (Viewer):**
  - Username: `auditor`
  - Password: `Audit@2026`

To deploy this project manually to GitHub Pages:

1. Install the dependencies including `gh-pages`:
   ```bash
   npm install
   npm install --save-dev gh-pages
   ```
2. Initialize Git and add your repository if you haven't already:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/HB2810/ICN.git
   ```
3. Run the deploy command:
   ```bash
   npm run deploy
   ```

*(Note: Depending on your specific Vite or TanStack configuration, your build output might be in `dist`, `.output/public`, or another directory. If the deployment fails, ensure the directory in the `gh-pages` command in `package.json` matches your actual build output directory. I have already configured the `base` property in `vite.config.ts` and the `homepage` in `package.json` for you.)*
