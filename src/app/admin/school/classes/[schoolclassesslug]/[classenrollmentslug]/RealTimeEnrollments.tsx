"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

// function to convert to uk format for date
function formatDateUK(dateString: string): string {
  if (!dateString) {
    return "";  // or return an empty string "" if you prefer
}
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero indexed, so we add 1
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}


export default function RealTimeEnrollments({ enrollments }: { enrollments: any }) {
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    const channel = supabase.channel('realtime enrollments').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'enrollmenttable'
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
    <div>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Student</th>
            <th className="py-2 px-4 border-b">Course</th>
            <th className="py-2 px-4 border-b">Start Date</th>
            <th className="py-2 px-4 border-b">End Date</th>
            <th className="py-2 px-4 border-b">Off Roll</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {enrollments?.map((enrolled: any) => (
            <tr key={enrolled.studentid}>
              <td className="py-2 px-4 border-b">{enrolled.student.firstname} {enrolled.student.lastname}</td>
              <td className="py-2 text-center px-4 border-b">{enrolled.course.subjectname} - {enrolled.course.level} {enrolled.course.exmaboard}</td>
              <td className="py-2 text-center px-4 border-b">{formatDateUK(enrolled.startdate)}</td>
              <td className="py-2 text-center px-4 border-b">{formatDateUK(enrolled.enddate)}</td>
              <td className="py-2 text-center px-4 border-b">{enrolled.offroll ? 'Yes' : 'No'}</td>

              <td className="py-2 text-center px-4 border-b">
                <Link
                  href={`#`}
                  className="mx-2 inline-block border border-primaryColor hover:bg-primaryColor hover:text-white hover:border-white text-primaryColor rounded px-4 py-2 transition duration-200"
                >
                  Edit
                </Link>
                <Link
                  href={`#`}
                  className="mx-2 inline-block border border-secondaryColor hover:bg-secondaryColor hover:text-white hover:border-white text-secondaryColor rounded px-4 py-2 transition duration-200"
                >
                  Delete
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  )
}
