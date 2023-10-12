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

        getQuestion();
    }, [supabase, setQuestion])



    return (
        <div className="container mx-auto px-4 overflow-x-auto">
            <div className="flex justify-between items-center my-4">
                {/* Previous button back retursn to the previous history stack location */}
                <button type="button" onClick={() => router.back()}>
                    <span className="mr-1">&lt;</span> Previous
                </button>
 
            </div>

            {question.length > 0 && <EditQuestion questionData={question[0]} />}
        </div>



    )
}
