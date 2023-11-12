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
    unit_title: string;

    // ... other fields
}

interface UnitTitles {
    [unitId: string]: string;
}

const unitTitles: UnitTitles = {};

interface MarksByUnit {
    [unitId: string]: number;
}

interface StudentInfo {
    marksByUnit: MarksByUnit;
    firstName: string;
    lastName: string;
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

interface UnitInfo {
    [unitNumber: string]: number; // Maps unit number to total marks per unit
}



export default async function AsessDashboard({ params }: { params: { slug: string } }) {
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

    let query2 = supabase.from('classunitdashboard').select('*')
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

    const marksByStudent: MarksByStudent = {};
    const overallMarks: OverallMarks = {};
    const units: Set<string> = new Set(); // To keep track of unique units

    classdashboard.forEach(record => {
        const studentId = String(record.student_id);
        const unitNumber = record.unit_number;

        units.add(unitNumber); // Add unit number to set

        // Initialize student info if not present
        if (!marksByStudent[studentId]) {
            marksByStudent[studentId] = {
                marksByUnit: {},
                firstName: record.first_name,
                lastName: record.last_name
            };
        }

        // Store unit title
        if (!unitTitles[unitNumber]) {
            unitTitles[unitNumber] = record.unit_title;
        }

        // Assign total marks per unit
        marksByStudent[studentId].marksByUnit[unitNumber] = record.total_marks_per_unit;

        // Initialize overall marks if not present
        if (!overallMarks[studentId]) {
            overallMarks[studentId] = { totalMarks: 0, name: `${record.first_name} ${record.last_name}` };
        }

        // Add to overall marks
        overallMarks[studentId].totalMarks += record.total_marks_per_unit;
    });

    const sortedStudentIds = Object.keys(marksByStudent).sort((a, b) => {
        const lastNameA = marksByStudent[a].lastName.toLowerCase();
        const lastNameB = marksByStudent[b].lastName.toLowerCase();
        if (lastNameA < lastNameB) return -1;
        if (lastNameA > lastNameB) return 1;
        return 0;
    });



    return (
        <div className="bg-white rounded-md shadow-sm pt-10 p-4 border border-gray-300">
            <h1 className="text-4xl font-semibold mb-4">Assessment Dashboard: {teachingClassName}</h1>
            <div className="flex flex-col my-10 overflow-x-auto">
                <table className="table-auto w-full overflow-x-auto border border-gray-900">
                    <thead>
                        <tr className="bg-gray-400 text-black border border-gray-900">
                            <th className="w-1/4 px-4 py-2 border-r border border-gray-900"></th>
                            <th className="w-1/4 px-4 py-2 border-r border border-gray-900">Overall</th>
                            {Array.from(units).map(unitId => (
                                <th key={unitId} className="w-1/4 px-4 py-2 border-r border border-gray-900">
                                    {unitId}: {unitTitles[unitId]}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {sortedStudentIds.map(studentId => (
                            <tr key={studentId}>
                                <td className="px-4 py-2 border-r border border-gray-900">
                                    {marksByStudent[studentId].firstName} {marksByStudent[studentId].lastName.charAt(0)}
                                </td>
                                <td className="px-4 py-2 border-r border text-center border-gray-900">
                                    {overallMarks[studentId].totalMarks}
                                </td>
                                {Array.from(units).map(unitId => (
                                    <td key={unitId} className="px-4 py-2 border-r border text-center border-gray-900">
                                        {marksByStudent[studentId].marksByUnit[unitId] || 0}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <p>{JSON.stringify(classdashboard)}</p>
        </div>
    );
}

