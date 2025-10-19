import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./css/index.css";
import App from "./App.jsx";
import { AuthProvider } from "./contexts/AuthContext";

const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);

// ✅ Register Service Worker for PWA
if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then(reg => console.log("✅ ScreenMate Service Worker registered:", reg.scope))
      .catch(err => console.error("❌ ScreenMate Service Worker registration failed:", err));
  });
}

// Ask user permission for notifications
if ("Notification" in window && navigator.serviceWorker) {
  Notification.requestPermission().then((permission) => {
    if (permission === "granted") {
      console.log("✅ Notifications permission granted.");

      // Trigger a test notification
      navigator.serviceWorker.ready.then((reg) => {
        reg.showNotification("ScreenMate", {
          body: "Your personalized recommendations are ready!",
          icon: "/icons/icon-192x192.png",
        });
      });
    }
  });
}


// ✅ PWA Install Prompt
let deferredPrompt;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault(); // Prevent automatic prompt
  deferredPrompt = e;

  const installBtn = document.getElementById("installBtn");
  if (installBtn) installBtn.style.display = "block"; // Show install button
});

window.addEventListener("DOMContentLoaded", () => {
  const installBtn = document.getElementById("installBtn");
  if (installBtn) {
    installBtn.addEventListener("click", async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        console.log("User choice:", choice.outcome);
        deferredPrompt = null;
        installBtn.style.display = "none"; // Hide button after install prompt
      }
    });
  }
});
