import React from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { cn } from "../libs/tailwind/merge-tailwind-classes";
import { Button } from "./ui/Button";
import { useTranslation } from "react-i18next";
import logo from "../assets/logo.png";
import { useAuth } from "../hooks/useAuth";

export type SideMenuItem = {
  label: string;
  permission?: string;
  icon?: React.ReactNode;
  path?: string;
  onClick?: () => void;
};

export type SideMenuProps = {
  title?: string;
  width?: number;
  open?: boolean;
  items: SideMenuItem[];
};

export const SideMenu: React.FC<SideMenuProps> = ({
  title = "Navigation",
  width = 280,
  items,
  open,
}) => {
  const location = useLocation();
  const { t } = useTranslation();
  const { hasPermission } = useAuth();

  return (
    <aside className="shrink-0  bg-slate-800" aria-label={title}>
      <div style={{ width: open ? width : 0 }}>
        <div className="flex h-14 items-center  px-4 my-6">
          <img
            src={logo}
            alt="Logo"
            className=" w-10 h-10 mr-3"
            style={{ backgroundColor: "transparent" }}
          />
          <div>
            <div className="text-lg font-semibold text-white">
              {t("common.title")}{" "}
            </div>
            <div className="text-sm text-gray-400">{t("common.subtitle")}</div>
          </div>
        </div>

        <nav className="px-2">
          <ul className="space-y-1">
            {items.map((item) => {
              const { label, icon, path, onClick, permission } = item;
              const isActive =
                item.path === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.path || "");

              const commonClassName = cn(
                "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground/80 hover:bg-accent hover:text-foreground",
              );

              return (
                <>
                  {hasPermission(permission || "") && (
                    <li
                      key={label}
                      className={
                        isActive
                          ? "border-l-4 border-green-700 bg-slate-700 rounded-xl hover:bg-transparent"
                          : "hover:bg-content-box"
                      }
                    >
                      {path ? (
                        <RouterLink
                          to={path}
                          className={cn(
                            commonClassName,
                            "hover:bg-transparent group-hover:bg-transparent",
                          )}
                        >
                          {icon ? (
                            <span className="text-white/70 ">{icon}</span>
                          ) : null}
                          <span className="font-semibold text-base text-white/90">
                            {label}
                          </span>
                        </RouterLink>
                      ) : (
                        <Button
                          variant={"ghost"}
                          className={commonClassName}
                          onClick={onClick ?? (() => undefined)}
                        >
                          {icon ? (
                            <span className="text-foreground/70">{icon}</span>
                          ) : null}
                          <span>{label}</span>
                        </Button>
                      )}
                    </li>
                  )}
                </>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default SideMenu;
