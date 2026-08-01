-- =========================================================
-- LANGKAH 1: HARDENING
-- =========================================================

-- Payments: hapus policy longgar / berbasis profiles.role
DROP POLICY IF EXISTS "Admins can do everything on payments" ON public.payments;
DROP POLICY IF EXISTS "Allow authenticated users to read payments" ON public.payments;
DROP POLICY IF EXISTS "Allow authenticated users to update payments" ON public.payments;
DROP POLICY IF EXISTS "Izinkan admin menghapus pembayaran" ON public.payments;
DROP POLICY IF EXISTS "Users can insert their own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;

CREATE OR REPLACE FUNCTION public.owns_parent_ref(_parent_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT _parent_id IS NOT NULL AND (
    _parent_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = _parent_id AND p.user_id = auth.uid())
  )
$$;

CREATE POLICY "payments_select_own_or_admin" ON public.payments
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.owns_parent_ref(parent_id));

CREATE POLICY "payments_insert_own" ON public.payments
FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.owns_parent_ref(parent_id));

CREATE POLICY "payments_update_admin" ON public.payments
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "payments_delete_admin" ON public.payments
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;

-- App settings: modifikasi hanya admin
DROP POLICY IF EXISTS "Izinkan modifikasi untuk admin" ON public.app_settings;
DROP POLICY IF EXISTS "Izinkan baca untuk semua" ON public.app_settings;

CREATE POLICY "app_settings_read_all" ON public.app_settings
FOR SELECT USING (true);

CREATE POLICY "app_settings_admin_write" ON public.app_settings
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

GRANT SELECT ON public.app_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;

-- Children: hapus duplikasi policy (versi lama berbasis auth.uid()=parent_id)
DROP POLICY IF EXISTS "Ortu boleh lihat data anak sendiri" ON public.children;
DROP POLICY IF EXISTS "Ortu boleh simpan data anak" ON public.children;
DROP POLICY IF EXISTS "Ortu boleh ubah data anak sendiri" ON public.children;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.children TO authenticated;
GRANT ALL ON public.children TO service_role;

-- =========================================================
-- LANGKAH 2: FONDASI SKEMA SIS
-- =========================================================

CREATE TYPE public.selection_status AS ENUM ('unprocessed', 'passed', 'failed', 'waitlist');
CREATE TYPE public.student_status AS ENUM ('active', 'inactive', 'graduated', 'transferred');
CREATE TYPE public.guardian_relation AS ENUM ('father', 'mother', 'other');

-- Penyesuaian tabel pendaftaran PPDB (children)
ALTER TABLE public.children
  ADD COLUMN IF NOT EXISTS selection_status public.selection_status NOT NULL DEFAULT 'unprocessed',
  ADD COLUMN IF NOT EXISTS selection_notes text,
  ADD COLUMN IF NOT EXISTS decided_at timestamptz,
  ADD COLUMN IF NOT EXISTS promoted_student_id uuid;

-- academic_years
CREATE TABLE public.academic_years (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  start_date date,
  end_date date,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.academic_years TO authenticated;
GRANT SELECT ON public.academic_years TO anon;
GRANT INSERT, UPDATE, DELETE ON public.academic_years TO authenticated;
GRANT ALL ON public.academic_years TO service_role;
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
CREATE POLICY "academic_years_read_all" ON public.academic_years FOR SELECT USING (true);
CREATE POLICY "academic_years_admin_write" ON public.academic_years FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- nis_sequences
CREATE TABLE public.nis_sequences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year_code text NOT NULL UNIQUE,
  last_number integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.nis_sequences TO authenticated;
GRANT ALL ON public.nis_sequences TO service_role;
ALTER TABLE public.nis_sequences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "nis_sequences_admin_read" ON public.nis_sequences FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- students
CREATE TABLE public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nis text NOT NULL UNIQUE,
  full_name text NOT NULL,
  nickname text,
  gender text NOT NULL,
  birth_place text,
  birth_date date,
  address text,
  photo_url text,
  status public.student_status NOT NULL DEFAULT 'active',
  registration_id uuid REFERENCES public.children(id) ON DELETE SET NULL,
  entry_year_id uuid REFERENCES public.academic_years(id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO authenticated;
GRANT ALL ON public.students TO service_role;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- guardians
CREATE TABLE public.guardians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  relation public.guardian_relation NOT NULL DEFAULT 'other',
  phone text,
  occupation text,
  address text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guardians TO authenticated;
GRANT ALL ON public.guardians TO service_role;
ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;
CREATE POLICY "guardians_select_self_or_admin" ON public.guardians FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR user_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = guardians.profile_id AND p.user_id = auth.uid()));
CREATE POLICY "guardians_admin_write" ON public.guardians FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- student_guardians
CREATE TABLE public.student_guardians (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  guardian_id uuid NOT NULL REFERENCES public.guardians(id) ON DELETE CASCADE,
  is_primary boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, guardian_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_guardians TO authenticated;
GRANT ALL ON public.student_guardians TO service_role;
ALTER TABLE public.student_guardians ENABLE ROW LEVEL SECURITY;

-- helper: apakah user saat ini wali dari siswa tsb
CREATE OR REPLACE FUNCTION public.is_guardian_of(_student_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.student_guardians sg
    JOIN public.guardians g ON g.id = sg.guardian_id
    LEFT JOIN public.profiles p ON p.id = g.profile_id
    WHERE sg.student_id = _student_id
      AND (g.user_id = auth.uid() OR p.user_id = auth.uid())
  )
$$;

CREATE POLICY "students_select_admin_or_guardian" ON public.students FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.is_guardian_of(id));
CREATE POLICY "students_admin_write" ON public.students FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "student_guardians_select" ON public.student_guardians FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.is_guardian_of(student_id));
CREATE POLICY "student_guardians_admin_write" ON public.student_guardians FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- classes
CREATE TABLE public.classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  level text,
  academic_year_id uuid REFERENCES public.academic_years(id) ON DELETE SET NULL,
  homeroom_teacher text,
  capacity integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (name, academic_year_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.classes TO authenticated;
GRANT ALL ON public.classes TO service_role;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "classes_read_authenticated" ON public.classes FOR SELECT TO authenticated USING (true);
CREATE POLICY "classes_admin_write" ON public.classes FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- enrollments
CREATE TABLE public.enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  academic_year_id uuid REFERENCES public.academic_years(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, class_id, academic_year_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.enrollments TO authenticated;
GRANT ALL ON public.enrollments TO service_role;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "enrollments_select_admin_or_guardian" ON public.enrollments FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.is_guardian_of(student_id));
CREATE POLICY "enrollments_admin_write" ON public.enrollments FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.children
  ADD CONSTRAINT children_promoted_student_fkey
  FOREIGN KEY (promoted_student_id) REFERENCES public.students(id) ON DELETE SET NULL;

-- Trigger updated_at
CREATE TRIGGER trg_academic_years_updated BEFORE UPDATE ON public.academic_years
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_students_updated BEFORE UPDATE ON public.students
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_guardians_updated BEFORE UPDATE ON public.guardians
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_classes_updated BEFORE UPDATE ON public.classes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_enrollments_updated BEFORE UPDATE ON public.enrollments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_nis_sequences_updated BEFORE UPDATE ON public.nis_sequences
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Index
CREATE INDEX idx_students_status ON public.students(status);
CREATE INDEX idx_student_guardians_student ON public.student_guardians(student_id);
CREATE INDEX idx_student_guardians_guardian ON public.student_guardians(guardian_id);
CREATE INDEX idx_enrollments_student ON public.enrollments(student_id);
CREATE INDEX idx_enrollments_class ON public.enrollments(class_id);
CREATE INDEX idx_children_selection_status ON public.children(selection_status);