export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

/* 
####################################################
Query Data Types
####################################################
*/
// ALL UNIT TOPICS QUERY
export  type UnitTopics = {   
      unit_id: number | null
      unit_name: string
      topics: [{
        topic_id: number
        topic_name: string
      }]
}

/* 
####################################################
Table Data Types
####################################################
*/

/* 
####################################################
DATABASE SCHEMA
####################################################
*/

export interface Database {
  public: {
    Tables: {
      questions_completed: {
        Row: {
          assessed_by: Database["public"]["Enums"]["assessment_type"]
          date_answered: string | null
          date_entered: string | null
          id: number
          marks_available: number
          no_of_marks: number
          studentid: number | null
          topic_id: number | null
        }
        Insert: {
          assessed_by: Database["public"]["Enums"]["assessment_type"]
          date_answered?: string | null
          date_entered?: string | null
          id?: number
          marks_available: number
          no_of_marks: number
          studentid?: number | null
          topic_id?: number | null
        }
        Update: {
          assessed_by?: Database["public"]["Enums"]["assessment_type"]
          date_answered?: string | null
          date_entered?: string | null
          id?: number
          marks_available?: number
          no_of_marks?: number
          studentid?: number | null
          topic_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_completed_studentid_fkey"
            columns: ["studentid"]
            referencedRelation: "students"
            referencedColumns: ["studentid"]
          },
          {
            foreignKeyName: "questions_completed_topic_id_fkey"
            columns: ["topic_id"]
            referencedRelation: "topics"
            referencedColumns: ["topic_id"]
          }
        ]
      }
      students: {
        Row: {
          email: string
          studentid: number
          username: string
        }
        Insert: {
          email: string
          studentid?: number
          username: string
        }
        Update: {
          email?: string
          studentid?: number
          username?: string
        }
        Relationships: []
      }
      topics: {
        Row: {
          topic_id: number
          topic_name: string
          unit_id: number | null
        }
        Insert: {
          topic_id?: number
          topic_name: string
          unit_id?: number | null
        }
        Update: {
          topic_id?: number
          topic_name?: string
          unit_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "topics_unit_id_fkey"
            columns: ["unit_id"]
            referencedRelation: "units"
            referencedColumns: ["unit_id"]
          }
        ]
      }
      units: {
        Row: {
          unit_id: number
          unit_name: string
        }
        Insert: {
          unit_id?: number
          unit_name: string
        }
        Update: {
          unit_id?: number
          unit_name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      assessment_type: "teacher" | "student"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}


export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
