'use client'

// TODO: Duplicate or move this file outside the `_examples` folder to make it a route

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'


export default function Comments({ blogId }: { blogId: number }) {
  const [comments, setComments] = useState<any[]>([])
  // Create a Supabase client configured to use cookies
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (!blogId) return;  // Early exit if no blogId

    const getComments = async () => {
      // This assumes you have a `todos` table in Supabase. Check out
      // the `Create Table and seed with data` section of the README 👇
      // https://github.com/vercel/next.js/blob/canary/examples/with-supabase/README.md
      const { data, error } = await supabase.from('comments').select(
        `content, 
         created_at, 
         blog_id, 
         user_profile_id,
         profiles(
            first_name, 
            last_name, 
            type
         )`
      ).eq('blog_id', `${blogId}`)

      if (data) {
        setComments(data)
      } else {
        console.log(error);
      }
    }

    getComments()
  }, [supabase, setComments])

  return (

    <div className="space-y-4 sm:w-full md:w-1/2 lg:w-1/4">
      {comments.map((comment, index) => (
        <div key={index} className="border p-4 rounded-lg shadow-sm bg-white ">
          <div className="flex items-start space-x-4">
            <div className="flex-1 space-y-2">
              <div className="text-sm font-semibold">{comment.content}</div>
              <div className="flex flex-col justify-between items-center text-xs text-gray-500">
                <span>
                  {`${comment.profiles.first_name} ${comment.profiles.last_name} - `}
                  <span className={`${comment.profiles.type === 'Teacher' ? 'text-primaryColor' :
                      comment.profiles.type === 'Student' ? 'text-secondaryColor' :
                        'text-gray-500'
                    }`}>
                    {comment.profiles.type}
                  </span>
                </span>

                <span className="m-2">
                  {new Date(comment.created_at).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}