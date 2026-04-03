# 🌿 Habit Journal

**A high-fidelity, data-driven productivity ecosystem built with the MERN Stack.**

![Project Banner](https://via.placeholder.com/1200x600?text=Paste+Your+Dashboard+Screenshot+Here)
*(Replace this link with a screenshot of your Yearly Heatmap or Admin Panel)*

### 📖 About The Project

I built **Habit Journal** because standard habit trackers felt too rigid. I wanted a system that didn't just track "Done/Not Done," but visualized **intensity and consistency** over time—similar to the GitHub contribution graph but for personal life.

This is a full-stack application that focuses heavily on **Data Visualization** and **User Experience**. It features a custom-built "Yearly Vitality" engine that calculates a daily productivity score based on task volume and duration, rendering it as a color-graded heatmap.

It also includes a hidden **Command Center** for administrators to manage the application with granular control.

---

### ⚡ Key Features

#### 👤 For Users:
* **📊 Dynamic Vitality Map:** A custom algorithm calculates daily intensity scores, mapping them to a 5-stage color spectrum (White → Blue → Green → Red → Black). Pure Black is reserved for "God Mode" days (24h+ intensity).
* **🧠 "Strict Mode" Logic:** Prevents "cheating" by locking past dates and disabling future interactions, ensuring data integrity.
* **⚡ Reactive Dashboard:** Real-time updates for "Up Next" tasks, daily time forecasting, and consistency metrics.
* **🎨 "Paper" Aesthetic:** A custom UI design system using grain textures, **Space Grotesk** typography, and tactile micro-interactions.

#### 🛡️ For Admins (Command Center):
* **👁️ God Mode Inspector:** View any user's private data, habits, and history without restriction.
* **⏳ The Time Machine:** A granular history editor allowing admins to modify habit completion for *any* date in the past or future.
* **🔥 Day Inspector:** Click any pixel on the heatmap to see exactly what tasks were performed on that specific date.
* **📢 Broadcast System:** Send system-wide alerts (Info/Warning/Critical) to all active users in real-time.

---

### 🛠️ Tech Stack

**Frontend:**
* React.js (Vite)
* Tailwind CSS (Custom Configuration & Animations)
* Lucide React (Iconography)
* Date-fns (Complex Date Logic)

**Backend:**
* Node.js & Express
* MongoDB (Mongoose Aggregation Pipelines)
* JWT (JSON Web Tokens) for Stateless Auth
* Bcrypt (Encryption)

---

### 💡 Technical Highlights (The "Under the Hood")

#### 1. The Vitality Spectrum Engine
Instead of a simple boolean check, the Yearly view uses a weighted formula to determine the day's color intensity.
```javascript
// The Spectrum Logic:
// 0 mins    -> White
// < 6 hrs   -> Blue
// < 12 hrs  -> Green
// < 18 hrs  -> Red
// > 24 hrs  -> Pure Black (#000000)