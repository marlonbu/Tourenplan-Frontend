import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[#0058A3] mb-2">
          ✅ React läuft!
        </h1>
        <p className="text-gray-600">
          Deine Render-Deployment funktioniert.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
