import React, { useState } from 'react';
import { ArrowLeft, User, Briefcase, Info } from 'lucide-react';

export default function RegistrationForm() {
  const [step, setStep] = useState(1);

  // State untuk menyimpan seluruh data form
  const [formData, setFormData] = useState({
    // --- DATA ANAK ---
    kelasTujuan: '', namaLengkap: '', namaPanggilan: '', nikAnak: '', jenisKelamin: '',
    tempatLahirAnak: '', tanggalLahirAnak: '', statusAnak: '', anakKe: '', jumlahSaudara: '',
    tinggalBersama: '', jarakSekolah: '', asalSekolah: '', riwayatTilawah: '', jumlahHafalan: '',

    // --- DATA AYAH ---
    namaAyah: '', nikAyah: '', tempatLahirAyah: '', tanggalLahirAyah: '', telpAyah: '',
    alamatAyah: '', desaAyah: '', kecamatanAyah: '', kabupatenAyah: '', provinsiAyah: '',
    pekerjaanAyah: '', alamatKerjaAyah: '',

    // --- DATA IBU ---
    namaIbu: '', nikIbu: '', tempatLahirIbu: '', tanggalLahirIbu: '', telpIbu: '',
    alamatIbu: '', desaIbu: '', kecamatanIbu: '', kabupatenIbu: '', provinsiIbu: '',
    pekerjaanIbu: '', alamatKerjaIbu: '', akunIg: ''
  });

  const [error, setError] = useState('');

  // Handle perubahan input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(''); // Clear error saat user mengetik
  };

  // Checkbox Copy Alamat Ayah ke Ibu
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

  // Validasi sebelum lanjut step
  const handleNext = () => {
    if (step === 1) {
      if (!formData.namaLengkap || !formData.nikAnak) {
        setError('Nama Lengkap dan NIK Anak wajib diisi.');
        return;
      }
    } else if (step === 2) {
      if (!formData.namaAyah || !formData.telpAyah) {
        setError('Nama Lengkap Ayah dan No. Telp/WA wajib diisi.');
        return;
      }
    }
    setStep((prev) => prev + 1);
    window.scrollTo(0, 0);
  };

  const handlePrev = () => {
    setStep((prev) => prev - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaIbu || !formData.telpIbu) {
      setError('Nama Lengkap Ibu dan No. Telp/WA wajib diisi.');
      return;
    }

    // TODO: Integrasikan dengan Supabase di sini
    console.log('Data yang siap dikirim ke Supabase:', formData);
    alert('Pendaftaran Berhasil Disimpan!');
  };

  // Helper untuk styling input seragam
  const inputClass = "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-colors";

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <button className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Kembali
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Title & Step Indicator */}
        <div className="bg-orange-50/50 p-6 md:p-10 text-center border-b border-gray-100">
          <h1 className="text-2xl font-bold text-red-900 mb-6">Formulir Pendaftaran Peserta Didik Baru</h1>

          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((num) => (
              <React.Fragment key={num}>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full text-white font-bold transition-colors duration-300 ${step >= num ? 'bg-emerald-600' : 'bg-gray-300'}`}>
                  {num}
                </div>
                {num !== 3 && <div className={`w-12 h-1 rounded ${step > num ? 'bg-emerald-600' : 'bg-gray-200'}`} />}
              </React.Fragment>
            ))}
          </div>
          <p className="mt-4 font-medium text-gray-600">
            {step === 1 ? 'Data Anak' : step === 2 ? 'Data Ayah' : 'Data Ibu'}
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 md:p-10">

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md flex items-center border border-red-100">
              <Info className="w-5 h-5 mr-2" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* ================= STEP 1: DATA ANAK ================= */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

              {/* Section Identitas Anak */}
              <div>
                <div className="flex items-center mb-4">
                  <div className="bg-emerald-100 p-2 rounded-lg mr-3">
                    <User className="w-5 h-5 text-emerald-700" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-800">Identitas Anak</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kelas Tujuan *</label>
                    <select name="kelasTujuan" value={formData.kelasTujuan} onChange={handleInputChange} className={inputClass}>
                      <option value="">Pilih kelas tujuan</option>
                      {/* Bagian Playgroup sudah dihapus, tinggal TK A dan TK B */}
                      <option value="TK A">TK A</option>
                      <option value="TK B">TK B</option>
                    </select>
                  </div>
                  <div className="hidden md:block"></div> {/* Spacer */}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
                    <input type="text" name="namaLengkap" value={formData.namaLengkap} onChange={handleInputChange} className={inputClass} placeholder="Masukkan nama lengkap anak" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Panggilan</label>
                    <input type="text" name="namaPanggilan" value={formData.namaPanggilan} onChange={handleInputChange} className={inputClass} placeholder="Masukkan nama panggilan" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">NIK Anak *</label>
                    <input type="text" name="nikAnak" value={formData.nikAnak} onChange={handleInputChange} className={inputClass} placeholder="16 digit NIK" required maxLength={16} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
                    <div className="flex space-x-4 mt-2">
                      <label className="flex items-center">
                        <input type="radio" name="jenisKelamin" value="Laki-laki" onChange={handleInputChange} className="text-emerald-600 focus:ring-emerald-600 w-4 h-4" />
                        <span className="ml-2 text-sm text-gray-700">Laki-laki</span>
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="jenisKelamin" value="Perempuan" onChange={handleInputChange} className="text-emerald-600 focus:ring-emerald-600 w-4 h-4" />
                        <span className="ml-2 text-sm text-gray-700">Perempuan</span>
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
                </div>
              </div>

              {/* Section Keluarga & Pendidikan */}
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Data Tambahan Anak</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status Anak</label>
                    <select name="statusAnak" value={formData.statusAnak} onChange={handleInputChange} className={inputClass}>
                      <option value="">Pilih status</option>
                      <option value="Anak Kandung">Anak Kandung</option>
                      <option value="Anak Tiri">Anak Tiri</option>
                      <option value="Anak Angkat">Anak Angkat</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Anak Ke-</label>
                      <input type="number" name="anakKe" value={formData.anakKe} onChange={handleInputChange} className={inputClass} min="1" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Jml Saudara</label>
                      <input type="number" name="jumlahSaudara" value={formData.jumlahSaudara} onChange={handleInputChange} className={inputClass} min="0" />
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Asal Sekolah (Jika Ada)</label>
                    <input type="text" name="asalSekolah" value={formData.asalSekolah} onChange={handleInputChange} className={inputClass} placeholder="Nama PAUD/TK sebelumnya" />
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Riwayat Belajar Tilawah / Jumlah Hafalan</label>
                    <textarea name="riwayatTilawah" value={formData.riwayatTilawah} onChange={handleInputChange} className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 min-h-[80px]" placeholder="Ceritakan riwayat mengaji anak dan jumlah hafalan surat pendek saat ini..."></textarea>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 2: DATA AYAH ================= */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div>
                <div className="flex items-center mb-4">
                  <div className="bg-emerald-100 p-2 rounded-lg mr-3">
                    <User className="w-5 h-5 text-emerald-700" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-800">Identitas Ayah</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap Ayah *</label>
                    <input type="text" name="namaAyah" value={formData.namaAyah} onChange={handleInputChange} className={inputClass} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">NIK Ayah</label>
                    <input type="text" name="nikAyah" value={formData.nikAyah} onChange={handleInputChange} className={inputClass} maxLength={16} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tempat Lahir</label>
                    <input type="text" name="tempatLahirAyah" value={formData.tempatLahirAyah} onChange={handleInputChange} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
                    <input type="date" name="tanggalLahirAyah" value={formData.tanggalLahirAyah} onChange={handleInputChange} className={inputClass} />
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">No. Telp / WA Aktif *</label>
                    <input type="tel" name="telpAyah" value={formData.telpAyah} onChange={handleInputChange} className={inputClass} placeholder="Contoh: 08123456789" required />
                  </div>
                </div>
              </div>

              {/* Alamat & Pekerjaan Ayah */}
              <div>
                <div className="flex items-center mb-4">
                  <div className="bg-emerald-100 p-2 rounded-lg mr-3">
                    <Briefcase className="w-5 h-5 text-emerald-700" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-800">Alamat & Pekerjaan Ayah</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Rumah Lengkap</label>
                    <textarea name="alamatAyah" value={formData.alamatAyah} onChange={handleInputChange} className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600" rows={2}></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Desa / Kelurahan</label>
                    <input type="text" name="desaAyah" value={formData.desaAyah} onChange={handleInputChange} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kecamatan</label>
                    <input type="text" name="kecamatanAyah" value={formData.kecamatanAyah} onChange={handleInputChange} className={inputClass} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pekerjaan Utama</label>
                    <input type="text" name="pekerjaanAyah" value={formData.pekerjaanAyah} onChange={handleInputChange} className={inputClass} placeholder="PNS / Swasta / Wiraswasta" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Pekerjaan</label>
                    <input type="text" name="alamatKerjaAyah" value={formData.alamatKerjaAyah} onChange={handleInputChange} className={inputClass} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 3: DATA IBU ================= */}
          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div>
                <div className="flex items-center mb-4">
                  <div className="bg-emerald-100 p-2 rounded-lg mr-3">
                    <User className="w-5 h-5 text-emerald-700" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-800">Identitas Ibu</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap Ibu *</label>
                    <input type="text" name="namaIbu" value={formData.namaIbu} onChange={handleInputChange} className={inputClass} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">NIK Ibu</label>
                    <input type="text" name="nikIbu" value={formData.nikIbu} onChange={handleInputChange} className={inputClass} maxLength={16} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tempat Lahir</label>
                    <input type="text" name="tempatLahirIbu" value={formData.tempatLahirIbu} onChange={handleInputChange} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
                    <input type="date" name="tanggalLahirIbu" value={formData.tanggalLahirIbu} onChange={handleInputChange} className={inputClass} />
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">No. Telp / WA Aktif *</label>
                    <input type="tel" name="telpIbu" value={formData.telpIbu} onChange={handleInputChange} className={inputClass} placeholder="Contoh: 08123456789" required />
                  </div>
                </div>
              </div>

              {/* Alamat & Pekerjaan Ibu */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="bg-emerald-100 p-2 rounded-lg mr-3">
                      <Briefcase className="w-5 h-5 text-emerald-700" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-800">Alamat & Pekerjaan Ibu</h2>
                  </div>

                  {/* Checkbox Auto-fill Alamat */}
                  <label className="flex items-center bg-gray-100 px-3 py-1.5 rounded-md cursor-pointer hover:bg-gray-200 transition-colors border border-gray-200">
                    <input type="checkbox" onChange={handleCopyAddress} className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-600" />
                    <span className="ml-2 text-sm text-gray-600 font-medium">Sama dengan alamat Ayah</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Rumah Lengkap</label>
                    <textarea name="alamatIbu" value={formData.alamatIbu} onChange={handleInputChange} className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600" rows={2}></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Desa / Kelurahan</label>
                    <input type="text" name="desaIbu" value={formData.desaIbu} onChange={handleInputChange} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kecamatan</label>
                    <input type="text" name="kecamatanIbu" value={formData.kecamatanIbu} onChange={handleInputChange} className={inputClass} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pekerjaan Utama</label>
                    <input type="text" name="pekerjaanIbu" value={formData.pekerjaanIbu} onChange={handleInputChange} className={inputClass} placeholder="Ibu Rumah Tangga / PNS / dll" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Akun IG Orang Tua</label>
                    <input type="text" name="akunIg" value={formData.akunIg} onChange={handleInputChange} className={inputClass} placeholder="@username" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= NAVIGATION BUTTONS ================= */}
          <div className="mt-10 flex items-center justify-between pt-6 border-t border-gray-100">
            <div>
              {step > 1 && (
                <button type="button" onClick={handlePrev} className="px-6 py-2.5 rounded-md border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                  Sebelumnya
                </button>
              )}
            </div>

            <div className="flex space-x-4">
              <button type="button" className="px-6 py-2.5 rounded-md text-gray-500 font-medium hover:text-gray-700 transition-colors">
                Batal
              </button>

              {step < 3 ? (
                <button type="button" onClick={handleNext} className="px-6 py-2.5 rounded-md bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors shadow-sm">
                  Selanjutnya
                </button>
              ) : (
                <button type="submit" className="px-6 py-2.5 rounded-md bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors shadow-sm">
                  Kirim Pendaftaran
                </button>
              )}
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}