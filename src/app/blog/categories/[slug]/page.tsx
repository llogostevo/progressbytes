import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { usersCheck } from '@/lib/users'
import Comments from '@/components/Comments'
import CommentForm from '@/components/CommentForm'

export const dynamic = 'force-dynamic'

export default async function CategoryBlogPostPage({ params }: { params: { slug: string } }) {

    // Create a Supabase client configured to use cookies
    const supabase = createServerComponentClient({ cookies })

    //   GET THE POST BY SLUG
    // query to get the blogs and profile data from the database
    const { data: blogs } = await supabase.from('blogs').select(`
  blog_id,
  title,
  content,
  img_path,
  created_at,
  author_id,
  profiles(profile_id,
  first_name,
  last_name, 
  type)
`) ;

// Created a filter to pull out only the identified types in the db
//@ts-ignore
const filteredBlogs = blogs?.filter(blog => blog.profiles.type === params.slug);


console.log(blogs)
console.log(filteredBlogs)

    if (!filteredBlogs || filteredBlogs.length === 0) {
        return notFound();
    }

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
                            <button className="px-2 py-1 text-xs bg-primaryColor hover:bg-secondaryColor text-white rounded">
                                <Link href={`/blog/`}><span>All</span></Link>
                            </button>
                        </div>
                        {categories?.map((category) => {
                            const buttonColor = category === params.slug ? 'bg-secondaryColor' : 'bg-primaryColor';

                            return (
                                <div key={category} className="flex items-center">
                                    <button className={`px-2 py-1 text-xs ${buttonColor} hover:bg-secondaryColor text-white rounded`}>
                                        <Link href={`/blog/categories/${category}`}><span>{category}</span></Link>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
    
    <section className="grid md:grid-cols-3 lg:grid-cols-4 gap-8">
  {/* Blog Card */}
  {filteredBlogs?.map(blog => (
    <div key={blog.blog_id} className="bg-white flex flex-col gap-2 p-6 justify-between rounded-lg shadow-lg mb-4"> {/* added mb-4 for some spacing between blog cards */}
      <h2 className=" sm:text-lg md:text-xl lg:text-xl font-semibold mb-4">{blog.title}</h2>
      {/* <p>{blog.img_path}</p> */}
      {/* <p className="text-gray-700">{blog.content}</p> */}
      <p>{new Date(blog.created_at).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      })}</p>
      {/* @ts-ignore */}
      <p>{`${blog.profiles?.first_name.charAt(0)} ${blog.profiles?.last_name} `}</p>  
      <Link href={`/blog/${blog.blog_id}`} className="inline-block border border-primaryColor hover:bg-secondaryColor hover:text-white hover:border-white text-primaryColor rounded px-4 py-2 transition duration-200">Visit Blog</Link>
    </div>
  ))}

</section>

</>

)}


