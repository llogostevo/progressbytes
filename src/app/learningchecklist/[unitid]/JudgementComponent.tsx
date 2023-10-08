'use client'

// TODO: Duplicate or move this file outside the `_examples` folder to make it a route

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'

interface Subtopic {
    subtopicid: number;
    topicid: number;
    subtopicnumber: string;
    subtopictitle: string;
    subtopicdescription: string;
    created_at: Date;
    updated_at: Date;
}

interface Props {
    studentId: number;
    subtopic: Subtopic;
    confidenceLevels: string[];
}

const JudgmentComponent = ({ studentId, subtopic, confidenceLevels }: Props) => {
    const [selectedJudgment, setSelectedJudgment] = useState<string | null>(null);


    // Create a Supabase client configured to use cookies
    const supabase = createClientComponentClient()

    useEffect(() => {
        const getSelectedJudgment = async () => {
            // This assumes you have a `todos` table in Supabase. Check out
            // the `Create Table and seed with data` section of the README 👇
            // https://github.com/vercel/next.js/blob/canary/examples/with-supabase/README.md
            //   const { data } = await supabase.from('judgementtable').select()

            let { data: judgementtable, error } = await supabase
                .from('judgementtable')
                .select('judgment')
                .eq('subtopicid', `${subtopic.subtopicid}`)
                .eq('studentid', `${studentId}`)


            if (judgementtable && judgementtable.length > 0) {
                setSelectedJudgment(judgementtable[0].judgment);
            }

        }

        getSelectedJudgment()
    }, [supabase, setSelectedJudgment])

    const handleJudgmentChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newJudgment = e.target.value;
        setSelectedJudgment(newJudgment); // Optimistic UI update.
        try {
            const { data, error } = await supabase
                .from('judgementtable')
                .upsert([
                    {
                        subtopicid: subtopic.subtopicid,
                        studentid: studentId,
                        judgment: newJudgment
                    }
                ], {
                    onConflict: 'subtopicid,studentid',  // unique constraints.
                });

            if (error) throw error;
            // Optionally handle data.
        } catch (error) {
            console.error("Error managing judgment:", error);
            // Handle error in your UX.
            setSelectedJudgment(selectedJudgment); // Revert optimistic update if API call fails.
        }
    };

    return (
        <select
            className="text-gray-400 border rounded p-1"
            value={selectedJudgment || ""}
            onChange={handleJudgmentChange}
        >
            <option disabled value="">
                No Judgment
            </option>
            {confidenceLevels.map((level) => (
                <option key={level} value={level}>
                    {level}
                </option>
            ))}
        </select>

    );
}

export default JudgmentComponent;
