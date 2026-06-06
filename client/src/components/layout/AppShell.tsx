import React from 'react';
import { Sidebar } from './Sidebar.js';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 ml-[240px] min-h-screen p-8 max-w-[1280px] mx-auto w-full">
        {children}
      </main>
    </div>
  );
};
