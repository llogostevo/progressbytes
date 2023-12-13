'use client'
import React, { useState } from 'react';
import JudgmentComponent from './JudgementComponent';
import HistoricalComponent from './HistoricalComponent';
import AssessmentModal from '@/components/assessmentModal/AssesmentModal';
import TooltipModalButton from '@/components/tooltipModal/TooltipModalButton';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import OverallGrade from './OverallGradeComponent';


interface Judgment {
    subtopicid: number;
    studentid: number;
    judgment: string;
    id: number;
    created_at: Date;
    judgementdate: Date;

}

interface Subtopic {
    subtopicid: number;
    topicid: number;
    subtopicnumber: string;
    subtopictitle: string;
    subtopicdescription: string;
    created_at: Date;
    updated_at: Date;
    judgementtable?: Judgment[];
}

interface Topic {
    topicid: number;
    topicnumber: string;
    topictitle: string;
    subtopictable: Subtopic[];
    [key: string]: any;
}

interface ConfidenceLevelColors {
    [key: string]: string;
}

interface LearningChecklistProps {
    topics: Topic[];
    unitId: number;
    unitTitle: string;
    unitNumber: string;
    studentId: number;
    confidenceLevelColors: ConfidenceLevelColors;
    confidenceLevels: string[];
}

// Helper functions to calculate dates
const getPreviousSeptemberStartDate = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    let yearOfPreviousSeptember;
    if (currentMonth >= 8) { // September is month 8 (0-indexed)
        yearOfPreviousSeptember = currentYear;
    } else {
        yearOfPreviousSeptember = currentYear - 1;
    }

    return `${yearOfPreviousSeptember}-09-01`;
};


const getLastYearStartDate = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Determine the start year based on the current month
    const startYear = currentMonth >= 8 ? currentYear - 1 : currentYear - 2;

    return `${startYear}-09-01`;
};

const getLastYearEndDate = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Determine the end year based on the current month
    const endYear = currentMonth >= 8 ? currentYear : currentYear - 1;

    return `${endYear}-08-31`;
};

const getThisWeekRange = () => {
    const now = new Date();
    const startDate = startOfWeek(now).toISOString().split('T')[0];
    const endDate = endOfWeek(now).toISOString().split('T')[0];
    return { startDate, endDate };
};

const getThisMonthRange = () => {
    const now = new Date();
    const startDate = startOfMonth(now).toISOString().split('T')[0];
    const endDate = endOfMonth(now).toISOString().split('T')[0];
    return { startDate, endDate };
};


// COMPONENT
export default function LearningChecklist(props: LearningChecklistProps) {
    const { unitId, unitTitle, unitNumber, topics, studentId, confidenceLevelColors, confidenceLevels } = props;
    // state for toggling filtered assessments
    const [filterAssessmentType, setFilterAssessmentType] = useState(false);

    const [activeButton, setActiveButton] = useState('');


    // Set the default start date to January 1, 2010
    const defaultStartDate = new Date('2020-09-01').toISOString().split('T')[0];
    // Set the default end date to today's date
    const defaultEndDate = new Date().toISOString().split('T')[0];

    const [startDate, setStartDate] = useState(defaultStartDate);
    const [endDate, setEndDate] = useState(defaultEndDate);


    const setToday = () => {
        if (activeButton === 'today') {
            setStartDate(defaultStartDate);
            setEndDate(defaultEndDate);
            setActiveButton('');
        } else {
            const today = new Date().toISOString().split('T')[0];
            setStartDate(today);
            setEndDate(today);
            setActiveButton('today');
        }
    };

    const setThisYear = () => {
        if (activeButton === 'thisYear') {
            setStartDate(defaultStartDate);
            setEndDate(defaultEndDate);
            setActiveButton('');
        } else {
            setStartDate(getPreviousSeptemberStartDate());
            setEndDate(new Date().toISOString().split('T')[0]);
            setActiveButton('thisYear');
        }
    };

    const setLastYear = () => {
        if (activeButton === 'lastYear') {
            setStartDate(defaultStartDate);
            setEndDate(defaultEndDate);
            setActiveButton('');
        } else {
            setStartDate(getLastYearStartDate());
            setEndDate(getLastYearEndDate());
            setActiveButton('lastYear');
        }
    };

    const setThisWeek = () => {
        const { startDate, endDate } = getThisWeekRange();
        if (activeButton === 'thisWeek') {
            setStartDate(defaultStartDate);
            setEndDate(defaultEndDate);
            setActiveButton('');
        } else {
            setStartDate(startDate);
            setEndDate(endDate);
            setActiveButton('thisWeek');
        }

    };

    const setThisMonth = () => {
        const { startDate, endDate } = getThisMonthRange();
        if (activeButton === 'thisMonth') {
            setStartDate(defaultStartDate);
            setEndDate(defaultEndDate);
            setActiveButton('');
        } else {
            setStartDate(startDate);
            setEndDate(endDate);
            setActiveButton('thisMonth');
        }
    };

    // Toggle the state for filterAssessmentType
    const toggleAssessmentTypeFilter = () => {
        setFilterAssessmentType(!filterAssessmentType);
    };

    const handleDateChange = () => {
        setActiveButton('');
    };

    const sortedTopics = topics?.sort((a, b) => {
        // Compare by topic number first
        const numComparison = a.topicnumber.localeCompare(b.topicnumber, undefined, { numeric: true });
        if (numComparison !== 0) {
            return numComparison;
        }
        // If topic numbers are the same, compare by title
        return a.topictitle.localeCompare(b.topictitle);
    });

    return (
        <>
            <div className="space-y-4">
                <h2 className="text-2xl">{unitNumber} {unitTitle}</h2>
                <div className="flex items-center gap-3">
                    <AssessmentModal />
                    <TooltipModalButton toolTitle="Learning Checklists:" toolDetails="Select the judgement for each subtopic based upon your current understanding" />
                </div>

                <div className="bg-white rounded-md shadow-sm mb-4 border border-gray-300">
                    <h2 className="text-lg p-4 mb-4 font-semibold">Historical Data Filters</h2>
                    {/* Button for Assessment Type Toggle */}
                    <div className='space-y-4 p-4'>
                        <div>
                            <button
                                onClick={toggleAssessmentTypeFilter}
                                className={`px-2 py-1 text-xs rounded cursor-pointer ${filterAssessmentType ? 'bg-primaryColor text-white' : 'inline-block border border-primaryColor hover:bg-secondaryColor hover:text-white hover:border-white text-primaryColor rounded transition duration-200'}`}
                            >
                                {filterAssessmentType ? 'Exam' : 'Exam'} Assessment Data
                            </button>
                        </div>
                        <div className="my-2 md:my-4 border p-4 rounded-lg">
                            <div className="flex flex-row flex-wrap gap-4 items-center mt-4">
                                {/* Buttons */}
                                <button onClick={setToday} className={`px-2 py-1 text-xs rounded cursor-pointer ${activeButton === 'today' ? 'bg-primaryColor text-white' : 'inline-block border border-primaryColor hover:bg-secondaryColor hover:text-white hover:border-white text-primaryColor rounded transition duration-200'}`}>Today</button>
                                <button onClick={setThisYear} className={`px-2 py-1 text-xs rounded cursor-pointer ${activeButton === 'thisYear' ? 'bg-primaryColor text-white' : 'inline-block border border-primaryColor hover:bg-secondaryColor hover:text-white hover:border-white text-primaryColor rounded transition duration-200'}`}>This Year</button>
                                <button onClick={setLastYear} className={`px-2 py-1 text-xs rounded cursor-pointer ${activeButton === 'lastYear' ? 'bg-primaryColor text-white' : 'inline-block border border-primaryColor hover:bg-secondaryColor hover:text-white hover:border-white text-primaryColor rounded transition duration-200'}`}>Last Year</button>
                                <button onClick={setThisWeek} className={`px-2 py-1 text-xs rounded cursor-pointer ${activeButton === 'thisWeek' ? 'bg-primaryColor text-white' : 'inline-block border border-primaryColor hover:bg-secondaryColor hover:text-white hover:border-white text-primaryColor rounded transition duration-200'}`}>This Week</button>
                                <button onClick={setThisMonth} className={`px-2 py-1 text-xs rounded cursor-pointer ${activeButton === 'thisMonth' ? 'bg-primaryColor text-white' : 'inline-block border border-primaryColor hover:bg-secondaryColor hover:text-white hover:border-white text-primaryColor rounded transition duration-200'}`}>This Month</button>
                            </div>
                            <div className="flex flex-col md:flex-row gap-4 items-center mt-4">
                                {/* Date inputs */}
                                <input type="date" id="startDate" name="startDate" value={startDate} onChange={(e) => { setStartDate(e.target.value); handleDateChange(); }} className="form-input border rounded-md shadow-sm mt-1 w-full" />
                                <input type="date" id="endDate" name="endDate" value={endDate} onChange={(e) => { setEndDate(e.target.value); handleDateChange(); }} className="form-input border rounded-md shadow-sm mt-1 w-full" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-md shadow-sm pt-10 p-4 border border-gray-300">
                    <OverallGrade
                        studentId={studentId}
                        unitId={unitId}
                        assessmentType={filterAssessmentType}
                        startDate={startDate}
                        endDate={endDate} 
                    />
                </div>

                <div className="bg-white rounded-md shadow-sm pt-10 p-4 border border-gray-300">
                    {sortedTopics?.map((topic) => (
                        <section key={topic.topicid} className="">
                            <h2 className="px-1 m-0 text-lg sm:text-xl md:px-4 font-bold mb-2">
                                {topic.topicnumber} - {topic.topictitle}
                            </h2>
                            <div className="flex flex-col my-10 overflow-x-auto"> {/* Wrapping div */}
                                <table className=" m-0 md:ml-1 lg:ml-10 table-auto overflow-x-auto border border-gray-900">
                                    <thead>
                                        <tr className="bg-gray-400 text-black border border-gray-900">
                                            <th className="px-1 text-xs lg:px-4 py-2 hidden sm:table-cell border-r border border-gray-900">#</th>
                                            <th className="px-1 text-xs lg:px-4 py-2 border-r border border-gray-900 sm:text-sm">
                                                <span className="lg:hidden">Subtopic</span>
                                                <span className="hidden lg:inline">Subtopic Title</span>
                                            </th>
                                            <th className="px-1 text-xs lg:px-4 py-2 hidden sm:table-cell border-r border border-gray-900 sm:text-sm">
                                                <span className="lg:hidden">Desc...</span>
                                                <span className="hidden lg:inline">Description</span>
                                            </th>
                                            <th className="px-1 text-xs lg:px-4 py-2 border-r border border-gray-900 sm:text-sm">
                                                <span className="lg:hidden">Grade</span>
                                                <span className="hidden lg:inline">Historical Performance</span>
                                            </th>
                                            <th className="px-1 text-xs lg:px-4 py-2 w-1 text-center border-r border border-gray-900 sm:text-sm">
                                                <span className="inline">Judgement</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(topic.subtopictable || []).sort((a: Subtopic, b: Subtopic) => {
                                            if (!isNaN(Number(a.subtopicnumber)) && !isNaN(Number(b.subtopicnumber))) {
                                                return Number(a.subtopicnumber) - Number(b.subtopicnumber);
                                            }
                                            return a.subtopicnumber.localeCompare(b.subtopicnumber);
                                        }).map((subtopic: Subtopic) => {
                                            const judgment: string = subtopic.judgementtable?.find(j => j.studentid === studentId)?.judgment ?? "";


                                            const judgmentColor = confidenceLevelColors[judgment as keyof typeof confidenceLevelColors] || '';

                                            return (
                                                <tr key={subtopic.subtopicid} className={`${judgmentColor} text-xs sm:text-sm`}>
                                                    <td className="p-1 sm:p-2 w-1  hidden sm:table-cell text-xs text-center border-r border border-gray-900">{subtopic.subtopicnumber}</td>
                                                    <td className="p-1 sm:p-2 w-2/4 md:w-7/12 text-xs border-r border border-gray-900">{subtopic.subtopictitle}</td>
                                                    <td className="p-1 sm:p-2 w-1/3 hidden sm:table-cell text-xs border-r border border-gray-900">{subtopic.subtopicdescription}</td>
                                                    <td className="p-1 sm:p-2 w-1/5 text-xs border-r border border-gray-900">
                                                        <HistoricalComponent
                                                            studentId={studentId}
                                                            subtopicId={subtopic.subtopicid}
                                                            assessmentType={filterAssessmentType}
                                                            startDate={startDate}
                                                            endDate={endDate}
                                                        />
                                                    </td>
                                                    <td className=" px-1 text-xs md:text-lg md:px-4 py-2 w-1 text-center border-r border border-gray-900">
                                                        <JudgmentComponent
                                                            studentId={studentId}
                                                            subtopic={subtopic}
                                                            confidenceLevels={confidenceLevels}
                                                        />
                                                    </td>
                                                </tr>
                                            );
                                        })}

                                    </tbody>
                                </table>
                            </div>
                        </section>
                    ))}
                </div>
            </div>


        </>
    )
}
