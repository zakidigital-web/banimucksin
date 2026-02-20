'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ChevronDown, 
  ChevronUp, 
  User, 
  Heart,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Move,
  GripHorizontal
} from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

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
  children: FamilyMember[];
  spouse?: FamilyMember | null;
}

interface TreePageProps {
  members: FamilyMember[];
  rootMembers: FamilyMember[];
}

function FamilyNode({ member, level = 0, isLast = true }: { 
  member: FamilyMember; 
  level?: number;
  isLast?: boolean;
}) {
  const [expanded, setExpanded] = useState(level < 2);
  const hasChildren = member.children && member.children.length > 0;
  
  const initials = member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const isMale = member.gender === 'L';

  return (
    <div className="flex flex-col items-center">
      {/* Member Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: level * 0.1 }}
        className="relative"
      >
        {/* Connection line to parent */}
        {level > 0 && (
          <div className="absolute -top-4 left-1/2 w-0.5 h-4 bg-border" />
        )}
        
        <Card className={cn(
          "w-36 sm:w-44 cursor-pointer transition-all duration-200 hover:shadow-lg relative overflow-hidden",
          isMale 
            ? "bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950 dark:to-blue-950 border-sky-200 dark:border-sky-800" 
            : "bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950 dark:to-pink-950 border-rose-200 dark:border-rose-800"
        )}>
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                <AvatarImage src={member.photo || undefined} />
                <AvatarFallback className={cn(
                  "text-white text-xs font-medium",
                  isMale ? "bg-sky-500" : "bg-rose-500"
                )}>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{member.name}</p>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className={cn(
                    "text-[10px] px-1.5 py-0",
                    isMale ? "border-sky-300 text-sky-700 dark:border-sky-700 dark:text-sky-300" 
                           : "border-rose-300 text-rose-700 dark:border-rose-700 dark:text-rose-300"
                  )}>
                    {isMale ? 'L' : 'P'}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    G{member.generation}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
          
          {/* Expand button for nodes with children */}
          {hasChildren && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-background border shadow-sm z-10"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
            >
              {expanded ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </Button>
          )}
        </Card>

        {/* Spouse Card */}
        {member.spouse && (
          <div className="flex items-start mt-2 justify-center">
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3 text-rose-500" />
            </div>
            <Card className={cn(
              "ml-2 w-28 sm:w-32 cursor-pointer transition-all duration-200 hover:shadow-lg",
              member.spouse.gender === 'L'
                ? "bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950 dark:to-blue-950 border-sky-200 dark:border-sky-800" 
                : "bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950 dark:to-pink-950 border-rose-200 dark:border-rose-800"
            )}>
              <CardContent className="p-2">
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6 border border-white shadow-sm">
                    <AvatarImage src={member.spouse.photo || undefined} />
                    <AvatarFallback className={cn(
                      "text-white text-[10px] font-medium",
                      member.spouse.gender === 'L' ? "bg-sky-500" : "bg-rose-500"
                    )}>
                      {member.spouse.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-xs font-medium truncate">{member.spouse.name}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </motion.div>

      {/* Children */}
      {hasChildren && expanded && (
        <div className="relative mt-6">
          {/* Horizontal line */}
          <div className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-border" />
          {/* Vertical lines to children */}
          <div className="flex gap-4 sm:gap-6 justify-center flex-wrap">
            {member.children.map((child, index) => (
              <div key={child.id} className="relative pt-4">
                <div className="absolute top-0 left-1/2 w-0.5 h-4 bg-border" />
                <FamilyNode 
                  member={child} 
                  level={level + 1}
                  isLast={index === member.children.length - 1}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TreePage({ members, rootMembers }: TreePageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.8);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Fit to screen - center on first generation at top
  const fitToScreen = useCallback(() => {
    if (!containerRef.current || !contentRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const contentWidth = contentRef.current.scrollWidth;
    const contentHeight = contentRef.current.scrollHeight;
    
    // Calculate optimal zoom to fit the tree
    const horizontalZoom = (containerRect.width - 60) / contentWidth;
    const verticalZoom = (containerRect.height - 60) / contentHeight;
    const optimalZoom = Math.min(horizontalZoom, verticalZoom, 1);
    const finalZoom = Math.max(0.3, Math.min(1.5, optimalZoom));
    
    setZoom(finalZoom);
    
    // Center horizontally, position at top with some padding
    const scaledWidth = contentWidth * finalZoom;
    const centerX = (containerRect.width - scaledWidth) / 2;
    
    setPan({ 
      x: centerX, 
      y: 30 // Small padding from top to show the root/first generation
    });
  }, []);

  // Reset view
  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Zoom controls
  const handleZoomIn = () => setZoom(Math.min(2, zoom + 0.1));
  const handleZoomOut = () => setZoom(Math.max(0.3, zoom - 0.1));

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      setZoom(prev => Math.min(2, Math.max(0.3, prev + delta)));
    }
  };

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ 
        x: e.touches[0].clientX - pan.x, 
        y: e.touches[0].clientY - pan.y 
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches.length === 1) {
      setPan({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Auto fit on first load
  useEffect(() => {
    const timer = setTimeout(fitToScreen, 300);
    return () => clearTimeout(timer);
  }, [fitToScreen, rootMembers]);

  // Refit when window resizes
  useEffect(() => {
    const handleResize = () => {
      fitToScreen();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [fitToScreen]);

  if (rootMembers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
          <User className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold mb-2">Belum Ada Data</h2>
        <p className="text-muted-foreground text-sm">
          Silakan tambahkan anggota keluarga terlebih dahulu
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Controls Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="md:hidden">
          <h1 className="text-xl font-bold">Pohon Keluarga</h1>
          <p className="text-sm text-muted-foreground">
            Visualisasi silsilah keluarga
          </p>
        </div>
        
        {/* Zoom Controls */}
        <div className="flex items-center gap-1 sm:gap-2 ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            className="gap-1"
          >
            <ZoomOut className="w-4 h-4" />
            <span className="hidden sm:inline">Perkecil</span>
          </Button>
          
          <div className="flex items-center gap-1 bg-muted rounded-lg px-2 py-1">
            <span className="text-sm font-medium w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            className="gap-1"
          >
            <ZoomIn className="w-4 h-4" />
            <span className="hidden sm:inline">Perbesar</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={fitToScreen}
            className="gap-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 dark:hover:bg-emerald-900 border-emerald-200 dark:border-emerald-800"
            title="Sesuaikan ke layar - fokus ke generasi pertama"
          >
            <Maximize2 className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline text-emerald-700 dark:text-emerald-300">Fit</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={resetView}
            className="gap-1"
            title="Reset tampilan"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset</span>
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Move className="w-4 h-4" />
        <span>Geser untuk menggeser • Scroll + Ctrl untuk zoom • Klik <strong>Fit</strong> untuk fokus ke generasi pertama</span>
      </div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardContent className="p-3 flex items-center gap-4 justify-center flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-br from-sky-100 to-blue-200 border border-sky-300" />
              <span className="text-xs">Laki-laki</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-br from-rose-100 to-pink-200 border border-rose-300" />
              <span className="text-xs">Perempuan</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-3 h-3 text-rose-500" />
              <span className="text-xs">Pasangan</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs px-1.5">G1</Badge>
              <span className="text-xs">Generasi</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tree Container */}
      <div 
        ref={containerRef}
        className="flex-1 relative overflow-hidden border rounded-xl bg-gradient-to-br from-muted/30 to-muted/10 cursor-grab active:cursor-grabbing"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ minHeight: '400px' }}
      >
        {/* Drag Indicator */}
        {isDragging && (
          <div className="absolute inset-0 bg-primary/5 pointer-events-none z-10 flex items-center justify-center">
            <GripHorizontal className="w-8 h-8 text-primary/50" />
          </div>
        )}
        
        {/* Tree Content */}
        <motion.div
          ref={contentRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="absolute"
          style={{ 
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'top center',
            transition: isDragging ? 'none' : 'transform 0.2s ease-out'
          }}
        >
          <div className="flex flex-col items-center min-w-max py-4 px-4">
            {rootMembers.map((root, index) => (
              <div key={root.id} className={index > 0 ? 'mt-12' : ''}>
                <FamilyNode member={root} />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Zoom Indicator */}
        <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-lg border">
          <div className="flex items-center gap-2">
            <ZoomIn className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">{Math.round(zoom * 100)}%</span>
          </div>
        </div>

        {/* Quick Actions Overlay */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={fitToScreen}
            className="shadow-lg gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Maximize2 className="w-4 h-4" />
            Fokus ke Generasi Pertama
          </Button>
        </div>
      </div>
    </div>
  );
}
