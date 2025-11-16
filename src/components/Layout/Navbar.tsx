import React, { Fragment } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import {
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  SunIcon,
  MoonIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useLanguage } from "../../contexts/LanguageContext";
// import { useCart } from "../../contexts/CartContext";

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  // const { itemCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [{ name: t("nav.home"), href: "/" }];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <Disclosure
      as="nav"
      className="fixed top-0 left-0 w-full z-50 bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700"
    >
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex">
                {/* LOGO */}
                <div className="flex flex-shrink-0 items-center">
                  <button
                    onClick={() => {
                      if (location.pathname === "/") {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      } else {
                        navigate("/");
                      }
                    }}
                    className="text-3xl font-bold bg-gradient-to-r from-[#155F82] via-[#44B3E1] to-[#155F82] bg-clip-text text-transparent drop-shadow"
                  >
                    StoreHub
                  </button>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden sm:ms-6 sm:flex sm:space-x-8 rtl:space-x-reverse">
                  {navigation.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => navigate(item.href)}
                      className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors ${
                        location.pathname === item.href
                          ? "border-blue-500 text-blue-600 dark:text-blue-400"
                          : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white hover:border-gray-300"
                      }`}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right buttons */}
              <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4 rtl:space-x-reverse">
                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {theme === "light" ? (
                    <MoonIcon className="h-5 w-5" />
                  ) : (
                    <SunIcon className="h-5 w-5" />
                  )}
                </button>

                {/* Language Toggle */}
                <button
                  onClick={() => setLanguage(language === "en" ? "ar" : "en")}
                  className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <GlobeAltIcon className="h-5 w-5" />
                </button>

                {/* If logged in */}
                {user ? (
                  <Menu as="div" className="relative ml-3">
                    <Menu.Button className="flex rounded-full bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800">
                      <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-white" />
                      </div>
                    </Menu.Button>

                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 rtl:right-auto rtl:left-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={handleLogout}
                              className={`block w-full text-left px-4 py-2 text-sm ${
                                active ? "bg-gray-100 dark:bg-gray-700" : ""
                              } text-gray-700 dark:text-gray-200`}
                            >
                              {t("nav.logout")}
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                ) : (
                  <div className="flex items-center space-x-4 rtl:space-x-reverse">
                    <button
                      onClick={() => navigate("/login")}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white px-3 py-2 text-sm font-medium transition-colors"
                    >
                      {t("nav.login")}
                    </button>

                    <button
                      onClick={() => navigate("/register")}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      {t("nav.register")}
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <div className="flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300">
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 pb-3 pt-2">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => navigate(item.href)}
                  className={`block w-full text-left border-l-4 py-2 pl-3 pr-4 text-base font-medium transition-colors ${
                    location.pathname === item.href
                      ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default Navbar;
