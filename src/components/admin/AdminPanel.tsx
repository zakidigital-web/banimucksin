'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Settings,
  Users,
  Image,
  Calendar,
  ArrowLeft,
  Save,
  Loader2,
  TreeDeciduous,
  Menu,
  X,
  LogOut,
  RefreshCw,
  Database,
  Info,
  Shield,
  Download,
  Upload,
  FileSpreadsheet,
  ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAdminStore, AdminTabType } from '@/store/useAdminStore';
import { cn } from '@/lib/utils';
import LoginPage from './LoginPage';
import DatabaseManager from './DatabaseManager';
import AboutPage from './AboutPage';
import SettingsPage from './SettingsPage';

interface AdminPanelProps {
  onBack: () => void;
}

const navItems: { id: AdminTabType; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'family', label: 'Keluarga', icon: <Settings className="w-5 h-5" /> },
  { id: 'members', label: 'Anggota', icon: <Users className="w-5 h-5" /> },
  { id: 'gallery', label: 'Galeri', icon: <Image className="w-5 h-5" /> },
  { id: 'events', label: 'Acara', icon: <Calendar className="w-5 h-5" /> },
  { id: 'database', label: 'Database', icon: <Database className="w-5 h-5" /> },
  { id: 'settings', label: 'Pengaturan', icon: <Shield className="w-5 h-5" /> },
  { id: 'about', label: 'Tentang', icon: <Info className="w-5 h-5" /> },
];

export default function AdminPanel({ onBack }: AdminPanelProps) {
  const { activeTab, setActiveTab } = useAdminStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [adminUser, setAdminUser] = useState<{ username: string; name: string } | null>(null);
  const [stats, setStats] = useState({
    members: 0,
    gallery: 0,
    events: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Check authentication
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/login');
        const json = await res.json();
        if (json.authenticated) {
          setAuthenticated(true);
          setAdminUser(json.data);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setCheckingAuth(false);
      }
    }
    checkAuth();
  }, []);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/family');
      const json = await res.json();
      if (json.success) {
        setStats({
          members: json.data.stats.totalMembers,
          gallery: json.data.gallery.length,
          events: json.data.events.length,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authenticated) {
      fetchStats();
    }
  }, [authenticated, refreshKey, fetchStats]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/login', { method: 'DELETE' });
      setAuthenticated(false);
      setAdminUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleRefresh = () => {
    setRefreshKey(k => k + 1);
  };

  // Show loading while checking auth
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Show login page if not authenticated
  if (!authenticated) {
    return <LoginPage onLogin={() => { setAuthenticated(true); }} onBack={onBack} />;
  }

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-muted border-r border-border">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center">
              <TreeDeciduous className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold">Admin Panel</h1>
              <p className="text-xs text-muted-foreground">{adminUser?.name || 'Administrator'}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                activeTab === item.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted-foreground/10"
              )}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border space-y-2">
          <Button variant="outline" size="sm" className="w-full" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
          <Button variant="outline" className="w-full" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Aplikasi
          </Button>
          <Button variant="ghost" className="w-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-background border-b border-border z-50">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="w-5 h-5" />
          </Button>
          <h1 className="font-bold">Admin Panel</h1>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.nav
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className="md:hidden fixed top-16 right-0 bottom-0 w-64 bg-background border-l border-border z-50 p-4 space-y-2"
            >
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                    activeTab === item.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
              <hr className="my-4" />
              <Button variant="outline" className="w-full" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </Button>
              <Button variant="ghost" className="w-full text-red-500" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 md:ml-0 pt-16 md:pt-0 pb-20 md:pb-0 overflow-auto">
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <AdminDashboard stats={stats} loading={loading} onRefresh={handleRefresh} />
              </motion.div>
            )}

            {activeTab === 'family' && (
              <motion.div
                key="family"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <FamilyInfoManager onUpdate={handleRefresh} />
              </motion.div>
            )}

            {activeTab === 'members' && (
              <motion.div
                key="members"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <MembersManager onUpdate={handleRefresh} />
              </motion.div>
            )}

            {activeTab === 'gallery' && (
              <motion.div
                key="gallery"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <GalleryManager onUpdate={handleRefresh} />
              </motion.div>
            )}

            {activeTab === 'events' && (
              <motion.div
                key="events"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <EventsManager onUpdate={handleRefresh} />
              </motion.div>
            )}

            {activeTab === 'database' && (
              <motion.div
                key="database"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <DatabaseManager onUpdate={handleRefresh} />
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <SettingsPage />
              </motion.div>
            )}

            {activeTab === 'about' && (
              <motion.div
                key="about"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <AboutPage />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-40">
        <div className="flex items-center justify-around p-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-lg transition-all",
                activeTab === item.id
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {item.icon}
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

// Dashboard Component
function AdminDashboard({ stats, loading, onRefresh }: { stats: { members: number; gallery: number; events: number }; loading: boolean; onRefresh: () => void }) {
  const cards = [
    { label: 'Anggota', value: stats.members, color: 'bg-emerald-500' },
    { label: 'Galeri', value: stats.gallery, color: 'bg-amber-500' },
    { label: 'Acara', value: stats.events, color: 'bg-rose-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Selamat datang di panel admin</p>
        </div>
        <Button variant="outline" onClick={onRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((card, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${card.color} flex items-center justify-center`}>
                  <span className="text-2xl font-bold text-white">{card.value}</span>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">{card.label}</p>
                  <p className="text-xl font-bold">{loading ? '...' : card.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Panduan Admin</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-muted">
              <h3 className="font-semibold mb-2">👥 Manajemen Anggota</h3>
              <p className="text-sm text-muted-foreground">Tambah, edit, atau hapus anggota keluarga dari database.</p>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <h3 className="font-semibold mb-2">🖼️ Manajemen Galeri</h3>
              <p className="text-sm text-muted-foreground">Kelola album foto keluarga dengan kategori.</p>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <h3 className="font-semibold mb-2">📅 Manajemen Acara</h3>
              <p className="text-sm text-muted-foreground">Atur jadwal acara keluarga seperti reuni dan halal bihalal.</p>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <h3 className="font-semibold mb-2">⚙️ Info Keluarga</h3>
              <p className="text-sm text-muted-foreground">Ubah nama keluarga, visi, misi, dan sejarah.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Family Info Manager
function FamilyInfoManager({ onUpdate }: { onUpdate: () => void }) {
  const [formData, setFormData] = useState({
    familyName: '',
    description: '',
    history: '',
    vision: '',
    mission: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/family/info');
        const json = await res.json();
        if (json.success) {
          setFormData({
            familyName: json.data.familyName || '',
            description: json.data.description || '',
            history: json.data.history || '',
            vision: json.data.vision || '',
            mission: json.data.mission || '',
          });
        }
      } catch (error) {
        console.error('Error fetching family info:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/family/info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (json.success) {
        setMessage({ type: 'success', text: 'Berhasil menyimpan perubahan!' });
        onUpdate();
      } else {
        setMessage({ type: 'error', text: 'Gagal menyimpan perubahan' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Info Keluarga</h1>
          <p className="text-muted-foreground">Kelola informasi dasar keluarga</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Simpan
        </Button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
          {message.text}
        </div>
      )}

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Dasar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nama Keluarga</label>
              <input
                type="text"
                value={formData.familyName}
                onChange={(e) => setFormData({ ...formData, familyName: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border bg-background"
                placeholder="Bani Mucksin / Supiyah"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Deskripsi</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border bg-background min-h-[100px]"
                placeholder="Deskripsi singkat tentang keluarga..."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sejarah & Nilai</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Sejarah Keluarga</label>
              <textarea
                value={formData.history}
                onChange={(e) => setFormData({ ...formData, history: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border bg-background min-h-[120px]"
                placeholder="Cerita sejarah keluarga..."
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Visi</label>
                <textarea
                  value={formData.vision}
                  onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border bg-background min-h-[80px]"
                  placeholder="Visi keluarga..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Misi</label>
                <textarea
                  value={formData.mission}
                  onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border bg-background min-h-[80px]"
                  placeholder="Misi keluarga..."
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Members Manager
function MembersManager({ onUpdate }: { onUpdate: () => void }) {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    gender: 'L',
    birthDate: '',
    birthPlace: '',
    parentId: '',
    spouseId: '',
    generation: 1,
    job: '',
    address: '',
    phone: '',
    education: '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/family/members');
      const json = await res.json();
      if (json.success) {
        setMembers(json.data);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  // Export to Excel
  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/family/members/export');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `anggota-keluarga-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setMessage({ type: 'success', text: 'Data berhasil diekspor!' });
    } catch (error) {
      console.error('Export error:', error);
      setMessage({ type: 'error', text: 'Gagal mengekspor data' });
    } finally {
      setExporting(false);
    }
  };

  // Download Template
  const handleDownloadTemplate = async () => {
    try {
      const res = await fetch('/api/family/members/template');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'template-anggota-keluarga.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setMessage({ type: 'success', text: 'Template berhasil diunduh!' });
    } catch (error) {
      console.error('Template download error:', error);
      setMessage({ type: 'error', text: 'Gagal mengunduh template' });
    }
  };

  // Import from Excel
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/family/members/import', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();

      if (json.success) {
        setMessage({
          type: 'success',
          text: `Berhasil mengimport ${json.imported} dari ${json.total} anggota!`
        });
        fetchMembers();
        onUpdate();
        if (json.errors && json.errors.length > 0) {
          console.warn('Import warnings:', json.errors);
        }
      } else {
        setMessage({ type: 'error', text: json.error || 'Gagal mengimport data' });
      }
    } catch (error) {
      console.error('Import error:', error);
      setMessage({ type: 'error', text: 'Gagal mengimport data' });
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const url = editingMember
        ? `/api/family/members/${editingMember.id}`
        : '/api/family/members';
      const method = editingMember ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        fetchMembers();
        onUpdate();
        setShowForm(false);
        setEditingMember(null);
        resetForm();
        setMessage({ type: 'success', text: editingMember ? 'Anggota berhasil diupdate!' : 'Anggota berhasil ditambahkan!' });
      } else {
        setMessage({ type: 'error', text: 'Gagal menyimpan data' });
      }
    } catch (error) {
      console.error('Error saving member:', error);
      setMessage({ type: 'error', text: 'Terjadi kesalahan' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus anggota ini?')) return;
    try {
      const res = await fetch(`/api/family/members/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchMembers();
        onUpdate();
        setMessage({ type: 'success', text: 'Anggota berhasil dihapus!' });
      }
    } catch (error) {
      console.error('Error deleting member:', error);
      setMessage({ type: 'error', text: 'Gagal menghapus anggota' });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      gender: 'L',
      birthDate: '',
      birthPlace: '',
      parentId: '',
      spouseId: '',
      generation: 1,
      job: '',
      address: '',
      phone: '',
      education: '',
    });
  };

  const startEdit = (member: any) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      gender: member.gender,
      birthDate: member.birthDate || '',
      birthPlace: member.birthPlace || '',
      parentId: member.parentId || '',
      spouseId: member.spouseId || '',
      generation: member.generation,
      job: member.job || '',
      address: member.address || '',
      phone: member.phone || '',
      education: member.education || '',
    });
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Anggota</h1>
          <p className="text-muted-foreground">{members.length} anggota terdaftar</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => { setShowForm(true); setEditingMember(null); resetForm(); setMessage(null); }}>
            + Tambah Anggota
          </Button>
        </div>
      </div>

      {/* Export/Import Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            Export & Import Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={exporting || members.length === 0}
              className="gap-2"
            >
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Export Excel
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadTemplate}
              className="gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Download Template
            </Button>

            <label>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleImport}
                className="hidden"
                disabled={importing}
              />
              <Button
                variant="outline"
                size="sm"
                disabled={importing}
                className="gap-2 cursor-pointer"
                asChild
              >
                <span>
                  {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  Import Excel
                </span>
              </Button>
            </label>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            💡 Download template untuk format yang benar, isi data, lalu import. Data akan ditambahkan ke database.
          </p>
        </CardContent>
      </Card>

      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
          {message.text}
        </div>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingMember ? 'Edit Anggota' : 'Tambah Anggota Baru'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border bg-background"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Jenis Kelamin *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border bg-background"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tanggal Lahir</label>
                  <input
                    type="text"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border bg-background"
                    placeholder="YYYY-MM-DD"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    value={formData.birthPlace}
                    onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Generasi</label>
                  <input
                    type="number"
                    value={formData.generation}
                    onChange={(e) => setFormData({ ...formData, generation: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg border bg-background"
                    min={1}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Pekerjaan</label>
                  <input
                    type="text"
                    value={formData.job}
                    onChange={(e) => setFormData({ ...formData, job: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Orang Tua</label>
                  <select
                    value={formData.parentId}
                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border bg-background"
                  >
                    <option value="">-- Pilih Orang Tua --</option>
                    {members.filter(m => m.id !== editingMember?.id).map(m => (
                      <option key={m.id} value={m.id}>{m.name} (Gen {m.generation})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Pasangan</label>
                  <select
                    value={formData.spouseId}
                    onChange={(e) => setFormData({ ...formData, spouseId: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border bg-background"
                  >
                    <option value="">-- Pilih Pasangan --</option>
                    {members.filter(m => m.id !== editingMember?.id && m.gender !== formData.gender).map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">No. WhatsApp/Telepon</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border bg-background"
                    placeholder="Contoh: 08123456789"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Pendidikan</label>
                  <input
                    type="text"
                    value={formData.education}
                    onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border bg-background"
                    placeholder="Contoh: S1 Teknik Informatika"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">Alamat</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border bg-background"
                    placeholder="Alamat lengkap..."
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Simpan
                </Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingMember(null); }}>
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-4">Nama</th>
                  <th className="text-left p-4 hidden sm:table-cell">Gender</th>
                  <th className="text-left p-4 hidden md:table-cell">Generasi</th>
                  <th className="text-left p-4 hidden lg:table-cell">Pekerjaan</th>
                  <th className="text-right p-4">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id} className="border-t border-border">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs ${member.gender === 'L' ? 'bg-sky-500' : 'bg-rose-500'}`}>
                          {member.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground sm:hidden">{member.gender === 'L' ? 'Laki-laki' : 'Perempuan'} • Gen {member.generation}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden sm:table-cell">
                      <Badge variant={member.gender === 'L' ? 'default' : 'secondary'}>
                        {member.gender === 'L' ? 'L' : 'P'}
                      </Badge>
                    </td>
                    <td className="p-4 hidden md:table-cell">Gen {member.generation}</td>
                    <td className="p-4 hidden lg:table-cell">{member.job || '-'}</td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => startEdit(member)}>Edit</Button>
                      <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(member.id)}>Hapus</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Gallery Manager
function GalleryManager({ onUpdate }: { onUpdate: () => void }) {
  const [gallery, setGallery] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    category: 'family',
    date: '',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const res = await fetch('/api/family/gallery');
      const json = await res.json();
      if (json.success) {
        setGallery(json.data);
      }
    } catch (error) {
      console.error('Error fetching gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const json = await res.json();
      if (json.success) {
        setFormData({ ...formData, imageUrl: json.data.url });
        setMessage({ type: 'success', text: 'Gambar berhasil diupload!' });
      } else {
        setMessage({ type: 'error', text: json.error || 'Gagal mengupload gambar' });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage({ type: 'error', text: 'Gagal mengupload gambar' });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const url = editingItem
        ? `/api/family/gallery/${editingItem.id}`
        : '/api/family/gallery';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        fetchGallery();
        onUpdate();
        setShowForm(false);
        setEditingItem(null);
        resetForm();
        setMessage({ type: 'success', text: editingItem ? 'Foto berhasil diupdate!' : 'Foto berhasil ditambahkan!' });
      } else {
        setMessage({ type: 'error', text: 'Gagal menyimpan data' });
      }
    } catch (error) {
      console.error('Error saving gallery item:', error);
      setMessage({ type: 'error', text: 'Terjadi kesalahan' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus foto ini?')) return;
    try {
      const res = await fetch(`/api/family/gallery/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchGallery();
        onUpdate();
        setMessage({ type: 'success', text: 'Foto berhasil dihapus!' });
      }
    } catch (error) {
      console.error('Error deleting gallery item:', error);
      setMessage({ type: 'error', text: 'Gagal menghapus foto' });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      category: 'family',
      date: '',
    });
  };

  const startEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      imageUrl: item.imageUrl,
      category: item.category,
      date: item.date || '',
    });
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Galeri</h1>
          <p className="text-muted-foreground">{gallery.length} foto</p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditingItem(null); resetForm(); setMessage(null); }}>
          + Tambah Foto
        </Button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
          {message.text}
        </div>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingItem ? 'Edit Foto' : 'Tambah Foto Baru'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Judul *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border bg-background"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border bg-background"
                  >
                    <option value="family">Keluarga</option>
                    <option value="event">Acara</option>
                    <option value="gathering">Silaturahmi</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">Foto *</label>
                  <div className="space-y-3">
                    {/* Image URL Input */}
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">URL Gambar</label>
                      <input
                        type="url"
                        value={formData.imageUrl.startsWith('data:') ? '' : formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border bg-background"
                        placeholder="https://..."
                        disabled={formData.imageUrl.startsWith('data:')}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-xs text-muted-foreground">atau</span>
                      <div className="flex-1 h-px bg-border" />
                    </div>

                    {/* Image Upload */}
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Upload Gambar</label>
                      <div className="flex gap-2">
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            disabled={uploading}
                          />
                          <Button type="button" variant="outline" disabled={uploading} className="gap-2" asChild>
                            <span>
                              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                              Pilih File
                            </span>
                          </Button>
                        </label>
                        {formData.imageUrl && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setFormData({ ...formData, imageUrl: '' })}
                            className="text-red-500"
                          >
                            Hapus
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Preview */}
                    {formData.imageUrl && (
                      <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                        <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">Deskripsi</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tanggal</label>
                  <input
                    type="text"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border bg-background"
                    placeholder="YYYY-MM-DD"
                  />
                </div>
              </div>
              {formData.imageUrl && (
                <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                  <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Simpan
                </Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingItem(null); }}>
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {gallery.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <div className="aspect-square relative bg-muted">
              <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
              <Badge className="absolute top-2 left-2">{item.category}</Badge>
            </div>
            <CardContent className="p-3">
              <p className="font-medium text-sm truncate">{item.title}</p>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => startEdit(item)}>Edit</Button>
                <Button variant="outline" size="sm" className="text-red-500" onClick={() => handleDelete(item.id)}>Hapus</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Events Manager
function EventsManager({ onUpdate }: { onUpdate: () => void }) {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    image: '',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/family/events');
      const json = await res.json();
      if (json.success) {
        setEvents(json.data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const json = await res.json();
      if (json.success) {
        setFormData({ ...formData, image: json.data.url });
        setMessage({ type: 'success', text: 'Gambar berhasil diupload!' });
      } else {
        setMessage({ type: 'error', text: json.error || 'Gagal mengupload gambar' });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage({ type: 'error', text: 'Gagal mengupload gambar' });
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const url = editingEvent
        ? `/api/family/events/${editingEvent.id}`
        : '/api/family/events';
      const method = editingEvent ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        fetchEvents();
        onUpdate();
        setShowForm(false);
        setEditingEvent(null);
        resetForm();
        setMessage({ type: 'success', text: editingEvent ? 'Acara berhasil diupdate!' : 'Acara berhasil ditambahkan!' });
      } else {
        setMessage({ type: 'error', text: json.error || 'Gagal menyimpan data' });
      }
    } catch (error) {
      console.error('Error saving event:', error);
      setMessage({ type: 'error', text: 'Terjadi kesalahan' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus acara ini?')) return;
    try {
      const res = await fetch(`/api/family/events/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchEvents();
        onUpdate();
        setMessage({ type: 'success', text: 'Acara berhasil dihapus!' });
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      setMessage({ type: 'error', text: 'Gagal menghapus acara' });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      location: '',
      image: '',
    });
  };

  const startEdit = (event: any) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      date: event.date,
      location: event.location || '',
      image: event.image || '',
    });
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Acara</h1>
          <p className="text-muted-foreground">{events.length} acara terjadwal</p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditingEvent(null); resetForm(); setMessage(null); }}>
          + Tambah Acara
        </Button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
          {message.text}
        </div>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingEvent ? 'Edit Acara' : 'Tambah Acara Baru'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Judul Acara *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border bg-background"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tanggal *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border bg-background"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">Lokasi</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border bg-background"
                    placeholder="Contoh: Rumah Bapak Ahmad, Jl. Merdeka No. 10"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">Gambar Acara</label>
                  <div className="space-y-3">
                    {/* Image URL Input */}
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">URL Gambar</label>
                      <input
                        type="url"
                        value={formData.image.startsWith('data:') ? '' : formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        className="w-full px-4 py-2 rounded-lg border bg-background"
                        placeholder="https://..."
                        disabled={formData.image.startsWith('data:')}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-xs text-muted-foreground">atau</span>
                      <div className="flex-1 h-px bg-border" />
                    </div>

                    {/* Image Upload */}
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Upload Gambar</label>
                      <div className="flex gap-2">
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            disabled={uploading}
                          />
                          <Button type="button" variant="outline" disabled={uploading} className="gap-2" asChild>
                            <span>
                              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                              Pilih File
                            </span>
                          </Button>
                        </label>
                        {formData.image && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setFormData({ ...formData, image: '' })}
                            className="text-red-500"
                          >
                            Hapus
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Preview */}
                    {formData.image && (
                      <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">Deskripsi</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border bg-background min-h-[80px]"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Simpan
                </Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingEvent(null); }}>
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {events.map((event) => (
          <Card key={event.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {event.image ? (
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex flex-col items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-emerald-700">
                        {new Date(event.date).getDate()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold">{event.title}</h3>
                    <p className="text-sm text-muted-foreground">{event.date}</p>
                    {event.location && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        📍 {event.location}
                      </p>
                    )}
                    {event.description && <p className="text-sm mt-1">{event.description}</p>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => startEdit(event)}>Edit</Button>
                  <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(event.id)}>Hapus</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
