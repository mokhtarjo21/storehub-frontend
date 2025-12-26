import React, { Fragment } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import {
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  SunIcon,
  MoonIcon,
  ShoppingCartIcon,
  GlobeAltIcon,
  // HomeIcon,
  CubeIcon,
  ShieldCheckIcon,
  BuildingStorefrontIcon,
  UserGroupIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { useActivityTracker } from "../../hooks/useActivityTracker";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { useCart } from "../../contexts/CartContext";
import NotificationBell from "../NotificationBell";

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { itemCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const { trackPageView } = useActivityTracker();
  const navigation = [
    // { name: t("nav.home"), href: "/", icon: HomeIcon },
    { name: t("nav.products"), href: "/products", icon: CubeIcon },
  ];

  if (user) {
    navigation.push({
      name: t("nav.orders"),
      href: "/dashboard",
      icon: ShoppingCartIcon,
    });
    if (user.role === "company_admin") {
      navigation.push({
        name: t("companyDashboard"),
        href: "/company",
        icon: BuildingStorefrontIcon,
      });
    }
    if (user.role === "affiliate") {
      navigation.push({
        name: "Affiliate",
        href: "/affiliate",
        icon: UserGroupIcon,
      });
    }
    if (user.role === "super_admin") {
      navigation.push({
        name: t("nav.admin"),
        href: "/admin",
        icon: ShieldCheckIcon,
      });
    }
  }

  const handleLogout = () => {
    logout();
    trackPageView("/");
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
                        trackPageView("/");
                        navigate("/");
                      }
                    }}
                    className="text-3xl font-bold bg-gradient-to-r from-[#155F82] via-[#44B3E1] to-[#155F82] bg-clip-text text-transparent drop-shadow"
                  >
                    Stackhubs Store
                  </button>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden sm:ms-6 sm:flex sm:space-x-8 rtl:space-x-reverse">
                  {navigation.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => {
                        navigate(item.href);
                        trackPageView(item.href);
                      }}
                      className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors ${
                        location.pathname === item.href
                          ? "border-[#44B3E1] text-[#44B3E1] dark:text-[#44B3E1]"
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

                {user ? (
                  <>
                    {/* Cart */}
                    <button
                      onClick={() => {
                        navigate("/cart");
                        trackPageView("/cart");
                      }}
                      className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
                    >
                      <ShoppingCartIcon className="h-5 w-5" />
                      {itemCount > 0 && (
                        <span className="absolute -top-1 -right-1 block h-5 w-5 rounded-full bg-blue-500 text-xs text-white flex items-center justify-center">
                          {itemCount}
                        </span>
                      )}
                    </button>

                    {/* Notifications */}
                    <NotificationBell />

                    {/* Profile dropdown */}
                    <Menu as="div" className="relative ml-3">
                      <div>
                        <Menu.Button className="flex rounded-full bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800">
                          {user?.avatar ? (
                            <img
                              src={user.avatar}
                              alt="Profile"
                              className="h-8 w-8 rounded-full object-fill"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                              <UserIcon className="h-5 w-5 text-white" />
                            </div>
                          )}
                        </Menu.Button>
                      </div>
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
                                onClick={() => {
                                  navigate("/profile");
                                  trackPageView("/profile");
                                }}
                                className={`block w-full text-left px-4 py-2 text-sm ${
                                  active ? "bg-gray-100 dark:bg-gray-700" : ""
                                } text-gray-700 dark:text-gray-200`}
                              >
                                {t("nav.profile")}
                              </button>
                            )}
                          </Menu.Item>

                          {/* Terms & Conditions */}
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() => {
                                  navigate("/terms");
                                  trackPageView("/terms");
                                }}
                                className={`block w-full text-left px-4 py-2 text-sm ${
                                  active ? "bg-gray-100 dark:bg-gray-700" : ""
                                } text-gray-700 dark:text-gray-200`}
                              >
                                {t("nav.terms")}
                              </button>
                            )}
                          </Menu.Item>

                          {/* Privacy Policy */}
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() => {
                                  navigate("/privacy");
                                  trackPageView("/privacy");
                                }}
                                className={`block w-full text-left px-4 py-2 text-sm ${
                                  active ? "bg-gray-100 dark:bg-gray-700" : ""
                                } text-gray-700 dark:text-gray-200`}
                              >
                                {t("nav.privacy")}
                              </button>
                            )}
                          </Menu.Item>
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
                  </>
                ) : (
                  <div className="flex items-center space-x-4 rtl:space-x-reverse">
                    <button
                      onClick={() => navigate("/login")}
                      className="px-5 py-2 bg-[#DF1783] text-white rounded-full hover:bg-pink-500 transition-all"
                    >
                      {t("nav.login")}
                    </button>
                    <button
                      onClick={() => navigate("/register")}
                      className="px-5 py-2 bg-[#DF1783] text-white rounded-full hover:bg-pink-500 transition-all"
                    >
                      {t("nav.register")}
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <div className="flex items-center sm:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>
          {open && (
            <div
              className="fixed inset-0 bg-black bg-opacity-30 z-40 sm:hidden"
              onClick={() => {
                // هذا يغلق الـ drawer بالضغط على الخلفية
                const toggleButton = document.querySelector(
                  'button[aria-expanded="true"]'
                ) as HTMLElement;
                toggleButton?.click();
              }}
            />
          )}
          {/* Mobile menu - IMPROVED VERSION */}
          <Disclosure.Panel className="sm:hidden fixed top-0 left-0 h-screen w-60 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-lg z-50">
            <div className="px-3 pt-3 pb-4 space-y-2">
              {/* Navigation Links */}
              {navigation.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Disclosure.Button
                    key={item.name}
                    as={Link}
                    to={item.href}
                    className={`flex items-center w-full px-3 py-3 rounded-lg text-base font-medium transition-all ${
                      location.pathname === item.href
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-r-2 border-blue-500"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <IconComponent className="h-5 w-5 mr-2" />
                    <span>{item.name}</span>
                  </Disclosure.Button>
                );
              })}

              {/* Theme & Language */}
              <button
                onClick={toggleTheme}
                className="flex items-center w-full px-3 py-3 rounded-lg text-base font-medium transition-all
             text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {theme === "light" ? (
                  <MoonIcon className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-300" />
                ) : (
                  <SunIcon className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-300" />
                )}

                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {theme === "light"
                    ? t("nav.theme.dark")
                    : t("nav.theme.light")}
                </span>
              </button>

              <Disclosure.Button
                onClick={() => setLanguage(language === "en" ? "ar" : "en")}
                className="flex items-center w-full px-3 py-3 rounded-lg text-base font-medium transition-all text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <GlobeAltIcon className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-300" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {language === "en" ? "العربية" : "English"}
                </span>
              </Disclosure.Button>

              {/* User Specific Actions */}
              {user && (
                <>
                  {/* Cart */}
                  <Disclosure.Button
                    as={Link}
                    to="/cart"
                    className="flex items-center w-full px-3 py-3 rounded-lg text-base font-medium transition-all text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 relative"
                  >
                    <ShoppingCartIcon className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-300" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {t("nav.cart")}
                      {itemCount > 0 && (
                        <span className="ml-2 inline-block h-4 w-4 rounded-full bg-blue-500 text-xs text-white text-center">
                          {itemCount}
                        </span>
                      )}
                    </span>
                  </Disclosure.Button>

                  {/* Notifications */}
                  <Disclosure.Button
                    onClick={() => navigate("/notifications")}
                    className="flex items-center w-full rounded-lg text-base font-medium transition-all 
             text-gray-700 dark:text-gray-200 
             hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <NotificationBell showBadge={true} />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {t("nav.notifications")}
                    </span>
                  </Disclosure.Button>

                  {/* Profile */}
                  <Disclosure.Button
                    as="button"
                    onClick={() => navigate("/profile")}
                    className="flex items-center w-full p-2 rounded-lg text-base font-medium transition-all 
             text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt="Profile"
                        className="h-8 w-8 rounded-full object-fill mr-2"
                      />
                    ) : (
                      <UserIcon className="h-5 w-5 mr-2" />
                    )}

                    <span>{t("nav.profile")}</span>
                  </Disclosure.Button>

                  {/* Terms & Conditions */}
                  <Disclosure.Button
                    as="button"
                    onClick={() => {
                      navigate("/terms");
                      trackPageView("/terms");
                    }}
                    className="flex items-center w-full px-3 py-3 rounded-lg text-base font-medium transition-all text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <DocumentTextIcon className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-300" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {t("nav.terms")}
                    </span>
                  </Disclosure.Button>

                  {/* Privacy Policy */}
                  <Disclosure.Button
                    as="button"
                    onClick={() => {
                      navigate("/privacy");
                      trackPageView("/privacy");
                    }}
                    className="flex items-center w-full px-3 py-3 rounded-lg text-base font-medium transition-all text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <ShieldCheckIcon className="h-5 w-5 mr-2 text-gray-600 dark:text-gray-300" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {t("nav.privacy")}
                    </span>
                  </Disclosure.Button>

                  {/* Logout */}
                  <Disclosure.Button
                    as="button"
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-3 rounded-lg text-base font-medium transition-all text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <svg
                      className="h-5 w-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    <span>{t("nav.logout")}</span>
                  </Disclosure.Button>
                </>
              )}

              {/* Auth Buttons for Non-Users */}
              {!user && (
                <>
                  <Disclosure.Button
                    as="button"
                    onClick={() => navigate("/login")}
                    className="flex items-center w-full px-3 py-3 rounded-lg text-base font-medium transition-all text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <span>{t("nav.login")}</span>
                  </Disclosure.Button>

                  <Disclosure.Button
                    as="button"
                    onClick={() => navigate("/register")}
                    className="flex items-center w-full px-3 py-3 rounded-lg text-base font-medium transition-all text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <span>{t("nav.register")}</span>
                  </Disclosure.Button>
                </>
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default Navbar;
