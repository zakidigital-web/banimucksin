'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import BottomNav from '@/components/family/BottomNav';
import SidebarNav from '@/components/family/SidebarNav';
import HomePage from '@/components/family/HomePage';
import TreePage from '@/components/family/TreePage';
import MembersPage from '@/components/family/MembersPage';
import GalleryPage from '@/components/family/GalleryPage';
import ProfilePage from '@/components/family/ProfilePage';
import AboutPage from '@/components/family/AboutPage';
import SplashScreen from '@/components/family/SplashScreen';
import AdminPanel from '@/components/admin/AdminPanel';
import { useAppStore } from '@/store/useAppStore';
import { Skeleton } from '@/components/ui/skeleton';
import { TreeDeciduous, Settings, Calendar, MapPin, X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FamilyMember {
  id: string;
  name: string;
  gender: string;
  birthDate?: string | null;
  birthPlace?: string | null;
  photo?: string | null;
  parentId?: string | null;
  spouseId?: string | null;
  generation: number;
  job?: string | null;
  address?: string | null;
  phone?: string | null;
  education?: string | null;
  children: FamilyMember[];
  spouse?: FamilyMember | null;
}

interface GalleryItem {
  id: string;
  title: string;
  description?: string | null;
  imageUrl: string;
  category: string;
  date?: string | null;
}

interface FamilyEvent {
  id: string;
  title: string;
  description?: string | null;
  date: string;
  location?: string | null;
  image?: string | null;
  showSplash: boolean;
}

interface FamilyInfo {
  familyName: string;
  description?: string | null;
  history?: string | null;
  vision?: string | null;
  mission?: string | null;
}

interface FamilyData {
  members: FamilyMember[];
  rootMembers: FamilyMember[];
  familyInfo: FamilyInfo;
  gallery: GalleryItem[];
  events: FamilyEvent[];
  stats: {
    totalMembers: number;
    generations: number;
    maleCount: number;
    femaleCount: number;
  };
}

// Desktop Header Component
function DesktopHeader({ title, subtitle, onAdminClick, onEventsClick, onAboutClick }: { title: string; subtitle: string; onAdminClick: () => void; onEventsClick: () => void; onAboutClick: () => void }) {
  return (
    <header className="hidden md:flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">{title}</h1>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onAboutClick} className="gap-2">
          <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Tentang
        </Button>
        <Button variant="outline" size="sm" onClick={onEventsClick} className="gap-2">
          <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          Acara
        </Button>
        <Button variant="outline" size="sm" onClick={onAdminClick} className="gap-2">
          <Settings className="w-4 h-4" />
          Admin
        </Button>
        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center ml-2 border border-emerald-200 dark:border-emerald-800">
          <TreeDeciduous className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const { activeTab } = useAppStore();
  const [data, setData] = useState<FamilyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showEventsModal, setShowEventsModal] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/family');
      const json = await res.json();

      if (json.success) {
        setData(json.data);

        // Auto seed if no members
        if (json.data.members.length === 0) {
          const seedRes = await fetch('/api/family/seed', { method: 'POST' });
          const seedJson = await seedRes.json();

          if (seedJson.success) {
            // Refetch after seeding
            const refetch = await fetch('/api/family');
            const refetchJson = await refetch.json();
            if (refetchJson.success) {
              setData(refetchJson.data);
            }
          }
        }
      } else {
        setError('Gagal memuat data');
      }
    } catch (err) {
      setError('Terjadi kesalahan');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Refetch data when returning from admin
  const handleBackFromAdmin = () => {
    setShowAdmin(false);
    fetchData();
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  // Show Admin Panel
  if (showAdmin) {
    return <AdminPanel onBack={handleBackFromAdmin} />;
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex">
        {/* Desktop Sidebar Skeleton */}
        <div className="hidden md:block w-64 bg-muted animate-pulse" />

        <main className="flex-1 pb-20 md:pb-0">
          <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-4">
            <Skeleton className="h-8 w-48 hidden md:block" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-32 rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        </main>

        <BottomNav />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  const getPageTitle = () => {
    switch (activeTab) {
      case 'home': return { title: 'Beranda', subtitle: 'Selamat datang di keluarga besar Bani Mucksin' };
      case 'tree': return { title: 'Pohon Keluarga', subtitle: 'Visualisasi silsilah keluarga' };
      case 'members': return { title: 'Anggota Keluarga', subtitle: `${data?.stats.totalMembers || 0} anggota terdaftar` };
      case 'gallery': return { title: 'Galeri', subtitle: 'Album foto keluarga' };
      case 'profile': return { title: 'Profil Keluarga', subtitle: 'Informasi & nilai-nilai keluarga' };
      case 'about': return { title: 'Tentang Aplikasi', subtitle: 'Informasi pembuatan aplikasi' };
      default: return { title: '', subtitle: '' };
    }
  };

  const pageInfo = getPageTitle();

  return (
    <>
      {/* Splash Screen for upcoming events */}
      <SplashScreen events={data?.events || []} />

      {/* Events Modal */}
      <EventsModal events={data?.events || []} open={showEventsModal} onClose={() => setShowEventsModal(false)} />

      <div className="min-h-screen bg-background flex">
        {/* Desktop/Tablet Sidebar */}
        <SidebarNav />

        {/* Main Content */}
        <main className="flex-1 pb-20 md:pb-0 overflow-x-hidden">
          <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
            {/* Mobile Buttons */}
            <div className="flex justify-end gap-2 mb-3 md:hidden">
              <Button variant="outline" size="sm" onClick={() => (useAppStore.getState().setActiveTab('about'))} className="gap-2">
                <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Tentang
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowEventsModal(true)} className="gap-2">
                <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Acara
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowAdmin(true)} className="gap-2">
                <Settings className="w-4 h-4" />
                Admin
              </Button>
            </div>
            {/* Desktop Header */}
            <DesktopHeader
              title={pageInfo.title}
              subtitle={pageInfo.subtitle}
              onAdminClick={() => setShowAdmin(true)}
              onEventsClick={() => setShowEventsModal(true)}
              onAboutClick={() => (useAppStore.getState().setActiveTab('about'))}
            />

            <AnimatePresence mode="wait">
              {activeTab === 'home' && (
                <motion.div
                  key="home"
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                >
                  <HomePageDesktop
                    stats={data?.stats || { totalMembers: 0, generations: 0, maleCount: 0, femaleCount: 0 }}
                    upcomingEvents={data?.events || []}
                    members={data?.members || []}
                    gallery={data?.gallery || []}
                  />
                </motion.div>
              )}

              {activeTab === 'tree' && (
                <motion.div
                  key="tree"
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                >
                  <TreePageDesktop
                    members={data?.members || []}
                    rootMembers={data?.rootMembers || []}
                  />
                </motion.div>
              )}

              {activeTab === 'members' && (
                <motion.div
                  key="members"
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                >
                  <MembersPageDesktop members={data?.members || []} />
                </motion.div>
              )}

              {activeTab === 'gallery' && (
                <motion.div
                  key="gallery"
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                >
                  <GalleryPageDesktop gallery={data?.gallery || []} />
                </motion.div>
              )}

              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                >
                  <ProfilePageDesktop
                    familyInfo={data?.familyInfo || { familyName: 'Bani Mucksin / Supiyah' }}
                    stats={data?.stats || { totalMembers: 0, generations: 0 }}
                    onAdminClick={() => setShowAdmin(true)}
                  />
                </motion.div>
              )}

              {activeTab === 'about' && (
                <motion.div
                  key="about"
                  variants={pageVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.2 }}
                >
                  <AboutPage onAdminClick={() => setShowAdmin(true)} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden">
          <BottomNav />
        </div>
      </div>
    </>
  );
}

// Desktop Home Page with grid layout
function HomePageDesktop({ stats, upcomingEvents, members, gallery }: {
  stats: { totalMembers: number; generations: number; maleCount: number; femaleCount: number };
  upcomingEvents: FamilyEvent[];
  members: FamilyMember[];
  gallery: GalleryItem[];
}) {
  const { setActiveTab } = useAppStore();

  return (
    <div className="space-y-6">
      {/* Hero - Desktop: Full width card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="hidden md:block"
      >
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/logo.svg')] bg-repeat opacity-5" />
          <div className="relative z-10 flex items-center gap-8">
            <div className="w-24 h-24 rounded-2xl bg-white/20 flex items-center justify-center">
              <TreeDeciduous className="w-12 h-12" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">Bani Mucksin / Supiyah</h2>
              <p className="text-emerald-100 max-w-xl">
                Silsilah keluarga besar Bani Mucksin / Supiyah. Menjalin tali silaturahmi
                antar generasi dengan penuh cinta dan kasih sayang.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mobile Home Page */}
      <div className="md:hidden">
        <HomePage stats={stats} upcomingEvents={upcomingEvents} />
      </div>

      {/* Desktop: Stats Grid + Quick Actions + Recent */}
      <div className="hidden md:grid md:grid-cols-3 gap-6">
        {/* Stats Cards */}
        <div className="lg:col-span-2 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6 text-center"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center mx-auto mb-3">
              <TreeDeciduous className="w-6 h-6" />
            </div>
            <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">{stats.totalMembers}</p>
            <p className="text-sm text-muted-foreground">Total Anggota</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border border-amber-200 dark:border-amber-800 rounded-xl p-6 text-center"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center mx-auto mb-3">
              <TreeDeciduous className="w-6 h-6" />
            </div>
            <p className="text-3xl font-bold text-amber-700 dark:text-amber-300">{stats.generations}</p>
            <p className="text-sm text-muted-foreground">Generasi</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950 dark:to-blue-950 border border-sky-200 dark:border-sky-800 rounded-xl p-6 text-center"
          >
            <div className="w-12 h-12 rounded-xl bg-sky-500 text-white flex items-center justify-center mx-auto mb-3">
              <TreeDeciduous className="w-6 h-6" />
            </div>
            <p className="text-3xl font-bold text-sky-700 dark:text-sky-300">{stats.maleCount}</p>
            <p className="text-sm text-muted-foreground">Laki-laki</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950 dark:to-pink-950 border border-rose-200 dark:border-rose-800 rounded-xl p-6 text-center"
          >
            <div className="w-12 h-12 rounded-xl bg-rose-500 text-white flex items-center justify-center mx-auto mb-3">
              <TreeDeciduous className="w-6 h-6" />
            </div>
            <p className="text-3xl font-bold text-rose-700 dark:text-rose-300">{stats.femaleCount}</p>
            <p className="text-sm text-muted-foreground">Perempuan</p>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <h3 className="font-semibold">Aksi Cepat</h3>
          {[
            { label: 'Lihat Pohon Keluarga', tab: 'tree' as const, color: 'bg-emerald-500' },
            { label: 'Daftar Anggota', tab: 'members' as const, color: 'bg-amber-500' },
            { label: 'Galeri Foto', tab: 'gallery' as const, color: 'bg-rose-500' },
          ].map((action, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(action.tab)}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
            >
              <div className={`w-10 h-10 rounded-lg ${action.color} text-white flex items-center justify-center`}>
                <TreeDeciduous className="w-5 h-5" />
              </div>
              <span className="font-medium">{action.label}</span>
            </button>
          ))}
        </motion.div>
      </div>

      {/* Desktop: Recent Members & Gallery */}
      <div className="hidden md:grid md:grid-cols-2 gap-6">
        {/* Recent Members */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="font-semibold mb-3">Anggota Terbaru</h3>
          <div className="space-y-2">
            {members.slice(0, 4).map((member, i) => (
              <div key={member.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${member.gender === 'L' ? 'bg-sky-500' : 'bg-rose-500'}`}>
                  {member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-xs text-muted-foreground">Generasi {member.generation}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="font-semibold mb-3">Galeri Terbaru</h3>
          <div className="grid grid-cols-2 gap-2">
            {gallery.slice(0, 4).map((item) => (
              <div key={item.id} className="aspect-square rounded-xl overflow-hidden bg-muted">
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Desktop Tree Page
function TreePageDesktop({ members, rootMembers }: { members: FamilyMember[]; rootMembers: FamilyMember[] }) {
  return (
    <div>
      {/* Mobile view */}
      <div className="md:hidden">
        <TreePage members={members} rootMembers={rootMembers} />
      </div>

      {/* Desktop view - centered and larger */}
      <div className="hidden md:block">
        <TreePage members={members} rootMembers={rootMembers} />
      </div>
    </div>
  );
}

// Desktop Members Page
function MembersPageDesktop({ members }: { members: FamilyMember[] }) {
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [generationFilter, setGenerationFilter] = useState<string>('all');
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

  const generations = Array.from(new Set(members.map(m => m.generation))).sort((a, b) => a - b);

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(search.toLowerCase());
    const matchesGender = genderFilter === 'all' || member.gender === genderFilter;
    const matchesGeneration = generationFilter === 'all' || member.generation.toString() === generationFilter;
    return matchesSearch && matchesGender && matchesGeneration;
  });

  return (
    <div className="space-y-4">
      {/* Mobile view */}
      <div className="md:hidden">
        <MembersPage members={members} />
      </div>

      {/* Desktop view - grid cards */}
      <div className="hidden md:block space-y-4">
        {/* Search & Filter Bar */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Cari anggota..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 pl-10 rounded-lg border bg-background"
            />
          </div>
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border bg-background"
          >
            <option value="all">Semua Gender</option>
            <option value="L">Laki-laki</option>
            <option value="P">Perempuan</option>
          </select>
          <select
            value={generationFilter}
            onChange={(e) => setGenerationFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border bg-background"
          >
            <option value="all">Semua Generasi</option>
            {generations.map(gen => (
              <option key={gen} value={gen.toString()}>Generasi {gen}</option>
            ))}
          </select>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredMembers.map((member, index) => {
            const isMale = member.gender === 'L';
            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => setSelectedMember(member)}
                className="cursor-pointer group"
              >
                <div className={`p-4 rounded-xl border transition-all group-hover:shadow-lg group-hover:scale-105 ${isMale
                  ? 'bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950 dark:to-blue-950 border-sky-200 dark:border-sky-800'
                  : 'bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950 dark:to-pink-950 border-rose-200 dark:border-rose-800'
                  }`}>
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg mb-3 ${isMale ? 'bg-sky-500' : 'bg-rose-500'}`}>
                      {member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <p className="font-medium text-sm truncate w-full">{member.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">Gen {member.generation}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Member Detail Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedMember(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 ${selectedMember.gender === 'L' ? 'bg-sky-500' : 'bg-rose-500'}`}>
                {selectedMember.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <h3 className="text-xl font-bold">{selectedMember.name}</h3>
              <p className="text-muted-foreground">Generasi {selectedMember.generation}</p>
            </div>

            <div className="space-y-3">
              {selectedMember.birthDate && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Tanggal Lahir</span>
                  <span className="font-medium">{selectedMember.birthDate}</span>
                </div>
              )}
              {selectedMember.job && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Pekerjaan</span>
                  <span className="font-medium">{selectedMember.job}</span>
                </div>
              )}
              {selectedMember.address && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Alamat</span>
                  <span className="font-medium">{selectedMember.address}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedMember(null)}
              className="w-full mt-6 py-2 bg-primary text-primary-foreground rounded-lg"
            >
              Tutup
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// Desktop Gallery Page
function GalleryPageDesktop({ gallery }: { gallery: GalleryItem[] }) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  const categories = ['all', ...new Set(gallery.map(g => g.category))];
  const filteredGallery = activeCategory === 'all' ? gallery : gallery.filter(g => g.category === activeCategory);

  const categoryConfig: Record<string, { label: string; color: string }> = {
    family: { label: 'Keluarga', color: 'bg-emerald-500' },
    event: { label: 'Acara', color: 'bg-amber-500' },
    gathering: { label: 'Silaturahmi', color: 'bg-rose-500' },
  };

  return (
    <div className="space-y-4">
      {/* Mobile view */}
      <div className="md:hidden">
        <GalleryPage gallery={gallery} />
      </div>

      {/* Desktop view - larger grid */}
      <div className="hidden md:block space-y-4">
        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-lg transition-colors ${activeCategory === cat
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
                }`}
            >
              {cat === 'all' ? 'Semua' : categoryConfig[cat]?.label || cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredGallery.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedImage(item)}
              className="cursor-pointer group"
            >
              <div className="aspect-square rounded-xl overflow-hidden relative bg-muted group-hover:shadow-lg transition-all">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white font-medium text-sm">{item.title}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" onClick={() => setSelectedImage(null)}>
          <button
            className="absolute top-4 right-4 text-white p-2 hover:bg-white/20 rounded-lg transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            ✕
          </button>
          <motion.img
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            src={selectedImage.imageUrl}
            alt={selectedImage.title}
            className="max-w-full max-h-[80vh] rounded-lg"
          />
          <div className="absolute bottom-4 left-4 right-4 text-center">
            <p className="text-white font-medium">{selectedImage.title}</p>
            {selectedImage.description && (
              <p className="text-white/70 text-sm">{selectedImage.description}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Desktop Profile Page
function ProfilePageDesktop({ familyInfo, stats, onAdminClick }: { familyInfo: FamilyInfo; stats: { totalMembers: number; generations: number }; onAdminClick: () => void }) {
  return (
    <div>
      {/* Mobile view */}
      <div className="md:hidden">
        <ProfilePage familyInfo={familyInfo} stats={stats} />
      </div>

      {/* Desktop view - wider layout */}
      <div className="hidden md:block">
        <ProfilePageDesktopContent familyInfo={familyInfo} stats={stats} onAdminClick={onAdminClick} />
      </div>
    </div>
  );
}

function ProfilePageDesktopContent({ familyInfo, stats, onAdminClick }: { familyInfo: FamilyInfo; stats: { totalMembers: number; generations: number }; onAdminClick: () => void }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Left Column - Family Info */}
      <div className="space-y-6">
        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-8 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('/logo.svg')] bg-repeat opacity-5" />
          <div className="relative z-10 flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center">
              <TreeDeciduous className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{familyInfo.familyName}</h2>
              <p className="text-emerald-100">{stats.totalMembers} anggota • {stats.generations} generasi</p>
            </div>
          </div>
        </motion.div>

        {/* Description */}
        {familyInfo.description && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-muted rounded-xl p-6"
          >
            <h3 className="font-semibold mb-3">Tentang Keluarga</h3>
            <p className="text-muted-foreground leading-relaxed">{familyInfo.description}</p>
          </motion.div>
        )}

        {/* History */}
        {familyInfo.history && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-muted rounded-xl p-6"
          >
            <h3 className="font-semibold mb-3">Sejarah Keluarga</h3>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{familyInfo.history}</p>
          </motion.div>
        )}
      </div>

      {/* Right Column - Vision, Mission, Values */}
      <div className="space-y-6">
        {/* Vision */}
        {familyInfo.vision && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950 dark:to-blue-950 border border-sky-200 dark:border-sky-800 rounded-xl p-6"
          >
            <h3 className="font-semibold mb-3">Visi</h3>
            <p className="text-muted-foreground leading-relaxed">{familyInfo.vision}</p>
          </motion.div>
        )}

        {/* Mission */}
        {familyInfo.mission && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border border-amber-200 dark:border-amber-800 rounded-xl p-6"
          >
            <h3 className="font-semibold mb-3">Misi</h3>
            <p className="text-muted-foreground leading-relaxed">{familyInfo.mission}</p>
          </motion.div>
        )}

        {/* Family Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-muted rounded-xl p-6"
        >
          <h3 className="font-semibold mb-4">Nilai-Nilai Keluarga</h3>
          <div className="grid grid-cols-2 gap-3">
            {['Silaturahmi', 'Kasih Sayang', 'Gotong Royong', 'Toleransi', 'Keadilan', 'Kesetiawanan'].map((value, i) => (
              <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-background">
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                  <TreeDeciduous className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-sm font-medium">{value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Admin Access */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button onClick={onAdminClick} className="w-full gap-2">
            <Settings className="w-4 h-4" />
            Buka Panel Admin
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

// Events Modal - Shows family event agenda
function EventsModal({ events, open, onClose }: { events: FamilyEvent[]; open: boolean; onClose: () => void }) {
  const [selectedEvent, setSelectedEvent] = useState<FamilyEvent | null>(null);

  if (!open) return null;

  const handleClose = () => {
    setSelectedEvent(null);
    onClose();
  };

  const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const isUpcoming = (dateStr: string) => {
    try {
      return new Date(dateStr) >= new Date(new Date().toISOString().split('T')[0]);
    } catch {
      return false;
    }
  };

  const getMapsUrl = (location: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={handleClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-background rounded-2xl w-full max-w-lg max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 relative flex-shrink-0">
          <div className="absolute inset-0 bg-[url('/logo.svg')] bg-repeat opacity-5" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {selectedEvent ? (
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <motion.span initial={{ x: 2 }} animate={{ x: 0 }}>←</motion.span>
                </button>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold">{selectedEvent ? 'Detail Acara' : 'Agenda Acara'}</h2>
                <p className="text-emerald-100 text-sm">
                  {selectedEvent ? formatDate(selectedEvent.date) : `${events.length} acara keluarga`}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Container */}
        <div className="overflow-y-auto flex-1">
          <AnimatePresence mode="wait">
            {selectedEvent ? (
              <motion.div
                key="detail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 space-y-6"
              >
                {/* Large Image */}
                {selectedEvent.image && (
                  <div className="w-full aspect-video rounded-2xl overflow-hidden border">
                    <img
                      src={selectedEvent.image}
                      alt={selectedEvent.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">{selectedEvent.title}</h3>
                    <p className="text-muted-foreground mt-1 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {formatDate(selectedEvent.date)}
                    </p>
                  </div>

                  {selectedEvent.location && (
                    <a
                      href={getMapsUrl(selectedEvent.location)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-0.5">Lokasi Acara</p>
                        <p className="text-sm font-medium truncate group-hover:text-emerald-600 transition-colors">
                          {selectedEvent.location}
                        </p>
                      </div>
                      <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs text-emerald-600">Buka Map ↗</span>
                      </div>
                    </a>
                  )}

                  {selectedEvent.description && (
                    <div className="bg-muted/30 rounded-xl p-6 border border-border/50">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Keterangan</h4>
                      <p className="text-foreground/90 whitespace-pre-line leading-relaxed">
                        {selectedEvent.description}
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  <Button variant="outline" className="w-full py-6 rounded-xl" onClick={() => setSelectedEvent(null)}>
                    Kembali ke Daftar
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-4 space-y-3"
              >
                {sortedEvents.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Belum ada acara terjadwal</p>
                  </div>
                ) : (
                  sortedEvents.map((event, index) => {
                    const upcoming = isUpcoming(event.date);
                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08 }}
                        onClick={() => setSelectedEvent(event)}
                        className={`rounded-xl border overflow-hidden cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${upcoming
                          ? 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 border-emerald-200 dark:border-emerald-800'
                          : 'bg-muted/50 border-border'
                          }`}
                      >
                        {/* Event Image */}
                        {event.image && (
                          <div className="w-full h-40 overflow-hidden">
                            <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                          </div>
                        )}

                        <div className="p-4">
                          <div className="flex items-start gap-3">
                            {/* Date Badge */}
                            <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center ${upcoming
                              ? 'bg-emerald-500 text-white'
                              : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                              }`}>
                              <span className="text-[10px] font-medium uppercase leading-none">
                                {(() => {
                                  try { return new Date(event.date).toLocaleDateString('id-ID', { month: 'short' }); }
                                  catch { return ''; }
                                })()}
                              </span>
                              <span className="text-lg font-bold leading-none">
                                {(() => {
                                  try { return new Date(event.date).getDate(); }
                                  catch { return '?'; }
                                })()}
                              </span>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold truncate">{event.title}</h3>
                                {upcoming && (
                                  <span className="flex-shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                                    Akan Datang
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-muted-foreground">{formatDate(event.date)}</p>

                              {event.location && (
                                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                  <MapPin className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">{event.location}</span>
                                </p>
                              )}

                              {event.description && (
                                <p className="text-sm text-foreground/80 mt-2 line-clamp-2">{event.description}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
