'use client'

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from 'react'
import EditQuestion from "./EditQuestion";


export default function AssessmentQuestion({ params }: { params: { questionSlug: number } }) {

    const [question, setQuestion] = useState<any[]>([])

    // Create a Supabase client configured to use cookies
    const supabase = createClientComponentClient()

    
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

        getQuestion()
    }, [supabase, setQuestion])

    return (
        <div className="container mx-auto overflow-x-auto">
            {question.length > 0 && <EditQuestion questionData={question[0]} />}
        </div>


    )
}
