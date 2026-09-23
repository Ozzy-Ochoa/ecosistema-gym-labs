export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateWorkoutSessionInput(data: any): ValidationResult {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Workout payload must be a non-null JSON object'] };
  }

  // Unwrap if nested in data.workout
  const payload = data.workout && typeof data.workout === 'object' ? data.workout : data;
  const sessionName = payload.name || payload.title;

  if (!sessionName || typeof sessionName !== 'string' || sessionName.trim().length === 0) {
    errors.push('Workout name or title is required');
  }

  if (payload.sessionRpe !== undefined) {
    const rpe = Number(payload.sessionRpe);
    if (isNaN(rpe) || rpe < 1 || rpe > 10) {
      errors.push('Session RPE must be between 1 and 10 (Foster Borg CR-10 scale)');
    }
  }

  if (payload.durationMinutes !== undefined) {
    const dur = Number(payload.durationMinutes);
    if (isNaN(dur) || dur <= 0 || dur > 720) {
      errors.push('Duration minutes must be realistic (1 to 720 minutes)');
    }
  }

  if (Array.isArray(payload.exercises)) {
    payload.exercises.forEach((ex: any, idx: number) => {
      const exName = ex.name || ex.exerciseName;
      if (!exName || typeof exName !== 'string') {
        errors.push(`Exercise #${idx + 1} must have a valid name`);
      }
      if (Array.isArray(ex.sets)) {
        ex.sets.forEach((st: any, setIdx: number) => {
          if (st.loadKg !== undefined && (isNaN(Number(st.loadKg)) || Number(st.loadKg) < 0 || Number(st.loadKg) > 600)) {
            errors.push(`Exercise #${idx + 1} Set #${setIdx + 1}: Load must be between 0 and 600 kg`);
          }
          if (st.reps !== undefined && (isNaN(Number(st.reps)) || Number(st.reps) < 1 || Number(st.reps) > 150)) {
            errors.push(`Exercise #${idx + 1} Set #${setIdx + 1}: Reps must be between 1 and 150`);
          }
          if (st.rir !== undefined && (isNaN(Number(st.rir)) || Number(st.rir) < 0 || Number(st.rir) > 10)) {
            errors.push(`Exercise #${idx + 1} Set #${setIdx + 1}: RIR must be between 0 and 10`);
          }
        });
      }
    });
  }

  return { valid: errors.length === 0, errors };
}

export function validateNutritionLogInput(data: any): ValidationResult {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Nutrition payload must be a non-null JSON object'] };
  }

  if (data.calories !== undefined) {
    const cal = Number(data.calories);
    if (isNaN(cal) || cal < 0 || cal > 15000) {
      errors.push('Calories must be between 0 and 15000 kcal');
    }
  }

  if (data.proteinGrams !== undefined) {
    const prot = Number(data.proteinGrams);
    if (isNaN(prot) || prot < 0 || prot > 800) {
      errors.push('Protein grams must be between 0 and 800 g');
    }
  }

  if (data.waterMl !== undefined) {
    const water = Number(data.waterMl);
    if (isNaN(water) || water < 0 || water > 20000) {
      errors.push('Water volume must be between 0 and 20000 ml');
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateSleepLogInput(data: any): ValidationResult {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Sleep payload must be a non-null JSON object'] };
  }

  if (data.durationMinutes !== undefined) {
    const dur = Number(data.durationMinutes);
    if (isNaN(dur) || dur < 60 || dur > 1440) {
      errors.push('Sleep duration must be between 60 minutes and 24 hours');
    }
  }

  if (data.sleepQualityRpe !== undefined) {
    const qual = Number(data.sleepQualityRpe);
    if (isNaN(qual) || qual < 1 || qual > 10) {
      errors.push('Sleep quality score must be between 1 and 10');
    }
  }

  return { valid: errors.length === 0, errors };
}
