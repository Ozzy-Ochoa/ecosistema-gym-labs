import { TrainingSession, DayAttendance, UserWorkoutRoutine, Exercise } from '../../types/training';

export interface IWorkoutRepository {
  getSessions(): TrainingSession[];
  saveSession(session: TrainingSession): Promise<void>;
  getAttendance(): DayAttendance[];
  getRoutine(): UserWorkoutRoutine;
  saveRoutine(routine: UserWorkoutRoutine): Promise<void>;
  getExercises(): Exercise[];
  addCustomExercise(exercise: Exercise): Promise<void>;
  syncRemote(): Promise<boolean>;
}
