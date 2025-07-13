export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Tab {
  id: string;
  noteId: string;
  position: number;
  isActive: boolean;
}

export interface Setting {
  key: string;
  value: any;
}
