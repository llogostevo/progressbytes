"use client"
import React, { useState } from 'react';
import { MenuIcon, XIcon } from '@heroicons/react/outline'; // Ensure you have @heroicons/react package
import Link from "next/link";
import Logo from './Logo';
import LogoutButton from "./LogoutButton";
import Image from "next/image";
import BackButton from "./BackButton";

const NavMenu = ({ user }: any) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="text-mainText mt-2 md:mt-5 pt-6 md:pt-12 pb-6 md:pb-11 mb-2 md:mb-10 border-t-2 border-b-2 border-primaryColor">
      {/* Menu toggle button for small screens */}
      <div className=" md:hidden flex items-center justify-between">
        <Logo logoClasses="text-mainText ml-1 text-3xl sm:text-6xl lg:text-6xl" />
        <button onClick={toggleMenu} className="p-2 focus:outline-none">
          {isMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </button>
      </div>

      {/* Main menu links */}
      <div className={`flex flex-col md:flex-row justify-between ${isMenuOpen ? 'block' : 'hidden'} md:block`}>
        <Logo logoClasses="hidden md:block ml-5 text-mainText text-3xl sm:text-6xl lg:text-6xl" />

        {/* Left section: Logo and links */}
        <div className="md:ml-10 mb-4 text-center md:text-left">
          <div className="flex flex-col md:flex-row justify-center sm:justify-start items-center mt-4 md:mt-10 gap-3 md:gap-5">
            {/* Conditional rendering based on user status */}
            {user ? (
              <>
                {/* User is logged in */}
                <div className="md:order-first order-last pr-0 pt-3 md:pt-0 md:pr-3 border-t-2 md:border-t-0 md:border-r-2 border-secondaryColor">
                  <BackButton />
                </div>
                <Link className="text-lg sm:text-2xl border-b-2 border-transparent hover:border-secondaryColor" href="/dashboard">Dashboard</Link>
                <Link className="text-lg sm:text-2xl border-b-2 border-transparent hover:border-secondaryColor" href="/assessment">Assessments</Link>
                <Link className="text-lg sm:text-2xl border-b-2 border-transparent hover:border-secondaryColor" href="/learningchecklist">PLC</Link>

              </>
            ) : (
              <div className="flex items-center gap-3">
                {/* Elements for non-logged-in users */}
              </div>
            )}
          </div>
        </div>

        {/* Right section: Additional links or user info */}
        <div className="flex flex-col md:flex-row gap-4 mt-4 md:ml-10 md:mt-0 items-center">
          <div>
            {user ? (
              <div className="flex items-center gap-3 md:gap-4">
                {/* User email and logout button */}
                <span className="block truncate w-24 md:w-32"><Link href="/learningchecklist">{user.email}</Link></span>
                <LogoutButton />
              </div>
            ) : (
              <>
                <Link href="/login" className="py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover">
                  Login
                </Link>
              </>

            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavMenu;
