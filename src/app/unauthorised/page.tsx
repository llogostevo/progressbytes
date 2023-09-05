import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import Link from "next/link"

export default function unauthorised() {
    
      

  return (
    <div>
    <div>You do not have authorisation to see this page</div>
    <Link className="py-2 px-4 mt-10 rounded-md no-underline text-foreground bg-btn-background hover:bg-btn-background-hover flex items-center group" href="/">
      <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>{' '}Return to Home</Link>
    </div>
  )
}
