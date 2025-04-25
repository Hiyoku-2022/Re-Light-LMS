"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/UI/Button";
import ChatComponent from "@/components/AIChat";

interface HeaderProps {
  dashboardType: "user" | "company";
  onToggleSidebar?: () => void;
}

export function Header({ dashboardType }: HeaderProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleSidebarToggle = () => setIsSidebarOpen(prev => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".sidebar") && !target.closest(".sidebar-toggle")) {
        closeSidebar();
      }
    };
    if (isSidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSidebarOpen]);

  return (
    <>
      <header className="fixed top-0 left-0 w-full bg-white shadow flex items-center justify-between px-4 py-3 z-20">
        <div className="flex items-center space-x-2 pl-3">
          <Image src="/Logo.svg" alt="Logo" width={40} height={40} className="h-10 w-10" />
          <span className="text-xl text-soft-blue font-semibold">Re-Light LMS</span>
        </div>
        <Button
          onClick={handleSidebarToggle}
          className="p-2 rounded-xl hover:bg-gray-100 sidebar-toggle mr-6"
        >
          <Image src="/SidebarIcon.svg" alt="Sidebar" width={24} height={24} />
        </Button>
      </header>

      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-40 z-30 transition-opacity duration-300 ${
          isSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <aside
        className={`sidebar fixed top-0 right-0 h-full bg-soft-sky w-32 shadow-lg z-40 transform transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        } flex flex-col justify-between`}
      >
        <nav className="p-4 flex-grow flex flex-col items-center space-y-8">
          <ul className="flex flex-col items-center space-y-8">
            {/* Close Button */}
            <li className="group relative">
              <Button
                onClick={closeSidebar}
                className="flex items-center justify-center p-2 rounded-xl hover:bg-soft-blue focus:bg-soft-blue"
                aria-label="Close Sidebar"
              >
                <Image src="/SidebarIcon.svg" alt="Close Sidebar" width={24} height={24} />
              </Button>
            </li>

            {/* Dashboard Link */}
            <li className="group relative">
              <Link href={dashboardType === "user" ? "/dashboard" : "/companydashboard"}>
                <Button
                  onClick={closeSidebar}
                  variant="link"
                  className="flex items-center justify-center p-2 rounded-xl hover:bg-soft-blue focus:bg-soft-blue"
                >
                  <Image src="/HomeIcon.svg" alt="Home" width={24} height={24} />
                </Button>
              </Link>
            </li>
            {/* Chat (AI質問) ボタン */}
            <li className="group relative">
              <Button
                onClick={() => setIsChatOpen(true)}
                className="flex items-center justify-center p-2 rounded-xl hover:bg-soft-blue focus:bg-soft-blue"
              >
                <Image src="/ChatIcon.svg" alt="AI Chat" width={24} height={24} />
              </Button>
            </li>
          </ul>
        </nav>

        <div className="pb-6 flex flex-col items-center space-y-8">
          {/* Logout Link */}
          <li className="group relative list-none">
            <Link href="/">
              <Button
                onClick={closeSidebar}
                variant="link"
                className="flex items-center justify-center p-2 rounded-xl hover:bg-soft-blue focus:bg-soft-blue"
              >
                <Image src="/LogoutIcon.svg" alt="Logout" width={24} height={24} />
              </Button>
            </Link>
          </li>
        </div>
      </aside>

      {/* Chat Modal */}
      {isChatOpen && (
        <ChatComponent isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      )}
    </>
  );
}