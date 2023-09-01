
// // import the set website url so that it can be used in vercel
// import { WEBSITE_URL } from "@/../config";
// import { teacherCheck, usersCheck } from "@/lib/users";
// import { createClientComponentClient, createServerComponentClient } from "@supabase/auth-helpers-nextjs";
// import { profile } from "console";

// // import use router, make sure it is from next/navigation
// import { useRouter } from 'next/navigation'

// import { useTransition } from "react";

// export default async function createBlog() {
//     const user = await usersCheck()

//   const supabase = createServerComponentClient({ cookies })

//   // check if logged in
//   if (!user) {
//     return
//   }

//   // check if teacher logged in
//   const { data: profiles, error } = await supabase
//     .from('profiles')
//     .select('type, profile_id').eq('profile_id', `${user?.id}`).eq('type', 'Teacher')
// //  @ts-ignore
//     console.log(profiles?[0]


//     return (
//         <p></p>
//         // <form className="w-8/12 mt-10" onSubmit={handleFormSubmit} >
//         //     <div className="flex flex-col gap-4 items-center border-b border-teal py-2">

//         //         <label className="w-full text-gray-500 mr-3 leading-tight focus:outline-none" htmlFor="username"><span className="mr-2 text-primaryColor">Commenting as:</span> {`${email}`} </label>

//         //         <textarea className="appearance-none bg-transparent border-none sm:30 md:h-60 lg:h-80 w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none" placeholder="Your comment..." name="comment" aria-label="Comment" required></textarea>
//         //         <button className="inline-block border border-primaryColor hover:bg-secondaryColor hover:text-white hover:border-white text-primaryColor rounded px-4 py-2 transition duration-200" type="submit">
//         //             Add Comment
//         //         </button>
//         //     </div>
//         // </form>
//     )
// }
