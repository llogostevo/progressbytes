import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  return (
<div className="text-mainText flex flex-col mt-5 gap-2 px-4 md:pl-10 pt-5 pb-5 border-t-2 border-primaryColor">
        <Logo logoClasses="text-primaryColor text-md"/>
        <a className="text-sm" href="https://www.flaticon.com/free-icons/progress" title="progress icons">Progress icons created by Freepik - Flaticon</a>
    </div>
  )
}
