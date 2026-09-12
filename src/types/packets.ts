export interface ProjectPacket {
  id: string;
  name: string;
  subtitle: string;
  awards?: string;
  dateRange: string;
  highlights: string[];
  category: 'hardware' | 'computational' | 'fabrication' | 'ai' | 'architecture' | 'other';
  tags?: string[];
}

export interface PacketLibrary {
  projects: ProjectPacket[];
}
