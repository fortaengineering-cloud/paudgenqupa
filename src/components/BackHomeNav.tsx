import { ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BackHomeNavProps {
  className?: string;
  /** Optional explicit back path. Defaults to browser history. */
  backTo?: string;
}

export default function BackHomeNav({ className = "", backTo }: BackHomeNavProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
      return;
    }
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={handleBack}
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background/80 backdrop-blur px-3 py-1.5 text-sm text-foreground hover:bg-accent transition-colors shadow-sm"
        aria-label="Kembali"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali
      </button>
      <button
        type="button"
        onClick={() => navigate("/")}
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background/80 backdrop-blur px-3 py-1.5 text-sm text-foreground hover:bg-accent transition-colors shadow-sm"
        aria-label="Beranda"
      >
        <Home className="h-4 w-4" />
        Beranda
      </button>
    </div>
  );
}
