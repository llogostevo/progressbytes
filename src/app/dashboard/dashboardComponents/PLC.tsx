'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'
import MyPieChart from './MyPieChart'
import Link from 'next/link'


export default function PLC() {

    const [judgements, setJudgements] = useState<any[]>([])
    const [pieChartData, setPieChartData] = useState<any[]>([]); // Add pieChartData as a state variable
    const [showOnRoll, setShowOnRoll] = useState(true); // State for checkbox
    const [classes, setClasses] = useState<any[]>([]);
    const [selectedClasses, setSelectedClasses] = useState<string[]>([]);

    // Create a Supabase client configured to use cookies
    const supabase = createClientComponentClient()

    // handle the selected classes
    const handleClassCheckboxChange = (classId: string) => {
        setSelectedClasses(prevSelectedClasses =>
            prevSelectedClasses.includes(classId)
                ? prevSelectedClasses.filter(id => id !== classId)
                : [...prevSelectedClasses, classId]
        );
    };

    useEffect(() => {

        const fetchClasses = async () => {
            try {
                // Build a basic query for enrollmenttable
                let classQuery = supabase.from('enrollmenttable').select('classid');

                // If showing only on-roll students, add the 'offroll' filter
                if (showOnRoll) {
                    classQuery = classQuery.eq('offroll', false);
                }

                // Execute the query
                const { data: classesData, error } = await classQuery;

                if (error) {
                    throw error;
                }

                // Extract distinct class IDs
                const distinctClasses = Array.from(new Set(classesData.map(cls => cls.classid)));
                setClasses(distinctClasses);
            } catch (error) {
                console.error('Error fetching classes:', error);
            }
        };

        fetchClasses();


        const getJudgements = async () => {
            let studentIds: string[] = [];

            // Fetch all student IDs from the enrollmenttable, optionally filtered by classid
            let enrollmentQuery = supabase
                .from('enrollmenttable')
                .select('studentid');

            if (selectedClasses.length > 0) {
                enrollmentQuery = enrollmentQuery.in('classid', selectedClasses);
            }

            let { data: enrolledStudents, error: enrolledError } = await enrollmentQuery;

            if (enrolledError) {
                console.error('Error fetching enrolled students:', enrolledError);
                return;
            }

            studentIds = enrolledStudents ? enrolledStudents.map(student => student.studentid) : [];

            // If showOnRoll is true, further filter the student IDs by on-roll status
            if (showOnRoll) {
                let { data: onRollStudents, error: onRollError } = await supabase
                    .from('enrollmenttable')
                    .select('studentid')
                    .eq('offroll', false)
                    .in('studentid', studentIds); // Filter by already fetched student IDs

                if (onRollError) {
                    console.error('Error fetching on-roll students:', onRollError);
                    return;
                }

                studentIds = onRollStudents ? onRollStudents.map(student => student.studentid) : [];

            }

            // Fetch judgments for these students
            let { data: judData, error: judError } = await supabase
                .from('judgementtable')
                .select(`
                    judgment,
                    studentid,
                    studenttable(
                        firstname,
                        lastname,
                        studentid,
                        schoolid
                    )
                `)
                .in('studentid', studentIds);

            if (judError) {
                console.error('Error fetching judgments:', judError);
                return;
            }

            if (judData) {
                setJudgements(judData);

                let judgmentCounts: Record<string, number> = {};

                judData.forEach(item => {
                    if (judgmentCounts[item.judgment]) {
                        judgmentCounts[item.judgment]++;
                    } else {
                        judgmentCounts[item.judgment] = 1;
                    }
                });

                let calculatedPieChartData = Object.entries(judgmentCounts).map(([judgment, count]) => {
                    return { name: judgment, value: count };
                });

                const order = ["Needs Significant Study", "Requires Revision", "Almost Secure", "Fully Secure"];
                calculatedPieChartData.sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name));

                setPieChartData(calculatedPieChartData);
            } else {
                console.log('No judgments found');
            }
        };
        getJudgements()
    }, [supabase, showOnRoll, selectedClasses])


    return (
        <div className="mt-10">
            <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col justify-between">
                <h1 className="text-2xl font-semibold mb-4">Learning Checklist Overview</h1>
                <div className="flex items-center mb-4">
                    <input
                        type="checkbox"
                        checked={showOnRoll}
                        onChange={(e) => setShowOnRoll(e.target.checked)}
                        className="mr-2"
                    />
                    <label>Show Only On Roll Students</label>
                </div>
                <div className="flex flex-col mb-4">
                    {classes.map((classId, idx) => (
                        <label key={idx} className="flex items-center mb-1">
                            <input
                                type="checkbox"
                                checked={selectedClasses.includes(classId)}
                                onChange={() => handleClassCheckboxChange(classId)}
                                className="mr-2"
                            />
                            <Link href={`../bytemark/staff/learningchecklist/${classId}`}>{classId}</Link>
                        </label>
                    ))}
                </div>
                <div className="bg-white p-1">
                    <MyPieChart pieChartData={pieChartData} />
                </div>
            </div>
        </div>
    )
}
