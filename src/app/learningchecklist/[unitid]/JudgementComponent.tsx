'use client'
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

interface ConfidenceLevelColors {
    [key: string]: string;
}

const confidenceLevelColors: ConfidenceLevelColors = {
    "Needs Significant Study": "bg-red-300",
    "Requires Revision": "bg-yellow-300",
    "Almost Secure": "bg-green-200",
    "Fully Secure": "bg-green-500"
};

const JudgmentComponent = ({ studentId, subtopic, confidenceLevels }: Props) => {
    const [selectedJudgment, setSelectedJudgment] = useState<string | null>(null);


    // Create a Supabase client configured to use cookies
    const supabase = createClientComponentClient()

    useEffect(() => {
        const getSelectedJudgment = async () => {
            
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

    // Get color class based on selectedJudgment value
    const getColorClass = (judgment: string | null) => {
        if (!judgment) return "text-gray-400"; // Default color
        return confidenceLevelColors[judgment] || "text-gray-400";
    }

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
            className={`${getColorClass(selectedJudgment)} border  border-black rounded p-1`} // Use the function to set the class
            value={selectedJudgment || ""}
            onChange={handleJudgmentChange}
        >
            <option disabled value="">
                No Judgement
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
