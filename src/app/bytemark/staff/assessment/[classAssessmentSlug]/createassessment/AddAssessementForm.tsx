'use client'
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// import use router, make sure it is from next/navigation
import { useRouter } from 'next/navigation'

import { useTransition } from "react";

import { useState, ChangeEvent } from 'react';
import TooltipModalButton from "@/components/tooltipModal/TooltipModalButton";

type AddAssessmentData = {
    assessmentdate: string;
    assessmentname: string;
    assessmenttype: string;
};

function formatDateToUKFormat(dateString: string): string {
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
}


export default function AddAssessementForm({ classId }: { classId: string }) {
    // create the router hook to trigger a page refresh
    const router = useRouter()
    
    // create the transition hook to manage the transition of the page refresh
    const [isPending, startTransition] = useTransition()


    const [selectedAssessmentType, setAssessmentType] = useState('Classwork');

    const [assessmentData, setAssessmentData] = useState<AddAssessmentData>({
        assessmentdate: new Date().toISOString().slice(0, 10),
        assessmentname: `${selectedAssessmentType}: ` + formatDateToUKFormat(new Date().toISOString().slice(0, 10)),
        assessmenttype: selectedAssessmentType

    });

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {  // Updated to handle select element as well
        const { id, value } = e.target;
        if (id === 'assessmenttype') {  // New condition for handling prefix selection
            setAssessmentType(value);
            setAssessmentData(prev => ({
                ...prev,
                assessmenttype: value,
                assessmentname: `${value}: ` + formatDateToUKFormat(prev.assessmentdate),
            }));
        } else if (id === 'assessmentdate') {
            setAssessmentData(prev => ({
                ...prev,
                assessmentdate: value,
                assessmentname: `${selectedAssessmentType}: ` + formatDateToUKFormat(value),
                assessmenttype: selectedAssessmentType
            }));
        } else {
            setAssessmentData(prev => ({ ...prev, [id]: value }));
        }
    };


    // async function to handle the form submission
    async function handleCreateAssessment(event: React.FormEvent<HTMLFormElement>) {
        // prevent refresh of the page on submit
        event.preventDefault();


        //  @ts-ignore
        const assessmentdate = assessmentData.assessmentdate;
        //  @ts-ignore
        const assessmentname = assessmentData.assessmentname;
        //  @ts-ignore
        const assessmenttype = assessmentData.assessmenttype;


        // Create a Supabase client configured to use cookies
        const supabase = createClientComponentClient()

        const { data, error } = await supabase
            .from('assessmenttable')
            .insert([
                { assessmentdate: assessmentdate, assessmenttype: assessmenttype, assessmentname: assessmentname, schoolid: 1, created_by: userId },
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
                <TooltipModalButton toolTitle="Assessment Date and Prefix:" toolDetails="Select the assessment date and a prefix for the assessment name, if you want a custom name you can edit this in the Assessment Name field instead - make sure you select the date of the assessment first though" />
                <div className="flex mb-6 flex-col mt-5 md:flex-row">
                    <div className="md:mr-2 mb-4 md:flex-1">
                        <label htmlFor="assessmentdate" className="block text-sm font-medium text-gray-700">Assessment Date</label>
                        <input
                            type="date"
                            id="assessmentdate"
                            value={assessmentData.assessmentdate}
                            onChange={handleInputChange}
                            className="mt-1 py-2 px-4 border rounded w-full h-10"
                        />
                    </div>
                    <div className="md:ml-2 mb-4 md:flex-1">
                        <label htmlFor="assessmenttype" className="block text-sm font-medium text-gray-700">
                            Assessment Type
                        </label>
                        <select
                            id="assessmenttype"
                            onChange={handleInputChange}
                            value={assessmentData.assessmenttype}
                            className="mt-1 py-2 px-4 border rounded w-full h-10"
                        >
                            <option value="Classwork">Classwork</option>
                            <option value="Homework">Homework</option>
                            <option value="Classwork">SGL</option>
                            <option value="Revision">Revision</option>
                            <option value="Assessment">Assessment</option>
                        </select>
                    </div>
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


