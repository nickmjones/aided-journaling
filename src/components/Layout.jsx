import React from "react";
import { Moon, Sun } from "lucide-react";

const Layout = ({ children }) => {
  const [isDark, setIsDark] = React.useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#282828] dark:text-[#ebdbb2]">
      <header className="border-b dark:border-[#3c3836]">
        <div className="max-w-2xl mx-auto p-4 flex justify-between items-center">
          <h1 className="text-xl font-medium">Aided Journal</h1>
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#3c3836]"
          >
            {isDark ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
        </div>
      </header>
      <main className="max-w-2xl mx-auto">{children}</main>
    </div>
  );
};

export default Layout;
