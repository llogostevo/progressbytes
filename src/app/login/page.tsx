import { redirect } from 'next/navigation';
import Messages from './messages'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export default async function Login() {

  // Create a Supabase client configured to use cookies
  const supabase = createServerComponentClient({ cookies })

  // get the users sessions
  const { data: { user } } = await supabase.auth.getUser()

  // check if user is logged in and redirect to page if they are not
  if (user) {
    // FIND OUT THE STUDENT ID OF THE LOGGED IN PROFILE
    const { data: profilesData, error: profilesDataError } = await supabase
      .from('profilestable')
      .select(`
        profileid, 
        studenttable(
            profileid,
            firstname,
            studentid
            )
    `)
      .eq('profileid', user.id);


    const { data: teacherData, error: teacherDataError } = await supabase
      .from('profilestable')
      .select(`
        profileid, 
        teachertable(
            profileid,
            teacherid
            )
    `)
      .eq('profileid', user.id);

    if (
      profilesData &&
      profilesData.length > 0 &&
      profilesData[0].studenttable &&
      profilesData[0].studenttable.length > 0 &&
      profilesData[0].studenttable[0].studentid
    ) {
      redirect("/learningchecklist");

    } else if (
      teacherData &&
      teacherData.length > 0 &&
      teacherData[0].teachertable &&
      teacherData[0].teachertable.length > 0 &&
      teacherData[0].teachertable[0].teacherid
    ) {

      redirect("/dashboard");
    } else {

      redirect("/admin");
    }
  }
  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
      <form
        className="flex-1 flex flex-col w-full justify-center gap-2 text-foreground"
        action="/auth/sign-in"
        method="post"
      >
        <label className="text-md" htmlFor="email">
          Email
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border mb-6"
          name="email"
          placeholder="you@example.com"
          required
        />
        <label className="text-md" htmlFor="password">
          Password
        </label>
        <input
          className="rounded-md px-4 py-2 bg-inherit border mb-6"
          type="password"
          name="password"
          placeholder="••••••••"
          required
        />
        <button className="bg-green-700 rounded px-4 py-2 text-white mb-2">
          Sign In
        </button>

        <Messages />
      </form>
    </div>
  )
}
