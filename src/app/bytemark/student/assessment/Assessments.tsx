"use client"
import React, { useState, useEffect } from 'react';
import formatDateToCustom from "@/lib/dates";
import Link from "next/link";
import AddAssessmentForm from "./AddAssessementForm";
import TooltipModalButton from '@/components/tooltipModal/TooltipModalButton';

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
    disableAssessment: Boolean;
    // You can add other properties if required.
}


export default function Assessments({ studentAssessment, user, disableAssessment }: AssessmentProps) {


    // 1. Use useState to manage sortOrder
    const [sortOrder, setSortOrder] = useState('assessmentdate');
    const [sortedAssessments, setSortedAssessments] = useState([...studentAssessment]);


    // 2. Sort the assessments based on the sortOrder    
    useEffect(() => {
        let sortedData = [...studentAssessment];  // Use a copy of the original data

        if (sortOrder === 'assessmentdate') {
            sortedData.sort((a, b) => new Date(b.assessmentdate).getTime() - new Date(a.assessmentdate).getTime());
        } else if (sortOrder === 'assessmentname') {
            sortedData.sort((a, b) => a.assessmentname.localeCompare(b.assessmentname));
        }

        setSortedAssessments(sortedData); // Update the sortedAssessments state
    }, [sortOrder, studentAssessment]);



    return (
        <div className="p-4">
            <h1 className="text-4xl mb-4 font-semibold">Student Assessments</h1>
            <div className="bg-white p-4 rounded-md shadow-sm mb-4 border border-gray-300"> {/* Container for the form */}
                <h2 className="text-2xl mb-4 font-semibold">Create Assessment</h2>
                <AddAssessmentForm userId={user.id} disableAssessment={disableAssessment}/>
            </div>

            {/* <Link className="inline-block border mt-10 mb-10 border-primaryColor hover:bg-secondaryColor hover:text-white hover:border-white text-primaryColor rounded px-4 py-2 transition duration-200" href={`/bytemark/assessment`}>Create New Assessment</Link> */}

            <div className="bg-white p-4 rounded-md shadow-sm mb-4 border border-gray-300">
                <h2 className="text-2xl mb-4 font-semibold">Personal Assessments</h2>

                <TooltipModalButton toolTitle="Add Questions:" toolDetails="Click Edit Assessments to add and edit the results of your questions" />
                <div className="bg-white p-4 mb-4"> {/* Container for sorting controls */}
                    <div className="flex mt-5 items-center justify-between ">
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
                                className={`
        px-2 py-1 text-xs rounded cursor-pointer 
        ${sortOrder === 'assessmentdate' ? 'bg-primaryColor text-white' : 'inline-block border border-primaryColor hover:bg-secondaryColor hover:text-white hover:border-white text-primaryColor rounded transition duration-200'}
    `}
                                onClick={() => setSortOrder('assessmentdate')}
                            >
                                Sort by Date
                            </label>

                            <label
                                htmlFor="sortByName"
                                className={`
        px-2 py-1 text-xs rounded cursor-pointer 
        ${sortOrder === 'assessmentname' ? 'bg-primaryColor text-white' : 'inline-block border border-primaryColor hover:bg-secondaryColor hover:text-white hover:border-white text-primaryColor rounded transition duration-200'}
    `}
                                onClick={() => setSortOrder('assessmentname')}
                            >
                                Sort by Name
                            </label>

                        </div>
                    </div>
                </div>
                <div>{JSON.stringify(studentAssessment)}</div>

                <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    {sortedAssessments.map((assessment) => (

                        <div className="bg-white p-5 rounded-lg shadow-lg mb-2 min-h-[140px] border border-gray-300" key={assessment.assessmentid}>
                            <h2 className="sm:text-base md:text-md lg:text-lg font-semibold mb-2">
                                {assessment.assessmentname}
                            </h2>
                            <p className="text-sm">{new Date(assessment.assessmentdate).toLocaleDateString('en-GB')}</p>
                            <div className="mt-auto text-right">
                                <Link href={`./assessment/${assessment.assessmentid}`}>
                                    <span className="text-xs inline-block border border-primaryColor hover:bg-secondaryColor hover:text-white hover:border-white text-primaryColor rounded px-3 py-1 transition duration-200">Edit Assessment</span>
                                </Link>
                            </div>
                        </div>

                    ))}
                </section>
            </div>
        </div>
    );
}