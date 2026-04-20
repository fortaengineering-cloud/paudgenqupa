
-- Create enum types
CREATE TYPE public.app_role AS ENUM ('admin', 'parent');
CREATE TYPE public.registration_status AS ENUM ('pending', 'verified', 'rejected');

-- =====================================================
-- 1. PROFILES TABLE
-- =====================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. USER_ROLES TABLE
-- =====================================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3. CHILDREN TABLE
-- =====================================================
CREATE TABLE public.children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  birth_place TEXT NOT NULL,
  birth_date DATE NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('Laki-laki', 'Perempuan')),
  child_order INTEGER NOT NULL DEFAULT 1,
  address TEXT,
  status registration_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. BANNERS TABLE
-- =====================================================
CREATE TABLE public.banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. GALLERY CATEGORIES TABLE
-- =====================================================
CREATE TABLE public.gallery_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.gallery_categories ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. GALLERY PHOTOS TABLE
-- =====================================================
CREATE TABLE public.gallery_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.gallery_categories(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 7. SITE CONTENT TABLE
-- =====================================================
CREATE TABLE public.site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  title TEXT,
  content TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- HELPER FUNCTION: has_role
-- =====================================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- =====================================================
-- HELPER FUNCTION: update_updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_children_updated_at
  BEFORE UPDATE ON public.children
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_content_updated_at
  BEFORE UPDATE ON public.site_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- TRIGGER: Auto-create profile on signup
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'parent');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- RLS POLICIES: profiles
-- =====================================================
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin can delete profiles"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- RLS POLICIES: user_roles
-- =====================================================
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admin can insert roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admin can update roles"
  ON public.user_roles FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admin can delete roles"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- RLS POLICIES: children
-- =====================================================
CREATE POLICY "Parents can view own children"
  ON public.children FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR parent_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Parents can insert own children"
  ON public.children FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR parent_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Parents can update own children"
  ON public.children FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR parent_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Parents can delete own children"
  ON public.children FOR DELETE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR parent_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

-- =====================================================
-- RLS POLICIES: banners (public read, admin write)
-- =====================================================
CREATE POLICY "Anyone can view active banners"
  ON public.banners FOR SELECT
  USING (true);

CREATE POLICY "Admin can insert banners"
  ON public.banners FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can update banners"
  ON public.banners FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can delete banners"
  ON public.banners FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- RLS POLICIES: gallery_categories (public read, admin write)
-- =====================================================
CREATE POLICY "Anyone can view gallery categories"
  ON public.gallery_categories FOR SELECT
  USING (true);

CREATE POLICY "Admin can insert gallery categories"
  ON public.gallery_categories FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can update gallery categories"
  ON public.gallery_categories FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can delete gallery categories"
  ON public.gallery_categories FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- RLS POLICIES: gallery_photos (public read, admin write)
-- =====================================================
CREATE POLICY "Anyone can view gallery photos"
  ON public.gallery_photos FOR SELECT
  USING (true);

CREATE POLICY "Admin can insert gallery photos"
  ON public.gallery_photos FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can update gallery photos"
  ON public.gallery_photos FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can delete gallery photos"
  ON public.gallery_photos FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- RLS POLICIES: site_content (public read, admin write)
-- =====================================================
CREATE POLICY "Anyone can view site content"
  ON public.site_content FOR SELECT
  USING (true);

CREATE POLICY "Admin can insert site content"
  ON public.site_content FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can update site content"
  ON public.site_content FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can delete site content"
  ON public.site_content FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('banners', 'banners', true);

INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', true);

-- Storage policies for banners bucket
CREATE POLICY "Anyone can view banner images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'banners');

CREATE POLICY "Admin can upload banner images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'banners' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can update banner images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'banners' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can delete banner images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'banners' AND public.has_role(auth.uid(), 'admin'));

-- Storage policies for gallery bucket
CREATE POLICY "Anyone can view gallery images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gallery');

CREATE POLICY "Admin can upload gallery images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'gallery' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can update gallery images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'gallery' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin can delete gallery images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'gallery' AND public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- SEED: Default site content
-- =====================================================
INSERT INTO public.site_content (key, title, content) VALUES
('about', 'Tentang PAUD GenQuPa', 'PAUD GenQuPa (Generasi Qur''ani Pandeglang) hadir sebagai lembaga pendidikan anak usia dini yang menggabungkan pendidikan Al-Qur''an dengan pendekatan pembelajaran modern. Didirikan dengan kesadaran bahwa masa Golden Age (0-6 tahun) adalah periode kritis dalam pembentukan karakter dan kecerdasan anak. Kami mengadopsi konsep Hybrid Education yang memadukan nilai-nilai Qur''ani dengan teknologi pembelajaran terkini. Dikelola oleh Yayasan Pendidikan Generasi Qurani Pandeglang, kami berkomitmen mencetak generasi yang cinta Al-Qur''an, berakhlak mulia, dan siap menghadapi tantangan zaman.'),
('vision', 'Visi', 'Menjadi lembaga PAUD unggulan yang mencetak Generasi Qur''ani berakhlak mulia, cerdas, kreatif, dan berdaya saing global.'),
('mission', 'Misi', '1. Menanamkan kecintaan terhadap Al-Qur''an sejak usia dini melalui program Tahfidz Juz 30
2. Membentuk karakter anak dengan adab dan akhlak Islami
3. Menerapkan metode Play-Based Learning yang menyenangkan dan efektif
4. Mengembangkan kemampuan multilingual (Indonesia, Arab, Inggris)
5. Memanfaatkan teknologi sebagai media pembelajaran inovatif
6. Membangun kemitraan aktif dengan orang tua dalam proses pendidikan anak');

-- =====================================================
-- SEED: Default gallery categories
-- =====================================================
INSERT INTO public.gallery_categories (name) VALUES
('Tahfidz'),
('Outing'),
('Wisuda'),
('Kegiatan Harian'),
('Hari Besar Islam');
