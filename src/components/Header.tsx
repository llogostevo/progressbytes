import Link from "next/link";
import Logo from "./Logo";
import Image from "next/image";
import { logoFont, siteFont } from "@/app/layout";
import { teacherCheck, usersCheck } from '../lib/users';
import LogoutButton from "./LogoutButton";
import JoinNow from "./JoinNow";
import BlogBytes from "./BlogBytes";

export default async function Header() {

  const user = await usersCheck();

  const teacher = await teacherCheck()
  return (
    <div className="text-mainText mt-5 px-4 md:pl-10 pt-12 pb-11 mb-10 border-t-2 border-b-2 border-primaryColor flex flex-row justify-between">
      <div>
        <div className="md:ml-4 mx-auto flex flex-row gap-10">
          <Logo logoClasses="text-mainText text-3xl md:text-5xl lg:text-6xl" />
        </div>
        <nav className={`${logoFont.className} mt-2 space-y-2 md:space-y-0 md:flex md:space-x-4 md:ml-4`}>
          {user ? (
            <>
              <Link className="mx-2 border-b-2 border-transparent hover:border-secondaryColor block" href="/questions">MyByte</Link>
              <Link className="mx-2 border-b-2 border-transparent hover:border-secondaryColor block" href="/questions">ByteMark</Link>
              <Link className="mx-2 border-b-2 border-transparent hover:border-secondaryColor block" href="/questions">ByteTrack</Link>
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
        </nav>

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
            <span className="hidden sm:block truncate w-32">{user.email}</span>
            <span className="block sm:hidden truncate w-20">{user.email}</span> {/* This will show truncated email on very small screens */}
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
