"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function RealTimeUnits({units}:{units:any}) {
    const supabase = createClientComponentClient()
    const router = useRouter()

    useEffect(() => {
        const channel = supabase.channel('realtime units').on('postgres_changes', {
            event: '*', 
            schema: 'public',
            table: 'unittable'
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {units?.map((unit: any) => (
          <div key={unit.unitid} className="bg-white p-6 rounded-lg shadow-lg flex flex-col justify-between">
            <h3 className="text-2xl font-semibold mb-4">{unit.unitnumber}</h3>
            <h3 className="text-1xl font-semibold mb-4">{unit.unittitle}</h3>

            <Link
              href={`${unit.courseid}/${unit.unitid}`}
              className="inline-block border mt-10 border-primaryColor hover:bg-secondaryColor hover:text-white hover:border-white text-primaryColor rounded px-4 py-2 transition duration-200"
            >
              View
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
