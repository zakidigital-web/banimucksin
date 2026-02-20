'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Filter,
  User,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Calendar,
  ChevronRight,
  X
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FamilyMember {
  id: string;
  name: string;
  gender: string;
  birthDate?: string | null;
  birthPlace?: string | null;
  photo?: string | null;
  parentId?: string | null;
  generation: number;
  job?: string | null;
  address?: string | null;
  phone?: string | null;
  education?: string | null;
  children: FamilyMember[];
}

interface MembersPageProps {
  members: FamilyMember[];
}

export default function MembersPage({ members }: MembersPageProps) {
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [generationFilter, setGenerationFilter] = useState<string>('all');
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

  const generations = useMemo(() => {
    const gens = new Set(members.map(m => m.generation));
    return Array.from(gens).sort((a, b) => a - b);
  }, [members]);

  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(search.toLowerCase());
      const matchesGender = genderFilter === 'all' || member.gender === genderFilter;
      const matchesGeneration = generationFilter === 'all' || member.generation.toString() === generationFilter;
      return matchesSearch && matchesGender && matchesGeneration;
    });
  }, [members, search, genderFilter, generationFilter]);

  const hasActiveFilters = search || genderFilter !== 'all' || generationFilter !== 'all';

  const clearFilters = () => {
    setSearch('');
    setGenderFilter('all');
    setGenerationFilter('all');
  };

  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
          <User className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold mb-2">Belum Ada Anggota</h2>
        <p className="text-muted-foreground text-sm">
          Silakan tambahkan anggota keluarga terlebih dahulu
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
        <h1 className="text-xl font-bold">Anggota Keluarga</h1>
        <p className="text-sm text-muted-foreground">
          {filteredMembers.length} dari {members.length} anggota
        </p>
      </motion.div>

      {/* Search & Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-3"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari anggota keluarga..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Select value={genderFilter} onValueChange={setGenderFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Jenis Kelamin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              <SelectItem value="L">Laki-laki</SelectItem>
              <SelectItem value="P">Perempuan</SelectItem>
            </SelectContent>
          </Select>

          <Select value={generationFilter} onValueChange={setGenerationFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Generasi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              {generations.map(gen => (
                <SelectItem key={gen} value={gen.toString()}>
                  Generasi {gen}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="ghost" size="icon" onClick={clearFilters}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </motion.div>

      {/* Members List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-2"
      >
        {filteredMembers.map((member, index) => {
          const initials = member.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
          const isMale = member.gender === 'L';

          return (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className="cursor-pointer hover:shadow-md transition-all duration-200 active:scale-[0.98]"
                onClick={() => setSelectedMember(member)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className={cn(
                      "w-12 h-12 border-2",
                      isMale ? "border-sky-300" : "border-rose-300"
                    )}>
                      <AvatarImage src={member.photo || undefined} />
                      <AvatarFallback className={cn(
                        "text-white font-medium",
                        isMale ? "bg-sky-500" : "bg-rose-500"
                      )}>
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{member.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={cn(
                          "text-xs",
                          isMale
                            ? "border-sky-300 text-sky-700 dark:border-sky-700 dark:text-sky-300"
                            : "border-rose-300 text-rose-700 dark:border-rose-700 dark:text-rose-300"
                        )}>
                          {isMale ? 'Laki-laki' : 'Perempuan'}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          Gen {member.generation}
                        </Badge>
                        {member.phone && (
                          <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                            <Phone className="w-2.5 h-2.5" />
                            <span>WA</span>
                          </div>
                        )}
                        {member.address && (
                          <div className="flex items-center gap-1 text-[10px] text-blue-600 font-medium">
                            <MapPin className="w-2.5 h-2.5" />
                            <span>Map</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}

        {filteredMembers.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Tidak ada anggota yang sesuai dengan pencarian</p>
          </div>
        )}
      </motion.div>

      {/* Member Detail Dialog */}
      <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
        <DialogContent className="max-w-md">
          {selectedMember && (
            <>
              <DialogHeader>
                <DialogTitle>Detail Anggota</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Avatar & Name */}
                <div className="flex flex-col items-center text-center">
                  <Avatar className={cn(
                    "w-20 h-20 border-4 mb-3",
                    selectedMember.gender === 'L' ? "border-sky-300" : "border-rose-300"
                  )}>
                    <AvatarImage src={selectedMember.photo || undefined} />
                    <AvatarFallback className={cn(
                      "text-white text-xl font-medium",
                      selectedMember.gender === 'L' ? "bg-sky-500" : "bg-rose-500"
                    )}>
                      {selectedMember.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-lg font-semibold">{selectedMember.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className={cn(
                      selectedMember.gender === 'L'
                        ? "border-sky-300 text-sky-700"
                        : "border-rose-300 text-rose-700"
                    )}>
                      {selectedMember.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                    </Badge>
                    <Badge variant="secondary">Generasi {selectedMember.generation}</Badge>
                  </div>
                </div>

                {/* Info Cards */}
                <div className="space-y-2">
                  {selectedMember.birthDate && (
                    <Card>
                      <CardContent className="p-3 flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Tanggal Lahir</p>
                          <p className="text-sm font-medium">{selectedMember.birthDate}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {selectedMember.birthPlace && (
                    <Card>
                      <CardContent className="p-3 flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Tempat Lahir</p>
                          <p className="text-sm font-medium">{selectedMember.birthPlace}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {selectedMember.job && (
                    <Card>
                      <CardContent className="p-3 flex items-center gap-3">
                        <Briefcase className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Pekerjaan</p>
                          <p className="text-sm font-medium">{selectedMember.job}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {selectedMember.education && (
                    <Card>
                      <CardContent className="p-3 flex items-center gap-3">
                        <GraduationCap className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Pendidikan</p>
                          <p className="text-sm font-medium">{selectedMember.education}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {selectedMember.address && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedMember.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block group"
                    >
                      <Card className="transition-colors group-hover:border-emerald-500/50 group-hover:bg-emerald-500/5 items-center">
                        <CardContent className="p-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-emerald-600" />
                            <div>
                              <p className="text-xs text-muted-foreground">Alamat</p>
                              <p className="text-sm font-medium">{selectedMember.address}</p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </CardContent>
                      </Card>
                    </a>
                  )}

                  {selectedMember.phone && (
                    <a
                      href={`https://wa.me/${selectedMember.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block group"
                    >
                      <Card className="transition-colors group-hover:border-green-500/50 group-hover:bg-green-500/5">
                        <CardContent className="p-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <Phone className="w-5 h-5 text-green-600" />
                            <div>
                              <p className="text-xs text-muted-foreground">WhatsApp</p>
                              <p className="text-sm font-medium">{selectedMember.phone}</p>
                            </div>
                          </div>
                          <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full font-medium">Hubungi</span>
                        </CardContent>
                      </Card>
                    </a>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
