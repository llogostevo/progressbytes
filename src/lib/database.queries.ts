import { Database, UnitTopics } from "./database.types";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

type Topic = Database["public"]["Tables"]["topics"]["Row"];





export async function allTopics() {

  //   const supabase = createServerComponentClient({ cookies });

  // const { data } = await supabase.from("topics").select();
  // const topics = data as Topic[]

  // return topics;

}

export async function allUnitTopics() {

  //   const supabase = createServerComponentClient({ cookies });

  // const { data } = await supabase.from("units").select(`
  //   unit_id, 
  //   unit_name,
  //   topics ( topic_id, topic_name )
  //   `);
  // const topics = data as UnitTopics[];

  // return topics;

}