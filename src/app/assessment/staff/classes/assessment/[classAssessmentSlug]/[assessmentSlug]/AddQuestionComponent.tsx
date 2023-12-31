"use client";

// import SubTopicDropDown from "@/components/SubTopicDropDown";
import SubTopicDropDownSearch from "@/components/SubTopicDropDownSearch";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// import use router, make sure it is from next/navigation
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react';

import { useTransition } from "react";

interface StudentEntry {
    id: number;
    name: string;
}

interface AddQuestionComponentProps {
    assessmentId: string;
    uniqueStudents: StudentEntry[]; // Using the StudentEntry type here
}

export default function AddQuestionComponent({ assessmentId, uniqueStudents }: AddQuestionComponentProps) {

    const dropDownStudentId = uniqueStudents[0].id
    // Create a Supabase client configured to use cookies
    const supabase = createClientComponentClient()

    // create the router hook to trigger a page refresh
    const router = useRouter()

    // create the transition hook to manage the transition of the page refresh
    const [isPending, startTransition] = useTransition()


    // State for the selected subtopic
    const [selectedSubtopic, setSelectedSubtopic] = useState<number | null>(null);

    const handleSubtopicChange = (subtopicId: number) => {
        setSelectedSubtopic(subtopicId);
    }

    // State for the next question order
    const [nextQuestionOrder, setNextQuestionOrder] = useState<number | null>(null);


    // Function to fetch and set the next question order
    const fetchNextQuestionOrder = async () => {
        // const supabase = createClientComponentClient()

        // Retrieve the highest 'questionorder' for the current assessment.
        const { data: highestOrderData, error: highestOrderError } = await supabase
            .from('questiontable')
            .select('questionorder')
            .eq('assessmentid', assessmentId)
            .order('questionorder', { ascending: false })
            .limit(1);

        if (highestOrderError) {
            console.error("Error fetching highest order:", highestOrderError);
            return;
        }

        // Calculate the new 'questionorder'.
        const newOrder = highestOrderData && highestOrderData[0]
            ? highestOrderData[0].questionorder + 1
            : 1;

        setNextQuestionOrder(newOrder);
    }

    useEffect(() => {
        fetchNextQuestionOrder();
    }, []);

    const [initialQuestionNumber, setInitialQuestionNumber] = useState<number | null>(null);
    useEffect(() => {
        if (nextQuestionOrder !== null && initialQuestionNumber === null) {
            // Only set the initial question number if it hasn't been set yet
            setInitialQuestionNumber(nextQuestionOrder);
        }
    }, [nextQuestionOrder]);

    // New state for manually entered question order
    const [userQuestionOrder, setUserQuestionOrder] = useState<number | null>(null);

    // Handler for when the user manually changes the question order
    const handleQuestionOrderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        // Convert the input string to number and save it to state
        setUserQuestionOrder(Number(event.target.value));
    }

    const [suberror, setSubError] = useState<string | null>(null);

    // async function to handle the form submission
    async function handleFormSubmit(event: React.FormEvent<HTMLFormElement>) {
        // prevent refresh of the page on submit
        event.preventDefault();

        // @ts-ignore
        const marksAvailable = parseFloat(event.target.marksavailable.value);

        if (!selectedSubtopic) {
            setSubError("Please select a subtopic");
            return;
        } else if (isNaN(marksAvailable) || marksAvailable < 1) {
            setSubError("Marks available must be at least 1");
            return;
        }

        setSubError(null); // Clear error state if validation passes


        //store the comment data from teh form in a temp variable called comment
        //  @ts-ignore
        const questionnumber = event.target.questionnumber.value
        //  @ts-ignore
        const questionorder = event.target.questionorder.value
        //  @ts-ignore
        const marksavailable = event.target.marksavailable.value


        // Use userQuestionOrder if it's not null; otherwise, use nextQuestionOrder
        const finalQuestionOrder = userQuestionOrder !== null ? userQuestionOrder : nextQuestionOrder;


        // carry out the update of the database table from the form data
        const { data: newQuestion, error: newQuestionError } = await supabase
            .from('questiontable')
            .insert([
                {
                    assessmentid: assessmentId,
                    questionnumber: questionnumber,
                    questionorder: finalQuestionOrder,  // Use state value
                    noofmarks: marksavailable
                }
            ]).select();

        if (newQuestionError) {
            console.error("Error inserting new question:", newQuestionError);
            return;
        }


        // @ts-ignore
        const questionId = newQuestion[0].questionid;


        // insert record into questionsubtopictable
        const { error: createQuestionError } =  await supabase
            .from('questionsubtopictable')
            .insert([
                {
                    questionid: questionId,
                    subtopicid: selectedSubtopic
                }
            ]);

        const answerInserts = uniqueStudents.map(student => ({
            questionid: questionId,
            studentid: student.id,
            studentaccess: 'read_only',
            mark: 0
        }));

        console.log(answerInserts)

        const { error: createAnswersError } = await supabase
            .from('answertable')
            .insert(
                answerInserts
            );

            if (createAnswersError) {
                console.log(createAnswersError)

            }

        //  @ts-ignore
        event.target.questionnumber.value = "";
        //  @ts-ignore
        event.target.marksavailable.value = "";
        //  @ts-ignore
        event.target.subtopic.value = "";
        startTransition(() => {
            router.refresh();

        })

        // Clear the form and state upon successful submission, if necessary:
        setUserQuestionOrder(null);
        setSelectedSubtopic(null);

        // fetch next question defualt for order upon successful submission
        fetchNextQuestionOrder();

    }

    return (
        <div className="add-question-container p-4 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">Add New Question</h2>

            <form className="space-y-6" onSubmit={handleFormSubmit}>
                <div className="question-details bg-gray-100 p-4 rounded-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="block">
                            <span className="text-gray-700" >Question Label:</span>
                            <input
                                type="text"
                                name="questionnumber"
                                className="mt-1 p-2 w-full rounded-md"
                                placeholder="Enter Question Number"
                                defaultValue={initialQuestionNumber ?? ''}  // Use defaultValue for initial value
                                required
                            />
                        </label>
                        <label className="block">
                            <span className="text-gray-700">Question Order:</span>
                            <input
                                type="text"
                                name="questionorder"
                                className="mt-1 p-2 w-full rounded-md"
                                placeholder="Enter Question Order"
                                value={userQuestionOrder !== null ? userQuestionOrder.toString() : nextQuestionOrder !== null ? nextQuestionOrder.toString() : ''}
                                onChange={handleQuestionOrderChange} // Add an onChange handler
                                required
                            />
                        </label>
                        <label className="block">
                            <span className="text-gray-700">Marks Available:</span>
                            <input type="text" name="marksavailable" className="mt-1 p-2 w-full rounded-md" placeholder="Enter Marks Available" required />
                        </label>
                    </div>

                    <div className="mt-4 space-y-2">
                        {/* origingal dropdown without search above */}
                        {/* <SubTopicDropDown
                            studentId = {studentId}
                            selectedSubtopicId={selectedSubtopic}
                            onSubtopicChange={handleSubtopicChange}
                        /> */}
                        <SubTopicDropDownSearch
                            studentId={dropDownStudentId}
                            selectedSubtopicId={selectedSubtopic}
                            onSubtopicChange={handleSubtopicChange}
                        />
                    </div>
                    {/* CUSTOM FORM VALIDATION ERRORS WILL DISPLAY HERE */}
                    {suberror && (
                        <p className={`text-white text-center mt-4 border p-3 bg-secondaryColor transition-opacity ease-in-out duration-500 ${suberror ? 'opacity-100' : 'opacity-0'} rounded-md`}>
                            {suberror}
                        </p>)}

                </div>

                <button type="submit" className="inline-block border px-4 py-2 border-primaryColor hover:bg-secondaryColor hover:text-white hover:border-white text-primaryColor rounded transition duration-200">Add Question</button>
            </form>
        </div>
    )
}



