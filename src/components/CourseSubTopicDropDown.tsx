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

interface CourseSubTopicDropDownProps {
    courseId: number;
    selectedSubtopicId: number | null;
    onSubtopicChange: (id: number) => void;
}

const CourseSubTopicDropDown: React.FC<CourseSubTopicDropDownProps> = ({ courseId, selectedSubtopicId, onSubtopicChange }) => {
    const [data, setData] = useState<Unit[]>([]);
    const supabase = createClientComponentClient();



    useEffect(() => {
        async function fetchData(courseId: number) {
            

            const { data: units } = await supabase
                .from('unittable')
                .select('*')
                .eq('courseid', courseId)
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

        fetchData(courseId);
    }, [courseId]);

    return (
        <div className="mt-1 space-y-2">
                <select
                    name="subtopic"
                    className="py-2 px-4 border rounded w-full"
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
        </div>

    );
}

export default CourseSubTopicDropDown;