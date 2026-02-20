'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Users, 
  TreeDeciduous, 
  Calendar, 
  Heart, 
  MapPin, 
  Clock,
  ChevronRight 
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

interface FamilyStats {
  totalMembers: number;
  generations: number;
  maleCount: number;
  femaleCount: number;
}

interface FamilyEvent {
  id: string;
  title: string;
  date: string;
  location: string;
}

interface HomePageProps {
  stats: FamilyStats;
  upcomingEvents: FamilyEvent[];
}

export default function HomePage({ stats, upcomingEvents }: HomePageProps) {
  const { setActiveTab } = useAppStore();

  const quickActions = [
    { 
      icon: <TreeDeciduous className="w-6 h-6" />, 
      label: 'Lihat Pohon Keluarga', 
      tab: 'tree' as const,
      color: 'bg-emerald-500' 
    },
    { 
      icon: <Users className="w-6 h-6" />, 
      label: 'Daftar Anggota', 
      tab: 'members' as const,
      color: 'bg-amber-500' 
    },
    { 
      icon: <Heart className="w-6 h-6" />, 
      label: 'Galeri Foto', 
      tab: 'gallery' as const,
      color: 'bg-rose-500' 
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-0 overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('/logo.svg')] bg-repeat opacity-5" />
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <TreeDeciduous className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Bani Mucksin</h1>
                <p className="text-emerald-100">Keluarga Supiyah</p>
              </div>
            </div>
            <p className="text-emerald-100 text-sm leading-relaxed">
              Silsilah keluarga besar Bani Mucksin / Supiyah. Menjalin tali silaturahmi 
              antar generasi dengan penuh cinta dan kasih sayang.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-emerald-600 dark:text-emerald-400" />
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{stats.totalMembers}</p>
            <p className="text-xs text-muted-foreground">Anggota</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border-amber-200 dark:border-amber-800">
          <CardContent className="p-4 text-center">
            <TreeDeciduous className="w-6 h-6 mx-auto mb-2 text-amber-600 dark:text-amber-400" />
            <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{stats.generations}</p>
            <p className="text-xs text-muted-foreground">Generasi</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950 dark:to-blue-950 border-sky-200 dark:border-sky-800">
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-sky-600 dark:text-sky-400" />
            <p className="text-2xl font-bold text-sky-700 dark:text-sky-300">{stats.maleCount}</p>
            <p className="text-xs text-muted-foreground">Laki-laki</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950 dark:to-pink-950 border-rose-200 dark:border-rose-800">
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-rose-600 dark:text-rose-400" />
            <p className="text-2xl font-bold text-rose-700 dark:text-rose-300">{stats.femaleCount}</p>
            <p className="text-xs text-muted-foreground">Perempuan</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-lg font-semibold mb-3">Aksi Cepat</h2>
        <div className="space-y-2">
          {quickActions.map((action, index) => (
            <Card 
              key={index}
              className="cursor-pointer hover:shadow-md transition-all duration-200 active:scale-[0.98]"
              onClick={() => setActiveTab(action.tab)}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${action.color} text-white flex items-center justify-center`}>
                  {action.icon}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{action.label}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-lg font-semibold mb-3">Acara Mendatang</h2>
          <div className="space-y-2">
            {upcomingEvents.map((event, index) => (
              <Card key={event.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900 flex flex-col items-center justify-center">
                      <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                        {new Date(event.date).getDate()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{event.title}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Clock className="w-3 h-3" />
                        <span>{event.date}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Motivational Quote */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-6 text-center">
            <Heart className="w-8 h-8 mx-auto mb-3 text-emerald-600 dark:text-emerald-400" />
            <blockquote className="text-sm italic text-muted-foreground">
              "Sesungguhnya silaturahmi itu menambah kecintaan dalam keluarga, 
              menambah rezeki, dan memperpanjang umur."
            </blockquote>
            <p className="text-xs text-muted-foreground mt-2">— Pepatah</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
