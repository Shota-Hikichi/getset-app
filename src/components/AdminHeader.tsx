import React from "react";
import { Bell, User } from "lucide-react";

const AdminHeader: React.FC = () => {
  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white border-b shadow-sm sticky top-0 z-40">
      {/* 左側：タイトル */}
      <h1 className="text-xl font-semibold text-gray-800">GETSET 管理画面</h1>

      {/* 右側：通知とユーザー */}
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-full hover:bg-gray-100 transition">
          <Bell className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
            管
          </div>
          <span className="text-sm text-gray-700 font-medium">Admin</span>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
