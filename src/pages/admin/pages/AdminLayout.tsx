import React from "react";
import AdminSidebar from "../../../components/AdminSidebar";
import AdminHeader from "../../../components/AdminHeader";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* サイドバー */}
      <AdminSidebar />

      {/* メインエリア */}
      <div className="flex flex-col flex-1 ml-64">
        <AdminHeader />
        <main className="p-8 overflow-y-auto h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
