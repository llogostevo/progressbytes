'use client'
import { getGCSEGrade, getAlevelGrade } from '@/lib/gradeBoundaries';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link';
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

interface AggregatedTopicData {
    name: string;
    totalStudentMarks: number;
    totalMarks: number;
}

type MarksByTopicType = { [key: string]: AggregatedTopicData };

interface ConfidenceLevelColors {
    [key: string]: string;
}

interface HistoricalPerformance {
    topic_number: string;
    topic_name: string;

}

// THIS NEEDS FIXING
interface HistoricalPerformanceItem {
    topic_number: string;
    topic_name: string;
    mark: number | string;  // Adjust this type based on your actual data
    questionmarks: number | string;  // Adjust this type as well
    // Add other properties from historicalperformance items if needed
}

const TopicGrade = ({ studentId, unitId, assessmentType, startDate, endDate }: Props) => {

    const [totalMarks, setTotalMarks] = useState(0);
    const [percentage, setPercentage] = useState(0);
    const [totalStudentMarks, setTotalStudentMarks] = useState(0);
    const [courseLevel, setCourseLevel] = useState('GCSE');
    const [historicalPerformanceData, setHistoricalPerformanceData] = useState<HistoricalPerformance[]>([]);


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
                const marksByTopic: MarksByTopicType = {};
    
                let totalStudentMarksAccumulator = 0;
                let totalMarksAccumulator = 0;
    
                historicalperformance.forEach((item: HistoricalPerformanceItem) => {
                    const topicKey = item.topic_number;
                    if (!marksByTopic[topicKey]) {
                        marksByTopic[topicKey] = {
                            name: item.topic_name,
                            totalStudentMarks: 0,
                            totalMarks: 0
                        };
                    }
                    const studentMark = Number(item.mark || 0);
                    const questionMark = Number(item.questionmarks || 0);
                    marksByTopic[topicKey].totalStudentMarks += studentMark;
                    marksByTopic[topicKey].totalMarks += questionMark;
    
                    totalStudentMarksAccumulator += studentMark;
                    totalMarksAccumulator += questionMark;
                });
    
                setTotalStudentMarks(totalStudentMarksAccumulator);
                setTotalMarks(totalMarksAccumulator);
                setPercentage((totalStudentMarksAccumulator / totalMarksAccumulator) * 100);
    
                const aggregatedData = Object.values(marksByTopic)
                    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    
                    const transformedData: HistoricalPerformance[] = Object.keys(marksByTopic).map(topic_number => {
                        const topicData = marksByTopic[topic_number];
                        return {
                            topic_number,
                            topic_name: topicData.name,
                        };
                    });

                setHistoricalPerformanceData(transformedData);
            }
        };
    
        getAnswers();
    }, [studentId, unitId, assessmentType, startDate, endDate, supabase]);
    

    const rounded = Number(percentage.toFixed(2));
 // Setting course level
                // setCourseLevel(historicalperformance[0].course_level);
    let grade: String;
    if (courseLevel == "GCSE") {
        grade = getGCSEGrade(rounded)
    } else {
        grade = getAlevelGrade(rounded)
    }

    return (
    
            <div className="bg-white rounded-md shadow-sm p-4 border border-gray-300">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Topic Number
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Topic Name
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Performance
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {historicalPerformanceData.map((item, index) => (
                            <tr key={index}>
                                <td className="px-5 border-b border-gray-200 bg-white text-sm">
                                    {item.topic_number}
                                </td>
                                <td className="px-5 border-b border-gray-200 bg-white text-sm">
                                <Link href={`#${item.topic_name}`}>{item.topic_name}</Link>

                                </td>
                                <td className="px-5  border-b border-gray-200 bg-white text-sm">
                                    <p>({totalStudentMarks}/{totalMarks}) {rounded}%</p>
                                    <p className="mt-2">{courseLevel} Grade: {grade} </p>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        
    );

}

export default TopicGrade;


