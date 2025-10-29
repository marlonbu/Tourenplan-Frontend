import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import Planung from "./pages/Planung";

function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-2xl font-bold text-[#0058A3] mb-6">
        🧭 Navigationstest
      </h1>
      <Link
        to="/planung"
        className="bg-[#0058A3] text-white px-4 py-2 rounded-md hover:bg-blue-800"
      >
        Zur Planung wechseln
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/planung" element={<Planung />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
