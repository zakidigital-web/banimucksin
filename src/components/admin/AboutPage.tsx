'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TreeDeciduous,
  Heart,
  Code,
  Database,
  Shield,
  Smartphone,
  Globe,
  Github,
  Calendar,
  Users,
  Sparkles
} from 'lucide-react';

export default function AboutPage() {
  const features = [
    {
      icon: <TreeDeciduous className="w-5 h-5" />,
      title: 'Pohon Keluarga Interaktif',
      description: 'Visualisasi silsilah keluarga dengan tampilan hierarkis yang mudah dipahami'
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: 'Manajemen Anggota',
      description: 'Kelola data anggota keluarga lengkap dengan detail profil'
    },
    {
      icon: <Heart className="w-5 h-5" />,
      title: 'Galeri Foto',
      description: 'Album foto keluarga dengan kategori dan lightbox preview'
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      title: 'Acara Keluarga',
      description: 'Jadwal acara dan kegiatan keluarga seperti reuni dan halal bihalal'
    },
    {
      icon: <Smartphone className="w-5 h-5" />,
      title: 'Responsif',
      description: 'Tampilan optimal di semua perangkat: mobile, tablet, dan desktop'
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: 'Admin Panel',
      description: 'Panel admin lengkap dengan sistem login dan backup data'
    },
  ];

  const techStack = [
    { name: 'Next.js 16', category: 'Framework' },
    { name: 'TypeScript', category: 'Language' },
    { name: 'Tailwind CSS', category: 'Styling' },
    { name: 'shadcn/ui', category: 'Components' },
    { name: 'Prisma', category: 'Database' },
    { name: 'SQLite', category: 'Database' },
    { name: 'Framer Motion', category: 'Animation' },
    { name: 'Zustand', category: 'State' },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4">
            <TreeDeciduous className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Silsilah Keluarga Digital</h1>
          <p className="text-muted-foreground mt-1">Bani Mucksin / Supiyah</p>
          <Badge variant="secondary" className="mt-2">Versi 1.0.0</Badge>
        </motion.div>
      </div>

      {/* Description */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground leading-relaxed">
              Aplikasi web untuk mendokumentasikan dan menampilkan silsilah keluarga
              Bani Mucksin / Supiyah. Dibangun dengan teknologi modern untuk memberikan
              pengalaman pengguna yang terbaik dalam menjalin tali silaturahmi antar generasi.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Fitur Utama
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5 text-sky-500" />
              Teknologi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {techStack.map((tech, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tech.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Creator Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500 flex items-center justify-center">
                <Globe className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Dikembangkan oleh Zakidigital Dev</h3>
                <p className="text-sm text-muted-foreground">
                  Untuk keluarga besar Bani Mucksin / Supiyah
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  © 2026 - Silsilah Keluarga Digital
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Database Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-violet-500" />
              Informasi Database
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Database Engine</span>
              <span className="font-medium">SQLite</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ORM</span>
              <span className="font-medium">Prisma</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Backup Format</span>
              <span className="font-medium">JSON</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Session Storage</span>
              <span className="font-medium">HTTP Cookies</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quote */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center"
      >
        <Card className="bg-muted/50">
          <CardContent className="p-6">
            <Heart className="w-8 h-8 mx-auto mb-3 text-rose-500" />
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
