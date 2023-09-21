'use client'
import { useRouter } from 'next/navigation';

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from 'react'
import EditQuestion from "./EditQuestion";


export default function AssessmentQuestion({ params }: { params: { questionSlug: number } }) {

    const [question, setQuestion] = useState<any[]>([])
    const [allQuestions, setAllQuestions] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState<number | null>(null);
    // Create a Supabase client configured to use cookies
    const supabase = createClientComponentClient()

    const router = useRouter();

    // Assuming you have a state called allQuestions which is an array of all questions.
// And a state called currentIndex which is the index of the current question in the allQuestions array.

    useEffect(() => {
        // if (!params.questionID) {
        //     console.log("no ID")
        //     return;
        // }

        const getQuestion = async () => {

            const { data: assessmentData, error: assessmentDataError } = await supabase
                .from('questiontable')
                .select(`
                    questionid, 
                    assessmentid, 
                    questionnumber, 
                    questionorder, 
                    noofmarks,
                    questionsubtopictable (
                        subtopictable (
                            subtopictitle, 
                            subtopicid,
                            topictable (
                                topictitle,
                                topicid,
                                unittable (
                                    unittitle, 
                                    unitnumber, 
                                    unitid
                                )
                            )
                        )
                    ),
                    answertable (
                        answerid, 
                        questionid, 
                        studentid, 
                        mark,
                        studenttable(studentid, firstname, lastname)
                    )
                )
            `).eq('questionid', `${params.questionSlug}`)

        

                if (assessmentData) {
                    setQuestion(assessmentData)
                } else {
                    console.log(assessmentDataError);
                }
        }

        const getAllQuestions = async () => {
            const { data, error } = await supabase
                .from('questiontable')
                .select('questionid, questionorder')
                .order('questionorder', { ascending: true });
    
            if (data) {
                setAllQuestions(data);
                const index = data.findIndex(q => q.questionid === params.questionSlug);
                setCurrentIndex(index);
            } else {
                console.log(error);
            }
        }

        getQuestion();
        getAllQuestions();
    }, [supabase, setQuestion])

    const redirectToPreviousQuestion = () => {
        // @ts-ignore
        if (currentIndex > 0) { // If there's a previous question
        // @ts-ignore
    
            const previousQuestionId = allQuestions[currentIndex - 1].questionid;
            
            // Assuming your route structure is /questions/[questionSlug] or similar
            router.push(`/questions/${previousQuestionId}`);
        } else {
            console.log("This is the first question, no previous question available.");
        }
    };

    const handleNavigate = (direction: "next" | "prev") => {
        if (currentIndex !== null) {
            if (direction === "next" && currentIndex < allQuestions.length - 1) {
                const nextQuestionId = allQuestions[currentIndex + 1].questionid;
                router.push(`./${nextQuestionId}`);
            } else if (direction === "prev" && currentIndex > 0) {
                const prevQuestionId = allQuestions[currentIndex - 1].questionid;
                router.push(`./${prevQuestionId}`);
            } else {
                if (direction === "next") {
                    console.log("This is the last question, no next question available.");
                } else {
                    console.log("This is the first question, no previous question available.");
                }
            }
        }
    };
    
    return (
        <div className="container mx-auto px-4 overflow-x-auto">
    <div className="flex justify-between items-center my-4">
        {/* Previous button */}
        <button onClick={() => handleNavigate("prev")}>
            <span className="mr-1">&lt;</span> Previous
        </button>

        {/* Next button */}
        <button onClick={() => handleNavigate("next")}>
            Next <span className="ml-1">&gt;</span>
        </button>
    </div>
    
    {question.length > 0 && <EditQuestion questionData={question[0]} />}
</div>



    )
}
