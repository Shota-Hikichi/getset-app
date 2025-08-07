// src/App.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import CalendarPage from "./pages/CalendarPage";
import RechargePage from "./pages/RechargePage";
import MyPage from "./pages/MyPage";
import Footer from "./components/Footer";

const App: React.FC = () => (
  <div className="min-h-screen pb-16">
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/recharge" element={<RechargePage />} />
      <Route path="/mypage" element={<MyPage />} />
      {/* 存在しないパスは Home にリダイレクト */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    <Footer />
  </div>
);

export default App;
