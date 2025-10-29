import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { BrowserRouter } from "react-router-dom";

window.addEventListener("error", (e) => {
  const msg = `❌ JS Error: ${e.message} (${e.filename}:${e.lineno})`;
  document.body.innerHTML = `<pre style="font-family:monospace;padding:1rem;background:#fee;color:#900;border:1px solid #c00">${msg}</pre>`;
  console.error("Fehler:", e);
});
window.addEventListener("unhandledrejection", (e) => {
  const msg = `❌ Promise Error: ${e.reason}`;
  document.body.innerHTML = `<pre style="font-family:monospace;padding:1rem;background:#fee;color:#900;border:1px solid #c00">${msg}</pre>`;
  console.error("Promise Fehler:", e);
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
