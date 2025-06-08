"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "@/components/providers/supabase-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

interface WhatsAppLog {
  id: string;
  recipient: string;
  message_type: string;
  success: boolean;
  response_code: number | null;
  response_message: string | null;
  created_at: string;
}

export default function WhatsAppLogsPage() {
  const supabase = useSupabase();
  const [logs, setLogs] = useState<WhatsAppLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('whatsapp_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);
        
        if (error) {
          throw new Error(error.message);
        }
        
        setLogs(data || []);
      } catch (err) {
        console.error('Error fetching WhatsApp logs:', err);
        setError(err instanceof Error ? err.message : 'Failed to load WhatsApp logs');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLogs();
  }, [supabase]);

  return (
      <Card>
        <CardHeader>
          <CardTitle>WhatsApp Verification Logs</CardTitle>
          <CardDescription>
            Monitor WhatsApp verification messages sent to users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md text-red-800 dark:text-red-200">
              {error}
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No WhatsApp logs found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border-b px-4 py-2 text-left">Date</th>
                    <th className="border-b px-4 py-2 text-left">Recipient</th>
                    <th className="border-b px-4 py-2 text-left">Type</th>
                    <th className="border-b px-4 py-2 text-left">Status</th>
                    <th className="border-b px-4 py-2 text-left">Response Code</th>
                    <th className="border-b px-4 py-2 text-left">Message</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td className="border-b px-4 py-2 whitespace-nowrap">
                        {format(new Date(log.created_at), "MMM d, yyyy HH:mm:ss")}
                      </td>
                      <td className="border-b px-4 py-2">{log.recipient}</td>
                      <td className="border-b px-4 py-2">{log.message_type}</td>
                      <td className="border-b px-4 py-2">
                        {log.success ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-100">
                            Success
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-100">
                            Failed
                          </span>
                        )}
                      </td>
                      <td className="border-b px-4 py-2">{log.response_code || "-"}</td>
                      <td className="border-b px-4 py-2 max-w-xs truncate">
                        {log.response_message || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
  );
}
