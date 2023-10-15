"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function RealTimeTopics({ topics }: { topics: any }) {
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    const channel = supabase.channel('realtime topics').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'topictable'
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
        {topics?.map((topic: any) => (
          <tr key={topic.topicid}>
            <td className="px-6 py-4 text-center whitespace-nowrap">{topic.topicnumber}</td>
            <td className="px-6 py-4 max-w-xs overflow-hidden overflow-ellipsis">{topic.topictitle}</td>
            <td className="px-6 py-4 max-w-xs overflow-hidden overflow-ellipsis">{topic.topicdescription}</td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <Link
                href={`${topic.unitid}/${topic.topicid}`}
                className="text-indigo-600 hover:text-indigo-900"
              >
                View
              </Link>
            </td>
          </tr>
        ))}
    </>
  )
}
