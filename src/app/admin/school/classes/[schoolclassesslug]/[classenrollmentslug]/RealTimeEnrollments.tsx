"use client"

import DeleteRecord from "@/components/DeleteRecord"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { PostgrestError } from "@supabase/supabase-js"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

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
  const [studentCount, setStudentCount] = useState<number | null>(null);

  useEffect(() => {
    setStudentCount(enrollments?.length || 0);

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

  // Sorting the enrollments by first or last name
  const [sortOption, setSortOption] = useState('firstname');  // New state for the selected sort option

  // Sort enrollments based on the selected sort option
  const sortedEnrollments = [...enrollments].sort((a, b) =>
    sortOption === 'firstname'
      ? a.student.firstname.localeCompare(b.student.firstname)
      : a.student.lastname.localeCompare(b.student.lastname)
  );


  return (
    <div>
      {/* Sorting options */}
      <div className="mb-4">
        Sort by:
        <button
          className={`ml-2  px-1 border border-primaryColor rounded ${sortOption === 'firstname' ? 'bg-primaryColor text-white' : ''}`}
          onClick={() => setSortOption('firstname')}
        >
          First Name
        </button>
        <button
          className={`ml-2 px-1 border border-primaryColor rounded ${sortOption === 'lastname' ? 'bg-primaryColor text-white' : ''}`}
          onClick={() => setSortOption('lastname')}
        >
          Last Name
        </button>

      </div>

      <div className="bg-primaryColor text-white p-2 inline-block mt-4 mb-4">
        Student Count: <span className="font-bold">{studentCount}</span>
      </div>

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
          {sortedEnrollments?.map((enrolled: any) => (
            <tr key={enrolled.studentid}>
              <td className="py-2 px-4 border-b">{enrolled.student.firstname} {enrolled.student.lastname}</td>
              <td className="py-2 text-center px-4 border-b">{enrolled.course.subjectname} - {enrolled.course.level} {enrolled.course.exmaboard}</td>
              <td className="py-2 text-center px-4 border-b">{formatDateUK(enrolled.startdate)}</td>
              <td className="py-2 text-center px-4 border-b">{formatDateUK(enrolled.enddate)}</td>
              <td className="py-2 text-center px-4 border-b">{enrolled.offroll ? 'Yes' : 'No'}</td>

              <td className="py-2 text-center px-4 border-b">
                <Link
                  href="#"
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
                  recordIdName='enrollmentid'
                  recordIdValue={enrolled.enrollmentid}
                  tableName='enrollmenttable'
                  onDelete={(error) => {
                    if (error) {
                      alert('Deletion failed: ' + error.message);
                    } else {
                      alert('Deletion successful');
                    }
                  }}
                />

              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  )
}
