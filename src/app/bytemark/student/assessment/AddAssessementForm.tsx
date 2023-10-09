'use client'
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// import use router, make sure it is from next/navigation
import { useRouter } from 'next/navigation'

import { useTransition } from "react";

import { useState, FC, ChangeEvent, FormEvent } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';

type AddAssessmentData = {
    assessmentdate: string;
    assessmentname: string;
};

function formatDateToUKFormat(dateString: string): string {
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
}


export default function AddAssessementForm({ userId }: {userId: string}) {
    // create the router hook to trigger a page refresh
    const router = useRouter()

    // create the transition hook to manage the transition of the page refresh
    const [isPending, startTransition] = useTransition()

    const [assessmentData, setAssessmentData] = useState<AddAssessmentData>({
        assessmentdate: new Date().toISOString().slice(0, 10),
        assessmentname: "Assessment: " + formatDateToUKFormat(new Date().toISOString().slice(0, 10))
    });

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setAssessmentData(prev => {
            // If the field being changed is 'assessmentdate', update 'assessmentname' as well
            if (id === 'assessmentdate') {
                return {
                    ...prev,
                    assessmentdate: value,
                    assessmentname: "Assessment: " + formatDateToUKFormat(value)
                };
            }
            // Otherwise, update the field that was changed
            return { ...prev, [id]: value };
        });
    };
    

    // async function to handle the form submission
    async function handleCreateAssessment(event: React.FormEvent<HTMLFormElement>) {
        // prevent refresh of the page on submit
        event.preventDefault();


        //  @ts-ignore
        const assessmentdate = assessmentData.assessmentdate;
        //  @ts-ignore
        const assessmentname = assessmentData.assessmentname;

    

        // Create a Supabase client configured to use cookies
        const supabase = createClientComponentClient()

        const { data, error } = await supabase
            .from('assessmenttable')
            .insert([
                { assessmentdate: assessmentdate, assessmentname: assessmentname, schoolid: 1, created_by: userId },
            ]);

        if (error) {
            console.error("Error inserting data:", error);
            return; // Prevent further code execution in case of error.
        }
        // clears out the comment from the form once completed the above. 
        //  @ts-ignore
        event.target.assessmentdate.value = "";
        //  @ts-ignore
        event.target.assessmentname.value = "";

        // refresh the current route and fetch new data from the server without losing the client side browser or react state
        // takes a callback as a parameter
        startTransition(() => {
            router.refresh();


        })


    }
    return (
        <div className="mb-6">
            <form onSubmit={handleCreateAssessment}>
                <div className="mb-4">
                    <label htmlFor="assessmentdate" className="block text-sm font-medium text-gray-700">Assessment Date</label>
                    <input
                        type="date"
                        id="assessmentdate"
                        value={assessmentData.assessmentdate}
                        onChange={handleInputChange}
                        className="mt-1 p-2 border rounded"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="assessmentname" className="block text-sm font-medium text-gray-700">Assessment Name</label>
                    <input
                        type="text"
                        id="assessmentname"
                        value={assessmentData.assessmentname}
                        onChange={handleInputChange}
                        className="mt-1 p-2 border rounded w-full"
                    />
                </div>
                <button type="submit" className="inline-block border border-primaryColor hover:bg-secondaryColor hover:text-white hover:border-white text-primaryColor rounded px-4 py-2 transition duration-200">Create Assessment</button>
            </form>
        </div>
    );
}


