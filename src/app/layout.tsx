import './globals.css'

import Header from '../components/Header'
import type { Metadata } from 'next'
import { Inter, Roboto_Mono, Fira_Mono } from 'next/font/google'
import Footer from '../components/Footer'

// import { Analytics } from '@vercel/analytics/react'


// Site fonts
// const siteFont = Inter({ subsets: ['latin']})
// export const headingFont = Fira_Mono({ subsets: ['latin'], weight: ['400'] })

export const siteFont = Roboto_Mono({ subsets: ['latin'], weight: ['400'] })
export const logoFont = Fira_Mono({ subsets: ['latin'], weight: ['400'] })

// THIS IS NEEDED DUE TO AN ISSUE WITH VERCEL UPLOAD AND COOKIES
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Progress Bytes',
  description: "Elevate your learning experience with ByteGrade's progress tracking, ByteTrack's topic monitoring, and ByteNow's spaced repetition exercises. Dive into a comprehensive platform tailored for the modern Computer Science student.",
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <html lang="en">
      <link
        rel="icon"
        href="/icon?<generated>"
        type="image/<generated>"
        sizes="<generated>"
      />
      {/* apply font to every page */}
      <body className={`${siteFont.className} text-mutedText`}>
        <Header />

        <div className="min-h-screen bg-white flex flex-col justify-center md:justify-start">
          <div className=" md:mr-10 md:ml-16 p-4">
            {children}
            {/* <Analytics /> */}

          </div>
        </div>

        <Footer />

      </body>
    </html>
  )
}
