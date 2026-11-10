import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { Navbar } from '../components/common/Navbar';
import { RoleGuard } from '../components/common/RoleGuard';
import { useAuth } from '../context/AuthContext';

export const SupervisorLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentRole, USER_ROLES } = useAuth();
  const allowedRoles = [USER_ROLES.ADMIN, USER_ROLES.SUPERVISOR];
  const isAllowed = allowedRoles.includes(currentRole);

  if (!isAllowed) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar showSidebarToggle={false} isCitizenView={currentRole === USER_ROLES.CITIZEN} />
        <main className="flex-1 p-gutter lg:p-margin">
          <RoleGuard allowedRoles={allowedRoles} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-72 flex flex-col min-h-screen">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-gutter lg:p-margin">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

