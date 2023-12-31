import Link from "next/link";
import Logo from "./Logo";
import Image from "next/image";
// import { logoFont, siteFont } from "@/app/layout";
import { studentCheck, usersCheck } from '../lib/users';
import LogoutButton from "./LogoutButton";
import JoinNow from "./JoinNow";
import BlogBytes from "./BlogBytes";
import { Inter, Roboto_Mono, Fira_Mono } from 'next/font/google'


const siteFont = Roboto_Mono({ subsets: ['latin'], weight: ['400'] })
const logoFont = Fira_Mono({ subsets: ['latin'], weight: ['400'] })
export default async function Header() {

  const user = await usersCheck();


  return (
    <div className="text-mainText mt-5 px-4 md:pl-10 pt-12 pb-11 mb-10 border-t-2 border-b-2 border-primaryColor flex flex-row justify-between">
      <div>
        <div className="md:ml-4 mx-auto flex flex-row gap-10">
          <Logo logoClasses="text-mainText text-3xl md:text-5xl lg:text-6xl" />
        </div>
        
        {user ? (
            <>
              <Link className="mx-2 border-b-2 border-transparent hover:border-secondaryColor block" href="/questions">MyByte</Link>
              <Link className="mx-2 border-b-2 border-transparent hover:border-secondaryColor block" href="/bytemark">ByteMark</Link>
              <Link className="mx-2 border-b-2 border-transparent hover:border-secondaryColor block" href="/bytemark/student/assessment">BM:Student</Link>
              <Link className="mx-2 border-b-2 border-transparent hover:border-secondaryColor block" href="/bytemark/staff/assessment">BM:Staff</Link>
              <Link className="mx-2 border-b-2 border-transparent hover:border-secondaryColor block" href="/bytetrack/teacherdashboard">ByteTrack</Link>
              <Link className="mx-2 border-b-2 border-transparent hover:border-secondaryColor block" href="/questions">ByteNow</Link>
              <Link className="mx-2 border-b-2 border-transparent hover:border-secondaryColor block" href="/blog">BlogBytes</Link>
            </>
          ) : (
            <div>
              <div className="mt-10 flex flex-cols gap-3">
                <JoinNow />
                <BlogBytes />
              </div>
            </div>

          )}



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
