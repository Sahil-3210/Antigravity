---
description: How to deploy the Competency Management System to Vercel
---

# Deploying to Vercel

This guide explains how to deploy your Vite + React application to Vercel.

## Prerequisites

1.  A [Vercel account](https://vercel.com/signup).
2.  Your project pushed to a Git repository (GitHub, GitLab, or Bitbucket).

## Steps

1.  **Push to GitHub**:
    *   Ensure your latest changes are committed and pushed to your repository.
    *   `git add .`
    *   `git commit -m "Ready for deployment"`
    *   `git push`

2.  **Import Project in Vercel**:
    *   Go to your [Vercel Dashboard](https://vercel.com/dashboard).
    *   Click **"Add New..."** -> **"Project"**.
    *   Import your Git repository.

3.  **Configure Project**:
    *   **Framework Preset**: Vercel should automatically detect `Vite`.
    *   **Root Directory**: `./` (default).
    *   **Build Command**: `npm run build` (default).
    *   **Output Directory**: `dist` (default).

4.  **Environment Variables (CRITICAL)**:
    *   Expand the **"Environment Variables"** section.
    *   You MUST add your Supabase credentials here. Copy them from your `.env` file.
    *   Key: `VITE_SUPABASE_URL`, Value: `your_supabase_url`
    *   Key: `VITE_SUPABASE_ANON_KEY`, Value: `your_supabase_anon_key`

5.  **Deploy**:
    *   Click **"Deploy"**.
    *   Wait for the build to complete.

6.  **Verify**:
    *   Once deployed, Vercel will give you a URL (e.g., `your-project.vercel.app`).
    *   Visit the URL and test the application.
    *   **Note**: You might need to update your Supabase **Site URL** and **Redirect URLs** in the Supabase Dashboard -> Authentication -> URL Configuration to match your new Vercel domain.

## Troubleshooting

*   **404 on Refresh**: If you refresh a page and get a 404, you need to add a `vercel.json` configuration for client-side routing.
    *   Create a `vercel.json` file in your root directory:
    ```json
    {
      "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
    }
    ```
    *   Push this file to your repo.
