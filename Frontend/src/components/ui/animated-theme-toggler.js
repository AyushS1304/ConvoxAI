import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useRef, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { flushSync } from "react-dom";
import { cn } from "@/lib/utils";
export const AnimatedThemeToggler = ({ className, duration = 400, ...props }) => {
    const [isDark, setIsDark] = useState(() => {
        // Check localStorage for stored theme, default to dark
        const storedTheme = localStorage.getItem("vite-ui-theme");
        return storedTheme ? storedTheme === "light" : true;
    });
    const buttonRef = useRef(null);
    useEffect(() => {
        const updateTheme = () => {
            setIsDark(document.documentElement.classList.contains("dark"));
        };
        updateTheme();
        const observer = new MutationObserver(updateTheme);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });
        return () => observer.disconnect();
    }, []);
    const toggleTheme = useCallback(async () => {
        if (!buttonRef.current)
            return;
        await document.startViewTransition(() => {
            flushSync(() => {
                const newTheme = !isDark;
                setIsDark(newTheme);
                document.documentElement.classList.toggle("dark");
                localStorage.setItem("vite-ui-theme", newTheme ? "dark" : "light");
            });
        }).ready;
        const { top, left, width, height } = buttonRef.current.getBoundingClientRect();
        const x = left + width / 2;
        const y = top + height / 2;
        const maxRadius = Math.hypot(Math.max(left, window.innerWidth - left), Math.max(top, window.innerHeight - top));
        document.documentElement.animate({
            clipPath: [
                `circle(0px at ${x}px ${y}px)`,
                `circle(${maxRadius}px at ${x}px ${y}px)`,
            ],
        }, {
            duration,
            easing: "ease-in-out",
            pseudoElement: "::view-transition-new(root)",
        });
    }, [isDark, duration]);
    return (_jsxs("button", { ref: buttonRef, onClick: toggleTheme, className: cn(className), ...props, children: [isDark ? _jsx(Sun, {}) : _jsx(Moon, {}), _jsx("span", { className: "sr-only", children: "Toggle theme" })] }));
};
