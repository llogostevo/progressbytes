// TODO: Duplicate or move this file outside the `_examples` folder to make it a route

import RealTimeBlogs from '@/components/RealTimeBlogs'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function BlogPostsPage() {
  // Create a Supabase client configured to use cookies
  const supabase = createServerComponentClient({ cookies })

  // fetch data from database
  const { data: blogs } = await supabase.from('blogs').select(`
          blog_id,
          title,
          content,
          img_path,
          created_at,
          author_id,
          profiles(profile_id,
          first_name,
          last_name)
        `)

        const { data: profiles } = await supabase.from('profiles').select(`type`)

        const categories = profiles?.map((profile) =>{
          return(profile.type)
      })

  return (
  <>
  <div>
                <h2 className="text-xl font-bold mb-4">Filter by Role</h2>
                <div>
                    <div className="flex flex-row gap-4">
                        <div className="flex items-center">
                            <button className="px-2 py-1 text-xs bg-secondaryColor hover:bg-nonphotblue text-white rounded">
                                <Link href={`/blog/`}><span>All</span></Link>
                            </button>
                        </div>
                        {categories?.map((category) => {
                            return (
                                <div key={category} className="flex items-center">
                                    <button className="px-2 py-1 text-xs bg-primaryColor hover:bg-secondaryColor text-white rounded">
                                        <Link href={`/blog/categories/${category}`}><span>{category}</span></Link>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
  
  <RealTimeBlogs blogs={blogs} />
</>
)}