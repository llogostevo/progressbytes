import Link from "next/link";
import Logo from "./Logo";
import Image from "next/image";
import { logoFont, siteFont } from "@/app/layout";
import { studentCheck, usersCheck } from '../lib/users';
import LogoutButton from "./LogoutButton";
import JoinNow from "./JoinNow";
import BlogBytes from "./BlogBytes";


export default async function Header() {

  const user = await usersCheck();


  return (
    <div className="text-mainText mt-5 px-4 md:pl-10 pt-12 pb-11 mb-10 border-t-2 border-b-2 border-primaryColor flex flex-row justify-between">
      <div>
        <div className="md:ml-4 mx-auto mb-4">
          <Logo logoClasses="text-mainText text-3xl md:text-5xl lg:text-6xl" />
        </div>

        <div className="flex items-center gap-5">
          {user ? (
            <>
              <Link className="mx-2 border-b-2 border-transparent hover:border-secondaryColor" href="/questions">MyDashboard</Link>
              <Link className="mx-2 border-b-2 border-transparent hover:border-secondaryColor" href="/bytemark/student/assessment">Assessments</Link>
              <Link className="mx-2 border-b-2 border-transparent hover:border-secondaryColor" href="/learningchecklist">PLC</Link>
              <Link className="mx-2 border-b-2 border-transparent hover:border-secondaryColor" href="/admin">Admin</Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <JoinNow />
              <BlogBytes />
            </div>
          )}
        </div>
      </div>


      <div className="flex flex-row gap-5">

        <div>
          <Image
            src="/logo.png"
            width={30}
            height={30}
            alt="Progress Icon"
            className="hidden md:block"
          />
        </div>

        <div>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="hidden sm:block truncate w-32"><Link href="/update-profile">{user.email}</Link></span>
              <span className="block sm:hidden truncate w-20"><Link href="/update-profile">{user.email}</Link></span> {/* This will show truncated email on very small screens */}
              <LogoutButton />
            </div>

          ) : (
            <Link
              href="/login"
              className="py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover"
            >
              Login
            </Link>
          )}
        </div>
      </div>

    </div>

  )
}
