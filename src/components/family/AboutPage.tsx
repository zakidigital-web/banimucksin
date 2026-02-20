'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TreeDeciduous,
  Heart,
  Code,
  Database,
  Shield,
  Smartphone,
  Globe,
  Calendar,
  Users,
  Sparkles,
  Zap,
  Palette,
  Settings,
  ArrowRight
} from 'lucide-react';

interface AboutPageProps {
  onAdminClick?: () => void;
}

export default function AboutPage({ onAdminClick }: AboutPageProps) {
  const features = [
    {
      icon: <TreeDeciduous className="w-5 h-5" />,
      title: 'Pohon Keluarga Interaktif',
      description: 'Visualisasi silsilah keluarga dengan tampilan hierarkis yang mudah dipahami',
      color: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400'
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: 'Manajemen Anggota',
      description: 'Kelola data anggota keluarga lengkap dengan detail profil',
      color: 'bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400'
    },
    {
      icon: <Heart className="w-5 h-5" />,
      title: 'Galeri Foto',
      description: 'Album foto keluarga dengan kategori dan lightbox preview',
      color: 'bg-rose-100 dark:bg-rose-900 text-rose-600 dark:text-rose-400'
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      title: 'Acara Keluarga',
      description: 'Jadwal acara dan kegiatan keluarga seperti reuni dan halal bihalal',
      color: 'bg-sky-100 dark:bg-sky-900 text-sky-600 dark:text-sky-400'
    },
    {
      icon: <Smartphone className="w-5 h-5" />,
      title: 'Responsif',
      description: 'Tampilan optimal di semua perangkat: mobile, tablet, dan desktop',
      color: 'bg-violet-100 dark:bg-violet-900 text-violet-600 dark:text-violet-400'
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: 'Admin Panel',
      description: 'Panel admin lengkap dengan sistem login dan backup data',
      color: 'bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-400'
    },
  ];

  const techStack = [
    { name: 'Next.js 16', category: 'Framework', color: 'bg-gray-800 text-white' },
    { name: 'TypeScript', category: 'Language', color: 'bg-sky-600 text-white' },
    { name: 'Tailwind CSS', category: 'Styling', color: 'bg-cyan-500 text-white' },
    { name: 'shadcn/ui', category: 'Components', color: 'bg-gray-700 text-white' },
    { name: 'Prisma', category: 'Database', color: 'bg-slate-800 text-white' },
    { name: 'SQLite', category: 'Database', color: 'bg-sky-500 text-white' },
    { name: 'Framer Motion', category: 'Animation', color: 'bg-purple-600 text-white' },
    { name: 'Zustand', category: 'State', color: 'bg-amber-600 text-white' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Hero Section */}
      <motion.div variants={itemVariants} className="text-center">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
          <TreeDeciduous className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold">Silsilah Keluarga Digital</h1>
        <p className="text-muted-foreground mt-1">Bani Mucksin / Supiyah</p>
        <div className="flex items-center justify-center gap-2 mt-3">
          <Badge variant="secondary" className="text-xs">Versi 1.0.0</Badge>
          <Badge className="bg-emerald-600 text-xs">Aktif</Badge>
        </div>
      </motion.div>

      {/* Description Card */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground leading-relaxed">
              Aplikasi web untuk mendokumentasikan dan menampilkan silsilah keluarga
              <span className="font-semibold text-emerald-700 dark:text-emerald-300"> Bani Mucksin / Supiyah</span>.
              Dibangun dengan teknologi modern untuk memberikan pengalaman pengguna yang terbaik
              dalam menjalin tali silaturahmi antar generasi.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Features Grid */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Fitur Utama
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-xl ${feature.color} flex items-center justify-center shrink-0`}>
                    {feature.icon}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{feature.title}</p>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tech Stack */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Code className="w-5 h-5 text-sky-500" />
              Teknologi yang Digunakan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {techStack.map((tech, index) => (
                <Badge key={index} className={`${tech.color} text-xs font-medium`}>
                  {tech.name}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Dibangun dengan stack teknologi modern yang handal dan performa tinggi untuk pengalaman pengguna terbaik.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Development Info */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="w-5 h-5 text-amber-500" />
              Informasi Pengembangan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-2 mb-1">
                  <Palette className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs text-muted-foreground">UI/UX Design</span>
                </div>
                <p className="text-sm font-medium">Modern & Clean</p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-2 mb-1">
                  <Smartphone className="w-4 h-4 text-amber-500" />
                  <span className="text-xs text-muted-foreground">Responsive</span>
                </div>
                <p className="text-sm font-medium">Mobile First</p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-2 mb-1">
                  <Database className="w-4 h-4 text-sky-500" />
                  <span className="text-xs text-muted-foreground">Database</span>
                </div>
                <p className="text-sm font-medium">SQLite + Prisma</p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4 text-rose-500" />
                  <span className="text-xs text-muted-foreground">Security</span>
                </div>
                <p className="text-sm font-medium">Session Auth</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Creator Section */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                <Globe className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-emerald-50 text-sm mt-1">
                  Dikembangkan oleh Zakidigital Dev
                </p>
                <p className="text-emerald-200 text-xs mt-1">
                  © 2026 - Silsilah Keluarga Digital
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Admin Access */}
      {onAdminClick && (
        <motion.div variants={itemVariants}>
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Panel Admin</p>
                    <p className="text-xs text-muted-foreground">Kelola data keluarga</p>
                  </div>
                </div>
                <Button onClick={onAdminClick} size="sm" className="gap-2">
                  Buka Admin
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quote */}
      <motion.div variants={itemVariants} className="text-center pb-4">
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="p-6">
            <Heart className="w-10 h-10 mx-auto mb-3 text-rose-500" />
            <blockquote className="text-sm italic text-muted-foreground leading-relaxed">
              "Sesungguhnya silaturahmi itu menambah kecintaan dalam keluarga,
              menambah rezeki, dan memperpanjang umur."
            </blockquote>
            <p className="text-xs text-muted-foreground mt-3">— Pepatah</p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
