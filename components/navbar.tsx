import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MicIcon, BookIcon, BarChart2Icon } from "lucide-react"
import { UserButton } from "@/components/user-button"

export default function Navbar() {
  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold">
            VoiceJournal
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/record" className="text-sm font-medium transition-colors hover:text-primary">
              Record
            </Link>
            <Link href="/journal" className="text-sm font-medium transition-colors hover:text-primary">
              Journal
            </Link>
            <Link href="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
              Dashboard
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex gap-2">
            <Link href="/record">
              <Button variant="outline" size="sm">
                <MicIcon className="h-4 w-4 mr-2" />
                Record
              </Button>
            </Link>
            <Link href="/journal">
              <Button variant="outline" size="sm">
                <BookIcon className="h-4 w-4 mr-2" />
                Journal
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <BarChart2Icon className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
          </div>
          <UserButton />
        </div>
      </div>
    </header>
  )
}

