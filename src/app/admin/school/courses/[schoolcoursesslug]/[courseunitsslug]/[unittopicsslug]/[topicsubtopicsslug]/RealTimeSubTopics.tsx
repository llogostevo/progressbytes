"use client"

import DeleteRecord from "@/components/DeleteRecord"
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
                className="m-2 inline-block border border-tertiaryColor text-center hover:bg-tertiaryColor hover:text-white hover:border-white text-tertiaryColor rounded px-4 py-2 transition duration-200"
              >
                Edit
              </Link>
              <DeleteRecord
                  recordIdName='subtopicid'
                  recordIdValue={subtopic.subtopicid} 
                  tableName='subtopictable'
                  onDelete={(error) => { 
                    if (error) {
                      alert('Deletion failed: ' + error.message);
                    } else {
                      alert('Deletion successful: Note any children related data will be deleted, related data will not delete if a many to many');
                    }
                  }}
                />
            </div>
          </td>
        </tr>
      ))}
    </>
  )
}
