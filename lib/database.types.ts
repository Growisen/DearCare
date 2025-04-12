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
      academy_courses: {
        Row: {
          course_fees: number | null
          course_name: string
          created_at: string
          id: number
          reg_fees: number | null
        }
        Insert: {
          course_fees?: number | null
          course_name: string
          created_at?: string
          id?: number
          reg_fees?: number | null
        }
        Update: {
          course_fees?: number | null
          course_name?: string
          created_at?: string
          id?: number
          reg_fees?: number | null
        }
        Relationships: []
      }
      academy_enquiries: {
        Row: {
          course: string | null
          created_at: string
          email: string | null
          hide: boolean | null
          id: number
          name: string | null
          phone_no: string | null
        }
        Insert: {
          course?: string | null
          created_at?: string
          email?: string | null
          hide?: boolean | null
          id?: number
          name?: string | null
          phone_no?: string | null
        }
        Update: {
          course?: string | null
          created_at?: string
          email?: string | null
          hide?: boolean | null
          id?: number
          name?: string | null
          phone_no?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "academy_enquiries_course_fkey"
            columns: ["course"]
            isOneToOne: false
            referencedRelation: "academy_courses"
            referencedColumns: ["course_name"]
          },
        ]
      }
      academy_faculties: {
        Row: {
          created_at: string
          department: string | null
          email: string | null
          id: number
          join_date: string | null
          name: string | null
          phone_no: string | null
        }
        Insert: {
          created_at?: string
          department?: string | null
          email?: string | null
          id?: number
          join_date?: string | null
          name?: string | null
          phone_no?: string | null
        }
        Update: {
          created_at?: string
          department?: string | null
          email?: string | null
          id?: number
          join_date?: string | null
          name?: string | null
          phone_no?: string | null
        }
        Relationships: []
      }
      academy_roles: {
        Row: {
          created_at: string
          id: number
          role: string | null
          uid: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          role?: string | null
          uid?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          role?: string | null
          uid?: string | null
        }
        Relationships: []
      }
      academy_supervisors: {
        Row: {
          created_at: string
          department: string | null
          email: string | null
          id: number
          join_date: string | null
          name: string | null
          phone_no: string | null
        }
        Insert: {
          created_at?: string
          department?: string | null
          email?: string | null
          id?: number
          join_date?: string | null
          name?: string | null
          phone_no?: string | null
        }
        Update: {
          created_at?: string
          department?: string | null
          email?: string | null
          id?: number
          join_date?: string | null
          name?: string | null
          phone_no?: string | null
        }
        Relationships: []
      }
      attendence_individual: {
        Row: {
          assigned_id: number
          created_at: string
          date: string
          end_time: string | null
          id: number
          location: string | null
          start_time: string | null
          total_hours: string | null
        }
        Insert: {
          assigned_id: number
          created_at?: string
          date: string
          end_time?: string | null
          id?: number
          location?: string | null
          start_time?: string | null
          total_hours?: string | null
        }
        Update: {
          assigned_id?: number
          created_at?: string
          date?: string
          end_time?: string | null
          id?: number
          location?: string | null
          start_time?: string | null
          total_hours?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendence_individual_assigned_id_fkey"
            columns: ["assigned_id"]
            isOneToOne: false
            referencedRelation: "nurse_client"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          client_category: Database["public"]["Enums"]["client_category"]
          client_type: Database["public"]["Enums"]["client_type"]
          created_at: string | null
          general_notes: string | null
          id: string
          rejection_reason: string | null
          status: Database["public"]["Enums"]["client_status"] | null
          updated_at: string | null
        }
        Insert: {
          client_category: Database["public"]["Enums"]["client_category"]
          client_type: Database["public"]["Enums"]["client_type"]
          created_at?: string | null
          general_notes?: string | null
          id?: string
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["client_status"] | null
          updated_at?: string | null
        }
        Update: {
          client_category?: Database["public"]["Enums"]["client_category"]
          client_type?: Database["public"]["Enums"]["client_type"]
          created_at?: string | null
          general_notes?: string | null
          id?: string
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["client_status"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      faculty_assignment: {
        Row: {
          created_at: string
          faculty_id: number | null
          id: number
          student_id: number | null
        }
        Insert: {
          created_at?: string
          faculty_id?: number | null
          id?: number
          student_id?: number | null
        }
        Update: {
          created_at?: string
          faculty_id?: number | null
          id?: number
          student_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "faculty_assignment_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "academy_faculties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faculty_assignment_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
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
      nurse_client: {
        Row: {
          assigned_type: Database["public"]["Enums"]["assigned_type"]
          client_id: string
          created_at: string
          end_date: string | null
          id: number
          nurse_id: number
          salary_hour: number | null
          shift_end_time: string | null
          shift_start_time: string | null
          start_date: string
        }
        Insert: {
          assigned_type: Database["public"]["Enums"]["assigned_type"]
          client_id: string
          created_at?: string
          end_date?: string | null
          id?: number
          nurse_id: number
          salary_hour?: number | null
          shift_end_time?: string | null
          shift_start_time?: string | null
          start_date: string
        }
        Update: {
          assigned_type?: Database["public"]["Enums"]["assigned_type"]
          client_id?: string
          created_at?: string
          end_date?: string | null
          id?: number
          nurse_id?: number
          salary_hour?: number | null
          shift_end_time?: string | null
          shift_start_time?: string | null
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "nurse_client_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nurse_client_nurse_id_fkey"
            columns: ["nurse_id"]
            isOneToOne: false
            referencedRelation: "nurses"
            referencedColumns: ["nurse_id"]
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
      nurse_leave_requests: {
        Row: {
          applied_on: string | null
          days: number
          end_date: string
          id: string
          leave_mode: Database["public"]["Enums"]["leave_mode"] | null
          leave_type: Database["public"]["Enums"]["leave_type"]
          nurse_id: number
          reason: string | null
          rejection_reason: string | null
          start_date: string
          status: Database["public"]["Enums"]["leave_status"] | null
          updated_at: string | null
        }
        Insert: {
          applied_on?: string | null
          days: number
          end_date: string
          id?: string
          leave_mode?: Database["public"]["Enums"]["leave_mode"] | null
          leave_type: Database["public"]["Enums"]["leave_type"]
          nurse_id: number
          reason?: string | null
          rejection_reason?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["leave_status"] | null
          updated_at?: string | null
        }
        Update: {
          applied_on?: string | null
          days?: number
          end_date?: string
          id?: string
          leave_mode?: Database["public"]["Enums"]["leave_mode"] | null
          leave_type?: Database["public"]["Enums"]["leave_type"]
          nurse_id?: number
          reason?: string | null
          rejection_reason?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["leave_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nurse_leave_requests_nurse_id_fkey"
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
          organization_address: string
          organization_name: string
          organization_type: string | null
          start_date: string | null
        }
        Insert: {
          client_id: string
          contact_email: string
          contact_person_name: string
          contact_person_role?: string | null
          contact_phone: string
          organization_address: string
          organization_name: string
          organization_type?: string | null
          start_date?: string | null
        }
        Update: {
          client_id?: string
          contact_email?: string
          contact_person_name?: string
          contact_person_role?: string | null
          contact_phone?: string
          organization_address?: string
          organization_name?: string
          organization_type?: string | null
          start_date?: string | null
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
          auth_uid: string | null
          category: string | null
          city: string | null
          course: string | null
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
          payment_receipt: boolean | null
          perm_address: string | null
          perm_pincode: string | null
          religion: string | null
          state: string | null
          taluk: string | null
        }
        Insert: {
          age?: number | null
          auth_uid?: string | null
          category?: string | null
          city?: string | null
          course?: string | null
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
          payment_receipt?: boolean | null
          perm_address?: string | null
          perm_pincode?: string | null
          religion?: string | null
          state?: string | null
          taluk?: string | null
        }
        Update: {
          age?: number | null
          auth_uid?: string | null
          category?: string | null
          city?: string | null
          course?: string | null
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
          payment_receipt?: boolean | null
          perm_address?: string | null
          perm_pincode?: string | null
          religion?: string | null
          state?: string | null
          taluk?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_course_fkey"
            columns: ["course"]
            isOneToOne: false
            referencedRelation: "academy_courses"
            referencedColumns: ["course_name"]
          },
        ]
      }
      supervisor_assignment: {
        Row: {
          created_at: string
          id: number
          student_id: number | null
          supervisor_id: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          student_id?: number | null
          supervisor_id?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          student_id?: number | null
          supervisor_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "supervisor_assignment_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supervisor_assignment_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "academy_supervisors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      assigned_type: "individual" | "organization"
      client_category: "DearCare" | "TataLife"
      client_status:
        | "pending"
        | "under_review"
        | "approved"
        | "rejected"
        | "assigned"
      client_type: "individual" | "organization" | "hospital" | "carehome"
      gender_type: "male" | "female" | "other"
      leave_mode: "full_day" | "half_day_morning" | "half_day_afternoon"
      leave_status: "pending" | "approved" | "rejected"
      leave_type:
        | "sick"
        | "annual"
        | "personal"
        | "casual"
        | "maternity"
        | "paternity"
        | "unpaid"
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      assigned_type: ["individual", "organization"],
      client_category: ["DearCare", "TataLife"],
      client_status: [
        "pending",
        "under_review",
        "approved",
        "rejected",
        "assigned",
      ],
      client_type: ["individual", "organization", "hospital", "carehome"],
      gender_type: ["male", "female", "other"],
      leave_mode: ["full_day", "half_day_morning", "half_day_afternoon"],
      leave_status: ["pending", "approved", "rejected"],
      leave_type: [
        "sick",
        "annual",
        "personal",
        "casual",
        "maternity",
        "paternity",
        "unpaid",
      ],
      nurse_status: ["unassigned", "assigned", "leave"],
      relation_type: ["self", "spouse", "child", "parent", "sibling", "other"],
    },
  },
} as const
