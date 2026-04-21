export interface ActivityLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  adminName?: string;
}

export const logActivity = (action: string, details: string) => {
  const logs: ActivityLog[] = JSON.parse(localStorage.getItem('admin_activity_logs') || '[]');
  const newLog: ActivityLog = {
    id: Date.now().toString(),
    action,
    details,
    timestamp: new Date().toISOString(),
    adminName: "Admin" // Can be expanded to use current user name
  };
  
  // Keep only last 50 logs
  const updatedLogs = [newLog, ...logs].slice(0, 50);
  localStorage.setItem('admin_activity_logs', JSON.stringify(updatedLogs));
  
  // Dispatch custom event to notify listeners (like our AdminPage logger tab)
  window.dispatchEvent(new Event('activity_log_updated'));
};

export const getActivities = (): ActivityLog[] => {
  return JSON.parse(localStorage.getItem('admin_activity_logs') || '[]');
};
