'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Image as ImageIcon, 
  Calendar,
  Heart,
  Users,
  PartyPopper,
  MapPin,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';

interface GalleryItem {
  id: string;
  title: string;
  description?: string | null;
  imageUrl: string;
  category: string;
  date?: string | null;
}

interface GalleryPageProps {
  gallery: GalleryItem[];
}

const categoryConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  family: { label: 'Keluarga', icon: <Users className="w-4 h-4" />, color: 'bg-emerald-500' },
  event: { label: 'Acara', icon: <PartyPopper className="w-4 h-4" />, color: 'bg-amber-500' },
  gathering: { label: 'Silaturahmi', icon: <Heart className="w-4 h-4" />, color: 'bg-rose-500' },
};

export default function GalleryPage({ gallery }: GalleryPageProps) {
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = ['all', ...new Set(gallery.map(g => g.category))];

  const filteredGallery = activeCategory === 'all' 
    ? gallery 
    : gallery.filter(g => g.category === activeCategory);

  const currentIndex = selectedImage 
    ? filteredGallery.findIndex(g => g.id === selectedImage.id) 
    : -1;

  const navigateImage = (direction: 'prev' | 'next') => {
    if (!selectedImage) return;
    const newIndex = direction === 'prev' 
      ? (currentIndex - 1 + filteredGallery.length) % filteredGallery.length
      : (currentIndex + 1) % filteredGallery.length;
    setSelectedImage(filteredGallery[newIndex]);
  };

  if (gallery.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
          <ImageIcon className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold mb-2">Belum Ada Foto</h2>
        <p className="text-muted-foreground text-sm">
          Galeri foto keluarga masih kosong
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-xl font-bold">Galeri Keluarga</h1>
        <p className="text-sm text-muted-foreground">
          {filteredGallery.length} foto
        </p>
      </motion.div>

      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4"
      >
        {categories.map(cat => (
          <Button
            key={cat}
            variant={activeCategory === cat ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveCategory(cat)}
            className="shrink-0"
          >
            {cat === 'all' ? (
              'Semua'
            ) : (
              <>
                {categoryConfig[cat]?.icon}
                <span className="ml-1">{categoryConfig[cat]?.label || cat}</span>
              </>
            )}
          </Button>
        ))}
      </motion.div>

      {/* Gallery Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 sm:grid-cols-3 gap-3"
      >
        {filteredGallery.map((item, index) => {
          const config = categoryConfig[item.category] || categoryConfig.family;
          
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card 
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
                onClick={() => setSelectedImage(item)}
              >
                <div className="aspect-square relative bg-muted">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge className={cn("text-white text-xs", config.color)}>
                      {config.icon}
                      <span className="ml-1">{config.label}</span>
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-3">
                  <p className="font-medium text-sm truncate">{item.title}</p>
                  {item.date && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>{item.date}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Image Preview Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-3xl p-0 bg-black/95 border-none">
          {selectedImage && (
            <div className="relative">
              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-10 text-white bg-black/50 hover:bg-black/70"
                onClick={() => setSelectedImage(null)}
              >
                <X className="w-5 h-5" />
              </Button>

              {/* Navigation Buttons */}
              {filteredGallery.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white bg-black/50 hover:bg-black/70"
                    onClick={() => navigateImage('prev')}
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white bg-black/50 hover:bg-black/70"
                    onClick={() => navigateImage('next')}
                  >
                    <ChevronRight className="w-6 h-6" />
                  </Button>
                </>
              )}

              {/* Image */}
              <img
                src={selectedImage.imageUrl}
                alt={selectedImage.title}
                className="w-full max-h-[70vh] object-contain"
              />

              {/* Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <h3 className="text-white text-lg font-semibold">{selectedImage.title}</h3>
                {selectedImage.description && (
                  <p className="text-white/80 text-sm mt-1">{selectedImage.description}</p>
                )}
                <div className="flex items-center gap-4 mt-2 text-white/60 text-sm">
                  {selectedImage.date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{selectedImage.date}</span>
                    </div>
                  )}
                  <Badge className={cn(
                    "text-white text-xs",
                    categoryConfig[selectedImage.category]?.color || "bg-gray-500"
                  )}>
                    {categoryConfig[selectedImage.category]?.label || selectedImage.category}
                  </Badge>
                </div>
              </div>

              {/* Counter */}
              <div className="absolute top-4 left-4 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
                {currentIndex + 1} / {filteredGallery.length}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
