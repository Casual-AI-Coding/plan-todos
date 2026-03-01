// Theme initialization script - runs before React loads to prevent hydration mismatch
(function () {
  var theme = localStorage.getItem("plan-todos-theme");
  if (!theme) {
    theme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  if (
    theme === "light" ||
    theme === "dark" ||
    theme === "dracula" ||
    theme === "nord" ||
    theme === "monokai" ||
    theme === "glass" ||
    theme === "spring" ||
    theme === "catppuccin" ||
    theme === "tokyoNight" ||
    theme === "oneDark" ||
    theme === "system"
  ) {
    document.documentElement.setAttribute("data-theme", theme);
  } else {
    document.documentElement.setAttribute("data-theme", "light");
  }
})();
