import { useEffect, useState } from 'react';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export interface Unit {
    unitid: number;
    unittitle: string;
    unitnumber: number;
    topics?: Topic[];
}

export interface Topic {
    topicid: number;
    unitid: number;
    topicnumber: number;
    topictitle: string;
    subtopics?: Subtopic[];
}

export interface Subtopic {
    subtopicid: number;
    topicid: number;
    subtopicnumber: number;
    subtopictitle: string;
}

interface SubTopicDropDownProps {
    studentId: number;
    selectedSubtopicId: number | null;
    onSubtopicChange: (id: number) => void;
}

const SubTopicDropDown: React.FC<SubTopicDropDownProps> = ({ studentId, selectedSubtopicId, onSubtopicChange }) => {
    const [data, setData] = useState<Unit[]>([]);
    const supabase = createClientComponentClient();



    useEffect(() => {
        async function fetchData(studentId: number) {
            const { data: enrollments } = await supabase
                .from('enrollmenttable')
                .select('courseid')
                .eq('studentid', studentId);

            if (!enrollments) return;

            const enrolledCourseIds = enrollments.map(enrollment => enrollment.courseid);

            const { data: units } = await supabase
                .from('unittable')
                .select('*')
                .in('courseid', enrolledCourseIds)
                .order('unitnumber', { ascending: true });

            if (!units) return;
            const unitIds = units.map(unit => unit.unitid);

            // const { data: units } = await supabase.from('unittable').select('*').order('unitnumber', { ascending: true });
            // const { data: topics } = await supabase.from('topictable').select('*').order('topicnumber', { ascending: true });
            // const { data: subtopics } = await supabase.from('subtopictable').select('*').order('subtopicnumber', { ascending: true });
            // if (!units || !topics || !subtopics) return;

            // Fetch topics based on the fetched units
            const { data: topics } = await supabase
                .from('topictable')
                .select('*')
                .in('unitid', unitIds)
                .order('topicnumber', { ascending: true });

            if (!topics) return;

            const topicIds = topics.map(topic => topic.topicid);

            // Fetch subtopics based on the fetched topics
            const { data: subtopics } = await supabase
                .from('subtopictable')
                .select('*')
                .in('topicid', topicIds)
                .order('subtopicnumber', { ascending: true });

            if (!subtopics) return;

            // Structure the data
            const structuredData: Unit[] = units.map(unit => ({
                ...unit,
                topics: topics
                    .filter(topic => topic.unitid === unit.unitid)
                    .map(topic => ({
                        ...topic,
                        subtopics: subtopics.filter(subtopic => subtopic.topicid === topic.topicid)
                    }))
            }));

            setData(structuredData);
        }

        fetchData(studentId);
    }, [studentId]);

    return (
        <div className="mt-4 space-y-2">
            <label className="block">
                <span className="text-gray-700">Subtopic:</span>
                <select
                    name="subtopic"
                    className="mt-1 p-2 w-full rounded-md"
                    value={selectedSubtopicId || ''}
                    onChange={(e) => onSubtopicChange(Number(e.target.value))}
                >
                    <option value=''>Select Subtopic</option>
                    {data.flatMap(unit => (
                        [
                            <option key={`unit-${unit.unitid}`} disabled>{`${unit.unitnumber}. ${unit.unittitle}`}</option>,
                            ...unit.topics?.map(topic => (
                                [
                                    <option key={`topic-${topic.topicid}`} disabled>{` ${topic.topicnumber} - ${topic.topictitle}`}</option>,
                                    ...topic.subtopics?.map(subtopic => (
                                        <option key={subtopic.subtopicid} value={subtopic.subtopicid}>
                                            {`  ${subtopic.subtopicnumber} - ${subtopic.subtopictitle}`}
                                        </option>
                                    )) || []
                                ]
                            )) || []
                        ]
                    ))}
                </select>
            </label>
        </div>

    );
}

export default SubTopicDropDown;
