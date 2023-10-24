import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'


export default async function Admin() {

  // check logged in as teacher
    // get assessment data
    // graphs for each topic
    // Create a Supabase client configured to use cookies
    const supabase = createServerComponentClient({ cookies })

    // get the users sessions
    const { data: { user } } = await supabase.auth.getUser()

    // check if user is logged in and redirect to page if they are not
    if (!user) {
        redirect("/")
    }

    // check if profile exists in DB
    const { data: profile, error: profileError } = await supabase
        .from('profilestable')
        .select('*')
        .eq('profileid', user.id)

        console.log(profile)

    // check if profile exists in DB, if not redirect to unauthorised
    if (!profile || profile.length === 0) {
        redirect("/unauthorised")
    }

    // if not at the correct role i.e. admin then redirect to the unauthorised page
    if (profile[0].admin==false) {
      redirect("/unauthorised")
  }

    return (
        <main>
      <section className="p-10">
        <h1 className="text-5xl font-bold mb-10">Admin Area</h1>

        {/* User Management Section */}
        <div className="mb-10">
          <h2 className="text-4xl font-semibold mb-6">User Management</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Profiles Sub-section */}
            <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col justify-between">
              <h3 className="text-3xl font-semibold mb-4">Profiles</h3>
              <p className="text-gray-700">Manage profiles</p>
              {user && (
                <Link 
                  href="/admin/profiles" 
                  className="inline-block border mt-10 border-primaryColor hover:bg-secondaryColor hover:text-white hover:border-white text-primaryColor rounded px-4 py-2 transition duration-200"
                >
                  Manage
                </Link>
              )}
            </div>

            {/* Students Sub-section */}
            <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col justify-between">
              <h3 className="text-3xl font-semibold mb-4">Students</h3>
              <p className="text-gray-700">Manage students</p>
              {user && (
                <Link 
                  href="/admin/students" 
                  className="inline-block border mt-10 border-primaryColor hover:bg-secondaryColor hover:text-white hover:border-white text-primaryColor rounded px-4 py-2 transition duration-200"
                >
                  Manage
                </Link>
              )}
            </div>
            {/* Teachers Sub-section */}
            <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col justify-between">
              <h3 className="text-3xl font-semibold mb-4">Teachers</h3>
              <p className="text-gray-700">Manage teachers</p>
              {user && (
                <Link 
                  href="/admin/teachers" 
                  className="inline-block border mt-10 border-primaryColor hover:bg-secondaryColor hover:text-white hover:border-white text-primaryColor rounded px-4 py-2 transition duration-200"
                >
                  Manage
                </Link>
              )}
            </div>          </div>
        </div>
        
        {/* Academic Structure Section */}
        <div className="mb-10">
          <h2 className="text-4xl font-semibold mb-6">Academic Structure</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* School Sub-section */}
            <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col justify-between">
              <h3 className="text-3xl font-semibold mb-4">School</h3>
              <p className="text-gray-700">Manage school units, topics and subtopics</p>
              {user && (
                <Link 
                  href="/admin/school" 
                  className="inline-block border mt-10 border-primaryColor hover:bg-secondaryColor hover:text-white hover:border-white text-primaryColor rounded px-4 py-2 transition duration-200"
                >
                  Manage
                </Link>
              )}
            </div>

            {/* Classes Sub-section */}
            <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col justify-between">
              <h3 className="text-3xl font-semibold mb-4">Classes</h3>
              <p className="text-gray-700">Manage classes</p>
              {user && (
                <Link 
                  href="/admin/classes" 
                  className="inline-block border mt-10 border-primaryColor hover:bg-secondaryColor hover:text-white hover:border-white text-primaryColor rounded px-4 py-2 transition duration-200"
                >
                  Manage
                </Link>
              )}
            </div>
          </div>
        </div>
        
        {/* Enrollment Management Section */}
        <div>
          <h2 className="text-4xl font-semibold mb-6">Enrollment Management</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Enrollment to Courses Sub-section */}
            <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col justify-between">
              <h3 className="text-3xl font-semibold mb-4">Enroll to Courses</h3>
              <p className="text-gray-700">Manage enrollment to courses</p>
              {user && (
                <Link 
                  href="/admin/enroll" 
                  className="inline-block border mt-10 border-primaryColor hover:bg-secondaryColor hover:text-white hover:border-white text-primaryColor rounded px-4 py-2 transition duration-200"
                >
                  Manage
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
      )
    }