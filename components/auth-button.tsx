"use client"

import { Button } from "@/components/ui/button"
import { signIn, signOut, useSession } from "next-auth/react"
import { LogInIcon, LogOutIcon } from "lucide-react"

export function AuthButton() {
  const { data: session } = useSession()

  if (session) {
    return (
      <Button variant="ghost" size="sm" onClick={() => signOut()} className="gap-2">
        <LogOutIcon className="h-4 w-4" />
        Sign Out
      </Button>
    )
  }

  return (
    <Button variant="ghost" size="sm" onClick={() => signIn("google")} className="gap-2">
      <LogInIcon className="h-4 w-4" />
      Sign In
    </Button>
  )
}

