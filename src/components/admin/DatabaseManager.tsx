'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Database, 
  Download, 
  Upload, 
  Trash2, 
  Loader2,
  AlertTriangle,
  CheckCircle,
  FileJson
} from 'lucide-react';

interface DatabaseManagerProps {
  onUpdate: () => void;
}

export default function DatabaseManager({ onUpdate }: DatabaseManagerProps) {
  const [loading, setLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [backupData, setBackupData] = useState<any>(null);

  // Backup database
  const handleBackup = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/database/backup');
      const json = await res.json();
      
      if (json.success) {
        setBackupData(json.data);
        
        // Create download
        const blob = new Blob([JSON.stringify(json.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup-bani-mucksin-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        setMessage({ type: 'success', text: 'Backup berhasil diunduh!' });
      } else {
        setMessage({ type: 'error', text: 'Gagal membuat backup' });
      }
    } catch (error) {
      console.error('Backup error:', error);
      setMessage({ type: 'error', text: 'Terjadi kesalahan saat backup' });
    } finally {
      setLoading(false);
    }
  };

  // Restore database
  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoreLoading(true);
    setMessage(null);
    
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (!data.data) {
        setMessage({ type: 'error', text: 'Format file backup tidak valid' });
        return;
      }

      const res = await fetch('/api/database/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: data.data }),
      });
      
      const json = await res.json();
      
      if (json.success) {
        setMessage({ 
          type: 'success', 
          text: `Data berhasil dipulihkan! ${json.stats.members} anggota, ${json.stats.gallery} foto, ${json.stats.events} acara`
        });
        onUpdate();
      } else {
        setMessage({ type: 'error', text: json.error || 'Gagal memulihkan data' });
      }
    } catch (error) {
      console.error('Restore error:', error);
      setMessage({ type: 'error', text: 'Gagal membaca file backup' });
    } finally {
      setRestoreLoading(false);
      // Reset input
      e.target.value = '';
    }
  };

  // Reset database
  const handleReset = async () => {
    const confirmed = confirm(
      '⚠️ PERINGATAN!\n\nSemua data akan dihapus secara permanen:\n- Semua anggota keluarga\n- Semua foto galeri\n- Semua acara\n- Informasi keluarga\n\nApakah Anda yakin ingin melanjutkan?'
    );
    
    if (!confirmed) return;

    const doubleConfirmed = confirm(
      '⚠️ KONFIRMASI TERAKHIR\n\nData tidak dapat dikembalikan setelah dihapus!\n\nKetik OK untuk menghapus semua data.'
    );
    
    if (!doubleConfirmed) return;

    setResetLoading(true);
    setMessage(null);
    
    try {
      const res = await fetch('/api/database/reset', { method: 'POST' });
      const json = await res.json();
      
      if (json.success) {
        setMessage({ type: 'success', text: 'Semua data berhasil dihapus!' });
        onUpdate();
      } else {
        setMessage({ type: 'error', text: 'Gagal menghapus data' });
      }
    } catch (error) {
      console.error('Reset error:', error);
      setMessage({ type: 'error', text: 'Terjadi kesalahan saat menghapus data' });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manajemen Database</h1>
        <p className="text-muted-foreground">Backup, restore, dan reset data aplikasi</p>
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertTriangle className="w-5 h-5" />
          )}
          {message.text}
        </motion.div>
      )}

      <div className="grid gap-6">
        {/* Backup Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-emerald-600" />
              Backup Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Download semua data aplikasi dalam format JSON. File backup dapat digunakan untuk memulihkan data di kemudian hari.
            </p>
            <Button onClick={handleBackup} disabled={loading} className="gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Download Backup
            </Button>
          </CardContent>
        </Card>

        {/* Restore Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-amber-600" />
              Restore Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upload file backup JSON untuk memulihkan data. Data yang ada akan diganti dengan data dari file backup.
            </p>
            <div className="flex items-center gap-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleRestore}
                  className="hidden"
                  disabled={restoreLoading}
                />
                <Button variant="outline" disabled={restoreLoading} className="gap-2" asChild>
                  <span>
                    {restoreLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    Upload File Backup
                  </span>
                </Button>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Reset Section */}
        <Card className="border-red-200 dark:border-red-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <Trash2 className="w-5 h-5" />
              Reset Database
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800 dark:text-red-200">Zona Bahaya</p>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Tindakan ini akan menghapus SEMUA data secara permanen dan tidak dapat dibatalkan!
                  </p>
                </div>
              </div>
            </div>
            <Button 
              variant="destructive" 
              onClick={handleReset} 
              disabled={resetLoading}
              className="gap-2"
            >
              {resetLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Hapus Semua Data
            </Button>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-muted/50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <FileJson className="w-6 h-6 text-muted-foreground" />
              <div>
                <h3 className="font-medium">Tentang Backup</h3>
                <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                  <li>• File backup berformat JSON dan dapat dibuka dengan text editor</li>
                  <li>• Backup mencakup: anggota, galeri, acara, dan informasi keluarga</li>
                  <li>• Disarankan backup secara berkala untuk keamanan data</li>
                  <li>• File backup tidak menyimpan password admin</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
