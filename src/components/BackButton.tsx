'use client'

import { useRouter } from 'next/navigation';

export default function BackButton() {
  // Declare the useRouter hook inside the component to ensure it's a client component
  const router = useRouter();

  return (
    <>
        
        <button
          className="text-lg sm:text-2xl border-b-2 border-transparent hover:border-secondaryColor text-gray-700"
          onClick={() => router.back()}
        >
          {'<<'} Back
        </button>
    </>
  );
}
