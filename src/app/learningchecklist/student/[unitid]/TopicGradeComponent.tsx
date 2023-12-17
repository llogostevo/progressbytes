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
    percentage: number;
    grade: string;
}

type MarksByTopicType = { [key: string]: AggregatedTopicData };

interface ConfidenceLevelColors {
    [key: string]: string;
}

interface HistoricalPerformance {
    topic_number: string;
    topic_name: string;

}

interface Topic {
    topicnumber: string;
    topictitle: string;
}

interface UnittableRow {
    topictable: Topic[];
}


// THIS NEEDS FIXING
interface HistoricalPerformanceItem {
    topic_number: string;
    topic_name: string;
    mark: number | string;  // Adjust this type based on your actual data
    questionmarks: number | string;  // Adjust this type as well
    course_level: string;
    // Add other properties from historicalperformance items if needed
}

const TopicGrade = ({ studentId, unitId, assessmentType, startDate, endDate }: Props) => {
    const [filterKey, setFilterKey] = useState(0);

    const [totalMarks, setTotalMarks] = useState(0);
    const [percentage, setPercentage] = useState(0);
    const [totalStudentMarks, setTotalStudentMarks] = useState(0);
    const [courseLevel, setCourseLevel] = useState('');
    const [historicalPerformanceData, setHistoricalPerformanceData] = useState<HistoricalPerformance[]>([]);
    const [marksByTopicState, setMarksByTopicState] = useState<MarksByTopicType>({});
    const [sortedUnassessedTopics, setSortedUnassessedTopics] = useState<Topic[]>([]);


    // Create a Supabase client configured to use cookies
    const supabase = createClientComponentClient()

    useEffect(() => {
        const fetchHistoricalPerformance = async () => {
            const marksByTopic: MarksByTopicType = {};

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
                setMarksByTopicState({});
                setHistoricalPerformanceData([]);
                return;
            }
            if (historicalperformance && historicalperformance.length > 0) {

                setCourseLevel(historicalperformance[0].course_level)

                let totalStudentMarksAccumulator = 0;
                let totalMarksAccumulator = 0;
                historicalperformance.forEach((item: HistoricalPerformanceItem) => {
                    const topicKey = item.topic_number;
                    console.log(marksByTopic[topicKey])
                    if (!marksByTopic[topicKey]) {
                        marksByTopic[topicKey] = {
                            name: item.topic_name,
                            totalStudentMarks: 0,
                            totalMarks: 0,
                            percentage: 0,
                            grade: ''
                        };
                    }

                    const studentMark = Number(item.mark || 0);
                    const questionMark = Number(item.questionmarks || 0);
                    marksByTopic[topicKey].totalStudentMarks += studentMark;
                    marksByTopic[topicKey].totalMarks += questionMark;
                    // Calculate percentage and grade for each topic
                    const topicPercentage = (marksByTopic[topicKey].totalStudentMarks / marksByTopic[topicKey].totalMarks) * 100;
                    marksByTopic[topicKey].percentage = topicPercentage;
                    marksByTopic[topicKey].grade = historicalperformance?.[0].course_level === "GCSE" ? getGCSEGrade(topicPercentage) : getAlevelGrade(topicPercentage);
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
                })
                .sort((a, b) => a.topic_number.localeCompare(b.topic_number, undefined, { numeric: true }));


                setHistoricalPerformanceData(transformedData);
            }
            setMarksByTopicState(marksByTopic);

        };

        fetchHistoricalPerformance();
        setFilterKey(prev => prev + 1);

    }, [unitId, studentId, assessmentType, startDate, endDate, supabase]);  // Dependencies related to filters

    useEffect(() => {
        // Fetch unittable data and compute unassessed topics
        const fetchUnittableData = async () => {
            let { data: unTypedTopicData, error } = await supabase
                .from('unittable')
                .select('topictable(topicnumber, topictitle)')
                .eq('unitid', unitId);

            if (error) {
                console.error('Error fetching unittable data:', error.message);
                return;
            }

            const topicData: UnittableRow[] = unTypedTopicData as UnittableRow[];
            const assessedTopicNumbers = new Set(historicalPerformanceData.map(item => item.topic_number));

            const unassessedTopicsData = topicData.flatMap(row => row.topictable)
                .filter(topic => !assessedTopicNumbers.has(topic.topicnumber))
                .map(topic => ({
                    topicnumber: topic.topicnumber,
                    topictitle: topic.topictitle
                }))
                .sort((a, b) => a.topicnumber.localeCompare(b.topicnumber, undefined, { numeric: true }));

            setSortedUnassessedTopics(unassessedTopicsData);
        };
        fetchUnittableData();
    }, [unitId, historicalPerformanceData, supabase]);

    return (

        <div key={filterKey} className="bg-white rounded-md shadow-sm p-4 border border-gray-300">
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
                                <p>({marksByTopicState[item.topic_number]?.totalStudentMarks ?? 0}/{marksByTopicState[item.topic_number]?.totalMarks ?? 0}) {marksByTopicState[item.topic_number]?.percentage?.toFixed(2) ?? 0}%</p>
                                <p className="mt-2">{courseLevel} Grade: {marksByTopicState[item.topic_number]?.grade ?? 'N/A'} </p>
                            </td>

                        </tr>
                    ))}

                    {sortedUnassessedTopics.map((topic, index) => (
                        <tr key={index} className="bg-gray-200">
                            <td className="px-5 border-b border-gray-200 bg-gray-200 text-sm">
                                {topic.topicnumber}
                            </td>
                            <td className="px-5 border-b border-gray-200 bg-gray-200 text-sm">
                                <Link href={`#${topic.topictitle}`}>{topic.topictitle}</Link>
                            </td>
                            <td className="px-5 border-b border-gray-200 bg-gray-200 text-sm" colSpan={2}>
                                Not Yet Assessed
                            </td>
                        </tr>
                    ))}


                </tbody>
            </table>

        </div>

    );

}

export default TopicGrade;