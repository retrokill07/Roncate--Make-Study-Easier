
# Roncate - Adaptive Educational Platform 🎓

Roncate is an AI-powered study companion that helps students manage their syllabus, plan exams, and maintain focus. It uses **Meta Llama 3.1** to generate study strategies and **Firebase Firestore** to save your progress permanently.

## 🌟 Features

1.  **AI Coach (Llama 3.1)**: Generates personalized study plans based on your incomplete syllabus and exam dates.
2.  **Global Focus Mode**: A persistent timer that tracks your study sessions even while you navigate the app. Includes distraction detection (tab switching) and punishments (audio alerts).
3.  **Cloud Sync**: All your notes, subjects, exams, and focus stats are saved to the cloud using Firebase.
4.  **Syllabus Tracker**: Paste raw course text, and the AI will auto-extract topics.
5.  **Exam Planner**: Visual timeline of upcoming tests.

---

## 🛠️ Setup Instructions

### 1. Prerequisites
- **Node.js**: Installed on your computer.

### 2. Installation
Open your terminal in the project folder:
```bash
npm install
```

### 3. Environment Variables (Critical for AI)
1.  Create a file named `.env` in the root folder.
2.  Get a key from [OpenRouter.ai](https://openrouter.ai/).
3.  Add it to the file:
    ```env
    REACT_APP_API_KEY=sk-or-v1-your-actual-key-here
    ```

---

## 🔥 Firebase Setup (Required for Database)

To make the Login and Save features work, you need to configure Firebase properly.

### Step 1: Create Project
1.  Go to [Firebase Console](https://console.firebase.google.com/).
2.  Click **Add Project** and name it "Roncate".

### Step 2: Enable Authentication
1.  Go to **Build** -> **Authentication**.
2.  Click **Get Started**.
3.  Select **Email/Password** provider and enable it.

### Step 3: Enable Firestore Database (NEW REQUIREMENT)
Since we added data saving features, you must enable the database:
1.  Go to **Build** -> **Firestore Database**.
2.  Click **Create Database**.
3.  Choose a location (e.g., nam5 or anything close to you).
4.  **Important**: When asked for security rules, choose **Start in Test Mode**.
    *   *Why?* This allows your app to read/write data immediately without complex setup.
    *   *Note:* In a real production app, you would lock this down later.

### Step 4: Get Config
1.  Go to **Project Settings** (Gear icon).
2.  Scroll down to **Your apps**.
3.  Select the **</>** (Web) icon.
4.  Copy the `firebaseConfig` object.
5.  Paste it into your code at `src/services/firebase.ts`.

---

## 🚀 Running the App

```bash
npm start
```
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## 🎵 Custom Audio
To customize the distraction punishment sound:
1.  Place your mp3 file in `public/audio/`.
2.  Rename it to `motivation.mp3`.

---

## 📂 Project Structure

- **src/components**: UI Elements (Dashboard, Focus Timer, etc.)
- **src/services**:
  - `aiService.ts`: Handles OpenRouter (Llama 3.1) calls.
  - `dataService.ts`: Handles saving/loading data from Firebase Firestore.
  - `firebase.ts`: Database configuration.
- **src/hooks**: Custom logic (like the global focus timer).
