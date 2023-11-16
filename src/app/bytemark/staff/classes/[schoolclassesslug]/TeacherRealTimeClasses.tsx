"use client"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function TeacherRealTimeClasses({ classes }: { classes: any }) {
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    const channel = supabase.channel('realtime classes').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'classtable'
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {classes?.map((schoolclass: any) => (
          <div key={schoolclass.classid} className="bg-white p-6 rounded-lg shadow-lg flex flex-col justify-between">
            <h3 className="text-2xl font-semibold mb-4">{schoolclass.classname}</h3>
            <p className="">{schoolclass.classid}</p>
            <div className="mt-10 flex flex-col gap-4 text-center">
              <div className="flex">
                <Link
                  href={`${schoolclass.schoolid}/${decodeURIComponent(schoolclass.classid)}`}
                  className="flex-grow inline-block border border-primaryColor hover:bg-primaryColor hover:text-white hover:border-white text-primaryColor rounded px-4 py-2 transition duration-200"
                >
                  Overall Data
                </Link>
              </div>
              <div className="flex">
                <Link
                  href={`${schoolclass.schoolid}/assessdashboard/${decodeURIComponent(schoolclass.classid)}`}
                  className="flex-grow inline-block border border-primaryColor hover:bg-primaryColor hover:text-white hover:border-white text-primaryColor rounded px-4 py-2 transition duration-200"
                >
                  Assessment Dash v2
                </Link>
              </div>
              <div className="flex">
                <Link
                  href={`${schoolclass.schoolid}/assessmentdashboard/${decodeURIComponent(schoolclass.classid)}`}
                  className="flex-grow inline-block border border-primaryColor hover:bg-primaryColor hover:text-white hover:border-white text-primaryColor rounded px-4 py-2 transition duration-200"
                >
                  Assessment Dash v1
                </Link>
              </div>
              <div className="flex">
                <Link
                  href={`../learningchecklist/${decodeURIComponent(schoolclass.classid)}`}
                  className="flex-grow inline-block border border-primaryColor hover:bg-primaryColor hover:text-white hover:border-white text-primaryColor rounded px-4 py-2 transition duration-200"
                >
                  PLC Dashboard
                </Link>
              </div>
              <div className="flex">
                <Link
                  href={`../assessment/${decodeURIComponent(schoolclass.classid)}`}
                  className="flex-grow inline-block border border-tertiaryColor text-center hover:bg-tertiaryColor hover:text-white hover:border-white text-tertiaryColor rounded px-4 py-2 transition duration-200"
                >
                  Edit Assessments
                </Link></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
