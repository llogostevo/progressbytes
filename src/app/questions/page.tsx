import StreakTracker from "@/components/StreakTracker";
import { allUnitTopics } from "@/lib/database.queries";
import { UnitTopics } from "@/lib/database.types";

export default async function Questions() {

    // get the unit topics from the database
    // const units : UnitTopics[] = await allUnitTopics() 

    return (
        <div>
            {/* {units?.map((unit) => (
                <div>
                    <h1 className="text-4xl" key={unit.unit_id}>{unit.unit_name} </h1>
                    <ul>
                        {unit.topics?.map(topic => <li key={topic.topic_id}>{topic.topic_name}</li>)}
                    </ul>
                </div>
            ))} */}


            {/* <form action="/submit-url" method="post">
                <label htmlFor="dropdownMenu">Choose an option:</label>
                <select name="dropdown" id="dropdownMenu">

                    {units?.map((unit) => (
                        unit.topics?.map(topic => (
                            <option key={topic.topic_id} value={topic.topic_id}>
                                {`Unit ${unit.unit_id}: ${topic.topic_name}`}
                            </option>
                        ))
                    ))}

                </select>
                <input type="submit" value="Submit" />
            </form> */}
            <StreakTracker/>
        </div>
    );
}