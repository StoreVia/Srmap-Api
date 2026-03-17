"use client";
import * as React from "react";
import { cn } from "@/fullStackUtils/utils/functions";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  animated?: boolean;
  onValueChange?: (value: string) => void;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label = "Input",
      animated = false,
      value,
      onValueChange,
      placeholder,
      ...props
    },
    ref
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [isFocused, setIsFocused] = React.useState(false);
    const [showPlaceholder, setShowPlaceholder] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState(value ?? "");

    const stringValue =
      typeof internalValue === "string"
        ? internalValue
        : Array.isArray(internalValue)
        ? internalValue.join(", ")
        : internalValue?.toString() ?? "";

    const isActive = isFocused || stringValue.length > 0;
    const inputId = label ? label.toLowerCase().replace(/\s+/g, "-") : "input";

    React.useEffect(() => {
      setInternalValue(value ?? "");
    }, [value]);

    React.useEffect(() => {
      if (isActive) {
        const timer = setTimeout(() => {
          setShowPlaceholder(true);
        }, label ? label.length * 40 + 100 : 300);
        return () => clearTimeout(timer);
      } else {
        setShowPlaceholder(false);
      }
    }, [isActive, label]);

    React.useEffect(() => {
      const node = inputRef.current;
      if (!node) return;

      const observer = new MutationObserver(() => {
        if (node.value !== internalValue) {
          setInternalValue(node.value);
          onValueChange?.(node.value);
        }
      });

      observer.observe(node, {
        attributes: true,
        attributeFilter: ["value"],
      });

      return () => observer.disconnect();
    }, [internalValue, onValueChange]);

    if (!animated) {
      return (
        <input
          ref={(el) => {
            inputRef.current = el;
            if (typeof ref === "function") ref(el);
            else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = el;
          }}
          type={type}
          value={internalValue}
          onChange={(e) => {
            setInternalValue(e.target.value);
            onValueChange?.(e.target.value);
          }}
          placeholder={placeholder}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-xs placeholder:text-muted-foreground text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus-visible:ring-blue-500 autofill:!bg-transparent",
            className
          )}
          {...props}
        />
      );
    }

    return (
      <div className="relative">
        <div
          className={cn(
            "relative rounded-md border transition-all duration-200",
            isFocused
              ? "border-blue-500 shadow-sm"
              : "border-gray-300 dark:border-gray-700",
            "hover:border-gray-400 dark:hover:border-gray-600",
            "bg-white dark:bg-gray-900"
          )}
        >
          <input
            id={inputId}
            ref={(el) => {
              inputRef.current = el;
              if (typeof ref === "function") ref(el);
              else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = el;
            }}
            type={type}
            value={internalValue}
            onChange={(e) => {
              setInternalValue(e.target.value);
              onValueChange?.(e.target.value);
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={showPlaceholder ? placeholder : ""}
            className={cn(
              "w-full bg-transparent border-0 text-gray-900 dark:text-gray-100 text-base px-4 pt-6 pb-2 focus:outline-none rounded-md placeholder:text-xs placeholder:text-gray-400 dark:placeholder:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50 autofill:!bg-transparent",
              className
            )}
            {...props}
          />
          {label && (
            <label
              htmlFor={inputId}
              className={cn(
                "absolute left-4 pointer-events-none flex transition-all duration-200",
                isActive ? "top-1.5" : "top-1/2 -translate-y-1/2"
              )}
            >
              {label.split("").map((char, i) => (
                <span
                  key={i}
                  style={{ transitionDelay: isActive ? `${i * 40}ms` : "0ms" }}
                  className={cn(
                    "inline-block min-w-[2px] transition-all duration-300 ease-out",
                    isActive
                      ? "text-blue-500 text-xs font-medium"
                      : "text-gray-500 dark:text-gray-400 text-sm"
                  )}
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </label>
          )}
        </div>
      </div>
    );
  }
);

Input.displayName = "Input";