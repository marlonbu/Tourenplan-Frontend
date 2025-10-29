import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Planung from "./pages/Planung";
import Tagestour from "./pages/Tagestour";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/planung" replace />} />
      <Route path="/planung" element={<Planung />} />
      <Route path="/tagestour" element={<Tagestour />} />
      <Route path="*" element={<div>Not Found</div>} />
    </Routes>
  );
}
