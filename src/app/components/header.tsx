"use client"

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const Header = () => {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    if (
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      document.documentElement.classList.add("dark");
      setTheme("dark");
    } else {
      document.documentElement.classList.remove("dark");
      setTheme("light");
    }
  }, []);

  const toggleTheme = () => {
    if (theme === "dark") {
      document.documentElement.classList.remove("dark");
      setTheme("light");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      setTheme("dark");
      localStorage.setItem("theme", "dark");
    }
  };

  return ( 
    <header className="flex justify-between items-center p-4 bg-background text-foreground">
      <h1 className="text-lg font-bold">Meu Projeto</h1>
      <Button
        onClick={toggleTheme}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
      >
        {theme === "dark" ? "🌙 Dark Mode" : "☀️ Light Mode"}
      </Button>
    </header>
  );
}
 
export default Header;