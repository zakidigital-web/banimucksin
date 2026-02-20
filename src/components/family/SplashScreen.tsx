'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, X, Clock } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

interface FamilyEvent {
  id: string;
  title: string;
  description?: string | null;
  date: string;
  location?: string | null;
  image?: string | null;
  showSplash: boolean;
}

interface SplashScreenProps {
  events: FamilyEvent[];
}

export default function SplashScreen({ events }: SplashScreenProps) {
  const [visible, setVisible] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<FamilyEvent | null>(null);
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    // Prevent multiple checks
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    // Check if there's an upcoming event that should show splash
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingEvent = events.find(event => {
      if (!event.showSplash) return false;
      
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      
      // Show splash if event date is today or in the future
      return eventDate >= today;
    });

    if (upcomingEvent) {
      // Check if user has already dismissed this splash today
      const dismissedKey = `splash_dismissed_${upcomingEvent.id}_${today.toDateString()}`;
      const wasDismissed = localStorage.getItem(dismissedKey);
      
      if (!wasDismissed) {
        // Use setTimeout to defer setState to next tick
        setTimeout(() => {
          setCurrentEvent(upcomingEvent);
          setVisible(true);
        }, 0);
      }
    }
  }, [events]);

  const handleClose = () => {
    setVisible(false);
    
    // Remember that user dismissed this splash today
    if (currentEvent) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dismissedKey = `splash_dismissed_${currentEvent.id}_${today.toDateString()}`;
      localStorage.setItem(dismissedKey, 'true');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDaysUntil = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(dateStr);
    eventDate.setHours(0, 0, 0, 0);
    
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hari ini!';
    if (diffDays === 1) return 'Besok!';
    return `${diffDays} hari lagi`;
  };

  if (!currentEvent) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-background rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Image */}
            {currentEvent.image && (
              <div className="relative h-56 w-full">
                <img
                  src={currentEvent.image}
                  alt={currentEvent.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
              </div>
            )}

            {/* Content */}
            <div className="p-6">
              {/* Days Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-4">
                <Clock className="w-4 h-4" />
                {getDaysUntil(currentEvent.date)}
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold mb-2">{currentEvent.title}</h2>

              {/* Date */}
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(currentEvent.date)}</span>
              </div>

              {/* Location */}
              {currentEvent.location && (
                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <MapPin className="w-4 h-4" />
                  <span>{currentEvent.location}</span>
                </div>
              )}

              {/* Description */}
              {currentEvent.description && (
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {currentEvent.description}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button onClick={handleClose} className="flex-1">
                  Lihat Aplikasi
                </Button>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-muted/50 text-center">
              <p className="text-xs text-muted-foreground">
                Keluarga Besar Bani Mucksin / Supiyah
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
