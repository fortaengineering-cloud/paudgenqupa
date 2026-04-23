import React from 'react';
import { Mail, Phone, MapPin, User, BookOpen, Users, Instagram } from 'lucide-react';

interface StudentProfilePrintProps {
  data: any;
}

const StudentProfilePrint = React.forwardRef<HTMLDivElement, StudentProfilePrintProps>(({ data }, ref) => {
  const m = data.metadata || {};
  const formattedDate = data.birth_date ? new Date(data.birth_date).toLocaleDateString("id-ID", { 
    day: 'numeric', month: 'long', year: 'numeric' 
  }) : "-";

  return (
    <div ref={ref} className="p-8 bg-white text-gray-800 font-serif max-w-[210mm] mx-auto print:p-0">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-start border-b-4 border-emerald-800 pb-6 mb-8">
        <div className="flex gap-4 items-center">
          <img src="/logo.png" alt="Logo" className="w-20 h-20 object-contain" />
          <div>
            <h1 className="text-2xl font-bold text-emerald-900 tracking-tight">PAUD TUNAS GENQUPA</h1>
            <p className="text-sm text-emerald-700 italic font-sans">Mencetak Generasi Qurani yang Cerdas dan Berakhlak Mulia</p>
            <p className="text-xs text-gray-500 mt-1 font-sans">Perumahan Mutiara NIMS Blok B6, Pandeglang, Banten</p>
          </div>
        </div>
        <div className="text-right">
          <div className="bg-emerald-800 text-white px-4 py-1 text-sm font-bold rounded">PPDB 2024/2025</div>
          <p className="text-[10px] text-gray-400 mt-2 font-mono uppercase">REG-ID: {data.id.substring(0,8)}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* LEFT COLUMN - PHOTO & STATS */}
        <div className="col-span-1 space-y-6">
          <div className="w-full aspect-[4/6] border-2 border-emerald-100 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
            {m.foto ? (
              <img src={m.foto} alt="Pas Foto" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-4">
                <User size={48} className="mx-auto text-emerald-200" />
                <p className="text-[10px] text-gray-400 mt-2 uppercase font-bold">Pas Foto 4x6</p>
              </div>
            )}
          </div>

          <section>
            <h3 className="text-xs font-bold text-emerald-800 uppercase border-b border-emerald-100 pb-1 mb-2 flex items-center gap-2">
              <BookOpen size={14} /> Keagamaan
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold">Riwayat Tilawah</p>
                <p className="text-xs leading-relaxed">{m.riwayatTilawah || "-"}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold">Hafalan</p>
                <p className="text-xs leading-relaxed">{m.jumlahHafalan || "-"}</p>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN - FULL DATA */}
        <div className="col-span-2 space-y-8">
          {/* Identitas Anak */}
          <section>
            <h2 className="text-lg font-bold text-emerald-900 border-l-4 border-emerald-600 pl-3 mb-4">IDENTITAS ANAK</h2>
            <div className="grid grid-cols-2 gap-y-3 text-sm">
              <div className="col-span-2"><span className="text-gray-400 w-32 inline-block">Nama Lengkap</span>: <span className="font-bold">{data.full_name}</span></div>
              <div><span className="text-gray-400 w-32 inline-block">Panggilan</span>: {m.namaPanggilan || "-"}</div>
              <div><span className="text-gray-400 w-32 inline-block">Jenis Kelamin</span>: {data.gender}</div>
              <div><span className="text-gray-400 w-32 inline-block">Tempat Lahir</span>: {data.birth_place}</div>
              <div><span className="text-gray-400 w-32 inline-block">Tgl Lahir</span>: {formattedDate}</div>
              <div><span className="text-gray-400 w-32 inline-block">NIK</span>: {m.nikAnak || "-"}</div>
              <div><span className="text-gray-400 w-32 inline-block">Kelas Tujuan</span>: <span className="font-bold text-emerald-700">{m.kelasTujuan}</span></div>
              <div><span className="text-gray-400 w-32 inline-block">Status Anak</span>: {m.statusAnak || "-"}</div>
              <div><span className="text-gray-400 w-32 inline-block">Anak Ke-</span>: {m.anakKe} dari {m.jumlahSaudara} sdr</div>
            </div>
          </section>

          {/* Data Keluarga */}
          <section>
            <h2 className="text-lg font-bold text-emerald-900 border-l-4 border-emerald-600 pl-3 mb-4 flex items-center gap-2">
              <Users size={18} /> DATA ORANG TUA / WALI
            </h2>
            <div className="grid grid-cols-2 gap-6">
              {/* Ayah */}
              <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
                <p className="text-[10px] text-emerald-700 font-bold uppercase mb-2">Ayah Kandung</p>
                <div className="space-y-1 text-xs">
                  <p className="font-bold">{m.namaAyah || "-"}</p>
                  <p className="text-gray-500 italic">{m.pekerjaanAyah || "-"}</p>
                  <p className="flex items-center gap-1.5 mt-2"><Phone size={10} /> {m.telpAyah || "-"}</p>
                </div>
              </div>
              {/* Ibu */}
              <div className="bg-pink-50/30 p-3 rounded-lg border border-pink-100">
                <p className="text-[10px] text-pink-700 font-bold uppercase mb-2">Ibu Kandung</p>
                <div className="space-y-1 text-xs">
                  <p className="font-bold">{m.namaIbu || "-"}</p>
                  <p className="text-gray-500 italic">{m.pekerjaanIbu || "-"}</p>
                  <p className="flex items-center gap-1.5 mt-2"><Phone size={10} /> {m.telpIbu || "-"}</p>
                  {m.akunIg && <p className="flex items-center gap-1.5 text-pink-600"><Instagram size={10} /> {m.akunIg}</p>}
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-2 items-start text-xs text-gray-600">
              <MapPin size={14} className="shrink-0 text-emerald-600 mt-0.5" />
              <p><b>Alamat Rumah:</b> {data.address || "-"}</p>
            </div>
          </section>
        </div>
      </div>

      {/* FOOTER SIGNATURE */}
      <div className="mt-16 pt-8 border-t border-gray-100 flex justify-between items-end">
        <div className="text-[10px] text-gray-400 italic">
          Dokumen ini dicetak secara otomatis dari Sistem PPDB Tunas GenQuPa pada {new Date().toLocaleDateString("id-ID")}
        </div>
        <div className="text-center font-sans">
          <p className="text-sm mb-16">Pandeglang, ........................... 2024</p>
          <div className="w-48 border-b border-gray-800 mx-auto"></div>
          <p className="text-xs font-bold mt-1 uppercase text-gray-600">Orang Tua / Wali Murid</p>
        </div>
      </div>
    </div>
  );
});

StudentProfilePrint.displayName = "StudentProfilePrint";
export default StudentProfilePrint;