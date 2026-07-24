"use client";

import type { FieldError, UseFormRegisterReturn } from "react-hook-form";
import { cn } from "@/lib/utils";

interface BaseProps {
  label: string;
  error?: FieldError;
  hint?: string;
}

export function Field({
  label,
  error,
  hint,
  registration,
  ...props
}: BaseProps & React.InputHTMLAttributes<HTMLInputElement> & { registration: UseFormRegisterReturn }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      {label}
      <input
        className={cn(
          "h-11 rounded-xl border bg-white px-3 font-normal outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
          error ? "border-red-400" : "border-slate-200",
        )}
        {...registration}
        {...props}
      />
      {hint && !error && <span className="text-xs font-normal text-slate-500">{hint}</span>}
      {error && <span className="text-xs font-normal text-red-600">{error.message}</span>}
    </label>
  );
}

export function TextareaField({
  label,
  error,
  registration,
  ...props
}: BaseProps &
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { registration: UseFormRegisterReturn }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      {label}
      <textarea
        className={cn(
          "min-h-24 resize-y rounded-xl border bg-white px-3 py-2 font-normal outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
          error ? "border-red-400" : "border-slate-200",
        )}
        {...registration}
        {...props}
      />
      {error && <span className="text-xs font-normal text-red-600">{error.message}</span>}
    </label>
  );
}

export function SelectField({
  label,
  error,
  registration,
  children,
}: BaseProps & { registration: UseFormRegisterReturn; children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      {label}
      <select
        className={cn(
          "h-11 rounded-xl border bg-white px-3 font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
          error ? "border-red-400" : "border-slate-200",
        )}
        {...registration}
      >
        {children}
      </select>
      {error && <span className="text-xs font-normal text-red-600">{error.message}</span>}
    </label>
  );
}
