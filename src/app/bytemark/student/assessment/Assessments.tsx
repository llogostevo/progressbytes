"use client"
import React, { useState, useEffect } from 'react';
import Link from "next/link";
import AddAssessmentForm from "./AddAssessementForm";
import TooltipModalButton from '@/components/tooltipModal/TooltipModalButton';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from "next/navigation"

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
    assessmenttype: string;
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
    const supabase = createClientComponentClient()
    const router = useRouter()

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [assessmentToDelete, setAssessmentToDelete] = useState<number | null>(null);

    const openDeleteModal = (assessmentId: number) => {
        setAssessmentToDelete(assessmentId);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setAssessmentToDelete(null);
        setShowDeleteModal(false);
    };

    // useState to manage sortOrder
    const [sortOrder, setSortOrder] = useState('assessmentdate');
    const [sortedAssessments, setSortedAssessments] = useState([...studentAssessment]);


    // Define the handleDelete function
    const handleDelete = async () => {
        // Your deletion logic here
        const { error } = await supabase
            .from('assessmenttable')
            .delete()
            .eq('assessmentid', assessmentToDelete)
        closeDeleteModal(); // Close the modal whether deletion succeeded or not
    };

    useEffect(() => {
        let sortedData = [...studentAssessment];  // Use a copy of the original data

        if (sortOrder === 'assessmentdate') {
            sortedData.sort((a, b) => new Date(b.assessmentdate).getTime() - new Date(a.assessmentdate).getTime());
        } else if (sortOrder === 'assessmentname') {
            sortedData.sort((a, b) => a.assessmentname.localeCompare(b.assessmentname));
        }

        setSortedAssessments(sortedData); // Update the sortedAssessments state

        // realtime changes
        const channel = supabase.channel('realtime assessments').on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'assessmenttable'
        }, () => {
            router.refresh()
        }
        )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        };


    }, [sortOrder, studentAssessment, supabase, router]);

    // New state for toggling filtered assessments
    const [filterAssessmentType, setFilterAssessmentType] = useState(false);

    // Filter the assessments based on the filterAssessmentType toggle
    const filteredAssessments = filterAssessmentType
        ? sortedAssessments.filter(assessment => assessment.assessmenttype === 'Assessment')
        : sortedAssessments;

    // Toggle the state for filterAssessmentType
    const toggleAssessmentTypeFilter = () => {
        setFilterAssessmentType(!filterAssessmentType);
    };


    return (
        <div className="p-4">
            <h1 className="text-4xl mb-4 font-semibold">Student Assessments</h1>
            <div className="bg-white p-4 rounded-md shadow-sm mb-4 border border-gray-300"> {/* Container for the form */}
                <h2 className="text-2xl mb-4 font-semibold">Create Assessment</h2>
                <AddAssessmentForm userId={user.id} disableAssessment={disableAssessment} />
            </div>

            {/* <Link className="inline-block border mt-10 mb-10 border-primaryColor hover:bg-secondaryColor hover:text-white hover:border-white text-primaryColor rounded px-4 py-2 transition duration-200" href={`/bytemark/assessment`}>Create New Assessment</Link> */}

            <div className="bg-white p-4 rounded-md shadow-sm mb-4 border border-gray-300">
                <h2 className="text-2xl mb-4 font-semibold">Personal Assessments</h2>

                <TooltipModalButton toolTitle="Add Questions:" toolDetails="Click View Assessments to view, add and edit the results of your questions" />
                <div className="bg-white sm:p-4 mb-4"> {/* Container for sorting controls */}
                    <div className="flex flex-wrap justify-center mt-5 items-center sm:justify-between ">
                        <div className="flex flex-wrap justify-center gap-2 items-center space-x-4 text-center">

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

                            {/* Button for Assessment Type Toggle */}
                            <button
                                onClick={toggleAssessmentTypeFilter}
                                className={`
                                    px-2 py-1 text-xs rounded cursor-pointer 
                                    ${filterAssessmentType ? 'bg-primaryColor text-white' : 'inline-block border border-primaryColor hover:bg-secondaryColor hover:text-white hover:border-white text-primaryColor rounded transition duration-200'}
                                `}
                            >
                                {filterAssessmentType ? '' : ''} Exam Assessments
                            </button>
                        </div>

                    </div>
                </div>
                <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    {filteredAssessments.map((assessment) => (

                        <div className="bg-white p-5 rounded-lg shadow-lg mb-2 min-h-[140px] border border-gray-300" key={assessment.assessmentid}>
                            <h2 className=" text-lg md:text-lg lg:text-lg font-semibold mb-2">
                                {assessment.assessmentname}
                            </h2>
                            <p className="text-sm">{new Date(assessment.assessmentdate).toLocaleDateString('en-GB')}</p>
                            <div className="mt-auto text-right">
                                <Link href={`./assessment/${assessment.assessmentid}`}>
                                    <span className="text-xs inline-block border mt-10 border-primaryColor hover:bg-secondaryColor hover:text-white hover:border-white text-primaryColor rounded px-3 py-1 transition duration-200">View Assessment</span>
                                </Link>
                            </div>
                            <div className="mt-auto text-right">
                                {assessment.created_by === user.id && (
                                    <button
                                        onClick={() => openDeleteModal(assessment.assessmentid)} // Open the delete modal with the assessment ID
                                        className="text-xs inline-block border mt-10 border-secondaryColor hover:bg-secondaryColor hover:text-white hover:border-white text-secondaryColor rounded px-3 py-1 transition duration-200"
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </section>

                {showDeleteModal && (
                    <div className="fixed inset-0 flex items-center backdrop-blur-sm justify-center z-50">
                        <div className="bg-white border border-secondaryColor p-4 rounded-lg shadow-lg">
                            <h2 className="text-lg font-semibold">Confirm Deletion</h2>
                            <p>Are you sure you want to delete this assessment?</p>
                            <p className="text-secondaryColor my-2">This cannot be undone! All questions and answers data will be deleted</p>
                            <div className="mt-4 text-right">
                                <button
                                    onClick={handleDelete} // Call the delete function
                                    className="px-3 mx-10 py-1 border border-secondaryColor text-secondaryColor hover:text-white rounded-md hover:bg-secondaryColor"
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={closeDeleteModal} // Close the modal without deleting
                                    className="px-3 py-1 ml-10 border text-gray-400 border-gray-100 bg-gray-100 rounded-md hover:text-gray-700 hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}