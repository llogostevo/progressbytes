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

            // if (historicalperformance && historicalperformance.length > 0) {

            //     const sortedData = historicalperformance.sort((a, b) =>
            //         a.topic_number.localeCompare(b.topic_number, undefined, { numeric: true })
            //     );

            //     const total = historicalperformance.reduce((sum, answer) => sum + Number(answer.mark || 0), 0);
            //     const totalMarks = historicalperformance.reduce((sum, answer) => sum + Number(answer.questionmarks || 0), 0);
            //     const percentage = (total / totalMarks) * 100
            //     setTotalStudentMarks(total);
            //     setTotalMarks(totalMarks);
            //     setPercentage(percentage);
            //     setCourseLevel(historicalperformance[0].course_level)
            //     setHistoricalPerformanceData(historicalperformance || []);

            // }

            if (historicalperformance && historicalperformance.length > 0) {
                // Aggregate marks by topic
                const marksByTopic: MarksByTopicType = {};
                historicalperformance.forEach(item => {
                    if (!marksByTopic[item.topic_number]) {
                        marksByTopic[item.topic_number] = {
                            name: item.topic_name,
                            totalStudentMarks: 0,
                            totalMarks: 0
                        };
                    }
                    marksByTopic[item.topic_number].totalStudentMarks += Number(item.mark || 0);
                    marksByTopic[item.topic_number].totalMarks += Number(item.questionmarks || 0);
                });

                // Convert aggregated data into an array and sort it
                const aggregatedData = Object.keys(marksByTopic).map(topic_number => {
                    const topic = marksByTopic[topic_number];
                    return {
                        topic_number,
                        topic_name: topic.name,
                        totalStudentMarks: topic.totalStudentMarks,
                        totalMarks: topic.totalMarks,
                        percentage: (topic.totalStudentMarks / topic.totalMarks) * 100
                    };
                }).sort((a, b) => a.topic_number.localeCompare(b.topic_number, undefined, { numeric: true }));

                setHistoricalPerformanceData(aggregatedData);

                // Setting course level
                setCourseLevel(historicalperformance[0].course_level);
            }

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
        <div className="flex flex-col">

            {/* Table to display topics */}
            <div className="bg-white rounded-md shadow-sm p-4 border border-gray-300 flex-1">
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
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    {item.topic_number}
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    {item.topic_name}
                                </td>
                                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                    <p>({totalStudentMarks}/{totalMarks}) {rounded}%</p>
                                    <p className="mt-2">{courseLevel} Grade: {grade} </p>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

}

export default TopicGrade;


