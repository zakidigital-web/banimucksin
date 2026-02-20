'use client';

import { Home, Users, TreeDeciduous, Image, UserCircle, Info } from 'lucide-react';
import { useAppStore, TabType } from '@/store/useAppStore';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const navItems: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'home', label: 'Beranda', icon: <Home className="w-5 h-5" /> },
  { id: 'tree', label: 'Pohon', icon: <TreeDeciduous className="w-5 h-5" /> },
  { id: 'members', label: 'Anggota', icon: <Users className="w-5 h-5" /> },
  { id: 'gallery', label: 'Galeri', icon: <Image className="w-5 h-5" /> },
  { id: 'profile', label: 'Profil', icon: <UserCircle className="w-5 h-5" /> },
];

export default function BottomNav() {
  const { activeTab, setActiveTab } = useAppStore();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t border-border z-50 safe-area-bottom shadow-[0_-1px_10px_rgba(0,0,0,0.05)]">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between px-2 py-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 py-1 rounded-2xl transition-all duration-300 relative",
                  isActive ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className="relative">
                  {isActive && (
                    <motion.div
                      layoutId="activeTabGlow"
                      className="absolute -inset-2 bg-emerald-500/15 rounded-full blur-sm"
                      initial={false}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <motion.div
                    animate={{
                      scale: isActive ? 1.2 : 1,
                      y: isActive ? -2 : 0
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="relative z-10"
                  >
                    {item.icon}
                  </motion.div>
                </div>
                <span className={cn(
                  "text-[10px] mt-1.5 font-semibold relative z-10 transition-all duration-300",
                  isActive ? "opacity-100 translate-y-0" : "opacity-70"
                )}>
                  {item.label}
                </span>

                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute bottom-0 w-1 h-1 bg-emerald-500 rounded-full"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
