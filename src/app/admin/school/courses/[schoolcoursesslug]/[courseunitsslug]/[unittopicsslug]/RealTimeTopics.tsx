"use client"

import DeleteRecord from "@/components/DeleteRecord"
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
                className="m-2 inline-block border border-primaryColor text-center hover:bg-primaryColor hover:text-white hover:border-white text-primaryColor rounded px-4 py-2 transition duration-200"

              >
                View
              </Link>
              <Link
                href="#"
                className="m-2 inline-block border border-tertiaryColor text-center hover:bg-tertiaryColor hover:text-white hover:border-white text-tertiaryColor rounded px-4 py-2 transition duration-200"
              >
                Edit
              </Link>
              <DeleteRecord
                  recordIdName='topicid'
                  recordIdValue={topic.topicid} 
                  tableName='topictable'
                  onDelete={(error) => { 
                    if (error) {
                      alert('Deletion failed: ' + error.message);
                    } else {
                      alert('Deletion successful: Note any children related data will be deleted, related data will not delete if a many to many');
                    }
                  }}
                />
            </td>
          </tr>
        ))}
    </>
  )
}
