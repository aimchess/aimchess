'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { LogOut, User, BookOpen, Shield } from 'lucide-react'
import { cn } from "@/lib/utils" // Assuming you have a cn utility, otherwise use template literals

interface AuthNavProps {
  isMobile?: boolean;
  className?: string;
}

export function AuthNav({ isMobile = false, className }: AuthNavProps) {
  const { data: session, status } = useSession()

  // Base classes for the container
  const containerClass = cn(
    "flex items-center gap-2",
    isMobile ? "flex-col w-full items-stretch gap-3 pt-4 border-t border-gray-100" : "",
    className
  );

  // Button variant/class adjustments for mobile
  const btnClass = isMobile ? "w-full justify-start" : "flex items-center gap-2";
  const textClass = isMobile ? "inline" : "hidden sm:inline";

  if (status === 'loading') {
    return <div className="w-20 h-8 bg-gray-200 animate-pulse rounded"></div>
  }

  if (session) {
    return (
      <div className={containerClass}>
        <div className={cn("flex items-center gap-2 px-2", isMobile && "mb-2 justify-start")}>
          <User className="h-4 w-4 text-gray-600" />
          <span className="text-sm text-gray-700">
            {session.user.name || session.user.email}
          </span>
        </div>

        <Link href="/learn" className={isMobile ? "w-full" : ""}>
          <Button variant="ghost" size="sm" className={btnClass}>
            <BookOpen className="h-4 w-4 mr-2" />
            <span className={textClass}>Learn</span>
          </Button>
        </Link>
        
        {session.user.role === 'ADMIN' && (
          <Link href="/admin" className={isMobile ? "w-full" : ""}>
            <Button variant="ghost" size="sm" className={btnClass}>
              <Shield className="h-4 w-4 mr-2" />
              <span className={textClass}>Admin</span>
            </Button>
          </Link>
        )}

        {session.user.role === 'COACH' && (
          <Link href="/coach" className={isMobile ? "w-full" : ""}>
            <Button variant="ghost" size="sm" className={btnClass}>
              <Shield className="h-4 w-4 mr-2" />
              <span className={textClass}>COACH</span>
            </Button>
          </Link>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => signOut({ callbackUrl: '/' })}
          className={btnClass}
        >
          <LogOut className="h-4 w-4 mr-2" />
          <span className={textClass}>Sign Out</span>
        </Button>
      </div>
    )
  }

  return (
    <div className={containerClass}>
      <Link href="/learn" className={isMobile ? "w-full" : ""}>
        <Button variant="ghost" size="sm" className={btnClass}>
          <BookOpen className="h-4 w-4 mr-2" />
          <span className={textClass}>Learn</span>
        </Button>
      </Link>
      
      <Link href="/auth/signin" className={isMobile ? "w-full" : ""}>
        <Button variant="outline" size="sm" className={isMobile ? "w-full" : ""}>
          Sign In
        </Button>
      </Link>
      
      <Link href="/auth/signup" className={isMobile ? "w-full" : ""}>
        <Button size="sm" className={`bg-[#769656] hover:bg-[#5C1F1C] ${isMobile ? "w-full" : ""}`}>
          Sign Up
        </Button>
      </Link>
    </div>
  )
}