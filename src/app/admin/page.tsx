import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

// Currently this is not in use, I am directing straight to the school page so that I can access this. 
// possibly this might be used in the future. 

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
        <h1 className="text-5xl font-bold mb-10">Admin</h1>
        {/* Academic Structure Section */}
        <div className="mb-10">
          <div className="grid md:grid-cols-3 gap-8">
            {/* School Sub-section */}
            <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col justify-between">
              <h3 className="text-3xl font-semibold mb-4">School</h3>
              <p className="text-gray-700">Manage School Data</p>
              {user && (
                <Link 
                  href="/admin/school" 
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