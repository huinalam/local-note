export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  order?: number; // 사용자 정의 순서 (옵셔널, 기본값은 createdAt 기준)
}

export interface Setting {
  key: string;
  value: any;
}
