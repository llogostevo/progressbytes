"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function RealTimeSubTopics({ subtopics }: { subtopics: any }) {
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    const channel = supabase.channel('realtime subtopics').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'subtopictable'
    }, () => {
      router.refresh()
    }
    )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    };
  }), [supabase, router]
  return (
    <>
      {subtopics?.map((subtopic: any) => (
        <tr key={subtopic.subtopicid}>
          <td className="px-6 py-4 text-center whitespace-nowrap">{subtopic.subtopicnumber}</td>
          <td className="px-6 py-4 max-w-xs overflow-hidden overflow-ellipsis">{subtopic.subtopictitle}</td>
          <td className="px-6 py-4 max-w-xs overflow-hidden overflow-ellipsis">{subtopic.subtopicdescription}</td>
          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <div className="flex flex-col items-right space-y-4">
              <Link
                href="#"
                className="text-red-600 hover:cursor-pointer hover:text-indigo-900"
              >
                Edit
              </Link>
              <Link
                href="#"
                className="text-red-600 hover:cursor-pointer hover:text-indigo-900"
              >
                Delete
              </Link>
            </div>
          </td>
        </tr>
      ))}
    </>
  )
}
