import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { loginAdmin } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react";
import LogoMark from "@/components/LogoMark";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await loginAdmin(email, password);
      toast({ title: "Berhasil!", description: "Selamat datang, Admin!" });
      navigate("/admin");
    } catch (error: any) {
      toast({
        title: "Gagal masuk",
        description: "Email atau password yang Anda masukkan salah.",
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
            <LogoMark className="mx-auto mb-2" />
            <CardTitle className="text-2xl">Login Admin</CardTitle>
            <CardDescription>Pilih jenis akun untuk masuk</CardDescription>
          </CardHeader>

          <div className="px-6 -mt-2 mb-4 grid grid-cols-2 gap-2">
            <Link
              to="/login"
              className="rounded-lg border border-input bg-background p-3 text-center hover:bg-accent transition-colors"
            >
              <div className="text-sm font-semibold">Orang Tua</div>
              <div className="text-[11px] text-muted-foreground">Login dengan No. HP</div>
            </Link>
            <button
              type="button"
              className="rounded-lg border-2 border-primary bg-primary/5 p-3 text-center"
              aria-pressed="true"
            >
              <div className="text-sm font-semibold text-primary">Admin</div>
              <div className="text-[11px] text-muted-foreground">Login dengan Email</div>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                Masuk sebagai Admin
              </Button>
              <Link
                to="/login"
                className="text-sm text-muted-foreground hover:text-primary text-center"
              >
                ← Login sebagai Orang Tua
              </Link>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
