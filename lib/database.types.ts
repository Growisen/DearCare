export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          client_category: Database["public"]["Enums"]["client_category"]
          client_type: Database["public"]["Enums"]["client_type"]
          created_at: string | null
          general_notes: string | null
          id: string
          status: Database["public"]["Enums"]["client_status"] | null
          updated_at: string | null
        }
        Insert: {
          client_category: Database["public"]["Enums"]["client_category"]
          client_type: Database["public"]["Enums"]["client_type"]
          created_at?: string | null
          general_notes?: string | null
          id?: string
          status?: Database["public"]["Enums"]["client_status"] | null
          updated_at?: string | null
        }
        Update: {
          client_category?: Database["public"]["Enums"]["client_category"]
          client_type?: Database["public"]["Enums"]["client_type"]
          created_at?: string | null
          general_notes?: string | null
          id?: string
          status?: Database["public"]["Enums"]["client_status"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      individual_clients: {
        Row: {
          care_duration: string
          client_id: string
          complete_address: string
          patient_age: number | null
          patient_gender: Database["public"]["Enums"]["gender_type"] | null
          patient_name: string
          patient_phone: string | null
          preferred_caregiver_gender: string | null
          relation_to_patient: Database["public"]["Enums"]["relation_type"]
          requestor_email: string
          requestor_name: string
          requestor_phone: string
          service_required: string
          start_date: string
        }
        Insert: {
          care_duration: string
          client_id: string
          complete_address: string
          patient_age?: number | null
          patient_gender?: Database["public"]["Enums"]["gender_type"] | null
          patient_name: string
          patient_phone?: string | null
          preferred_caregiver_gender?: string | null
          relation_to_patient: Database["public"]["Enums"]["relation_type"]
          requestor_email: string
          requestor_name: string
          requestor_phone: string
          service_required: string
          start_date: string
        }
        Update: {
          care_duration?: string
          client_id?: string
          complete_address?: string
          patient_age?: number | null
          patient_gender?: Database["public"]["Enums"]["gender_type"] | null
          patient_name?: string
          patient_phone?: string | null
          preferred_caregiver_gender?: string | null
          relation_to_patient?: Database["public"]["Enums"]["relation_type"]
          requestor_email?: string
          requestor_name?: string
          requestor_phone?: string
          service_required?: string
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "individual_clients_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      nurse_health: {
        Row: {
          created_at: string
          disability: string | null
          health_status: string | null
          id: number
          nurse_id: number | null
          source: string | null
        }
        Insert: {
          created_at?: string
          disability?: string | null
          health_status?: string | null
          id?: number
          nurse_id?: number | null
          source?: string | null
        }
        Update: {
          created_at?: string
          disability?: string | null
          health_status?: string | null
          id?: number
          nurse_id?: number | null
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nurse_health_nurse_id_fkey"
            columns: ["nurse_id"]
            isOneToOne: false
            referencedRelation: "nurses"
            referencedColumns: ["nurse_id"]
          },
        ]
      }
      nurse_references: {
        Row: {
          created_at: string
          description: string | null
          family_references: Json | null
          id: number
          nurse_id: number | null
          phone_number: string | null
          referer_name: string | null
          relation: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          family_references?: Json | null
          id?: number
          nurse_id?: number | null
          phone_number?: string | null
          referer_name?: string | null
          relation?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          family_references?: Json | null
          id?: number
          nurse_id?: number | null
          phone_number?: string | null
          referer_name?: string | null
          relation?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nurse_references_nurse_id_fkey"
            columns: ["nurse_id"]
            isOneToOne: false
            referencedRelation: "nurses"
            referencedColumns: ["nurse_id"]
          },
        ]
      }
      nurses: {
        Row: {
          address: string | null
          category: string | null
          city: string | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          experience: number | null
          first_name: string | null
          gender: string | null
          languages: Json | null
          last_name: string | null
          marital_status: string | null
          mother_tongue: string | null
          noc_status: string | null
          nurse_id: number
          phone_number: string | null
          pin_code: number | null
          religion: string | null
          service_type: string | null
          shift_pattern: string | null
          state: string | null
          status: Database["public"]["Enums"]["nurse_status"]
          taluk: string | null
        }
        Insert: {
          address?: string | null
          category?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          experience?: number | null
          first_name?: string | null
          gender?: string | null
          languages?: Json | null
          last_name?: string | null
          marital_status?: string | null
          mother_tongue?: string | null
          noc_status?: string | null
          nurse_id?: number
          phone_number?: string | null
          pin_code?: number | null
          religion?: string | null
          service_type?: string | null
          shift_pattern?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["nurse_status"]
          taluk?: string | null
        }
        Update: {
          address?: string | null
          category?: string | null
          city?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          experience?: number | null
          first_name?: string | null
          gender?: string | null
          languages?: Json | null
          last_name?: string | null
          marital_status?: string | null
          mother_tongue?: string | null
          noc_status?: string | null
          nurse_id?: number
          phone_number?: string | null
          pin_code?: number | null
          religion?: string | null
          service_type?: string | null
          shift_pattern?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["nurse_status"]
          taluk?: string | null
        }
        Relationships: []
      }
      organization_clients: {
        Row: {
          client_id: string
          contact_email: string
          contact_person_name: string
          contact_person_role: string | null
          contact_phone: string
          contract_duration: string | null
          organization_address: string
          organization_name: string
          organization_type: string | null
        }
        Insert: {
          client_id: string
          contact_email: string
          contact_person_name: string
          contact_person_role?: string | null
          contact_phone: string
          contract_duration?: string | null
          organization_address: string
          organization_name: string
          organization_type?: string | null
        }
        Update: {
          client_id?: string
          contact_email?: string
          contact_person_name?: string
          contact_person_role?: string | null
          contact_phone?: string
          contract_duration?: string | null
          organization_address?: string
          organization_name?: string
          organization_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_clients_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: true
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_assessments: {
        Row: {
          alcohol_use: string | null
          alertness_level: string | null
          blood_pressure: string | null
          chronic_illness: string | null
          city_town: string | null
          client_id: string
          created_at: string | null
          current_status: string | null
          district: string | null
          drugs_use: string | null
          emotional_state: string | null
          environment: Json | null
          equipment: Json | null
          feeding_method: string | null
          final_diagnosis: string | null
          foods_to_avoid: string | null
          foods_to_include: string | null
          guardian_occupation: string | null
          height: string | null
          id: string
          lab_investigations: Json | null
          marital_status: string | null
          medical_history: string | null
          medication_history: string | null
          other_social_history: string | null
          patient_position: string | null
          physical_behavior: string | null
          pincode: string | null
          present_condition: string | null
          speech_patterns: string | null
          sugar_level: string | null
          surgical_history: string | null
          tobacco_use: string | null
          updated_at: string | null
          weight: string | null
        }
        Insert: {
          alcohol_use?: string | null
          alertness_level?: string | null
          blood_pressure?: string | null
          chronic_illness?: string | null
          city_town?: string | null
          client_id: string
          created_at?: string | null
          current_status?: string | null
          district?: string | null
          drugs_use?: string | null
          emotional_state?: string | null
          environment?: Json | null
          equipment?: Json | null
          feeding_method?: string | null
          final_diagnosis?: string | null
          foods_to_avoid?: string | null
          foods_to_include?: string | null
          guardian_occupation?: string | null
          height?: string | null
          id?: string
          lab_investigations?: Json | null
          marital_status?: string | null
          medical_history?: string | null
          medication_history?: string | null
          other_social_history?: string | null
          patient_position?: string | null
          physical_behavior?: string | null
          pincode?: string | null
          present_condition?: string | null
          speech_patterns?: string | null
          sugar_level?: string | null
          surgical_history?: string | null
          tobacco_use?: string | null
          updated_at?: string | null
          weight?: string | null
        }
        Update: {
          alcohol_use?: string | null
          alertness_level?: string | null
          blood_pressure?: string | null
          chronic_illness?: string | null
          city_town?: string | null
          client_id?: string
          created_at?: string | null
          current_status?: string | null
          district?: string | null
          drugs_use?: string | null
          emotional_state?: string | null
          environment?: Json | null
          equipment?: Json | null
          feeding_method?: string | null
          final_diagnosis?: string | null
          foods_to_avoid?: string | null
          foods_to_include?: string | null
          guardian_occupation?: string | null
          height?: string | null
          id?: string
          lab_investigations?: Json | null
          marital_status?: string | null
          medical_history?: string | null
          medication_history?: string | null
          other_social_history?: string | null
          patient_position?: string | null
          physical_behavior?: string | null
          pincode?: string | null
          present_condition?: string | null
          speech_patterns?: string | null
          sugar_level?: string | null
          surgical_history?: string | null
          tobacco_use?: string | null
          updated_at?: string | null
          weight?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_assessments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_requirements: {
        Row: {
          client_id: string | null
          count: number
          created_at: string | null
          id: string
          shift_type: string
          staff_type: string
        }
        Insert: {
          client_id?: string | null
          count?: number
          created_at?: string | null
          id?: string
          shift_type: string
          staff_type: string
        }
        Update: {
          client_id?: string | null
          count?: number
          created_at?: string | null
          id?: string
          shift_type?: string
          staff_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_requirements_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      student_academics: {
        Row: {
          created_at: string
          id: number
          institution: string | null
          marks: string | null
          qualification: string | null
          student_id: number | null
          year_of_passing: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          institution?: string | null
          marks?: string | null
          qualification?: string | null
          student_id?: number | null
          year_of_passing?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          institution?: string | null
          marks?: string | null
          qualification?: string | null
          student_id?: number | null
          year_of_passing?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "student_academics_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_experience: {
        Row: {
          created_at: string
          duration: number | null
          id: number
          org_name: string | null
          responsibility: string | null
          role: string | null
          student_id: number | null
        }
        Insert: {
          created_at?: string
          duration?: number | null
          id?: number
          org_name?: string | null
          responsibility?: string | null
          role?: string | null
          student_id?: number | null
        }
        Update: {
          created_at?: string
          duration?: number | null
          id?: number
          org_name?: string | null
          responsibility?: string | null
          role?: string | null
          student_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "student_experience_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_guardian: {
        Row: {
          aadhaar: string | null
          address: string | null
          created_at: string
          guardian_name: string | null
          id: number
          mobile: string | null
          relation: string | null
          student_id: number | null
        }
        Insert: {
          aadhaar?: string | null
          address?: string | null
          created_at?: string
          guardian_name?: string | null
          id?: number
          mobile?: string | null
          relation?: string | null
          student_id?: number | null
        }
        Update: {
          aadhaar?: string | null
          address?: string | null
          created_at?: string
          guardian_name?: string | null
          id?: number
          mobile?: string | null
          relation?: string | null
          student_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "student_guardian_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_preferences: {
        Row: {
          clinical_assist: string | null
          companionship: string | null
          created_at: string
          critical_illness_care: string | null
          delivery_care: string | null
          home_care: string | null
          hospital_care: string | null
          icu_home_care: string | null
          id: number
          old_age_home: string | null
          senior_citizen_assist: string | null
          student_id: number | null
        }
        Insert: {
          clinical_assist?: string | null
          companionship?: string | null
          created_at?: string
          critical_illness_care?: string | null
          delivery_care?: string | null
          home_care?: string | null
          hospital_care?: string | null
          icu_home_care?: string | null
          id?: number
          old_age_home?: string | null
          senior_citizen_assist?: string | null
          student_id?: number | null
        }
        Update: {
          clinical_assist?: string | null
          companionship?: string | null
          created_at?: string
          critical_illness_care?: string | null
          delivery_care?: string | null
          home_care?: string | null
          hospital_care?: string | null
          icu_home_care?: string | null
          id?: number
          old_age_home?: string | null
          senior_citizen_assist?: string | null
          student_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "student_preferences_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_source: {
        Row: {
          assigning_agent: string | null
          category: string | null
          created_at: string
          id: number
          priority: string | null
          source_of_info: string | null
          status: string | null
          student_id: number | null
          sub_category: string | null
        }
        Insert: {
          assigning_agent?: string | null
          category?: string | null
          created_at?: string
          id?: number
          priority?: string | null
          source_of_info?: string | null
          status?: string | null
          student_id?: number | null
          sub_category?: string | null
        }
        Update: {
          assigning_agent?: string | null
          category?: string | null
          created_at?: string
          id?: number
          priority?: string | null
          source_of_info?: string | null
          status?: string | null
          student_id?: number | null
          sub_category?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_source_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          age: number | null
          category: string | null
          city: string | null
          created_at: string
          cur_address: string | null
          cur_health_status: string | null
          cur_pincode: string | null
          disability_details: string | null
          dob: string | null
          email: string | null
          gender: string | null
          id: number
          languages: Json | null
          marital_status: string | null
          mobile: string | null
          mother_tongue: string | null
          name: string | null
          nationality: string | null
          noc_status: string | null
          perm_address: string | null
          perm_pincode: string | null
          religion: string | null
          state: string | null
          taluk: string | null
        }
        Insert: {
          age?: number | null
          category?: string | null
          city?: string | null
          created_at?: string
          cur_address?: string | null
          cur_health_status?: string | null
          cur_pincode?: string | null
          disability_details?: string | null
          dob?: string | null
          email?: string | null
          gender?: string | null
          id?: number
          languages?: Json | null
          marital_status?: string | null
          mobile?: string | null
          mother_tongue?: string | null
          name?: string | null
          nationality?: string | null
          noc_status?: string | null
          perm_address?: string | null
          perm_pincode?: string | null
          religion?: string | null
          state?: string | null
          taluk?: string | null
        }
        Update: {
          age?: number | null
          category?: string | null
          city?: string | null
          created_at?: string
          cur_address?: string | null
          cur_health_status?: string | null
          cur_pincode?: string | null
          disability_details?: string | null
          dob?: string | null
          email?: string | null
          gender?: string | null
          id?: number
          languages?: Json | null
          marital_status?: string | null
          mobile?: string | null
          mother_tongue?: string | null
          name?: string | null
          nationality?: string | null
          noc_status?: string | null
          perm_address?: string | null
          perm_pincode?: string | null
          religion?: string | null
          state?: string | null
          taluk?: string | null
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
      client_category: "DearCare" | "TataLife"
      client_status:
        | "pending"
        | "under_review"
        | "approved"
        | "rejected"
        | "assigned"
      client_type: "individual" | "organization" | "hospital" | "carehome"
      gender_type: "male" | "female" | "other"
      nurse_status: "unassigned" | "assigned" | "leave"
      relation_type:
        | "self"
        | "spouse"
        | "child"
        | "parent"
        | "sibling"
        | "other"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
