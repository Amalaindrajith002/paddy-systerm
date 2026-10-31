# Paddy Management System

A React application for managing farmers, seasonal paddy purchases, loans, and account summaries. Authentication and application data use Firebase Authentication and Cloud Firestore.

## Requirements

- Node.js 20
- npm
- A Firebase project configured for the application

## Run locally

```bash
npm ci
npm start
```

The development server is available at http://localhost:3000.

## Production build

```bash
npm run build
```

Create React App writes the deployable static site to `build/`. The `homepage` setting in `package.json` sets the project-site base path to `/paddy-systerm/`, so generated JavaScript, CSS, and public asset URLs work when hosted under the repository name.

## Deploy to GitHub Pages

The workflow at `.github/workflows/deploy.yml` builds the site and publishes the `build/` directory to GitHub Pages whenever changes are pushed to `main`. It can also be started manually from the repository's Actions tab.

To enable deployment:

1. Push the workflow and application changes to the `main` branch.
2. In the GitHub repository, open **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Open **Actions** and confirm the **Deploy to GitHub Pages** workflow succeeds.

The site URL is `https://Amalaindrajith002.github.io/paddy-systerm/`.

The workflow does not need Firebase credentials or secrets to build and publish this static application. Firebase web-app configuration is consumed by the client application; protect application data with appropriate Firebase Authentication settings, API-key restrictions, and Firestore Security Rules. Do not put private credentials or service-account keys in the repository or Pages workflow.

## Admin access

The application requires Firebase Authentication to open the management pages. Public registration is not offered in the application; create admin accounts in Firebase Console under **Authentication → Users**. The login page still supports password resets.

The login screen is not a substitute for database access control. Configure Firestore Security Rules in Firebase Console to allow reads and writes only for approved admin accounts. GitHub Pages serves static files publicly, so never rely on hiding the frontend to secure Firestore data.
