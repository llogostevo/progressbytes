"use client"
import React, { useState, useEffect } from 'react';
import formatDateToCustom from "@/lib/dates";
import Link from "next/link";
import AddAssessmentForm from "./AddAssessementForm";

type Answer = {
    answerid: string;
    questionid: string;
    studentid: string;
};

type Question = {
    questionid: string;
    assessmentid: string;
    answertable: Answer[];
};

type Assessment = {
    assessmentid: number;  // Changed from string to number
    assessmentdate: string;
    assessmentname: string;
    created_by: string;
    questiontable: Question[];
};

type AssessmentReference = {
    assessmentid: number;  // Changed from string to number
};

interface AssessmentProps {
    studentAssessment: Assessment[];
    user: {
        id: string;
    }; 
    // You can add other properties if required.
}


export default function Assessments({studentAssessment, user}: AssessmentProps) {


    // 1. Use useState to manage sortOrder
    const [sortOrder, setSortOrder] = useState('assessmentdate');

    let sortedAssessments = studentAssessment ? [...studentAssessment] : [];

    // 2. Sort the assessments based on the sortOrder    
    useEffect(() => {
        if (sortedAssessments) {
            if (sortOrder === 'assessmentdate') {
                sortedAssessments.sort((a, b) => new Date(b.assessmentdate).getTime() - new Date(a.assessmentdate).getTime());
            } else if (sortOrder === 'assessmentname') {
                sortedAssessments.sort((a, b) => a.assessmentname.localeCompare(b.assessmentname));
            }
        }
    }, [sortOrder, studentAssessment]);



    return (
        <div className="p-4 bg-gray-100"> {/* Added a light gray background for contrast */}
            <div className="bg-white p-4 rounded-md shadow-sm mb-4"> {/* Container for sorting controls */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        {/* Actual hidden radio inputs */}
                        <input
                            type="radio"
                            id="sortByDate"
                            name="sortOrder"
                            value="assessmentdate"
                            className="hidden"
                            checked={sortOrder === 'assessmentdate'}
                            onChange={() => setSortOrder('assessmentdate')} // update state on change
                        />

                        <input
                            type="radio"
                            id="sortByName"
                            name="sortOrder"
                            value="assessmentname"
                            className="hidden"
                            checked={sortOrder === 'assessmentname'}
                            onChange={() => setSortOrder('assessmentname')} // update state on change
                        />

                        {/* Labels styled as buttons */}
                        <label
                            htmlFor="sortByDate"
                            className={`px-2 py-1 text-xs rounded cursor-pointer ${false ? 'bg-secondaryColor text-white' : 'bg-white border border-secondaryColor hover:bg-nonphotblue hover:text-white'}`}
                        >
                            Sort by Date
                        </label>

                        <label
                            htmlFor="sortByName"
                            className={`px-2 py-1 text-xs rounded cursor-pointer ${true ? 'bg-secondaryColor text-white' : 'bg-white border border-secondaryColor hover:bg-nonphotblue hover:text-white'}`}
                        >
                            Sort by Name
                        </label>
                    </div>
                </div>
            </div>


            <div className="bg-white p-4 rounded-md shadow-sm mb-4"> {/* Container for the form */}
                <h2 className="text-xl mb-4 font-semibold">Add Assessment</h2>
                <AddAssessmentForm userId={user.id} />
            </div>

            {/* <Link className="inline-block border mt-10 mb-10 border-primaryColor hover:bg-secondaryColor hover:text-white hover:border-white text-primaryColor rounded px-4 py-2 transition duration-200" href={`/bytemark/assessment`}>Create New Assessment</Link> */}

            <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {sortedAssessments.map((assessment) => (
                    <div key={assessment.assessmentid} className="bg-white flex flex-col gap-1 p-3 justify-between rounded-lg shadow-lg mb-2">
                        <h2 className="sm:text-base md:text-md lg:text-lg font-semibold mb-2">
                            {assessment.assessmentname}
                        </h2>
                        <p className="text-sm">{formatDateToCustom(assessment.assessmentdate)}</p>
                        <Link className="text-xs inline-block border border-primaryColor hover:bg-secondaryColor hover:text-white hover:border-white text-primaryColor rounded px-3 py-1 transition duration-200" href={`./assessment/${assessment.assessmentid}`}>Edit Assessment</Link>
                    </div>
                ))}
            </section>
        </div>
    );
}