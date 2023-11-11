import { logoFont } from '@/app/layout'
import Link from 'next/link';

type LogoProps = {
  logoClasses: string;
}



export default function Logo({logoClasses} : LogoProps) {
  return (
    
    <Link href="/learningchecklist" className={`${logoFont.className} ${logoClasses} text-primaryColor`}><span className="text-secondaryColor">{`{`}</span>ProgressBytes<span className="text-secondaryColor">{`}`}</span></Link>
  )
}
