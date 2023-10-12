'use client'

// TODO: Duplicate or move this file outside the `_examples` folder to make it a route

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState, useCallback } from 'react'

type Unit = {
    unittitle: string;
    unitnumber: string;
    unitid: number;
};

type Topic = {
    topictitle: string;
    topicid: number;
    unittable: Unit;
};

type Subtopic = {
    subtopictitle: string;
    subtopicid: number;
    topictable: Topic;
};

type QuestionSubtopicTable = {
    subtopictable: Subtopic;
};

type Student = {
    studentid: number;
    firstname: string;
    lastname: string;
};

type Answer = {
    answerid: number;
    questionid: number;
    studentid: number;
    mark: number;
    studenttable: Student;
};

type QuestionData = {
    questionid: number;
    assessmentid: number;
    questionnumber: string;
    questionorder: number;
    noofmarks: number;
    questionsubtopictable: QuestionSubtopicTable[];
    answertable: Answer[];
};

interface EditQuestionProps {
    questionData: QuestionData;
}
type Props = {
    questionData: QuestionData;  // Assuming you've already defined the type 'QuestionData'
};

export default function EditQuestion({ questionData }: Props) {

    const [editableQuestionData, setEditableQuestionData] = useState(questionData);
    const [answers, setAnswers] = useState(questionData.answertable);
    const [dataChangeFlag, setDataChangeFlag] = useState(false);


    // Create a Supabase client configured to use cookies
    const supabase = createClientComponentClient()

    const handleQuestionDataChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof QuestionData) => {
        setEditableQuestionData({
            ...editableQuestionData,
            [field]: e.target.value
        });
        setDataChangeFlag(true)
    };

    const handleAnswerChange = (e: React.ChangeEvent<HTMLInputElement>, answerId: number) => {
        const updatedAnswers = answers.map(answer =>
            answer.answerid === answerId
                ? { ...answer, mark: Number(e.target.value) }
                : answer
        );
        setAnswers(updatedAnswers);
        setDataChangeFlag(true)

    };

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionMessage, setSubmissionMessage] = useState("");

    const updateQuestionData = useCallback(
        async () => {
            const { data:questionData, error:questionError } = await supabase
                .from('questiontable')
                .update({
                    questionnumber: editableQuestionData.questionnumber,
                    questionorder: editableQuestionData.questionorder,
                    noofmarks: editableQuestionData.noofmarks
                })
                .eq('questionid', editableQuestionData.questionid)
                .select();

                if (questionError) {
                    console.error("Error updating question:", questionError);
                    setSubmissionMessage("Error updating question. Please try again.");
                    return;  // Exit early if there's an error
                }
        
                // Updating the student data
                const updateStudentPromises = answers.map(answer =>
                    supabase
                        .from('answertable')
                        .update({ mark: answer.mark })
                        .eq('answerid', answer.answerid)
                );
                const studentResults = await Promise.all(updateStudentPromises);
        
                // Check for any errors in updating the student data
                const studentErrors = studentResults.filter(result => result.error);
                if (studentErrors.length > 0) {
                    console.error("Errors updating student data:", studentErrors);
                    setSubmissionMessage("Error updating student data. Please try again.");
                } else {
                    setSubmissionMessage("Question and student data updated successfully!");
                    setDataChangeFlag(false);  // set data change to false after data uploaded
                }
            },
            [supabase, editableQuestionData, questionData.questionid, answers]
        );
    
    const handleFormSubmit =  (e: React.FormEvent) => {
        e.preventDefault();

        if (isSubmitting) return;  // Prevent multiple submissions
        setIsSubmitting(true);  // Set submitting state to true
        
        // check if the data has been altered, if so send back to server
        if (dataChangeFlag == true) {
            console.log('Updated Question Data:', editableQuestionData);
            console.log('Updated Answers:', answers);

            updateQuestionData();

        } else {
            setSubmissionMessage("Data not altered!");
        }
        setIsSubmitting(false);  // Set submitting state to false after submitting
    };

    return (
        <div className="edit-question-container p-4 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Edit Question Results</h2>

            <form className="space-y-6" onSubmit={handleFormSubmit}>
                <div className="question-details bg-gray-100 p-4 rounded-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="block">
                            <span className="text-gray-700">Question Number:</span>
                            <input
                                type="text"
                                value={editableQuestionData.questionnumber}
                                onChange={(e) => handleQuestionDataChange(e, 'questionnumber')}
                                className="mt-1 p-2 w-full rounded-md"
                            />
                        </label>
                        <label className="block">
                            <span className="text-gray-700">Question Order:</span>
                            <input
                                type="text"
                                value={editableQuestionData.questionorder}
                                onChange={(e) => handleQuestionDataChange(e, 'questionorder')}
                                className="mt-1 p-2 w-full rounded-md"
                            />
                        </label>
                        <label className="block">
                            <span className="text-gray-700">No of Marks:</span>
                            <input
                                type="text"
                                value={editableQuestionData.noofmarks}
                                onChange={(e) => handleQuestionDataChange(e, 'noofmarks')}
                                className="mt-1 p-2 w-full rounded-md"
                            />
                        </label>
                    </div>

                    <div className="mt-4 space-y-2">
                        <p className="text-gray-700">Unit: {questionData.questionsubtopictable[0].subtopictable.topictable.unittable.unittitle}</p>
                        <p className="text-gray-700">Topic: {questionData.questionsubtopictable[0].subtopictable.topictable.topictitle}</p>
                        <p className="text-gray-700">Subtopic: {questionData.questionsubtopictable[0].subtopictable.subtopictitle}</p>
                    </div>
                </div>

                <div className="student-results bg-gray-100 p-4 rounded-md">
                    <h3 className="text-xl font-semibold mb-4">Student Results</h3>

                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 text-left text-gray-700">Students</th>
                                    <th className="px-4 py-2 text-left text-gray-700">Marks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {answers.map((answer) => (
                                    <tr key={answer.answerid} className="border-t">
                                        <td className="px-4 py-2">{answer.studenttable.firstname} {answer.studenttable.lastname}</td>
                                        <td className="px-4 py-2">
                                            <input
                                                type="text"
                                                value={answer.mark}
                                                onChange={(e) => handleAnswerChange(e, answer.answerid)}
                                                className="p-2 w-20 rounded-md"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md mt-6">Save Changes</button>
            </form>
        </div>

    );
}
