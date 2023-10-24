"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function RealTimeProfiles({ schoolProfiles }: { schoolProfiles: any }) {
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    const channel = supabase.channel('realtime schprofiles').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'profilestable'
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
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="py-2 px-4 text-left">Email</th>
            <th className="py-2 px-4 text-left">Profile Type</th>
            <th className="py-2 px-4 text-left">Admin</th>
          </tr>
        </thead>
        <tbody className="text-gray-700">
          {schoolProfiles && schoolProfiles.length > 0 ? (
            schoolProfiles.map((profile: any) => (
              <tr key={profile.id} className="border-b border-gray-200">
                <td className="py-2 px-4">{profile.email}</td>
                <td className="py-2 px-4">{profile.profiletype}</td>
                <td className="py-2 px-4">{profile.admin ? 'Yes' : 'No'}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="py-2 px-4 text-center text-gray-500">No profiles available</td>
            </tr>
          )}
        </tbody>
      </table>

    </div>
  )
}
