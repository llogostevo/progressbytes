"use client";

// import the set website url so that it can be used in vercel
import { WEBSITE_URL } from "@/../config";
import { teacherCheck, usersCheck } from "@/lib/users";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { profile } from "console";

// import use router, make sure it is from next/navigation
import { useRouter } from 'next/navigation'

import { useTransition } from "react";

export default function CommentForm({ email, }: { email: string; }) {
   
    // create the router hook to trigger a page refresh
    const router = useRouter()

    // create the transition hook to manage the transition of the page refresh
    const [isPending, startTransition] = useTransition()
    const user = usersCheck();
    const teacher = teacherCheck()

    if (!teacherCheck() == false) {
        console.log(teacher)
        console.log(user)
    }
    // async function to handle the form submission
    async function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
        // prevent refresh of the page on submit
        // event.preventDefault();

        //store the comment data from teh form in a temp variable called comment
        //  @ts-ignore
        const comment = event.target.comment.value;
        console.log(comment)

        // Create a Supabase client configured to use cookies
        const supabase = createClientComponentClient()
        
        // carry out the update of the database table from the form data
        const { data, error } = await supabase
            .from('comments')
            .insert([
                { content: comment , blog_id: `${email}`, user_profile_id: `${user_id}` },
            ])
            .select()

        // clears out the comment from the form once completed the above. 
        //  @ts-ignore
        event.target.comment.value = "";
        // refresh the current route and fetch new data from the server without losing the client side browser or react state
        // takes a callback as a parameter
        startTransition(() => {
            router.refresh();

        })

    }

    return (
        <form className="w-8/12 mt-10" onSubmit={handleFormSubmit} >
            <div className="flex flex-col gap-4 items-center border-b border-teal py-2">

                <label className="w-full text-gray-500 mr-3 leading-tight focus:outline-none" htmlFor="username"><span className="mr-2 text-primaryColor">Commenting as:</span> {`${email}`} </label>

                <textarea className="appearance-none bg-transparent border-none sm:30 md:h-60 lg:h-80 w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none" placeholder="Your comment..." name="comment" aria-label="Comment" required></textarea>
                <button className="inline-block border border-primaryColor hover:bg-secondaryColor hover:text-white hover:border-white text-primaryColor rounded px-4 py-2 transition duration-200" type="submit">
                    Add Comment
                </button>
            </div>
        </form>
    )
}
