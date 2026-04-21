import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function RegisterPage() {
    const [name, setName] = useState(''); // <-- State baru untuk menyimpan Nama Lengkap
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // LOGIKA EMAIL DUMMY GENQUPA (Login tetap menggunakan No HP)
        const dummyEmail = `${phone}@paud.genqupa.co.id`;

        const { data, error } = await supabase.auth.signUp({
            email: dummyEmail,
            password: password,
            options: {
                data: {
                    phone: phone,
                    name: name // <-- Mengirim nama ke database agar tersimpan di profil
                }
            }
        });

        setLoading(false);

        if (error) {
            alert("Gagal mendaftar: " + error.message);
        } else {
            alert("Akun berhasil dibuat! Silakan Login.");
            navigate('/login'); // Arahkan ke halaman login
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <form onSubmit={handleRegister} className="w-full max-w-sm bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-center text-emerald-700 mb-6">Daftar Akun Ortu</h2>

                <div className="space-y-4">
                    {/* --- KOTAK ISIAN NAMA LENGKAP (BARU) --- */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap Ayah/Ibu</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="Contoh: Budi Santoso"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nomor HP / WA</label>
                        <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="08123456789"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="Minimal 6 karakter"
                            required
                        />
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white py-2 rounded-md hover:bg-emerald-700 font-medium mt-4">
                        {loading ? "Memproses..." : "Buat Akun"}
                    </button>
                </div>
            </form>
        </div>
    );
}