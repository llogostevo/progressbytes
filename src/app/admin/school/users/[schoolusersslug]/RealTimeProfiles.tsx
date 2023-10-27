"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo } from "react"

interface Profile {
  profileid: string;
  email: string;
  profiletype: 'Admin' | 'Teacher' | 'Student';
  admin: boolean;
  firstname: string;
  lastname: string;
}

interface RealTimeProfilesProps {
  schoolProfiles: Profile[];
}

export default function RealTimeProfiles({ schoolProfiles }: RealTimeProfilesProps) {
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

  const sortedProfiles = useMemo(() => {
    if (!schoolProfiles) return [];

    const order = { Admin: 1, Teacher: 2, Student: 3 };  // Define sorting order for profile types

    return [...schoolProfiles].sort((a, b) => {
      if (order[a.profiletype] !== order[b.profiletype]) {
        return order[a.profiletype] - order[b.profiletype];  // Sort by profile type first
      }
      if (a.firstname && b.firstname && a.firstname !== b.firstname) {
        return a.firstname.localeCompare(b.firstname);  // Then sort by first name if defined
      }
      if (a.lastname && b.lastname) {
        return a.lastname.localeCompare(b.lastname);  // Finally sort by last name if defined
      }
      return 0;  // Return 0 if either first name or last name are undefined to keep the order unchanged
    });
  }, [schoolProfiles]);



  return (
    <div>
      <h1 className="text-4xl font-semibold mb-4">School Profiles</h1>
      <table className="min-w-full bg-white">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="py-2 px-4 text-left">Email</th>
            <th className="py-2 px-4 text-left">Profile Type</th>
            <th className="py-2 px-4 text-left">Admin</th>
            <th className="py-2 px-4 text-left">Type</th>
            <th className="py-2 px-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody className="text-gray-700">
          {sortedProfiles && sortedProfiles.length > 0 ? (
            sortedProfiles.map((profile: any) => (
              <tr key={profile.profileid} className="border-b border-gray-200">
                <td className="py-2 px-4">{profile.email}</td>
                <td className="py-2 px-4">{profile.profiletype}</td>
                <td className="py-2 px-4">{profile.admin ? 'Yes' : 'No'}</td>
                <td className="py-2 px-4">{profile.profiletype}</td>
                {/* following provides the actions column */}
                <td className="flex flex-col justify-center items-center py-2 px-4">
                  <Link className="block text-center mb-1 text-green-900 hover:text-green-500" href="/view-route">View</Link>
                  <Link className="block text-center mb-1 text-yellow-900 hover:text-yellow-500" href="/edit-route">Edit</Link>
                  <Link className="block text-center mb-1 text-red-900 hover:text-red-500" href="/delete-route">Delete</Link>
                  {(((profile.profiletype === 'Student') || profile.profiletype === 'student')) && (
                    <Link className="block text-center mt-1 text-blue-900 hover:text-blue-500" href="/enrollments-route">Enrollments</Link>
                  )}
                </td>
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
