'use client'

// THIS NEEDS CHANGING TO ONLY SHOW ACTIVITY DATA FROM THE ASSESSMENT TABLE AND THE PLC TABLES

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import { useEffect, useState } from 'react'

function formatDateAndDetermineColor(lastSignIn: string | Date | null): { friendlyDate: string, actualDate: string, color: string } {
    if (!lastSignIn) {
        return { friendlyDate: 'never', actualDate: '', color: 'gray-500' };
    }

    const lastSignInDate = new Date(lastSignIn);
    if (isNaN(lastSignInDate.getTime())) {
        // Invalid date
        return { friendlyDate: 'invalid date', actualDate: '', color: 'gray-500' };
    }

    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;

    // Calculate difference in days
    const diffDays = Math.round(Math.abs((now.getTime() - lastSignInDate.getTime()) / oneDay));

    let friendlyDate = lastSignInDate.toLocaleDateString();
    let actualDate = `${lastSignInDate.getDate()}/${lastSignInDate.getMonth() + 1}`; // Date in day/month format
    let color; // Default color for more than a week

    if (diffDays < 1) {
        friendlyDate = `today`;
        color = 'green-500';
    } else if (diffDays < 2) {
        friendlyDate = `yesterday`;
        color = 'green-500';
    } else if (diffDays < 7 && diffDays >= 2) {
        friendlyDate = 'this week';
        color = 'yellow-500';
    } else if (diffDays >= 7 && diffDays < 14) {
        friendlyDate = 'last week';
        color = 'orange-500'; // You might want to set a different color for this range
    } else {
        friendlyDate = `${diffDays} days ago`;
        color = 'red-500'; // Color for more than two weeks
    }

    return { friendlyDate, actualDate, color };
}


export default function LastActivity() {
    const ITEMS_PER_PAGE = 5;

    const [questionCreated, setQuestionCreated] = useState<any[]>([])
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const supabase = createClientComponentClient()

    useEffect(() => {
        const getLogins = async () => {
            // const start = (currentPage - 1) * ITEMS_PER_PAGE;
            // const end = start + ITEMS_PER_PAGE;

            // Fetch profiles with pagination
            let { data: profilesData, error, count } = await supabase
                .from('profilestable')
                .select(`
                    profileid,
                    lastsignin,
                    studenttable(firstname, lastname, studentid)
                `, { count: 'exact' }) // Requesting the count
                .eq('schoolid', 1)
                .eq('profiletype', 'Student')
                .not('lastsignin', 'is', null)

            // Fetch questions data
            let { data: questionsData, error: questionsError } = await supabase
                .from('questiontable')
                .select(`created_by, created_at`)
                .order('created_at', { ascending: false });

            // Merge and sort data
            let mergedData = profilesData?.map(profile => {
                let relatedQuestions = questionsData?.filter(question => question.created_by === profile.profileid) || [];
                relatedQuestions?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                return { ...profile, questions: relatedQuestions };
            });

            mergedData?.sort((a, b) => {
                let lastDateA = (a.questions && a.questions.length > 0) ? new Date(a.questions[0].created_at).getTime() : 0;
                let lastDateB = (b.questions && b.questions.length > 0) ? new Date(b.questions[0].created_at).getTime() : 0;
                return lastDateB - lastDateA;
            });

            // Manually paginate the sorted data
            const start = (currentPage - 1) * ITEMS_PER_PAGE;
            const paginatedData = mergedData?.slice(start, start + ITEMS_PER_PAGE);

            setQuestionCreated(paginatedData || []);

            // setQuestionCreated(mergedData || []);
            setTotalItems(count !== null ? count : 0);
        }

        getLogins();
    }, [supabase, currentPage]);

    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const goToNextPage = () => setCurrentPage((page) => Math.min(page + 1, totalPages));
    const goToPreviousPage = () => setCurrentPage((page) => Math.max(page - 1, 1));

    return (
        <div>
            <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col justify-between mt-10">
                <h1 className="text-2xl font-semibold mb-4">Question Created</h1>

                {questionCreated?.map((user) => {
                    const createdAt = user.questions && user.questions.length > 0 ? user.questions[0].created_at : null;
                    const { actualDate, friendlyDate, color } = formatDateAndDetermineColor(createdAt);
                    return (
                        <div key={user.profileid} className="bg-white p-1">
                            <p className="text-sm text-gray-700">
                                <Link href={`./teacher/${user.studenttable[0].studentid}`}>{user.studenttable[0].firstname} {user.studenttable[0].lastname}</Link>
                            </p>
                            <p className="">
                                <span className={`px-1 py-1 text-xs text-white rounded bg-${color}`}>
                                    {friendlyDate}
                                </span>
                            </p>
                            <p className="ml-2 text-gray-500 text-sm mt-1">{actualDate}</p>
                        </div>
                    );
                })}

                <div className='mt-5'>
                    <button
                        className={`${currentPage === 1 ? 'text-gray-100' : 'hover:underline text-gray-700'}`}
                        onClick={goToPreviousPage}
                        disabled={currentPage === 1}
                    >
                        {`<<`} Previous
                    </button>
                    <span> Page {currentPage} of {totalPages} </span>
                    <button
                        className={`${currentPage === totalPages ? 'text-gray-100' : 'hover:underline text-gray-700'}`}
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                    >
                        Next {`>>`}
                    </button>
                </div>
            </div>

        </div>
    )
}
