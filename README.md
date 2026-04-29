# ⏱️ TimeWise

**TimeWise** is a privacy-first, purely local browser extension that intelligently tracks your screen time and categorizes your productivity—without ever sending a single byte of your data to external servers.

![TimeWise Dashboard Preview](https://raw.githubusercontent.com/shubhpsd/TimeWise/main/icons/icon128.png)

## ✨ Features

* **🔒 100% Privacy-First:** All analytics, browsing history, and tracking data are stored locally on your machine using Chrome's native storage. No tracking APIs, no external servers.
* **🧠 Smart Tracking Engine:** Intelligently pauses tracking when you switch to internal pages (like `chrome://` or the New Tab page) or when your computer goes idle.
* **🎥 Advanced YouTube Analytics:** 
  * Tracks the *exact channel* you are watching, allowing you to categorize different creators (e.g., categorizing educational channels as "Study" and entertainment as "Wasted").
  * **Shorts Sinkhole:** Automatically groups all YouTube Shorts into a single pseudo-channel so you can easily isolate and track endless scrolling time.
* **📊 Beautiful Classic Dashboard:** A comprehensive, locally rendered dashboard featuring donut charts, daily trend graphs, and detailed domain-by-domain breakdowns.
* **🎨 Dynamic Themes:** Built-in support for multiple modern color schemes (including Everforest, Nord, Dracula, and more).

## 🚀 Installation

Since TimeWise is currently not on the Chrome Web Store, you can easily install it locally:

1. Clone or download this repository.
2. Open Chrome and navigate to `chrome://extensions`.
3. Enable **Developer mode** in the top right corner.
4. Click **Load unpacked** and select the `TimeWise` folder.
5. Pin the ⏱️ extension icon to your toolbar and click it to open your popup or dashboard!

## 🛠️ Built With

* **Vanilla JavaScript** - Lightweight and blazing fast.
* **HTML5 / CSS3** - Classic, responsive flexbox layout.
* **[Chart.js](https://www.chartjs.org/)** - For the beautiful, interactive dashboard analytics.

## 🔮 Future Roadmap
- [ ] Weekly/Monthly comparative analytics.
- [ ] Export data to CSV functionality.
- [ ] Companion native macOS application for system-wide app tracking (integrating with Chrome data via Native Messaging).

## 🤝 Contributing
Feel free to open issues or submit pull requests if you have ideas for new features or improvements!

---
*Built to help you take back control of your time.*
