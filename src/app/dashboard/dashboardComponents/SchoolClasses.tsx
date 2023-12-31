"use client";

import Link from 'next/link';
import React, { useEffect, useState } from 'react';

interface StudentTable {
    firstname: string;
    lastname: string;
    studentid: number;
}

interface SchoolClassEnrollment {
    studentid: number;
    classid: string;
    studenttable: StudentTable;
}

export default function SchoolClasses({ schoolClasses }: { schoolClasses: SchoolClassEnrollment[] }) {
    const [schoolClassesData, setSchoolClassesData] = useState<SchoolClassEnrollment[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

    useEffect(() => {
        // Sort by class then by student's first name
        const sortedSchoolClasses = [...schoolClasses].sort((a, b) => {
            // Compare class IDs first
            if (a.classid < b.classid) return -1;
            if (a.classid > b.classid) return 1;

            // If class IDs are equal, compare student's first names
            return a.studenttable.firstname.localeCompare(b.studenttable.firstname);
        });

        setSchoolClassesData(sortedSchoolClasses);
    }, [schoolClasses]);

    const uniqueClasses = Array.from(new Set(schoolClasses.map(item => item.classid)));

    const filteredStudents = selectedClassId
        ? schoolClassesData.filter(student => student.classid === selectedClassId)
        : schoolClassesData;

    return (
        <div className="container mx-auto px-4 py-4">
            <h1 className="text-6xl font-semibold py-10">School Classes</h1>

            <select
                className="mb-5 p-2 border rounded"
                value={selectedClassId || ''}
                onChange={(e) => setSelectedClassId(e.target.value)}
            >
                <option value="">Select a class</option>
                {uniqueClasses.map((classId) => (
                    <option key={classId} value={classId}>Class {classId}</option>
                ))}
            </select>

            <div className="overflow-x-auto">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Class ID
                            </th>
                            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Student
                            </th>

                        </tr>
                    </thead>
                    <tbody>
                        {filteredStudents.map((student) => (
                                <tr key={student.studentid}>
                                    
                                    <td className="px-5 py-2 border-b border-gray-200 bg-white text-sm">{student.classid}</td>
                                    <td className="px-5 py-2 border-b border-gray-200 bg-white text-sm"><Link href={`./teacher/${student.studenttable?.studentid}`}>{student.studenttable?.firstname} {student.studenttable?.lastname}</Link></td>
                                </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
