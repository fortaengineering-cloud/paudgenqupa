import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client"; // Import Supabase ditambahkan di sini

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi: nomor HP hanya boleh angka
    const phoneClean = phone.replace(/\D/g, "");
    if (!/^\d{8,15}$/.test(phoneClean)) {
      toast({
        title: "Nomor HP tidak valid",
        description: "Masukkan hanya angka (8-15 digit), contoh: 08123456789",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // LOGIKA EMAIL DUMMY GENQUPA
      const dummyEmail = `${phoneClean}@paud.genqupa.co.id`;

      const { data, error } = await supabase.auth.signInWithPassword({
        email: dummyEmail,
        password: password,
      });

      if (error) throw error;

      toast({ title: "Berhasil!", description: "Selamat datang kembali!" });
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Gagal masuk",
        description: error.message || "Nomor HP atau password salah.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-accent/30 islamic-pattern p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Beranda
          </Link>
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
            Beranda
          </Link>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center">
            <div className="w-14 h-14 rounded-full gradient-islamic flex items-center justify-center mx-auto mb-2">
              <span className="text-primary-foreground font-bold text-xl">G</span>
            </div>
            <CardTitle className="text-2xl">Masuk</CardTitle>
            <CardDescription>Login menggunakan nomor HP yang terdaftar</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Nomor HP</Label>
                <Input
                  id="phone"
                  placeholder="08123456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full gradient-islamic border-0" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Masuk
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Belum punya akun?{" "}
                <Link to="/register" className="text-primary font-medium hover:underline">
                  Daftar sekarang
                </Link>
              </p>
              <Link
                to="/admin/login"
                className="text-xs text-muted-foreground/60 hover:text-primary text-center"
              >
                Login sebagai Admin →
              </Link>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}