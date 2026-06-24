# Firebase App Hosting: GEMINI_API_KEY Configuration Guide

This guide explains how to add your **`GEMINI_API_KEY`** to the **Firebase App Hosting** settings console. 

Because App Hosting runs your Express backend server in a secure, containerized environment (Cloud Run), server-side environment variables and secrets must be configured in the Firebase Console or via `apphosting.yaml` so they are securely injected at runtime.

---

## Method 1: Using the Firebase Console UI (Recommended & Easiest)

This is the easiest method because the Firebase Console will automatically set up the API key as a secure secret in **Google Cloud Secret Manager** and automatically grant the necessary IAM permissions to your App Hosting service account.

### Step-by-Step Instructions:

1. **Open Firebase Console**:
   Go to the [Firebase Console](https://console.firebase.google.com/) and select your project.

2. **Navigate to App Hosting**:
   In the left-hand navigation sidebar, click on **App Hosting** (under the "Build" section).

3. **Select Your Backend**:
   Click on your active App Hosting backend (the deployment name you created).

4. **Open Settings/Configuration**:
   Click on the **Settings** (or **Configuration**) tab at the top of your dashboard.

5. **Add Environment Variable / Secret**:
   - Scroll down to the **Environment variables** (or **Variables & Secrets**) section.
   - Click the **Add Variable** or **Create Secret** button.
   
6. **Enter Secret Details**:
   - **Key/Name**: `GEMINI_API_KEY`
   - **Type**: Select **Secret** (instead of standard variable) to ensure your key remains hidden and secure.
   - **Value**: Paste your Gemini API key (starts with `AIzaSy...`).

7. **Save and Grant Permissions**:
   Click **Save**. If prompted to grant the App Hosting service account permissions to access Secret Manager, click **Grant/Confirm**.

8. **Trigger a New Rollout**:
   Once the secret is saved, trigger a new deployment or push a commit to your repository to start a new rollout. The key will now be securely loaded on startup.

---

## Method 2: Defining Secrets in `apphosting.yaml`

If you prefer managing configuration via code, you can define the secret in `apphosting.yaml`. However, **you must first create the secret manually in Cloud Secret Manager**.

### Step-by-Step Instructions:

1. **Create the Secret in Google Cloud Console**:
   - Go to the [Google Cloud Secret Manager Console](https://console.cloud.google.com/security/secret-manager).
   - Click **Create Secret**.
   - Name it `gemini_api_key_secret` and paste your Gemini API key as the secret value.
   - Click **Create**.

2. **Grant IAM Permissions**:
   - Locate your Firebase App Hosting Service Account (usually named `firebase-app-hosting-compute@<PROJECT_ID>.iam.gserviceaccount.com`).
   - Grant this service account the **Secret Manager Secret Accessor** role (`roles/secretmanager.secretAccessor`) for the secret you just created.

3. **Update `apphosting.yaml`**:
   Add the secret under the `env` block in your `/apphosting.yaml` file:

   ```yaml
   # apphosting.yaml
   runtimeConfig:
     nodeVersion: "20"

   env:
     - variable: FIREBASE_PROJECT_ID
       value: "jurisconnect-wwep2"
     - variable: FIRESTORE_DATABASE_ID
       value: "ai-studio-58027f49-f4cb-4d2f-bb1b-006e0f11be95"
     - variable: GEMINI_API_KEY
       secret: gemini_api_key_secret
   ```

4. **Deploy**:
   Commit and push your changes. App Hosting will bind the secret value of `gemini_api_key_secret` to the `GEMINI_API_KEY` environment variable at runtime.

---

## Why did the previous rollouts fail?
1. **Port Mismatch**: Previously, there were port configuration conflicts (running on 8080 vs 3000). The dev server is now optimized to run on port `3000` in AI Studio, while dynamically honoring Cloud Run's production port `process.env.PORT` in production.
2. **Missing Secrets**: Without configuring the `GEMINI_API_KEY` inside the environment variables of App Hosting, the backend failed to initialize the Gemini client or threw an error on boot because `process.env.GEMINI_API_KEY` was undefined, causing the Cloud Run container check to fail.
