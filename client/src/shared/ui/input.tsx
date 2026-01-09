"use client";
import { ComponentProps, forwardRef, useState, MouseEvent } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputProps extends ComponentProps<"input"> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, type = "text", ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const isPasswordType = type === "password";

    const inputType = isPasswordType
      ? showPassword
        ? "text"
        : "password"
      : type;

    const togglePasswordVisibility = (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setShowPassword((prev) => !prev);
    };

    return (
      <div className="relative w-full">
        <label
          className={`absolute -top-2 left-3 z-10 px-1 text-xs font-medium bg-white transition-colors ${
            error ? "text-red-500" : "text-gray-500"
          }`}
        >
          {label}
        </label>

        <div className="relative">
          <input
            ref={ref}
            type={inputType}
            className={`
              w-full rounded-xl border px-4 py-3 outline-none transition-colors bg-transparent
              placeholder:text-gray-300
              ${error ? "border-red-500 text-red-900" : "border-gray-300 text-black focus:border-black"}
              ${isPasswordType ? "pr-10" : ""} 
              ${className}
            `}
            {...props}
          />

          {isPasswordType && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? (
                <EyeOff size={20} strokeWidth={1.5} />
              ) : (
                <Eye size={20} strokeWidth={1.5} />
              )}
            </button>
          )}
        </div>

        {error && (
          <span className="text-xs text-red-500 ml-1 mt-1 block">{error}</span>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
