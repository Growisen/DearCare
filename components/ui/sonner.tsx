"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
//import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  //const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme="light"
      className="toaster group"
      richColors
      expand={true}
      icons={{
        success: <CircleCheckIcon className="size-5 text-emerald-600 dark:text-emerald-400" />,
        info: <InfoIcon className="size-5 text-blue-600 dark:text-blue-400" />,
        warning: <TriangleAlertIcon className="size-5 text-amber-600 dark:text-amber-400" />,
        error: <OctagonXIcon className="size-5 text-red-600 dark:text-red-400" />,
        loading: <Loader2Icon className="size-5 animate-spin text-zinc-500" />,
      }}
      toastOptions={{
        classNames: {
          toast: `
            group toast group-[.toaster]:bg-white group-[.toaster]:text-zinc-950 group-[.toaster]:border-zinc-200 group-[.toaster]:shadow-lg
            dark:group-[.toaster]:bg-zinc-950 dark:group-[.toaster]:text-zinc-50 dark:group-[.toaster]:border-zinc-800
            border-l-4 border rounded-sm
          `,
          
          description: "group-[.toast]:text-zinc-500 dark:group-[.toast]:text-zinc-400",
          actionButton: "group-[.toast]:bg-zinc-900 group-[.toast]:text-zinc-50 dark:group-[.toast]:bg-zinc-50 dark:group-[.toast]:text-zinc-900",
          cancelButton: "group-[.toast]:bg-zinc-100 group-[.toast]:text-zinc-500 dark:group-[.toast]:bg-zinc-800 dark:group-[.toast]:text-zinc-400",
          

          success: `
            group-data-[type=success]:bg-emerald-50 group-data-[type=success]:text-emerald-900 group-data-[type=success]:border-l-emerald-500 group-data-[type=success]:border-emerald-200
            dark:group-data-[type=success]:bg-emerald-950/30 dark:group-data-[type=success]:text-emerald-50 dark:group-data-[type=success]:border-l-emerald-500 dark:group-data-[type=success]:border-emerald-900
          `,

          error: `
            group-data-[type=error]:bg-red-50 group-data-[type=error]:text-red-900 group-data-[type=error]:border-l-red-500 group-data-[type=error]:border-red-200
            dark:group-data-[type=error]:bg-red-950/30 dark:group-data-[type=error]:text-red-50 dark:group-data-[type=error]:border-l-red-500 dark:group-data-[type=error]:border-red-900
          `,

          warning: `
            group-data-[type=warning]:bg-amber-50 group-data-[type=warning]:text-amber-900 group-data-[type=warning]:border-l-amber-500 group-data-[type=warning]:border-amber-200
            dark:group-data-[type=warning]:bg-amber-950/30 dark:group-data-[type=warning]:text-amber-50 dark:group-data-[type=warning]:border-l-amber-500 dark:group-data-[type=warning]:border-amber-900
          `,

          info: `
            group-data-[type=info]:bg-blue-50 group-data-[type=info]:text-blue-900 group-data-[type=info]:border-l-blue-500 group-data-[type=info]:border-blue-200
            dark:group-data-[type=info]:bg-blue-950/30 dark:group-data-[type=info]:text-blue-50 dark:group-data-[type=info]:border-l-blue-500 dark:group-data-[type=info]:border-blue-900
          `,
        },
      }}
      {...props}
    />
  )
}

export { Toaster }