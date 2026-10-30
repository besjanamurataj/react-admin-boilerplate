import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import SideMenu from "../components/SideMenu";
import type { SideMenuItem } from "../components/SideMenu";
import Header from "./Header";
import { Footer } from "./Footer";

export type AppShellLayoutProps = {
  children?: React.ReactNode;
  menuItems: SideMenuItem[];
  permission?: string;
  menuTitle?: string;
  menuWidth?: number;
};

export const AppShellLayout: React.FC<AppShellLayoutProps> = ({
  menuItems,
  menuTitle,
  menuWidth,
}) => {
  const [open, setOpen] = useState<boolean>(true);

  return (
    <div className="flex min-h-screen bg-muted/40">
      <SideMenu
        title={menuTitle}
        width={menuWidth}
        items={menuItems}
        open={open}
      />
      <main className="flex-1 flex flex-col">
        <Header setOpen={setOpen} open={open} />
        <div className="flex-1 bg-gray-100 shadow-lg border-b border-border rounded-xl flex flex-col">
          <main>
            <Outlet />
          </main>
        </div>
        <Footer />
      </main>
    </div>
  );
};

export default AppShellLayout;
