import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import React from 'react'

interface Record {
    student_id: number;
    unit_id: number;
    mark: number;
    first_name: string;
    last_name: string;
    // ... other fields
}

interface MarksByUnit {
    [unitId: string]: number;
}

interface StudentInfo {
    marksByUnit: MarksByUnit;
    name: string;
}

interface MarksByStudent {
    [studentId: string]: StudentInfo;
}

interface OverallMarks {
    [studentId: string]: {
        totalMarks: number;
        name: string;
    };
}



export default async function AssessmentDashboard({ params }: { params: { slug: string } }) {
    const supabase = createServerComponentClient({ cookies })

    // get the users sessions
    const { data: { user } } = await supabase.auth.getUser()

    // check if user is logged in and redirect to page if they are not
    if (!user) {
        redirect("/")
    }

    // check if profile exists in DB
    const { data: profile, error: profileError } = await supabase
        .from('profilestable')
        .select('*')
        .eq('profileid', user.id)

    // check if profile exists in DB, if not redirect to unauthorised
    // if not at the correct role i.e. admin then redirect to the unauthorised page
    if (!profile || profile[0].admin == false) {
        redirect("/unauthorised")
    }

    const teachingClassName = decodeURIComponent(params.slug);

    let query2 = supabase.from('classdashboard').select('*')
        .eq('class_id', teachingClassName)

    let { data: classdashboard, error: classdashboardError } = await query2;

    if (classdashboardError) {
        console.error('Error fetching data:', classdashboardError);
        return null;
    }

    // Ensure classdashboard is not null before proceeding
    if (!classdashboard) {
        console.error('No data available');
        return null; // or handle the absence of data appropriately
    }

    const calculateMarks = (data: Record[]): { marksByStudent: MarksByStudent; overallMarks: OverallMarks } => {
        const marksByStudent: MarksByStudent = {};
        const overallMarks: OverallMarks = {};

        data.forEach(record => {
            const studentId = String(record.student_id);
            const unitId = String(record.unit_id);

            // If student not in marksByStudent, initialize it
            if (!marksByStudent[studentId]) {
                marksByStudent[studentId] = {
                    marksByUnit: {},
                    name: `${record.first_name} ${record.last_name}` // Combine first and last names
                };
            }

            // Initialize unit marks if not present
            if (!marksByStudent[studentId].marksByUnit[unitId]) {
                marksByStudent[studentId].marksByUnit[unitId] = 0;
            }

            // Add mark to the unit
            marksByStudent[studentId].marksByUnit[unitId] += record.mark;

            // If student not in overallMarks, initialize it
            if (!overallMarks[studentId]) {
                overallMarks[studentId] = {
                    totalMarks: 0,
                    name: `${record.first_name} ${record.last_name}` // Combine first and last names
                };
            }

            // Add mark to the overall marks
            overallMarks[studentId].totalMarks += record.mark;
        });

        return { marksByStudent, overallMarks };
    };

    const { marksByStudent, overallMarks } = calculateMarks(classdashboard);

    return (
        <div>
            <h1 className="text-4xl font-semibold mb-4">Assessment Dashboard: </h1>
            <h2 className="text-2xl">{teachingClassName}</h2>
            <table className="m-0 md:ml-1 lg:ml-10 table-auto overflow-x-auto border border-gray-900">
                <thead>
                    <tr className="bg-gray-400 text-black border border-gray-900">
                        <th></th>
                        {Object.keys(marksByStudent).map(studentId => (
                            <th className="px-1 text-xs lg:px-4 py-2 border-r border border-gray-900"key={studentId}>{marksByStudent[studentId].name}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="p-1 sm:p-2 w-2/4 md:w-7/12 text-xs border-r border border-gray-900">Overall</td>
                        {Object.entries(overallMarks).map(([studentId, info]) => (
                            <td className="p-1 sm:p-2 w-2/4 md:w-7/12 text-xs border-r border border-gray-900" key={studentId}>{info.totalMarks}</td>
                        ))}
                    </tr>
                    {Object.keys(marksByStudent[Object.keys(marksByStudent)[0]].marksByUnit).map(unitId => (
                        <tr className="p-1 sm:p-2 w-2/4 md:w-7/12 text-xs border-r border border-gray-900" key={unitId}>
                            <td className="p-1 sm:p-2 w-2/4 md:w-7/12 text-xs border-r border border-gray-900">Unit {unitId}</td>
                            {Object.keys(marksByStudent).map(studentId => (
                                <td className="p-1 sm:p-2 w-2/4 md:w-7/12 text-xs border-r border border-gray-900" key={studentId}>{marksByStudent[studentId].marksByUnit[unitId]}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

}

