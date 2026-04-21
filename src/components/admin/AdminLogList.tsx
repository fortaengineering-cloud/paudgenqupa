import { useEffect, useState } from "react";
import { getActivities, ActivityLog } from "@/lib/logger";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, User, ClipboardList } from "lucide-react";

export default function AdminLogList() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    setLogs(getActivities());
    
    const handleUpdate = () => setLogs(getActivities());
    window.addEventListener('activity_log_updated', handleUpdate);
    return () => window.removeEventListener('activity_log_updated', handleUpdate);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Log Aktivitas</h2>
        <p className="text-sm text-muted-foreground">Riwayat tindakan admin pada sistem</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Aktivitas Terbaru
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            {logs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Belum ada catatan aktivitas.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {logs.map((log) => (
                  <div key={log.id} className="p-4 flex gap-4 hover:bg-accent/50 transition-colors">
                    <div className="mt-1">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <User className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-foreground">
                          {log.action}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase tracking-widest">
                          <Clock className="h-3 w-3" />
                          {new Date(log.timestamp).toLocaleString('id-ID')}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{log.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
