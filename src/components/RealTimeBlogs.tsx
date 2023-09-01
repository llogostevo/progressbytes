'use client'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';


export default function RealTimeBlogs({blogs} : {blogs:any} ) {
    const supabase = createClientComponentClient();
    const router = useRouter();
    
    useEffect(() => {
        const channel = supabase
            .channel('realtime blogs')
            .on('postgres_changes', 
            {
                event:'*', 
                schema:'public',
                table:'blogs',
        }, 
        () => {
            router.refresh()
        },
        )
        .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, router])
    return (
        <section className="grid md:grid-cols-3 lg:grid-cols-4 gap-8">
  {/* Blog Card */}
  {blogs?.map((blog:any) => (
    <div key={blog.blog_id} className="bg-white flex flex-col gap-2 p-6 justify-between rounded-lg shadow-lg mb-4"> {/* added mb-4 for some spacing between blog cards */}
      <h2 className=" sm:text-lg md:text-xl lg:text-xl font-semibold mb-4">{blog.title}</h2>
      {/* <p>{blog.img_path}</p> */}
      {/* <p className="text-gray-700">{blog.content}</p> */}
      <p>{new Date(blog.created_at).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      })}</p>
      {/* @ts-ignore */}
      <p>{`${blog.profiles?.first_name.charAt(0)} ${blog.profiles?.last_name} `}</p>  
      <Link href={`./blog/${blog.blog_id}`} className="inline-block border border-primaryColor hover:bg-secondaryColor hover:text-white hover:border-white text-primaryColor rounded px-4 py-2 transition duration-200">Visit Blog</Link>
    </div>
  ))}

</section>
    )
}
