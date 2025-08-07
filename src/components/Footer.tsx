// src/components/Footer.tsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, Calendar, TrendingUp, User } from "lucide-react";

const Footer: React.FC = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const tabs = [
    { to: "/", label: "ホーム", Icon: Home },
    { to: "/calendar", label: "カレンダー", Icon: Calendar },
    { to: "/recharge", label: "リチャージ", Icon: TrendingUp },
    { to: "/mypage", label: "マイページ", Icon: User },
  ] as const;

  return (
    <footer className="fixed bottom-0 left-0 w-full bg-white rounded-t-xl shadow-lg">
      <nav className="flex justify-around py-2">
        {tabs.map(({ to, label, Icon }) => {
          const active = pathname === to;
          return (
            <button
              key={to}
              onClick={() => navigate(to)}
              className="flex flex-col items-center space-y-1 focus:outline-none"
            >
              <Icon
                size={24}
                strokeWidth={2}
                className={active ? "text-cyan-500" : "text-gray-400"}
              />
              <span
                className={`text-xs ${
                  active ? "text-cyan-500" : "text-gray-400"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </nav>
    </footer>
  );
};

export default Footer;
