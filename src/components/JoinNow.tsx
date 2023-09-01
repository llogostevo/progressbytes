import { usersCheck } from "@/lib/users"
import Link from "next/link"

export default async function JoinNow() {
    
    const user = await usersCheck()
    
    return (
        <>
            {!user && (
                <button className="inline-block border border-primaryColor hover:bg-secondaryColor hover:text-white hover:border-white text-primaryColor rounded px-4 py-2 transition duration-200">
                    <Link href="/login">Join now</Link>
                </button>
            )
            }
        </>
    )
}