import { ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback } from "../components/ui/Avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/DropdownMenu";
import { useNavigate } from "react-router-dom";
import enflag from "../assets/flags/en.png";
import itflag from "../assets/flags/it.png";
import { useState } from "react";
import i18next from "i18next";
import { useTranslation } from "react-i18next";
import { Button } from "../components/ui/Button";
import { useAuth } from "../hooks/useAuth";

interface HeaderProps {
  setOpen?: (open: boolean) => void;
  open?: boolean;
}

export const Header = ({ setOpen, open }: HeaderProps) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("jwtToken");
  const { t } = useTranslation();
  const { user } = useAuth();
  const { unAuthenticateUser } = useAuth();

  const handleLogout = () => {
    unAuthenticateUser();
    navigate("/login");
  };

  const languages = [
    { code: "en-GB", label: "EN", flag: enflag },
    { code: "it-IT", label: "IT", flag: itflag },
  ];
  const [selectedLang, setSelectedLang] = useState(languages[0]);

  const goToProfile = () => {
    navigate("/profile");
  };

  const menuItems = [
    { text: t("common.profile"), action: goToProfile },
    { text: t("common.logout"), action: handleLogout },
  ];

  const handleLanguageChange = (lang: (typeof languages)[0]) => {
    setSelectedLang(lang);
    i18next.changeLanguage(lang.code);
  };

  const toggleMenu = () => {
    if (setOpen) {
      setOpen(!open);
    }
  };

  const getUsername = (): string => {
    if (!user) return "";
    const email = user.email || "";
    const name = email.split("@")[0] || "";
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const getUsernameInitial = (): string => {
    if (!user) return "";
    const email = user.email || "";
    const name = email.split("@")[0] || "";
    return name.charAt(0).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 w-full  bg-background">
      <div className="flex h-16 items-center justify-between px-6">
        {token ? (
          <Button variant={"outline"} onClick={() => toggleMenu()}>
            ☰
          </Button>
        ) : (
          <div></div>
        )}
        <div className="flex h-16 items-center justify-end px-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              {token && (
                <div className="relative hidden md:block">
                  <Avatar className="rounded-lg">
                    <AvatarFallback className="text-white border-md bg-green-700 text-lg rounded-xl  font-bold">
                      {getUsernameInitial()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}

              {token && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700">
                    {getUsername()}
                  </h3>
                </div>
              )}
            </div>

            {token && (
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <ChevronDown className="text-gray-500" />
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  {menuItems.map((item) => (
                    <DropdownMenuItem
                      key={item.text}
                      className="hover:bg-white active:bg-gray-100"
                      onSelect={() => item.action()}
                    >
                      <h5 className="font-medium text-md text-gray-700 ">
                        {item.text}
                      </h5>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <div>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <img
                    src={selectedLang.flag}
                    alt={`${selectedLang.label} Flag`}
                    className="w-6 h-4 rounded-sm"
                  />
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  {languages.map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      className="hover:bg-white active:bg-gray-100"
                      onSelect={() => handleLanguageChange(lang)}
                    >
                      <img
                        src={lang.flag}
                        alt={`${lang.label} Flag`}
                        className="w-6 h-4 rounded-sm mr-2"
                      />
                      <h5 className="font-medium text-md text-gray-700 ">
                        {lang.label}
                      </h5>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
