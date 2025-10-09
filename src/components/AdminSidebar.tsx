import React from "react";
import {
  LayoutDashboard,
  FileText,
  Sliders,
  Settings,
  LogOut,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const AdminSidebar: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    {
      path: "/admin/dashboard",
      label: "ダッシュボード",
      icon: LayoutDashboard,
    },
    {
      path: "/admin/recharges",
      label: "リチャージ管理",
      icon: FileText,
    },
    {
      path: "/admin/recharge-articles",
      label: "リチャージ記事",
      icon: FileText,
    },
    {
      path: "/admin/recharge-rules",
      label: "リチャージルール管理",
      icon: Sliders,
    },
    {
      path: "/admin/settings",
      label: "システム設定",
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-gray-200 flex flex-col h-screen fixed left-0 top-0">
      {/* ロゴ部分 */}
      <div className="h-16 flex items-center justify-center border-b border-gray-700">
        <span className="text-lg font-bold tracking-wide text-white">
          GETSET Admin
        </span>
      </div>

      {/* メニュー */}
      <nav className="flex-1 overflow-y-auto py-4">
        {menuItems.map(({ path, label, icon: Icon }) => (
          <Link
            key={path}
            to={path}
            className={`flex items-center px-6 py-3 text-sm font-medium transition ${
              location.pathname === path
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-800 text-gray-300"
            }`}
          >
            <Icon className="w-5 h-5 mr-3" />
            {label}
          </Link>
        ))}
      </nav>

      {/* ログアウト */}
      <div className="p-4 border-t border-gray-700">
        <button className="flex items-center space-x-2 text-sm text-gray-400 hover:text-red-400 transition">
          <LogOut className="w-4 h-4" />
          <span>ログアウト</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
