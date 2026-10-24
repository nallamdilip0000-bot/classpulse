-- ====================================================================
-- ClassPulse: Early Academic Support Dashboard
-- Database Schema & Row Level Security (RLS) Policies
-- Suggested Ministry Alignment: Ministry of Education
-- ====================================================================

-- 1. EXTENSIONS & ENUMS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'student');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'excused', 'late');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE assessment_result_status AS ENUM ('scored', 'missing', 'excused');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE intervention_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. CORE TABLES

-- Users (Profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'teacher',
  title TEXT,
  student_id TEXT, -- If role is student, references students.id
  assigned_class_ids TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Classes
CREATE TABLE IF NOT EXISTS public.classes (
  id TEXT PRIMARY KEY,
  class_name TEXT NOT NULL,
  section TEXT NOT NULL,
  subject_focus TEXT,
  academic_term TEXT NOT NULL DEFAULT 'Fall 2026',
  room TEXT,
  assigned_teacher_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Students
CREATE TABLE IF NOT EXISTS public.students (
  id TEXT PRIMARY KEY,
  student_code TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  class_id TEXT NOT NULL REFERENCES public.classes(id) ON DELETE RESTRICT,
  date_of_birth DATE,
  guardian_contact TEXT,
  profile_category TEXT,
  active_status BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attendance Records
CREATE TABLE IF NOT EXISTS public.attendance_records (
  id TEXT PRIMARY KEY DEFAULT ('ATT-' || uuid_generate_v4()::text),
  student_id TEXT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  class_id TEXT NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status attendance_status NOT NULL DEFAULT 'present',
  recorded_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_student_date UNIQUE(student_id, date)
);

-- Assessments
CREATE TABLE IF NOT EXISTS public.assessments (
  id TEXT PRIMARY KEY,
  class_id TEXT NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  title TEXT NOT NULL,
  assessment_date DATE NOT NULL,
  maximum_marks NUMERIC NOT NULL CHECK (maximum_marks > 0),
  academic_term TEXT NOT NULL DEFAULT 'Fall 2026',
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assessment Results
CREATE TABLE IF NOT EXISTS public.assessment_results (
  id TEXT PRIMARY KEY DEFAULT ('RES-' || uuid_generate_v4()::text),
  assessment_id TEXT NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  marks_obtained NUMERIC CHECK (marks_obtained >= 0),
  result_status assessment_result_status NOT NULL DEFAULT 'scored',
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_assessment_student UNIQUE(assessment_id, student_id)
);

-- Risk Settings (Configurable Thresholds)
CREATE TABLE IF NOT EXISTS public.risk_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scope_type TEXT NOT NULL DEFAULT 'global', -- 'global' or 'class'
  scope_id TEXT DEFAULT 'ALL',
  attendance_threshold NUMERIC NOT NULL DEFAULT 75 CHECK (attendance_threshold BETWEEN 10 AND 100),
  minimum_average_threshold NUMERIC NOT NULL DEFAULT 40 CHECK (minimum_average_threshold BETWEEN 5 AND 90),
  decline_threshold NUMERIC NOT NULL DEFAULT 15 CHECK (decline_threshold BETWEEN 1 AND 50),
  minimum_assessments INTEGER NOT NULL DEFAULT 2 CHECK (minimum_assessments BETWEEN 1 AND 10),
  enable_attendance_rule BOOLEAN DEFAULT TRUE,
  enable_average_rule BOOLEAN DEFAULT TRUE,
  enable_decline_rule BOOLEAN DEFAULT TRUE,
  updated_by TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Interventions & Support Tracking
CREATE TABLE IF NOT EXISTS public.interventions (
  id TEXT PRIMARY KEY DEFAULT ('INT-' || uuid_generate_v4()::text),
  student_id TEXT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  created_by TEXT NOT NULL,
  assigned_teacher_id TEXT,
  assigned_teacher_name TEXT,
  reason TEXT NOT NULL,
  triggered_indicator TEXT,
  planned_action TEXT NOT NULL,
  planned_action_label TEXT,
  private_notes TEXT,       -- Restricted to Staff / Teachers
  student_feedback TEXT,    -- Visible to Student
  next_follow_up_date DATE NOT NULL,
  status intervention_status NOT NULL DEFAULT 'pending',
  completion_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Activity Logs & Audit
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id TEXT PRIMARY KEY DEFAULT ('ACT-' || uuid_generate_v4()::text),
  action TEXT NOT NULL,
  details TEXT NOT NULL,
  user_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_students_class ON public.students(class_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON public.attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance_records(date);
CREATE INDEX IF NOT EXISTS idx_results_student ON public.assessment_results(student_id);
CREATE INDEX IF NOT EXISTS idx_results_assessment ON public.assessment_results(assessment_id);
CREATE INDEX IF NOT EXISTS idx_interventions_student ON public.interventions(student_id);
CREATE INDEX IF NOT EXISTS idx_interventions_status ON public.interventions(status);

-- 4. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Students:
-- Admins can view and manage all students.
-- Teachers can view students in their assigned classes.
-- Students can only view their own profile.
CREATE POLICY "Admins full access to students" ON public.students
  FOR ALL TO authenticated
  USING (public.current_user_role() = 'admin');

CREATE POLICY "Teachers view assigned class students" ON public.students
  FOR SELECT TO authenticated
  USING (
    public.current_user_role() = 'teacher' AND
    class_id = ANY(SELECT unnest(assigned_class_ids) FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Students view own record" ON public.students
  FOR SELECT TO authenticated
  USING (
    public.current_user_role() = 'student' AND
    id = (SELECT student_id FROM public.profiles WHERE id = auth.uid())
  );

-- Interventions:
-- Admins and Teachers can read and write interventions.
-- Students can only read interventions for themselves, and only the student_feedback column (via view or column-level access).
CREATE POLICY "Staff full access to interventions" ON public.interventions
  FOR ALL TO authenticated
  USING (public.current_user_role() IN ('admin', 'teacher'));

CREATE POLICY "Students read own interventions" ON public.interventions
  FOR SELECT TO authenticated
  USING (
    public.current_user_role() = 'student' AND
    student_id = (SELECT student_id FROM public.profiles WHERE id = auth.uid())
  );

-- Attendance & Assessments: Staff full access, Students select own records
CREATE POLICY "Staff manage attendance" ON public.attendance_records
  FOR ALL TO authenticated
  USING (public.current_user_role() IN ('admin', 'teacher'));

CREATE POLICY "Students view own attendance" ON public.attendance_records
  FOR SELECT TO authenticated
  USING (
    student_id = (SELECT student_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Staff manage assessments" ON public.assessments
  FOR ALL TO authenticated
  USING (public.current_user_role() IN ('admin', 'teacher'));

CREATE POLICY "Students view assessments" ON public.assessments
  FOR SELECT TO authenticated
  USING (TRUE);

CREATE POLICY "Staff manage results" ON public.assessment_results
  FOR ALL TO authenticated
  USING (public.current_user_role() IN ('admin', 'teacher'));

CREATE POLICY "Students view own results" ON public.assessment_results
  FOR SELECT TO authenticated
  USING (
    student_id = (SELECT student_id FROM public.profiles WHERE id = auth.uid())
  );
