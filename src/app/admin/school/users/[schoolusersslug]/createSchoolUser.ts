import { createClient } from '@supabase/supabase-js'
import 'server-only'
// used to create a new user within the DB
export default async function createSchoolUser({
      userEmail,
        password,
        firstname,
        lastname,
        type
            }: {
              userEmail: string;
              password: string;
              
              firstname: string;
              lastname: string;
              type: string;
              }, schoolid: number) {

const supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const service_role_key = process.env.SERVICE_ROLE_KEY as string;


  

const supabase = createClient(supabase_url, service_role_key, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Access auth admin api
const adminAuthClient = supabase.auth.admin

  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email: `${userEmail}`,
    password: `${password}`,
    user_metadata: {
    schoolid: `${schoolid}`,
    firstname: `${firstname}`,
    lastname: `${lastname}`,
    type: `${type}`
    },
    email_confirm: true
  })
  return ({

  })

}