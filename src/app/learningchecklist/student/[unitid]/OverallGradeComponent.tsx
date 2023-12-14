'use client'
import { getGCSEGrade, getAlevelGrade } from '@/lib/gradeBoundaries';
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
    unitId: number;
    assessmentType: boolean;
    startDate: string;
    endDate: string;
}

interface ConfidenceLevelColors {
    [key: string]: string;
}


const OverallGrade = ({ studentId, unitId, assessmentType, startDate, endDate }: Props) => {

    const [totalMarks, setTotalMarks] = useState(0);
    const [percentage, setPercentage] = useState(0);
    const [totalStudentMarks, setTotalStudentMarks] = useState(0);
    const [courseLevel, setCourseLevel] = useState('GCSE');


    // Create a Supabase client configured to use cookies
    const supabase = createClientComponentClient()

    useEffect(() => {
        const getAnswers = async () => {

            let query = supabase.from('historicalperformance').select('*')
                .eq('unit_id', unitId)
                .eq('student_id', studentId)

            // Add conditional filter for assessment type
            if (assessmentType) {
                query = query.eq('assessment_type', 'Assessment');
            }


            const start = new Date(startDate).toISOString();
            const end = new Date(endDate).toISOString();


            let query2 = query.gte('assessment_date', start)
                .lte('assessment_date', end);

            let { data: historicalperformance, error: historicalerror } = await query2;


            if (historicalerror) {
                console.error('Error fetching answers:', historicalerror.message);
                return;
            }

            if (!historicalperformance || historicalperformance.length === 0) {
                // Reset state or handle empty data scenario
                setTotalStudentMarks(0);
                setTotalMarks(0);
                setPercentage(0);
                setCourseLevel('');
                return;
            }

            if (historicalperformance && historicalperformance.length > 0) {
                const total = historicalperformance.reduce((sum, answer) => sum + Number(answer.mark || 0), 0);
                const totalMarks = historicalperformance.reduce((sum, answer) => sum + Number(answer.questionmarks || 0), 0);
                const percentage = (total / totalMarks) * 100
                setTotalStudentMarks(total);
                setTotalMarks(totalMarks);
                setPercentage(percentage);
                setCourseLevel(historicalperformance[0].course_level)

            }

        };

        getAnswers();

    }, [studentId, unitId, assessmentType, startDate, endDate, supabase]);

    const rounded = Number(percentage.toFixed(2));

    let grade: String;
    if (courseLevel == "GCSE") {
        grade = getGCSEGrade(rounded)
    } else {
        grade = getAlevelGrade(rounded)
    }

    return (
        <div className="bg-white rounded-md shadow-sm p-4 border border-gray-300 flex-1">
            <p className="my-10 text-6xl">{courseLevel} Grade: {grade} </p>
            <p className="text-4xl ml-10 mb-10">({totalStudentMarks}/{totalMarks}) {rounded}%</p>

        </div >
    );
}

export default OverallGrade;


