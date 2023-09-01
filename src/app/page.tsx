import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link'
import LogoutButton from '../components/LogoutButton'
import SupabaseLogo from '../components/SupabaseLogo'
import NextJsLogo from '../components/NextJsLogo'
import Logo from '../components/Logo'
import { usersCheck } from '@/lib/users'
import JoinNow from '@/components/JoinNow'
import BlogBytes from '@/components/BlogBytes'

export const dynamic = 'force-dynamic'


export default async function Home() {

  const user = await usersCheck();

  return (
    <main>

      {/* PRODUCT SECTION */}
      <section className="">
        <div className="flex flex-col justify-center items-center py-10">
          <h1 className="text-5xl md:self-start font-bold mb-10">Welcome to <Logo logoClasses="" /></h1>

          <div className="grid md:grid-cols-3 gap-8">

            {/* ByteGrade Card */}
            <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col justify-between">
              <h2 className="text-3xl font-semibold mb-4">ByteMark</h2>
              <p className="text-gray-700">
                Track marks to questions to see progress.
              </p>
              {user && (
                <Link className="inline-block border mt-10 border-primaryColor hover:bg-secondaryColor hover:text-white hover:border-white text-primaryColor rounded px-4 py-2 transition duration-200" href="/questions">ByteMark</Link>
              )}

            </div>

            {/* ByteTrack Card */}
            <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col justify-between">
              <h2 className="text-3xl font-semibold mb-4">ByteTrack</h2>
              <p className="text-gray-700">
                Track the topics you study and rate your understanding to monitor your progress.
              </p>
              {user && (

                <Link className="inline-block border border-primaryColor hover:bg-secondaryColor hover:text-white hover:border-white text-primaryColor rounded px-4 py-2 transition duration-200" href="/questions">ByteTrack</Link>
              )}



            </div>

            {/* ByteNow Card */}
            <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col justify-between">
              <h2 className="text-3xl font-semibold mb-4">ByteNow</h2>
              <p className="text-gray-700">
                Randomised questions based on your ByteGrade and ByteTrack to provide you with spaced repetition.
              </p>
              {user && (

                <Link className="inline-block border mt-10 border-primaryColor hover:bg-secondaryColor hover:text-white hover:border-white text-primaryColor rounded px-4 py-2 transition duration-200" href="/questions">ByteNow</Link>
              )}
            </div>

          </div>
        </div>

        <div className="flex flex-cols gap-3">
          <JoinNow />
          <BlogBytes />
        </div>

      </section>


    </main>
  )
}
