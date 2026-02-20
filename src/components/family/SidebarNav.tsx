'use client';

import { Home, Users, TreeDeciduous, Image, UserCircle, Heart, Menu, X, Info } from 'lucide-react';
import { useAppStore, TabType } from '@/store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const navItems: { id: TabType; label: string; icon: React.ReactNode; description: string }[] = [
  { id: 'home', label: 'Beranda', icon: <Home className="w-5 h-5" />, description: 'Dashboard keluarga' },
  { id: 'tree', label: 'Pohon Keluarga', icon: <TreeDeciduous className="w-5 h-5" />, description: 'Visualisasi silsilah' },
  { id: 'members', label: 'Anggota', icon: <Users className="w-5 h-5" />, description: 'Daftar keluarga' },
  { id: 'gallery', label: 'Galeri', icon: <Image className="w-5 h-5" />, description: 'Album foto' },
  { id: 'profile', label: 'Profil', icon: <UserCircle className="w-5 h-5" />, description: 'Tentang keluarga' },
];

export default function SidebarNav() {
  const { activeTab, setActiveTab } = useAppStore();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col h-screen sticky top-0 bg-gradient-to-b from-emerald-700 to-teal-800 text-white transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <TreeDeciduous className="w-6 h-6" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden"
              >
                <h1 className="text-lg font-bold whitespace-nowrap">Bani Mucksin</h1>
                <p className="text-xs text-emerald-200 whitespace-nowrap">Keluarga Supiyah</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg hidden lg:flex"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <Menu className="w-3 h-3" /> : <X className="w-3 h-3" />}
      </Button>

      {/* Navigation Items */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative",
                isActive
                  ? "bg-white/20 text-white"
                  : "text-emerald-100 hover:bg-white/10 hover:text-white"
              )}
            >
              <span className="shrink-0">{item.icon}</span>
              <AnimatePresence>
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="overflow-hidden text-left"
                  >
                    <p className="font-medium whitespace-nowrap">{item.label}</p>
                    <p className="text-xs text-emerald-200 whitespace-nowrap">{item.description}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-sm text-emerald-200"
            >
              <Heart className="w-4 h-4 text-rose-400" />
              <span>Silaturahmi itu indah</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
}
