'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Heart,
  Target,
  Eye,
  BookOpen,
  Calendar,
  Users,
  MapPin,
  Phone,
  Mail,
  Clock,
  TreeDeciduous
} from 'lucide-react';

interface FamilyInfo {
  familyName: string;
  description?: string | null;
  history?: string | null;
  vision?: string | null;
  mission?: string | null;
  logo?: string | null;
}

interface FamilyStats {
  totalMembers: number;
  generations: number;
}

interface ProfilePageProps {
  familyInfo: FamilyInfo;
  stats: FamilyStats;
}

export default function ProfilePage({ familyInfo, stats }: ProfilePageProps) {
  return (
    <div className="space-y-6">
      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-0 overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('/logo.svg')] bg-repeat opacity-5" />
          <CardContent className="p-6 relative z-10">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mb-4 border-4 border-white/30">
                <TreeDeciduous className="w-12 h-12" />
              </div>
              <h1 className="text-2xl font-bold">{familyInfo.familyName}</h1>
              <p className="text-emerald-100 mt-1">Keluarga Besar</p>
              
              <div className="flex items-center gap-6 mt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold">{stats.totalMembers}</p>
                  <p className="text-xs text-emerald-100">Anggota</p>
                </div>
                <div className="w-px h-10 bg-white/30" />
                <div className="text-center">
                  <p className="text-3xl font-bold">{stats.generations}</p>
                  <p className="text-xs text-emerald-100">Generasi</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Description */}
      {familyInfo.description && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" />
                Tentang Keluarga
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {familyInfo.description}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* History */}
      {familyInfo.history && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-500" />
                Sejarah Keluarga
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {familyInfo.history}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Vision & Mission */}
      <div className="grid sm:grid-cols-2 gap-4">
        {familyInfo.vision && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="h-full bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950 dark:to-blue-950 border-sky-200 dark:border-sky-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="w-5 h-5 text-sky-600" />
                  Visi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {familyInfo.vision}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {familyInfo.mission && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="h-full bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border-amber-200 dark:border-amber-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="w-5 h-5 text-amber-600" />
                  Misi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {familyInfo.mission}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Family Values */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" />
              Nilai-Nilai Keluarga
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Silaturahmi', icon: <Users className="w-4 h-4" /> },
                { label: 'Kasih Sayang', icon: <Heart className="w-4 h-4" /> },
                { label: 'Gotong Royong', icon: <Users className="w-4 h-4" /> },
                { label: 'Toleransi', icon: <Heart className="w-4 h-4" /> },
                { label: 'Keadilan', icon: <Heart className="w-4 h-4" /> },
                { label: 'Kesetiawanan', icon: <Heart className="w-4 h-4" /> },
              ].map((value, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 p-3 rounded-lg bg-muted"
                >
                  <span className="text-emerald-600">{value.icon}</span>
                  <span className="text-sm font-medium">{value.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Contact Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Kontak & Informasi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Dibuat</p>
                <p className="font-medium">2024</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Terakhir Diperbarui</p>
                <p className="font-medium">{new Date().toLocaleDateString('id-ID')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="text-center text-sm text-muted-foreground"
      >
        <p>Dibuat dengan ❤️ untuk keluarga besar Bani Mucksin</p>
        <p className="text-xs mt-1">© 2024 - Silsilah Keluarga Digital</p>
      </motion.div>
    </div>
  );
}
