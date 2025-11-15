 "use client"

 import { useTheme } from "next-themes"
 import { Button } from "@/components/ui/button"
 import * as React from "react"
 
 export function ModeToggle() {
   const { theme, setTheme, resolvedTheme } = useTheme()
 
   const current = theme === "system" ? resolvedTheme : theme
   const isDark = current === "dark"
 
   return (
     <div className="flex items-center gap-2">
       <Button
         variant="outline"
         size="sm"
         onClick={() => setTheme(isDark ? "light" : "dark")}
       >
         {isDark ? "切换到浅色" : "切换到深色"}
       </Button>
     </div>
   )
 }


