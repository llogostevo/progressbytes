import Link from 'next/link'
 
export default function NotFound() {
  return (
    <div>
      <h2 className="text-5xl md:self-start font-bold mb-10">Not Found</h2>
      <p>Could not find requested resource</p>
      <p>Please navigate via the home page</p>

      <div></div>
      <Link className="py-2 px-4 mt-10 rounded-md no-underline text-foreground bg-btn-background hover:bg-btn-background-hover flex items-center group" href="/">
      <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>{' '}Return to Home</Link>
    </div>
  )
}