'use client'
import { useRouter } from 'next/navigation';

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from 'react'
import EditQuestionStaff from "./EditQuestionStaff";


export default function AssessmentQuestion({ params }: { params: { questionSlug: number } }) {

    const [question, setQuestion] = useState<any[]>([])
    const [allQuestions, setAllQuestions] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState<number | null>(null);
    // Create a Supabase client configured to use cookies
    const supabase = createClientComponentClient()

    const router = useRouter();

    useEffect(() => {
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

    

    

    return (
        <div className="container mx-auto px-4 overflow-x-auto">
            <div className="flex justify-between items-center my-4">
                {/* Previous button */}
                <button onClick={() => (router.back() )}>
                    <span className="mr-1">&lt;</span> Previous
                </button>
            </div>

            {question.length > 0 && <EditQuestionStaff questionData={question[0]} />}
        </div>



    )
}
