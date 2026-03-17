"use client";
import { JSX, useState } from "react";
import { useTheme } from "next-themes";
import { Eye, EyeOff } from "lucide-react";

interface UsePasswordToggleOptions {
    initialVisible?: boolean;
    buttonClassName?: string;
}

interface PasswordToggleReturn {
    inputType: "text" | "password";
    toggleButton: JSX.Element;
    visible: boolean;
}

const usePasswordToggle = ({ initialVisible = false, buttonClassName = "" }: UsePasswordToggleOptions = {}): PasswordToggleReturn => {

    const [visible, setVisible] = useState(initialVisible);
    const { theme } = useTheme();

    const toggleVisibility = () => setVisible((prev) => !prev);

    const icon = visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />;
    const ariaLabel = visible ? "Hide password" : "Show password";

    const toggleButton = (
        <button
            type="button"
            onClick={toggleVisibility}
            aria-label={ariaLabel}
            className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-md transition-colors ${theme === "dark"
                ? "text-slate-400 hover:text-slate-200 hover:bg-slate-600"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                } ${buttonClassName}`}
        >
            {icon}
        </button>
    );

    return { inputType: visible ? "text" : "password", toggleButton, visible };
};

export default usePasswordToggle;