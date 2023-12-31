"use client"
import LearningChecklist from '@/components/plcComponents/LearningChecklist';
import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { redirect, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react';


interface Judgment {
    subtopicid: number;
    studentid: number;
    judgment: string;
    id: number;
    created_at: Date;
    judgementdate: Date;

}

interface Subtopic {
    subtopicid: number;
    topicid: number;
    subtopicnumber: string;
    subtopictitle: string;
    subtopicdescription: string;
    created_at: Date;
    updated_at: Date;
    judgementtable?: Judgment[];
}

interface Topic {
    topicid: number;
    topicnumber: string;
    topictitle: string;
    subtopictable: Subtopic[];
    [key: string]: any;
}

interface ConfidenceLevelColors {
    [key: string]: string;
}


export default function UnitChecklist() {

    const searchParams = useSearchParams()

    const unitid = Number(searchParams.get('unitid'))
    const studentid = Number(searchParams.get('studentid'))

    const [courseId, setCourseId] = useState<number>()
    const [unitTitle, setUnitTitle] = useState<string>("")
    const [unitNumber, setUnitNumber] = useState<string>("")
    const [topics, setTopics] = useState<Topic[]>([])

    // Create a Supabase client configured to use cookies
    const supabase = createClientComponentClient()

    const confidenceLevels = ["Needs Significant Study",
        "Requires Revision",
        "Almost Secure",
        "Fully Secure"];

    const confidenceLevelColors: ConfidenceLevelColors = {
        "Needs Significant Study": "bg-red-300",
        "Requires Revision": "bg-yellow-300",
        "Almost Secure": "bg-green-200",
        "Fully Secure": "bg-green-500"
    };

    useEffect(() => {
        const getCourses = async () => {
          
          const { data: courses } = await supabase
          .from('unittable')
          .select('*')
          .eq('unitid', unitid)
  

          if (courses) {
            setCourseId(courses?.[0].courseid)
            setUnitTitle(courses?.[0].unittitle)
            setUnitNumber(courses?.[0].unitnumber)
          }
        }
    
        getCourses()
      }, [supabase, setCourseId, setUnitTitle, setUnitNumber])
   
      useEffect(() => {
        const getTopics = async () => {
          
            const { data: topicstable, error: topicserror } = await supabase
            .from('topictable')
            .select(`*,
                subtopictable:subtopictable (
                    *,
                    judgementtable:judgementtable (*)
                )
        `)
            .eq('unitid', unitid);
  

          if (topicstable) {
            setTopics(topicstable)
            
          }
        }
    
        getTopics()
      }, [supabase, setTopics])
    

    return (
        <>
            <div className="space-y-6">
                <h1 className="text-4xl mb-4 font-semibold">Personalised Learning</h1>

                <LearningChecklist
                    topics={topics as Topic[]}
                    unitTitle={unitTitle}
                    unitNumber={unitNumber}
                    unitId={unitid}
                    studentId={studentid}
                    confidenceLevelColors={confidenceLevelColors}
                    confidenceLevels={confidenceLevels}
                />
            </div>
        </>
    )
}
