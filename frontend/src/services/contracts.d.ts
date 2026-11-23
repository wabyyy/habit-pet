export type Period = "morning" | "noon" | "evening";
export type IconId =
  | "cup"
  | "book"
  | "dumbbell"
  | "leaf"
  | "pen"
  | "sun"
  | "headphones"
  | "plant"
  | "moon";
export type HabitGoal =
  { type: "check" } | { type: "quantity"; target: number; unitId: string };
export interface HabitInput {
  name: string;
  period: Period;
  iconId: IconId;
  weekdays: number[];
  goal: HabitGoal;
}
export interface Habit extends HabitInput {
  id: string;
  revision: number;
  createdOn: string;
  createdAt: string;
  updatedAt: string;
  todayProgress?: { date: string; value: number; isCompleted: boolean };
}
export interface HabitService {
  mode?: "local" | "supabase";
  storageKey?: string;
  listUnits(): Promise<Array<{ id: string; label: string }>>;
  listHabits(options?: {
    date?: string;
    scheduledOnly?: boolean;
  }): Promise<Habit[]>;
  createHabit(
    input: HabitInput,
    options?: { requestId?: string },
  ): Promise<Habit>;
  updateHabit(
    id: string,
    input: HabitInput,
    options?: { expectedRevision?: number },
  ): Promise<Habit>;
}
export interface MountOptions {
  service?: HabitService;
  timezone?: string;
}
