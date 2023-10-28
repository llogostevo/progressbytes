"use client"

import DeleteRecord from "@/components/DeleteRecord"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function RealTimeCourses({courses}:{courses:any}) {
    const supabase = createClientComponentClient()
    const router = useRouter()

    useEffect(() => {
        const channel = supabase.channel('realtime courses').on('postgres_changes', {
            event: '*', 
            schema: 'public',
            table: 'coursetable'
        }, ()=> {
            router.refresh()
        }
        )
        .subscribe()

        return() => {
            supabase.removeChannel(channel)
        };
    }), [supabase, router]
  return (
    <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {courses?.map((course: any) => (
          <div key={course.courseid} className="bg-white p-6 rounded-lg shadow-lg flex flex-col justify-between">
            <h3 className="text-2xl font-semibold mb-4">{course.level}: {course.subjectname}</h3>
            <h3 className="text-1xl font-semibold mb-4">{course.examboard} {course.level}</h3>

              <Link
                href={`${course.schoolid}/${course.courseid}`}
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
                  recordIdName='courseid'
                  recordIdValue={course.courseid} 
                  tableName='coursetable'
                  onDelete={(error) => { 
                    if (error) {
                      alert('Deletion failed: ' + error.message);
                    } else {
                      alert('Deletion successful: Note any children related data will be deleted, related data will not delete if a many to many');
                    }
                  }}
                />
          </div>
        ))}
      </div>
    </div>
  )
}
