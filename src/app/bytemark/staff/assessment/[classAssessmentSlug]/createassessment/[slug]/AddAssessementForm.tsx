'use client'
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { SupabaseClient } from '@supabase/supabase-js';

// import use router, make sure it is from next/navigation
import { useRouter } from 'next/navigation'

import { useTransition } from "react";

import { useState, ChangeEvent } from 'react';
import TooltipModalButton from "@/components/tooltipModal/TooltipModalButton";
import CourseSubTopicDropDown from "@/components/CourseSubTopicDropDown";

type AddAssessmentData = {
    assessmentdate: string;
    assessmentname: string;
    assessmenttype: string;
};

type PropStudent = {
    studentid: number;
    firstname: string;
    lastname: string;
};

type PropsStudents = {
    studentid: number;
    courseid: number;
    studenttable: PropStudent;
}[];

interface Question {
    questionNumber: string;
    questionOrder: number | null;
    numberOfMarks: number | null;
    subtopic: number | null;
}

interface Question {
    questionNumber: string;
    questionOrder: number | null;
    numberOfMarks: number | null;
    subtopic: number | null;
}

interface Student {
    studentid: number;
}

function formatDateToUKFormat(dateString: string): string {
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
}

function chunkArray(array: PropsStudents, size: number): PropsStudents[] {
    return array.reduce((acc, val, i) => {
        let idx = Math.floor(i / size);
        let page = acc[idx] || (acc[idx] = []);
        page.push(val);

        return acc;
    }, [] as PropsStudents[]);
}



export default function AddAssessmentForm({ students }: { students: PropsStudents }) {
    // create the router hook to trigger a page refresh
    const router = useRouter()

    // Create a Supabase client configured to use cookies
    const supabase = createClientComponentClient()

    // State for the selected subtopic
    const [selectedSubtopic, setSelectedSubtopic] = useState<number | null>(null);

    const handleSubtopicChange = (index: number, subtopicId: number | null) => {
        const newQuestions = [...questions];
        newQuestions[index].subtopic = subtopicId;
        setQuestions(newQuestions);
    };



    // Assuming `students` is of type Students[]
    let studentColumns: PropsStudents[] = [];

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

    const [questions, setQuestions] = useState<Question[]>([
        { questionNumber: '', questionOrder: null, numberOfMarks: null, subtopic: null }
    ]);


    // Function to handle adding a new question
    const addQuestion = () => {
        setQuestions([...questions, { questionNumber: '', questionOrder: null, numberOfMarks: null, subtopic: null }]);
    };

    // Function to handle removing a question
    const removeQuestion = (index: number) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    // Function to handle question changes
    const handleQuestionChange = (index: number, field: keyof Question, value: string) => {
        const newQuestions = [...questions];

        if (field === 'subtopic') {
            // Convert value to number or null for 'subtopic'
            newQuestions[index][field] = value ? Number(value) : null;
        } else if (field === 'questionOrder' || field === 'numberOfMarks') {
            // Convert value to number for 'questionOrder' and 'numberOfMarks', using null for empty strings
            newQuestions[index][field] = value === '' ? null : Number(value);
        } else {
            // For other fields, keep them as strings
            newQuestions[index][field] = value;
        }
        setQuestions(newQuestions);
    };


    const [selectedAssessmentType, setAssessmentType] = useState('Assessment');

    const [assessmentData, setAssessmentData] = useState<AddAssessmentData>({
        assessmentdate: new Date().toISOString().slice(0, 10),
        assessmentname: `${selectedAssessmentType}: ` + formatDateToUKFormat(new Date().toISOString().slice(0, 10)),
        assessmenttype: selectedAssessmentType
    });

    const [checkedStudents, setCheckedStudents] = useState<Record<number, boolean>>({});

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

    // Function to insert data for a single question
    async function insertSingleQuestionData(question: Question,
        students: Student[],
        assessmentId: number,
        supabase: SupabaseClient) {

        // Insert question and get questionid
        const { data: questionData, error: questionError } = await supabase
            .from('questiontable')
            .insert([{
                assessmentid: assessmentId,
                questionnumber: question.questionNumber,
                questionorder: question.questionOrder,
                noofmarks: question.numberOfMarks,
                studentaccess: 'read_only',
            }])
            .select('questionid');

        if (questionError) {
            console.error("Error inserting question:", questionError);
            throw questionError; // throw the error to be caught by Promise.all
        }

        const questionId = questionData?.[0].questionid;

        // Insert subtopic record
        const { error: subtopicError } = await supabase
            .from('questionsubtopictable')
            .insert([{
                questionid: questionId,
                subtopicid: question.subtopic,
            }]);

        if (subtopicError) {
            console.error("Error inserting subtopic:", subtopicError);
            throw subtopicError; // throw the error to be caught by Promise.all
        }

        // Create answer records for each student
        const answerPromises = students.map(student => {
            return supabase
                .from('answertable')
                .insert([{
                    questionid: questionId,
                    studentid: student.studentid,
                    mark: 0, // Assuming default mark is 0
                    // Include other necessary fields
                }]);
        });

        // Wait for all answer records to be inserted for the current question
        await Promise.all(answerPromises);
    }


    if (!Array.isArray(questions) || !Array.isArray(students)) {
        console.error("Invalid data provided");
        return;
    }
    // async function to handle the form submission
    async function handleCreateAssessment(event: React.FormEvent<HTMLFormElement>) {
        // prevent refresh of the page on submit
        event.preventDefault();
        // Call the function with questions and students array

        const { data: schoolid, error: errorschool } = await supabase
            .from('studenttable')
            .select('schoolid')
            .eq('studentid', students[0].studentid)

        // step 1: create assessment
        const { data: newassessmentdata, error: assessmentError } = await supabase
            .from('assessmenttable')
            .insert([
                {
                    assessmentdate: assessmentData.assessmentdate,
                    assessmenttype: assessmentData.assessmenttype,
                    assessmentname: assessmentData.assessmentname,
                    schoolid: schoolid?.[0].schoolid
                },
            ])
            .select('assessmentid')

        // Filter out only checked students
        const checkedStudentIds = Object.entries(checkedStudents)
            .filter(([_, isChecked]) => isChecked)
            .map(([studentId, _]) => parseInt(studentId));

        const checkedStudentsList = students.filter(student =>
            checkedStudentIds.includes(student.studentid));

        // Call insertSingleQuestionData for each question with filtered students
        const insertPromises = questions.map(question =>
            insertSingleQuestionData(question, checkedStudentsList, newassessmentdata?.[0].assessmentid, supabase)
        );

        Promise.all(insertPromises).then(() => {
            console.log('All questions and related data inserted successfully');
            // Handle successful insertion for all questions
        }).catch(error => {
            console.error('An error occurred during batch insertion:', error);
            // Handle errors that occurred during the insertion process
        });

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
                <h2 className="mt-5 text-2xl">Assessment Details</h2>
                <div className="flex ml-10 mb-6 flex-col mt-5 md:flex-row">
                    <div className=" md:mr-2 mb-4 md:flex-1">
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

                <div className="mb-4 ml-10">
                    <label htmlFor="assessmentname" className="block text-sm font-medium text-gray-700">Assessment Name</label>
                    <input
                        type="text"
                        id="assessmentname"
                        value={assessmentData.assessmentname}
                        onChange={handleInputChange}
                        className="mt-1 p-2 border rounded w-full"
                    />
                </div>

                <h2 className="mt-5 text-2xl">Students</h2>

                <div className="mt-5 ml-10 mb-4">
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
                <h2 className="questions-title text-2xl mb-4">Questions</h2>
                <div className="ml-10">
                    <div className="question-fields-header flex flex-row gap-3 mb-2">
                        {/* Header labels */}
                        <div className="w-24 text-center">
                            <label className="block text-sm font-medium text-gray-700">Question Number</label>
                        </div>
                        <div className="w-24 text-center">
                            <label className="block text-sm font-medium text-gray-700">Question Order</label>
                        </div>
                        <div className="w-24 text-center">
                            <label className="block text-sm font-medium text-gray-700">No. Of Marks</label>
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700">Topic</label>
                        </div>
                        <div className="w-20"> {/* Empty column for alignment with the remove button */}
                        </div>
                    </div>

                    {questions.map((question, index) => (

                        <div key={index} className="question-fields flex items-center mb-4">
                            {/* Question Fields */}
                            <div className="flex-grow flex flex-row gap-3">
                                {/* Question Number */}
                                <div className="flex flex-col w-24">
                                    <input
                                        type="text"
                                        id={`question-number-${index}`}
                                        className="mt-1 py-2 px-4 border rounded"
                                        onChange={(e) => handleQuestionChange(index, 'questionNumber', e.target.value)}
                                        // tabIndex={1}
                                    />

                                </div>

                                {/* Question Order */}
                                <div className="flex flex-col w-24">
                                    <input
                                        type="text"
                                        id={`question-order-${index}`}
                                        className="mt-1 py-2 px-4 border rounded w-full"
                                        onChange={(e) => handleQuestionChange(index, 'questionOrder', e.target.value)}
                                        // tabIndex={2}
                                    />

                                </div>

                                {/* No. Of Marks */}
                                <div className="flex flex-col w-24">
                                    <input
                                        type="text"
                                        id={`question-marks-${index}`}
                                        className="mt-1 py-2 px-4 border rounded w-full"
                                        onChange={(e) => handleQuestionChange(index, 'numberOfMarks', e.target.value)}
                                        // tabIndex={3}
                                    />
                                </div>

                                {/* Topic */}
                                <div className="flex flex-col flex-1">
                                    <CourseSubTopicDropDown
                                        courseId={students[0].courseid}
                                        selectedSubtopicId={question.subtopic}
                                        onSubtopicChange={(subtopicId) => handleSubtopicChange(index, subtopicId)}
                                    />
                                </div>
                            </div>

                            {/* Remove Button */}
                            <div className="ml-4">
                                <button
                                    type="button"
                                    onClick={() => removeQuestion(index)}
                                    className="px-2 py-1 text-white bg-red-500 hover:bg-red-700 rounded"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                    {/* Add Button */}
                    <button
                        type="button"
                        onClick={addQuestion}
                        className="mt-4 px-4 py-2 text-white bg-blue-500 hover:bg-blue-700 rounded"
                    >
                        Add Question
                    </button>
                </div>


                <button type="submit" className="inline-block border mt-10 border-primaryColor hover:bg-secondaryColor hover:text-white hover:border-white text-primaryColor rounded px-4 py-2 transition duration-200">Create Assessment</button>
            </form>
        </div>
    );
}


