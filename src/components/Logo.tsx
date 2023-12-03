// import { logoFont } from '@/app/layout'
import Link from 'next/link';
import { Inter, Roboto_Mono, Fira_Mono } from 'next/font/google'

type LogoProps = {
  logoClasses: string;
}


const logoFont = Fira_Mono({ subsets: ['latin'], weight: ['400'] })

export default function Logo({logoClasses} : LogoProps) {
  return (
    
    <Link href="/learningchecklist" className={`${logoFont.className} ${logoClasses} text-primaryColor`}><span className="text-secondaryColor">{`{`}</span>ProgressBytes<span className="text-secondaryColor">{`}`}</span></Link>
  )
}
