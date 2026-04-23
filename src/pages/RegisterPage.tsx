import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import BackHomeNav from '@/components/BackHomeNav';
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const phoneClean = (val: string) => {
        let cleaned = val.replace(/\D/g, "");
        if (cleaned.startsWith("62")) {
            cleaned = "0" + cleaned.slice(2);
        } else if (cleaned.startsWith("8")) {
            cleaned = "0" + cleaned;
        }
        return cleaned;
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        const cleaned = phoneClean(phone);
        
        // Validasi: nomor HP harus berawal 08 dan min 10 digit
        if (!/^08\d{8,13}$/.test(cleaned)) {
            toast({
                title: "Nomor HP tidak valid",
                description: "Gunakan format 0812..., minimal 10 digit.",
                variant: "destructive",
            });
            return;
        }

        if (password.length < 6) {
            toast({
                title: "Password terlalu pendek",
                description: "Password minimal 6 karakter.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        // LOGIKA EMAIL DUMMY GENQUPA (Login tetap menggunakan No HP berawalan 08)
        const dummyEmail = `${cleaned}@paud.genqupa.co.id`;

        const { data, error } = await supabase.auth.signUp({
            email: dummyEmail,
            password: password,
            options: {
                data: {
                    phone: cleaned,
                    name: name
                },
                emailRedirectTo: window.location.origin,
            }
        });

        setLoading(false);

        if (error) {
            // Ubah pesan error bawaan Supabase agar mudah dipahami Orang Tua
            let errorMessage = error.message;
            if (errorMessage.includes("User already registered")) {
                errorMessage = "Nomor HP ini sudah terdaftar. Silakan langsung Login.";
            }

            toast({
                title: "Gagal mendaftar",
                description: errorMessage,
                variant: "destructive"
            });
        } else {
            toast({
                title: "Berhasil!",
                description: "Akun berhasil dibuat! Silakan Login menggunakan Nomor HP dan Password Anda."
            });
            navigate('/login');
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-sm mb-4">
                <BackHomeNav />
            </div>
            <form onSubmit={handleRegister} className="w-full max-w-sm bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-center text-emerald-700 mb-6">Daftar Akun Ortu</h2>

                <div className="space-y-4">
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
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="08123456789"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500 pr-10"
                                placeholder="Minimal 6 karakter"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                    
                    <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white py-2.5 rounded-md hover:bg-emerald-700 font-medium mt-4 transition-colors">
                        {loading ? "Memproses..." : "Buat Akun"}
                    </button>
                </div>

                <div className="mt-6 text-center text-sm text-gray-600">
                    Sudah punya akun?{" "}
                    <Link to="/login" className="text-emerald-600 font-bold hover:underline">
                        Login di sini
                    </Link>
                </div>
            </form>
        </div>
    );
}