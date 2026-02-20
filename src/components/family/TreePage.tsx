'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ChevronDown,
  ChevronRight,
  User,
  Heart,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Move,
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

/* ─── Compact Member Pill ────────────────────────── */
function MemberPill({ member, isSpouse = false }: { member: FamilyMember; isSpouse?: boolean }) {
  const isMale = member.gender === 'L';
  const initials = member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-2 rounded-lg border shadow-sm transition-all hover:shadow-md min-w-0",
      isSpouse ? "text-xs" : "text-sm",
      isMale
        ? "bg-gradient-to-r from-sky-50 to-blue-50 border-sky-200 dark:from-sky-950/60 dark:to-blue-950/60 dark:border-sky-800"
        : "bg-gradient-to-r from-rose-50 to-pink-50 border-rose-200 dark:from-rose-950/60 dark:to-pink-950/60 dark:border-rose-800"
    )}>
      <div className={cn(
        "flex-shrink-0 rounded-full flex items-center justify-center text-white font-bold",
        isSpouse ? "w-6 h-6 text-[9px]" : "w-8 h-8 text-[10px]",
        isMale ? "bg-sky-500" : "bg-rose-500"
      )}>
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn("font-semibold truncate", isSpouse ? "text-[11px]" : "text-xs")}>
          {member.name}
        </p>
        {!isSpouse && member.job && (
          <p className="text-[10px] text-muted-foreground truncate">{member.job}</p>
        )}
      </div>
    </div>
  );
}

/* ─── Couple Node (member + spouse side by side) ──── */
function CoupleNode({ member }: { member: FamilyMember }) {
  return (
    <div className="flex items-center gap-0">
      <MemberPill member={member} />
      {member.spouse && (
        <>
          <div className="flex items-center px-1">
            <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
          </div>
          <MemberPill member={member.spouse} isSpouse />
        </>
      )}
    </div>
  );
}

/* ─── Tree Node with vertical connector lines ───── */
function TreeNode({ member, level = 0 }: { member: FamilyMember; level?: number }) {
  const [expanded, setExpanded] = useState(level < 3);
  const hasChildren = member.children && member.children.length > 0;

  return (
    <div className="flex flex-col items-center">
      {/* Couple card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: level * 0.05 }}
        className="relative"
      >
        <div className="relative">
          <CoupleNode member={member} />

          {/* Expand/collapse toggle */}
          {hasChildren && (
            <button
              onClick={() => setExpanded(!expanded)}
              className={cn(
                "absolute -bottom-3 left-1/2 -translate-x-1/2 z-10",
                "w-5 h-5 rounded-full border bg-white dark:bg-zinc-900 shadow-sm",
                "flex items-center justify-center",
                "hover:bg-emerald-50 hover:border-emerald-300 transition-colors"
              )}
            >
              {expanded ? (
                <ChevronDown className="w-3 h-3 text-emerald-600" />
              ) : (
                <ChevronRight className="w-3 h-3 text-muted-foreground" />
              )}
            </button>
          )}
        </div>
      </motion.div>

      {/* Children subtree */}
      {hasChildren && expanded && (
        <div className="flex flex-col items-center mt-4">
          {/* Vertical line from parent to horizontal rail */}
          <div className="w-px h-4 bg-emerald-300 dark:bg-emerald-700" />

          {/* Children row */}
          <div className="relative">
            {/* Horizontal rail connecting children */}
            {member.children.length > 1 && (
              <div
                className="absolute top-0 h-px bg-emerald-300 dark:bg-emerald-700"
                style={{
                  left: `calc(${100 / (member.children.length * 2)}% )`,
                  right: `calc(${100 / (member.children.length * 2)}% )`,
                }}
              />
            )}

            <div className="flex gap-3">
              {member.children.map((child) => (
                <div key={child.id} className="flex flex-col items-center">
                  {/* Vertical line from rail to child */}
                  <div className="w-px h-4 bg-emerald-300 dark:bg-emerald-700" />
                  <TreeNode member={child} level={level + 1} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main Tree Page ─────────────────────────────── */
export default function TreePage({ members, rootMembers }: TreePageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.75);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Fit the tree to screen
  const fitToScreen = useCallback(() => {
    if (!containerRef.current || !contentRef.current) return;
    const cr = containerRef.current.getBoundingClientRect();
    const cw = contentRef.current.scrollWidth;
    const ch = contentRef.current.scrollHeight;

    const zH = (cr.width - 40) / cw;
    const zV = (cr.height - 40) / ch;
    const z = Math.max(0.25, Math.min(1.2, Math.min(zH, zV)));
    setZoom(z);

    const sW = cw * z;
    const sH = ch * z;
    setPan({
      x: Math.max(0, (cr.width - sW) / 2),
      y: Math.max(10, (cr.height - sH) / 2)
    });
  }, []);

  const handleZoomIn = () => setZoom(prev => Math.min(2, prev + 0.1));
  const handleZoomOut = () => setZoom(prev => Math.max(0.2, prev - 0.1));

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      setZoom(prev => Math.min(2, Math.max(0.2, prev + (e.deltaY > 0 ? -0.05 : 0.05))));
    }
  };

  // Pan handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };
  const handlePointerUp = () => setIsDragging(false);

  // Auto-fit on mount and resize
  useEffect(() => {
    const t = setTimeout(fitToScreen, 200);
    return () => clearTimeout(t);
  }, [fitToScreen, rootMembers]);

  useEffect(() => {
    window.addEventListener('resize', fitToScreen);
    return () => window.removeEventListener('resize', fitToScreen);
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
    <div className="space-y-3 h-full flex flex-col">
      {/* Header + Controls */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="md:hidden">
          <h1 className="text-lg font-bold">Pohon Keluarga</h1>
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <Button variant="outline" size="sm" onClick={handleZoomOut} className="h-8 px-2">
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>
          <div className="bg-muted rounded px-2 py-1 text-xs font-mono w-12 text-center">
            {Math.round(zoom * 100)}%
          </div>
          <Button variant="outline" size="sm" onClick={handleZoomIn} className="h-8 px-2">
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="outline" size="sm" onClick={fitToScreen}
            className="h-8 px-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 border-emerald-200"
          >
            <Maximize2 className="w-3.5 h-3.5 text-emerald-600" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="h-8 px-2">
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Legend bar */}
      <div className="flex items-center gap-4 text-[11px] text-muted-foreground px-1">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-gradient-to-r from-sky-100 to-blue-200 border border-sky-300" /> Laki-laki
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm bg-gradient-to-r from-rose-100 to-pink-200 border border-rose-300" /> Perempuan
        </span>
        <span className="flex items-center gap-1">
          <Heart className="w-3 h-3 text-rose-400 fill-rose-400" /> Pasangan
        </span>
        <span className="hidden sm:flex items-center gap-1">
          <Move className="w-3 h-3" /> Geser untuk navigasi
        </span>
      </div>

      {/* Tree Canvas */}
      <div
        ref={containerRef}
        className={cn(
          "flex-1 relative overflow-hidden rounded-xl border",
          "bg-gradient-to-b from-white via-emerald-50/20 to-white",
          "dark:from-zinc-950 dark:via-emerald-950/10 dark:to-zinc-950",
          isDragging ? "cursor-grabbing" : "cursor-grab"
        )}
        style={{ minHeight: '450px' }}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div
          ref={contentRef}
          className="absolute select-none"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'top left',
            transition: isDragging ? 'none' : 'transform 0.2s ease-out',
          }}
        >
          <div className="flex flex-col items-center p-6 min-w-max">
            {rootMembers.map((root, i) => (
              <div key={root.id} className={i > 0 ? 'mt-8' : ''}>
                <TreeNode member={root} />
              </div>
            ))}
          </div>
        </div>

        {/* Floating zoom indicator */}
        <div className="absolute bottom-3 right-3 bg-background/80 backdrop-blur rounded-md px-2 py-1 text-xs text-muted-foreground border shadow-sm">
          {Math.round(zoom * 100)}%
        </div>
      </div>
    </div>
  );
}
