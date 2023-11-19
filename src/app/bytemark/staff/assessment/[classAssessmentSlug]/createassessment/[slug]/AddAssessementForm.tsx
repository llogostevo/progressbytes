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

type Student = {
    studentid: number;
    firstname: string;
    lastname: string;
};

type Students = {
    studentid: number;
    studenttable: Student;
}[];


function formatDateToUKFormat(dateString: string): string {
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
}

function chunkArray(array: Students, size: number): Students[] {
    return array.reduce((acc, val, i) => {
        let idx = Math.floor(i / size);
        let page = acc[idx] || (acc[idx] = []);
        page.push(val);

        return acc;
    }, [] as Students[]);
}



export default function AddAssessmentForm({ students }: { students: Students}) {
    // create the router hook to trigger a page refresh
    const router = useRouter()

    // Create a Supabase client configured to use cookies
    const supabase = createClientComponentClient()

    console.log(students)

    // Assuming `students` is of type Students[]
    let studentColumns: Students[] = [];

    // Chunk the students array into groups of 5
    // Assuming students is your array of student objects
    if (students) {
        // Sort students by lastname
        students.sort((a, b) => a.studenttable.lastname.localeCompare(b.studenttable.lastname));

        // Then chunk the sorted students array into groups of 6
        studentColumns = chunkArray(students, 6);
    }

    // create the transition hook to manage the transition of the page refresh
    const [isPending, startTransition] = useTransition()

    const [selectedAssessmentType, setAssessmentType] = useState('Assessment');

    const [assessmentData, setAssessmentData] = useState<AddAssessmentData>({
        assessmentdate: new Date().toISOString().slice(0, 10),
        assessmentname: `${selectedAssessmentType}: ` + formatDateToUKFormat(new Date().toISOString().slice(0, 10)),
        assessmenttype: selectedAssessmentType
    });

    const [checkedStudents, setCheckedStudents] = useState<Record<number, boolean>>({});

    console.log(checkedStudents)
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

    const handleStudentCheckboxChange = (studentId: number, isChecked: boolean) => {
        setCheckedStudents(prev => ({
            ...prev,
            [studentId]: isChecked
        }));
    };

    const handleSelectAllChange = (e: ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        // Check if students is not undefined and not empty
        if (students && students.length > 0) {
            const newCheckedStudents = students.reduce((acc, student) => {
                acc[student.studentid] = isChecked;
                return acc;
            }, {} as Record<number, boolean>);
            setCheckedStudents(newCheckedStudents);
        } else {
            // Handle the scenario where there are no students (optional)
            setCheckedStudents({});
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



        /* 
                #######################
                FORM SUBMISSION PROCESS 
                #######################
        */

        // when create assessment is clicked 

        // step 1: create assessment

        // const { data: assessment, error: assessmenterror } = await supabase
        //     .from('assessmenttable')
        //     .insert([
        //         { assessmentdate: assessmentdate, assessmenttype: assessmenttype, assessmentname: assessmentname, schoolid: 1 },
        //     ]);

        // step 2: create question record

        // step 2a: create linked subtopic records

        // step 3: create the answer table record
        // for each question
        // for each student
        // create answer



        // const { data, error } = await supabase
        //     .from('assessmenttable')
        //     .insert([
        //         { assessmentdate: assessmentdate, assessmenttype: assessmenttype, assessmentname: assessmentname, schoolid: 1 },
        //     ]);

        // if (error) {
        //     console.error("Error inserting data:", error);
        //     return; // Prevent further code execution in case of error.
        // }
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

                <div className="mb-4">
                    <fieldset>
                        <legend className="text-sm font-medium text-gray-700">Select Students</legend>
                        <div className="mb-4 mt-4">
                            <input
                                type="checkbox"
                                id="select-all-students"
                                onChange={handleSelectAllChange}
                                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                            />
                            <label htmlFor="select-all-students" className="ml-2 text-sm text-gray-700">
                                Select All Students
                            </label>
                        </div>

                        <div className="mt-2 flex flex-wrap -mx-2"> {/* Use flexbox here */}
                            {studentColumns.map((column, idx) => (
                                <div key={idx} className="px-2 w-1/4"> {/* Adjust width as needed */}
                                    {column.map(student => (
                                        <div key={student.studentid} className="flex items-center mb-2">
                                            <input
                                                id={`student-${student.studentid}`}
                                                type="checkbox"
                                                checked={checkedStudents[student.studentid] || false}
                                                onChange={(e) => handleStudentCheckboxChange(student.studentid, e.target.checked)}
                                                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                            />
                                            <label htmlFor={`student-${student.studentid}`} className="ml-2 block text-sm text-gray-900">
                                            {student.studenttable.lastname}, {student.studenttable.firstname}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </fieldset>
                </div>

                <button type="submit" className="inline-block border border-primaryColor hover:bg-secondaryColor hover:text-white hover:border-white text-primaryColor rounded px-4 py-2 transition duration-200">Create Assessment</button>
            </form>
        </div>
    );
}


