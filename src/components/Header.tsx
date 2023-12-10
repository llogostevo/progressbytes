import Link from "next/link";
import Logo from "./Logo";
import Image from "next/image";
// import { logoFont, siteFont } from "@/app/layout";
import { adminCheck, studentTrueCheck, usersCheck, teacherCheck } from '../lib/users';
import LogoutButton from "./LogoutButton";
import JoinNow from "./JoinNow";
import BlogBytes from "./BlogBytes";
import { Inter, Roboto_Mono, Fira_Mono } from 'next/font/google'
import BackButton from "./BackButton";


const siteFont = Roboto_Mono({ subsets: ['latin'], weight: ['400'] })
const logoFont = Fira_Mono({ subsets: ['latin'], weight: ['400'] })
export default async function Header() {
  const user = await usersCheck();

  return (
    <div className="text-mainText mt-5 px-4 pt-12 pb-11 mb-10 border-t-2 border-b-2 border-primaryColor flex flex-col md:flex-row justify-between">
      <div className="md:ml-4 mb-4">
        {/* Adjust Logo size for smaller screens */}
        <Logo logoClasses="text-mainText text-3xl sm:text-3xl md:text-5xl lg:text-6xl" />
        {/* Main menu links: horizontal layout on larger screens, vertical on smaller screens */}
        <div className="flex flex-col md:flex-row justify-center sm:justify-start items-center mt-4 md:mt-10 gap-3 md:gap-5">
          {user ? (
            <>
              {/* Links */}
              <div className="md:order-first order-last pr-0 pt-3 md:pt-0 md:pr-3 border-t-2 md:border-t-0 md:border-r-2 border-secondaryColor">
                <BackButton />
              </div>
              <Link className="text-lg sm:text-2xl border-b-2 border-transparent hover:border-secondaryColor" href="/dashboard">Dashboard</Link>
              <Link className="text-lg sm:text-2xl border-b-2 border-transparent hover:border-secondaryColor" href="/bytemark/student/assessment">Assessments</Link>
              <Link className="text-lg sm:text-2xl border-b-2 border-transparent hover:border-secondaryColor" href="/learningchecklist">PLC</Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              {/* Hidden elements for smaller screens can go here */}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mt-4 md:mt-0 items-center">
        {/* Right section: remains unchanged */}
        <div className="hidden lg:block">
          <Image src="/logo.png" width={30} height={30} alt="Progress Icon" />
        </div>

        <div>
          {user ? (
            <div className="flex items-center gap-3 md:gap-4">
              {/* User email and logout button */}
              <span className="hidden md:block truncate w-24 md:w-32"><Link href="/learningchecklist">{user.email}</Link></span>
              <LogoutButton />
            </div>
          ) : (
            <Link href="/login" className="py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover">
              Login
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}