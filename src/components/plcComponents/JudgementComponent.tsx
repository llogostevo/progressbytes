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

interface ShortenedConfidenceLevels {
    [key: string]: string;
}
const confidenceLevelColors: ConfidenceLevelColors = {
    "Needs Significant Study": "bg-red-100",
    "Requires Revision": "bg-yellow-100",
    "Almost Secure": "bg-green-100",
    "Fully Secure": "bg-green-300"
};

const shortenedConfidenceLevels: ShortenedConfidenceLevels = {
    "Needs Significant Study": "SigStud",
    "Requires Revision": "NeedRev",
    "Almost Secure": "Almost",
    "Fully Secure": "Secure"
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



    const handleJudgmentChange = async (newJudgment: string) => {
        // const newJudgment = e.target.value;
        setSelectedJudgment(newJudgment);
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

        <div>
            {/* Radio Button Cards for larger screens */}
            <div className="sm:flex-row md:flex-col lg:flex-row justify-around hidden sm:flex">
                {confidenceLevels.map((level) => (
                    <label
                        key={level}
                        className={`flex items-center hover:border-4 border-black text-black ${confidenceLevelColors[level]} justify-center p-2 m-1 rounded-md cursor-pointer transition-all ease-in-out duration-300 ${selectedJudgment === level ? `border-4 border-black text-black` : ' text-gray-400'}`}
                        style={{ minWidth: '100px' }}
                    >
                        <input
                            type="radio"
                            name="judgment"
                            value={level}
                            checked={selectedJudgment === level}
                            onChange={() => handleJudgmentChange(level)}
                            className="hidden"
                        />
                        <span className="text-xs">{level}</span>
                    </label>
                ))}
            </div>

            {/* Dropdowns for smaller screens */}
            <select
                className={`${getColorClass(selectedJudgment)} border border-black rounded p-1 sm:hidden`}
                value={selectedJudgment || ""}
                onChange={(e) => handleJudgmentChange(e.target.value)}
                style={{ maxWidth: '80px' }}

            >
                <option disabled value="">Select Judgement</option>
                {confidenceLevels.map((level) => (
                    <option key={level} value={level}>
                        {shortenedConfidenceLevels[level] || level}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default JudgmentComponent;
