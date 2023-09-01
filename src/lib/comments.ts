'use client'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { useEffect, useState } from 'react'


export async function saveComment() {
    
    // Create a Supabase client configured to use cookies
  // const supabase = createRouteHandlerClient({ cookies })

  
  // const { data, error } = await supabase
  // .from('comments')
  // .insert([
  //   { some_column: 'someValue', other_column: 'otherValue' },
  // ])
  // .select()
  
  // return 
}

// GET COMMENTS
export async function getComments(slug: string) {
  const supabase = createServerComponentClient({ cookies })
  const { data: comments } = await supabase.from('comments').select(
    `content, 
     created_at, 
     blog_id, 
     user_profile_id,
     profiles(
        first_name, 
        last_name, 
        type
     )`
  ).eq('blog_id', `${slug}`) 
    
  return comments
  }



