export interface SCITBDTask {
  id: number;
  title: string;
  description: string;
  division: "marketing" | "sales" | "tech" | "success" | "finance";
  priority: "CRITICAL" | "HIGH" | "MEDIUM";
  deadline: string;
  kpi: string;
  status: "not_started" | "in_progress" | "completed";
}

export interface SCITBDKpi {
  metric: string;
  baseline: string;
  target6m: string;
  target12m: string;
  current: string;
}

export interface TimeBlock {
  time: string;
  zone: string;
  task: string;
}

export interface PresetPrompt {
  id: string;
  category: "marketing" | "bd" | "operations";
  title: string;
  prompt: string;
}

export interface GoogleChatSpace {
  name: string;
  displayName: string;
  type?: string;
}

export interface GoogleContact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  photoUrl?: string;
}
