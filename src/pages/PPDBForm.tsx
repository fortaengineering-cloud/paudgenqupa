import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Briefcase, Info, FileUp, CheckCircle, UploadCloud, ImageIcon, FileText } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function RegistrationForm() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const { profile } = useAuth();

  // --- STATE DATA FORM (STRUKTUR LENGKAP 500+ BARIS) ---
  const [formData, setFormData] = useState({
    // IDENTITAS ANAK
    kelasTujuan: '',
    namaLengkap: '',
    namaPanggilan: '',
    nikAnak: '',
    jenisKelamin: '',
    tempatLahirAnak: '',
    tanggalLahirAnak: '',
    // DATA TAMBAHAN ANAK
    statusAnak: '',
    anakKe: '',
    jumlahSaudara: '',
    tinggalBersama: '',
    jarakSekolah: '',
    asalSekolah: '',
    kelasAsal: '',
    riwayatTilawah: '',
    jumlahHafalan: '',

    // DATA AYAH
    namaAyah: '',
    nikAyah: '',
    tempatLahirAyah: '',
    tanggalLahirAyah: '',
    telpAyah: '',
    alamatAyah: '',
    desaAyah: '',
    kecamatanAyah: '',
    kabupatenAyah: '',
    provinsiAyah: '',
    pekerjaanAyah: '',
    alamatKerjaAyah: '',

    // DATA IBU
    namaIbu: '',
    nikIbu: '',
    tempatLahirIbu: '',
    tanggalLahirIbu: '',
    telpIbu: '',
    alamatIbu: '',
    desaIbu: '',
    kecamatanIbu: '',
    kabupatenIbu: '',
    provinsiIbu: '',
    pekerjaanIbu: '',
    alamatKerjaIbu: '',
    akunIg: ''
  });

  // State File & Preview Thumbnail (5 Slot Dokumen)
  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    foto: null,
    kk: null,
    akte: null,
    ktp_ayah: null,
    ktp_ibu: null
  });
  const [previews, setPreviews] = useState<{ [key: string]: string }>({});

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = !!localStorage.getItem('ppdbEditId');

  // LOAD DATA CACHE ATAU DATA EDIT
  useEffect(() => {
    const savedData = localStorage.getItem('ppdbFormData');
    const savedStep = localStorage.getItem('ppdbFormStep');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setFormData(parsed);

      // Load thumbnail dari URL lama jika ada
      const oldPreviews: any = {};
      if (parsed.foto) oldPreviews.foto = parsed.foto;
      if (parsed.kk) oldPreviews.kk = parsed.kk;
      if (parsed.akte) oldPreviews.akte = parsed.akte;
      if (parsed.ktp_ayah) oldPreviews.ktp_ayah = parsed.ktp_ayah;
      if (parsed.ktp_ibu) oldPreviews.ktp_ibu = parsed.ktp_ibu;
      setPreviews(oldPreviews);
    }
    if (savedStep) {
      setStep(parseInt(savedStep));
    }
  }, []);

  // UPDATE CACHE LOKAL SAAT MENGETIK
  useEffect(() => {
    localStorage.setItem('ppdbFormData', JSON.stringify(formData));
    localStorage.setItem('ppdbFormStep', step.toString());
  }, [formData, step]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = e.target.files?.[0] || null;
    setFiles(prev => ({ ...prev, [type]: file }));

    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => ({ ...prev, [type]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    } else {
      setPreviews(prev => ({ ...prev, [type]: '' }));
    }
  };

  const handleCopyAddress = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setFormData((prev) => ({
        ...prev,
        alamatIbu: prev.alamatAyah,
        desaIbu: prev.desaAyah,
        kecamatanIbu: prev.kecamatanAyah,
        kabupatenIbu: prev.kabupatenAyah,
        provinsiIbu: prev.provinsiAyah,
      }));
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    const nameRegex = /^[a-zA-Z\s'.]{3,}$/;
    const nikRegex = /^\d{16}$/;
    const phoneRegex = /^(08|62)\d{8,}$/;

    if (step === 1) {
      if (!formData.namaLengkap || !nameRegex.test(formData.namaLengkap)) {
        toast.error('Nama Lengkap Anak minimal 3 karakter (gunakan huruf, titik, atau kutipan).');
        return;
      }
      if (!formData.nikAnak || !nikRegex.test(formData.nikAnak)) {
        toast.error('NIK Anak wajib 16 digit angka.');
        return;
      }
      if (!formData.kelasTujuan) {
        toast.error('Pilih Kelas Tujuan terlebih dahulu.');
        return;
      }
    }
    
    if (step === 2) {
      if (!formData.namaAyah || !nameRegex.test(formData.namaAyah)) {
        toast.error('Nama Lengkap Ayah wajib diisi (minimal 3 karakter).');
        return;
      }
      if (formData.nikAyah && !nikRegex.test(formData.nikAyah)) {
        toast.error('NIK Ayah wajib 16 digit angka.');
        return;
      }
      const cleanPhone = (formData.telpAyah || "").replace(/\D/g, "");
      if (!cleanPhone || !phoneRegex.test(cleanPhone)) {
        toast.error('Nomor HP Ayah tidak valid (harus berawal 08/62, min 10 digit).');
        return;
      }
    }
    
    if (step === 3) {
      if (!formData.namaIbu || !nameRegex.test(formData.namaIbu)) {
        toast.error('Nama Lengkap Ibu wajib diisi (minimal 3 karakter).');
        return;
      }
      if (formData.nikIbu && !nikRegex.test(formData.nikIbu)) {
        toast.error('NIK Ibu wajib 16 digit angka.');
        return;
      }
      const cleanPhone = (formData.telpIbu || "").replace(/\D/g, "");
      if (!cleanPhone || !phoneRegex.test(cleanPhone)) {
        toast.error('Nomor HP Ibu tidak valid (harus berawal 08/62, min 10 digit).');
        return;
      }
    }
    
    setStep((prev) => prev + 1);
    window.scrollTo(0, 0);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    setStep((prev) => prev - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (!profile?.id) throw new Error("Sesi berakhir, silakan login kembali.");
      const editId = localStorage.getItem('ppdbEditId');

      let uploadedUrls: { [key: string]: string } = {};

      // 1. PROSES UPLOAD FILE KE STORAGE
      for (const [key, file] of Object.entries(files)) {
        if (file) {
          const fileExt = file.name.split('.').pop();
          // Gunakan folder per User ID agar rapi
          const fileName = `${profile.id}/${key}_${Date.now()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('dokumen-ppdb')
            .upload(fileName, file, { upsert: true });

          if (uploadError) throw new Error(`Gagal upload ${key}: ${uploadError.message}`);

          const { data: { publicUrl } } = supabase.storage
            .from('dokumen-ppdb')
            .getPublicUrl(fileName);

          uploadedUrls[key] = publicUrl;
        }
      }

      // 2. GABUNGKAN DATA TEKS + LINK FILE BARU
      const finalMetadata = { ...formData, ...uploadedUrls };

      const payload = {
        full_name: formData.namaLengkap,
        birth_place: formData.tempatLahirAnak,
        birth_date: formData.tanggalLahirAnak || null,
        gender: formData.jenisKelamin,
        child_order: parseInt(formData.anakKe) || 1,
        address: formData.alamatAyah,
        parent_id: profile.id,
        status: 'pending' as const,
        metadata: finalMetadata
      };

      // 3. SIMPAN KE DATABASE
      if (editId) {
        const { error: updateError } = await supabase.from('children').update(payload).eq('id', editId);
        if (updateError) throw updateError;
        toast.success('Data Berhasil Diperbarui!');
      } else {
        const { error: insertError } = await supabase.from('children').insert([payload]);
        if (insertError) throw insertError;
        toast.success('Pendaftaran Berhasil Terkirim!');
      }

      // 4. BERSIHKAN CACHE
      localStorage.removeItem('ppdbFormData');
      localStorage.removeItem('ppdbFormStep');
      localStorage.removeItem('ppdbEditId');
      navigate('/dashboard');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-colors";

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6 gap-2 flex-wrap">
        <button type="button" onClick={() => navigate('/dashboard')} className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Dashboard
        </button>
        <button type="button" onClick={() => navigate('/')} className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 transition-colors shadow-sm">
          🏠 Beranda
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-orange-50/50 p-6 md:p-10 text-center border-b border-gray-100">
          <h1 className="text-2xl font-bold text-red-900 mb-2">Formulir Pendaftaran Siswa Baru</h1>
          {isEditMode && <p className="text-emerald-700 font-bold flex items-center justify-center"><CheckCircle className="w-4 h-4 mr-1" /> Mode Edit Data</p>}

          <div className="flex items-center justify-center space-x-4 mt-8">
            {[1, 2, 3, 4].map((num) => (
              <React.Fragment key={num}>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full text-white font-bold transition-all duration-300 ${step >= num ? 'bg-emerald-600 scale-110' : 'bg-gray-300'}`}>{num}</div>
                {num !== 4 && <div className={`w-8 md:w-12 h-1 rounded ${step > num ? 'bg-emerald-600' : 'bg-gray-200'}`} />}
              </React.Fragment>
            ))}
          </div>
          <p className="mt-4 font-bold text-emerald-900 uppercase tracking-wide text-sm">
            {step === 1 ? 'Identitas Anak' : step === 2 ? 'Identitas Ayah' : step === 3 ? 'Identitas Ibu' : 'Upload Dokumen'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-10">
          {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md border border-red-100 flex items-start"><Info className="w-5 h-5 mr-3 shrink-0" /><p className="text-sm font-medium">{error}</p></div>}

          {/* ================= STEP 1: DATA ANAK ================= */}
          <div className={step === 1 ? 'space-y-8 animate-in' : 'hidden'}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kelas Tujuan *</label>
                <select name="kelasTujuan" value={formData.kelasTujuan} onChange={handleInputChange} className={inputClass}>
                  <option value="">Pilih kelas</option>
                  <option value="TK A">TK A</option>
                  <option value="TK B">TK B</option>
                </select>
              </div>
              <div className="hidden md:block"></div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap Anak *</label>
                <input type="text" name="namaLengkap" value={formData.namaLengkap} onChange={handleInputChange} className={inputClass} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Panggilan</label>
                <input type="text" name="namaPanggilan" value={formData.namaPanggilan} onChange={handleInputChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NIK Anak *</label>
                <input type="text" name="nikAnak" value={formData.nikAnak} onChange={handleInputChange} className={inputClass} maxLength={16} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Kelamin</label>
                <div className="flex space-x-6 mt-1">
                  <label className="flex items-center cursor-pointer">
                    <input type="radio" name="jenisKelamin" value="Laki-laki" onChange={handleInputChange} checked={formData.jenisKelamin === 'Laki-laki'} className="text-emerald-600 w-4 h-4" />
                    <span className="ml-2 text-sm">Laki-laki</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input type="radio" name="jenisKelamin" value="Perempuan" onChange={handleInputChange} checked={formData.jenisKelamin === 'Perempuan'} className="text-emerald-600 w-4 h-4" />
                    <span className="ml-2 text-sm">Perempuan</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tempat Lahir</label>
                <input type="text" name="tempatLahirAnak" value={formData.tempatLahirAnak} onChange={handleInputChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
                <input type="date" name="tanggalLahirAnak" value={formData.tanggalLahirAnak} onChange={handleInputChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status Anak</label>
                <select name="statusAnak" value={formData.statusAnak} onChange={handleInputChange} className={inputClass}>
                  <option value="">Pilih status</option>
                  <option value="Anak Kandung">Anak Kandung</option>
                  <option value="Anak Tiri">Anak Tiri</option>
                  <option value="Anak Angkat">Anak Angkat</option>
                  <option value="Lain-Lain">Lain-Lain</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Anak Ke</label>
                  <input type="number" name="anakKe" value={formData.anakKe} onChange={handleInputChange} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Saudara Kandung</label>
                  <input type="number" name="jumlahSaudara" value={formData.jumlahSaudara} onChange={handleInputChange} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tinggal Bersama</label>
                <select name="tinggalBersama" value={formData.tinggalBersama} onChange={handleInputChange} className={inputClass}>
                  <option value="">Pilih</option>
                  <option value="Orang Tua">Orang Tua</option>
                  <option value="Wali">Wali / Kakek Nenek</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jarak Tempat tinggal ke Rufizh GenQuPa</label>
                <input type="text" name="jarakSekolah" value={formData.jarakSekolah} onChange={handleInputChange} className={inputClass} placeholder="Contoh: 1 km" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asal Sekolah Sebelumnya</label>
                <input type="text" name="asalSekolah" value={formData.asalSekolah} onChange={handleInputChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kelas Terakhir</label>
                <input type="text" name="kelasAsal" value={formData.kelasAsal} onChange={handleInputChange} className={inputClass} />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Riwayat Tilawah / Mengaji</label>
                <textarea name="riwayatTilawah" value={formData.riwayatTilawah} onChange={handleInputChange} className="w-full rounded-md border border-gray-300 p-3 text-sm min-h-[80px]" placeholder="Misal: Sudah jilid 2..."></textarea>
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Hafalan yang dimiliki saat ini</label>
                <input type="text" name="jumlahHafalan" value={formData.jumlahHafalan} onChange={handleInputChange} className={inputClass} />
              </div>
            </div>
          </div>

          {/* ================= STEP 2: DATA AYAH ================= */}
          <div className={step === 2 ? 'space-y-8 animate-in' : 'hidden'}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Ayah *</label>
                <input type="text" name="namaAyah" value={formData.namaAyah} onChange={handleInputChange} className={inputClass} required={step === 2} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NIK Ayah</label>
                <input type="text" name="nikAyah" value={formData.nikAyah} onChange={handleInputChange} className={inputClass} maxLength={16} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tempat Lahir Ayah</label>
                <input type="text" name="tempatLahirAyah" value={formData.tempatLahirAyah} onChange={handleInputChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir Ayah</label>
                <input type="date" name="tanggalLahirAyah" value={formData.tanggalLahirAyah} onChange={handleInputChange} className={inputClass} />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telp / WA *</label>
                <input type="tel" name="telpAyah" value={formData.telpAyah} onChange={handleInputChange} className={inputClass} required={step === 2} />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Rumah Lengkap</label>
                <textarea name="alamatAyah" value={formData.alamatAyah} onChange={handleInputChange} className="w-full rounded-md border border-gray-300 p-3 text-sm" rows={2}></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Desa / Kelurahan</label>
                <input type="text" name="desaAyah" value={formData.desaAyah} onChange={handleInputChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kecamatan</label>
                <input type="text" name="kecamatanAyah" value={formData.kecamatanAyah} onChange={handleInputChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kabupaten</label>
                <input type="text" name="kabupatenAyah" value={formData.kabupatenAyah} onChange={handleInputChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provinsi</label>
                <input type="text" name="provinsiAyah" value={formData.provinsiAyah} onChange={handleInputChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pekerjaan</label>
                <input type="text" name="pekerjaanAyah" value={formData.pekerjaanAyah} onChange={handleInputChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Tempat Kerja</label>
                <input type="text" name="alamatKerjaAyah" value={formData.alamatKerjaAyah} onChange={handleInputChange} className={inputClass} />
              </div>
            </div>
          </div>

          {/* ================= STEP 3: DATA IBU ================= */}
          <div className={step === 3 ? 'space-y-8 animate-in' : 'hidden'}>
            <div className="flex items-center justify-between mb-6 border-b pb-2">
              <h2 className="text-lg font-bold text-gray-800">Identitas Ibu Kandung</h2>
              <label className="flex items-center bg-gray-100 px-3 py-1.5 rounded-md cursor-pointer border border-gray-200 hover:bg-gray-200 transition-colors">
                <input type="checkbox" onChange={handleCopyAddress} className="w-4 h-4 text-emerald-600 rounded" />
                <span className="ml-2 text-xs font-bold text-gray-600 uppercase tracking-tighter">Samakan Alamat Ayah</span>
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap Ibu *</label>
                <input type="text" name="namaIbu" value={formData.namaIbu} onChange={handleInputChange} className={inputClass} required={step === 3} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NIK Ibu</label>
                <input type="text" name="nikIbu" value={formData.nikIbu} onChange={handleInputChange} className={inputClass} maxLength={16} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tempat Lahir Ibu</label>
                <input type="text" name="tempatLahirIbu" value={formData.tempatLahirIbu} onChange={handleInputChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir Ibu</label>
                <input type="date" name="tanggalLahirIbu" value={formData.tanggalLahirIbu} onChange={handleInputChange} className={inputClass} />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telp / WA Ibu *</label>
                <input type="tel" name="telpIbu" value={formData.telpIbu} onChange={handleInputChange} className={inputClass} required={step === 3} />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap Ibu</label>
                <textarea name="alamatIbu" value={formData.alamatIbu} onChange={handleInputChange} className="w-full rounded-md border border-gray-300 p-3 text-sm" rows={2}></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Desa / Kelurahan</label>
                <input type="text" name="desaIbu" value={formData.desaIbu} onChange={handleInputChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kecamatan</label>
                <input type="text" name="kecamatanIbu" value={formData.kecamatanIbu} onChange={handleInputChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kabupaten</label>
                <input type="text" name="kabupatenIbu" value={formData.kabupatenIbu} onChange={handleInputChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provinsi</label>
                <input type="text" name="provinsiIbu" value={formData.provinsiIbu} onChange={handleInputChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pekerjaan Ibu</label>
                <input type="text" name="pekerjaanIbu" value={formData.pekerjaanIbu} onChange={handleInputChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Tempat Kerja</label>
                <input type="text" name="alamatKerjaIbu" value={formData.alamatKerjaIbu} onChange={handleInputChange} className={inputClass} />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Akun Instagram Orang Tua</label>
                <input type="text" name="akunIg" value={formData.akunIg} onChange={handleInputChange} className={inputClass} placeholder="@akun" />
              </div>
            </div>
          </div>

          {/* ================= STEP 4: UPLOAD DOKUMEN ================= */}
          <div className={step === 4 ? 'space-y-8 animate-in' : 'hidden'}>
            <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-100 flex items-start">
              <UploadCloud className="w-6 h-6 text-emerald-600 mr-3 shrink-0" />
              <div>
                <h3 className="font-bold text-emerald-900 text-sm">Lampiran Dokumen (Opsional)</h3>
                <p className="text-xs text-emerald-700 mt-1">Format JPG/PNG/PDF (Maks 2MB). Biarkan kosong jika tidak ingin mengubah file lama.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { id: 'foto', label: 'Pas Foto 3x4 Calon Siswa' },
                { id: 'kk', label: 'Scan Kartu Keluarga' },
                { id: 'akte', label: 'Scan Akte Kelahiran' },
                { id: 'ktp_ayah', label: 'Scan KTP Ayah' },
                { id: 'ktp_ibu', label: 'Scan KTP Ibu' }
              ].map((doc) => (
                <div key={doc.id} className="p-4 border-2 border-dashed border-gray-200 rounded-xl bg-white hover:border-emerald-400 transition-all flex flex-col items-center">
                  {previews[doc.id] ? (
                    <img src={previews[doc.id]} className="w-24 h-24 object-cover rounded-md mb-2 shadow-sm border" alt="Thumbnail" />
                  ) : (
                    <div className="w-24 h-24 bg-gray-50 flex items-center justify-center rounded-md mb-2 border">
                      <ImageIcon className="text-gray-300" />
                    </div>
                  )}
                  <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-wide text-center">{doc.label}</label>
                  <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileChange(e, doc.id)} className="text-[10px] file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer w-full" />
                  {files[doc.id] && <p className="text-[10px] text-emerald-600 mt-2 font-bold truncate w-full text-center">✓ {files[doc.id]?.name}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* ================= NAVIGATION BUTTONS ================= */}
          <div className="mt-12 flex items-center justify-between pt-8 border-t border-gray-100">
            <button type="button" onClick={handlePrev} disabled={isSubmitting || step === 1} className="px-8 py-2.5 rounded-md border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 disabled:opacity-30 transition-all">Sebelumnya</button>
            <div className="flex space-x-4 items-center">
              <button type="button" onClick={() => { localStorage.removeItem('ppdbEditId'); navigate('/dashboard'); }} className="text-gray-400 font-bold hover:text-gray-600 text-sm">Batal</button>
              {step < 4 ? (
                <button type="button" onClick={handleNext} className="px-10 py-2.5 rounded-md bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-md active:scale-95 transition-all">Selanjutnya</button>
              ) : (
                <button type="submit" disabled={isSubmitting} className="px-10 py-2.5 rounded-md bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-md flex items-center active:scale-95 transition-all">
                  {isSubmitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div> Menyimpan...</> : (isEditMode ? 'Simpan Perubahan' : 'Kirim Pendaftaran')}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}