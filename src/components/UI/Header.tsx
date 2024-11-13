import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/UI/Button";

interface HeaderProps {
  dashboardType: "user" | "company";
  onToggleSidebar?: () => void;
  className?: string; // className をオプショナルプロパティとして追加
}

export function Header({ dashboardType, onToggleSidebar, className }: HeaderProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
    onToggleSidebar?.();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".sidebar") && !target.closest(".sidebar-toggle")) {
        setIsSidebarOpen(false);
      }
    };

    if (isSidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen]);

  return (
    <header className={`bg-white shadow flex items-center justify-between px-4 py-3 ${className || ""}`}>
      <div className="flex items-center space-x-2 pl-3">
        <Image src="/Logo.svg" alt="Logo" width={40} height={40} className="h-10 w-10" />
        <span className="text-xl text-soft-blue font-semibold">Re-Light LMS</span>
      </div>

      <Button onClick={handleSidebarToggle} className="p-2 rounded-xl hover:bg-gray-100 sidebar-toggle mr-6">
        <Image src="/SidebarIcon.svg" alt="Sidebar" width={24} height={24} />
      </Button>

      {isSidebarOpen && (
        <aside className="sidebar absolute top-0 right-0 h-full bg-soft-sky w-32 shadow-lg flex flex-col justify-between z-50">
          <nav className="p-4 flex-grow flex flex-col items-center space-y-4">
            <ul className="flex flex-col items-center space-y-4">
              <li>
                <Button
                  onClick={() => setIsSidebarOpen(false)}
                  className="flex items-center justify-center p-2 rounded-xl hover:bg-soft-blue"
                >
                  <Image src="/SidebarIcon.svg" alt="Close Sidebar" width={24} height={24} />
                </Button>
              </li>

              {dashboardType === "user" ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="link" className="flex items-center justify-center">
                      <Image src="/HomeIcon.svg" alt="Home" width={24} height={24} />
                    </Button>
                  </Link>
                  {/* <li>
                    <Button variant="link" className="flex items-center justify-center">
                      <Image src="/FaceIcon.svg" alt="Face" width={24} height={24} />
                    </Button>
                  </li> */}
                  {/* <li>
                    <Button variant="link" className="flex items-center justify-center">
                      <Image src="/ProgressIcon.svg" alt="Progress" width={24} height={24} />
                    </Button>
                  </li> */}
                </>
              ) : (
                <>
                  <Link href="/companydashboard">
                    <Button variant="link" className="flex items-center justify-center">
                      <Image src="/HomeIcon.svg" alt="Home" width={24} height={24} />
                    </Button>
                  </Link>
                  {/* <li>
                    <Button variant="link" className="flex items-center justify-center">
                      <Image src="/FaceIcon.svg" alt="Face" width={24} height={24} />
                    </Button>
                  </li> */}
                </>
              )}
            </ul>
          </nav>
          <div className="pb-64 space-y-4 flex flex-col items-center">
            {/* <Button variant="link" className="flex items-center justify-center">
              <Image src="/SettingsIcon.svg" alt="Settings" width={24} height={24} />
            </Button> */}
            <Link href="/">
              <Button variant="link" className="flex items-center justify-center">
                <Image src="/LogoutIcon.svg" alt="Logout" width={24} height={24} />
              </Button>
            </Link>
          </div>
        </aside>
      )}
    </header>
  );
}
