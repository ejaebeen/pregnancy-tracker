export interface DiaryEntry {
  id: string;
  created_at: string;
  text: string;
}

export interface DoctorQuestion {
  id: string;
  created_at: string;
  text: string;
  is_answered: boolean;
}
