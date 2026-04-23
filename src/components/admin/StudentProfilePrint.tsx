import React from 'react';
import { Phone, MapPin, User, BookOpen, Users, Instagram } from 'lucide-react';

interface StudentProfilePrintProps {
  data: any;
}

const StudentProfilePrint = React.forwardRef<HTMLDivElement, StudentProfilePrintProps>(({ data }, ref) => {
  const m = data.metadata || {};
  const formattedDate = data.birth_date ? new Date(data.birth_date).toLocaleDateString("id-ID", { 
    day: 'numeric', month: 'long', year: 'numeric' 
  }) : "-";

  return (
    <div ref={ref} className="p-8 bg-white text-gray-800 font-serif max-w-[210mm] mx-auto print:p-0 flex flex-col justify-between min-h-screen">
      
      <div>
        {/* HEADER SECTION */}
        <div className="flex justify-between items-center mb-4 font-sans">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="w-[72px] h-[72px] object-contain" />
            <div className="flex flex-col justify-center leading-[1]">
              <h1 className="text-[20px] font-bold text-[#8DC63F] -mb-1">PAUD</h1>
              <h1 className="text-[26px] font-black text-[#0f5132] tracking-tight -mb-1">Tunas</h1>
              <h1 className="text-[26px] font-black text-[#0f5132] tracking-tight">GenQuPa</h1>
            </div>
          </div>
          <div className="text-right mt-1">
            <div className="bg-[#0f5132] text-white px-5 py-1.5 font-bold rounded text-sm inline-block tracking-wider">
              PPDB 2024/2025
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5 uppercase tracking-widest font-mono">
              REG-ID: {data.id.substring(0,8).toUpperCase()}
            </p>
          </div>
        </div>
        
        {/* SOLID GREEN LINE */}
        <div className="border-b-[3px] border-[#0f5132] mb-6"></div>

        {/* TOP SECTION: PHOTO & IDENTITY */}
        <div className="flex gap-8 mb-5">
          
          {/* LEFT: PHOTO */}
          <div className="w-[30%]">
            <div className="aspect-[3/4] w-full border rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center p-1.5 shadow-sm border-gray-200">
              {m.foto ? (
                <img src={m.foto} alt="Pas Foto" className="w-full h-full object-cover rounded-lg" />
              ) : (
                <div className="text-center p-4">
                  <User size={56} className="mx-auto text-gray-300" />
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: IDENTITY DETAILS */}
          <div className="w-[70%] text-[15px] leading-snug">
            
            {/* TITLE: PROFIL ANAK */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-1 h-5 bg-[#0f5132] rounded-sm"></div>
              <User className="text-gray-500" size={18} />
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Profil Anak</h2>
            </div>

            {/* Dirapatkan dengan gap-y-1.5 */}
            <div className="grid grid-cols-[140px_auto] gap-y-1.5">
              <div className="text-gray-400 font-sans text-sm">Nama Lengkap</div>
              <div className="font-bold text-[17px] leading-none">: {data.full_name}</div>

              <div className="text-gray-400 font-sans text-sm">Panggilan</div>
              <div className="text-gray-800">: {m.namaPanggilan || "-"}</div>

              <div className="text-gray-400 font-sans text-sm">Jenis Kelamin</div>
              <div className="text-gray-800">: {data.gender === 'male' ? 'Laki-laki' : data.gender === 'female' ? 'Perempuan' : data.gender}</div>

              <div className="text-gray-400 font-sans text-sm">Tempat Lahir</div>
              <div className="text-gray-800">: {data.birth_place || "-"}</div>

              <div className="text-gray-400 font-sans text-sm">Tgl Lahir</div>
              <div className="text-gray-800">: {formattedDate}</div>

              <div className="text-gray-400 font-sans text-sm">NIK</div>
              <div className="text-gray-800">: {m.nikAnak || "-"}</div>

              <div className="text-gray-400 font-sans text-sm flex items-center">Kelas Tujuan</div>
              <div className="font-bold text-[#0f5132] flex items-center">: <span className="ml-1">{m.kelasTujuan || "-"}</span></div>

              <div className="text-gray-400 font-sans text-sm">Status Anak</div>
              <div className="text-gray-800">: {m.statusAnak || "-"}</div>

              <div className="text-gray-400 font-sans text-sm">Anak Ke-</div>
              <div className="text-gray-800">: {m.anakKe || "-"} dari {m.jumlahSaudara || "-"} sdr Kandung</div>
            </div>
          </div>
        </div>

        {/* MIDDLE SECTION: RELIGION BACKGROUND */}
        <div className="mb-5 font-serif">
          {/* Dirapatkan dengan py-3 */}
          <div className="border-t border-b border-gray-200 py-3 flex flex-col">
            <BookOpen className="text-[#0f5132] mb-2 ml-1" size={18} />
            <div className="grid grid-cols-2 gap-8 text-[15px]">
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest font-sans mb-1">Riwayat Tilawah</p>
                <p className="text-gray-800 font-medium">{m.riwayatTilawah || "-"}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest font-sans mb-1">Hafalan</p>
                <p className="text-gray-800 font-medium">{m.jumlahHafalan || "-"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: PARENTS DATA */}
        <div>
          {/* TITLE: PROFIL ORANG TUA */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-1 h-5 bg-[#0f5132] rounded-sm"></div>
            <Users className="text-gray-500" size={18} />
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Profil Orang Tua</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 font-serif">
            {/* Ayah Card - Dirapatkan padding-nya (p-3) */}
            <div className="bg-[#f0fdf4] p-3 rounded-xl border border-[#dcfce7] flex flex-col justify-between">
              <div>
                <p className="text-[10px] text-[#0f5132] font-extrabold uppercase tracking-widest font-sans mb-1.5">Ayah Kandung</p>
                <p className="font-bold text-[17px] text-gray-900 leading-tight">{m.namaAyah || "-"}</p>
                <p className="text-gray-500 italic text-[13px] mt-0.5">{m.pekerjaanAyah || "-"}</p>
              </div>
              <div className="mt-3 flex items-center gap-2 text-gray-700 text-[13px]">
                <Phone size={14} className="text-[#0f5132]" /> {m.telpAyah || "-"}
              </div>
            </div>
            
            {/* Ibu Card - Dirapatkan padding-nya (p-3) */}
            <div className="bg-[#fdf2f8] p-3 rounded-xl border border-[#fce7f3] flex flex-col justify-between">
              <div>
                <p className="text-[10px] text-[#be185d] font-extrabold uppercase tracking-widest font-sans mb-1.5">Ibu Kandung</p>
                <p className="font-bold text-[17px] text-gray-900 leading-tight">{m.namaIbu || "-"}</p>
                <p className="text-gray-500 italic text-[13px] mt-0.5">{m.pekerjaanIbu || "-"}</p>
              </div>
              <div className="mt-3 flex justify-between items-center text-gray-700 text-[13px]">
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-[#be185d]" /> {m.telpIbu || "-"}
                </div>
                {m.akunIg && (
                  <div className="flex items-center gap-1 text-[#be185d] font-sans text-[11px]">
                    <Instagram size={14}/> {m.akunIg}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="mt-3 flex gap-2 items-start text-[13px] bg-gray-50 p-2.5 rounded-lg border border-gray-100">
            <MapPin className="text-[#0f5132] shrink-0 mt-0.5" size={16} />
            <p className="text-gray-800 leading-snug"><span className="font-bold text-gray-900 font-sans text-[11px] uppercase tracking-widest mr-2">Alamat Rumah:</span> {data.address || "-"}</p>
          </div>
        </div>
      </div>

      {/* FOOTER SIGNATURE (Will stick to bottom) */}
      <div className="mt-6 pt-3 flex justify-between items-end font-sans">
        <div className="text-[9px] text-gray-400 italic">
          Dokumen ini dicetak secara otomatis dari Sistem PPDB Tunas GenQuPa pada {new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric'})}
        </div>
        <div className="w-56 border-b border-gray-400"></div>
      </div>
      
    </div>
  );
});

StudentProfilePrint.displayName = "StudentProfilePrint";
export default StudentProfilePrint;