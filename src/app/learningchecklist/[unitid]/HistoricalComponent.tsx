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
    subtopicId: number;
    assessmentType: boolean;
    startDate: string;
    endDate: string;
}

interface ConfidenceLevelColors {
    [key: string]: string;
}


const HistoricalComponent = ({ studentId, subtopicId, assessmentType, startDate, endDate }: Props) => {

    const [totalMarks, setTotalMarks] = useState(0);
    const [percentage, setPercentage] = useState(0);
    const [totalStudentMarks, setTotalStudentMarks] = useState(0);
    const [courseLevel, setCourseLevel] = useState('GCSE');


    // Create a Supabase client configured to use cookies
    const supabase = createClientComponentClient()

    useEffect(() => {
        const getAnswers = async () => {
            // let { data: historicalperformance, error: historicalerror } = await supabase
            //     .from('historicalperformance')
            //     .select('*')
            //     .eq('subtopic_id', subtopicId)
            //     .eq('student_id', studentId)

            let query = supabase.from('historicalperformance').select('*')
                .eq('subtopic_id', subtopicId)
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

    }, [studentId, subtopicId, assessmentType, startDate, endDate, supabase]);

    const rounded = Number(percentage.toFixed(2));

    let grade: String;
    if (courseLevel == "GCSE") {
        grade = getGCSEGrade(rounded)
    } else {
        grade = getAlevelGrade(rounded)
    }

    return (
        <>
            {totalMarks === 0 ? (
                <>
                    <p>No Data Available</p>
                </>
            ) : (
                <>
                    <p>({totalStudentMarks}/{totalMarks}) {rounded}%</p>
                    <p className="mt-2">{courseLevel} Grade: {grade} </p>
                </>
            )}
        </>

    );
}

export default HistoricalComponent;


