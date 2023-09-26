
"use client";

// import the set website url so that it can be used in vercel
import SubTopicDropDown from "@/components/SubTopicDropDown";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// import use router, make sure it is from next/navigation
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react';

import { useTransition } from "react";

export default function CommentForm({ slug, studentId }: { slug: string; studentId: number }) {


    // create the router hook to trigger a page refresh
    const router = useRouter()

    // create the transition hook to manage the transition of the page refresh
    const [isPending, startTransition] = useTransition()


    // State for the selected subtopic
    const [selectedSubtopic, setSelectedSubtopic] = useState<number | null>(null);

    const handleSubtopicChange = (subtopicId: number) => {
        setSelectedSubtopic(subtopicId);
    }

    // async function to handle the form submission
    async function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
        // prevent refresh of the page on submit
        event.preventDefault();


        //store the comment data from teh form in a temp variable called comment
        //  @ts-ignore
        const questionnumber = event.target.questionnumber.value
        //  @ts-ignore
        const questionorder = event.target.questionorder.value
        //  @ts-ignore
        const marksavailable = event.target.marksavailable.value
        //  @ts-ignore
        const mark = event.target.mark.value


        // Create a Supabase client configured to use cookies
        const supabase = createClientComponentClient()

        // carry out the update of the database table from the form data
        const { data: newQuestion, error: newQuestionError } = await supabase
            .from('questiontable')
            .insert([
                {
                    assessmentid: slug,  // Assuming slug is the assessment ID
                    questionnumber: questionnumber,
                    questionorder: questionorder,
                    noofmarks: marksavailable
                }
            ]).select();

        if (newQuestionError) {
            console.error("Error inserting new question:", newQuestionError);
            return;
        }

        console.log(newQuestion)
        // @ts-ignore
        const questionId = newQuestion[0].questionid;

        // insert record into questionsubtopictable
        await supabase
            .from('questionsubtopictable')
            .insert([
                {
                    questionid: questionId,
                    subtopicid: selectedSubtopic
                }
            ]);

        await supabase
            .from('answertable')
            .insert([
                {
                    questionid: questionId,
                    studentid: studentId,
                    mark: mark
                }
            ]);

            // THIS ISNT WORKING

        //  @ts-ignore
        event.target.questionnumber.value = "";
        //  @ts-ignore
        event.target.questionorder.value = questionorder + 1;
        //  @ts-ignore
        event.target.marksavailable.value = "";
        //  @ts-ignore
        event.target.mark.value = "";

        startTransition(() => {
            router.refresh();

        })



    }

    return (
        <div className="add-question-container p-4 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Add New Question</h2>

            <form className="space-y-6" onSubmit={handleFormSubmit}>
                <div className="question-details bg-gray-100 p-4 rounded-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="block">
                            <span className="text-gray-700" >Question Number:</span>
                            <input type="text" name="questionnumber" className="mt-1 p-2 w-full rounded-md" placeholder="Enter Question Number" />
                        </label>
                        <label className="block">
                            <span className="text-gray-700">Question Order:</span>
                            <input type="text" name="questionorder" className="mt-1 p-2 w-full rounded-md" placeholder="Enter Question Order" />
                        </label>
                        <label className="block">
                            <span className="text-gray-700">Marks Available:</span>
                            <input type="text" name="marksavailable" className="mt-1 p-2 w-full rounded-md" placeholder="Enter Marks Available" />
                        </label>
                        <label className="block">
                            <span className="text-gray-700">Marks:</span>
                            <input type="text" name="mark" className="mt-1 p-2 w-full rounded-md" placeholder="Enter Marks Achieved" />
                        </label>
                    </div>

                    <div className="mt-4 space-y-2">
                        <SubTopicDropDown
                            selectedSubtopicId={selectedSubtopic}
                            onSubtopicChange={handleSubtopicChange}
                        />
                    </div>
                </div>

                <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md mt-6">Add Question</button>
            </form>
        </div>
    )
}



