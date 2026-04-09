import { PrismaClient, ExerciseCategory } from '@prisma/client';

const prisma = new PrismaClient();

const defaultExercises: {
  name: string;
  category: ExerciseCategory;
  primaryMuscles: string[];
  description?: string;
}[] = [
  // Barbell
  { name: 'Barbell Bench Press', category: ExerciseCategory.BARBELL, primaryMuscles: ['Chest', 'Triceps'] },
  { name: 'Barbell Squat', category: ExerciseCategory.BARBELL, primaryMuscles: ['Quadriceps', 'Glutes'] },
  { name: 'Barbell Deadlift', category: ExerciseCategory.BARBELL, primaryMuscles: ['Back', 'Hamstrings'] },
  { name: 'Barbell Row', category: ExerciseCategory.BARBELL, primaryMuscles: ['Back', 'Biceps'] },
  { name: 'Barbell Overhead Press', category: ExerciseCategory.BARBELL, primaryMuscles: ['Shoulders', 'Triceps'] },
  { name: 'Barbell Curl', category: ExerciseCategory.BARBELL, primaryMuscles: ['Biceps'] },
  { name: 'Barbell Hip Thrust', category: ExerciseCategory.BARBELL, primaryMuscles: ['Glutes'] },
  // Dumbbell
  { name: 'Dumbbell Bench Press', category: ExerciseCategory.DUMBBELL, primaryMuscles: ['Chest', 'Triceps'] },
  { name: 'Dumbbell Row', category: ExerciseCategory.DUMBBELL, primaryMuscles: ['Back', 'Biceps'] },
  { name: 'Dumbbell Shoulder Press', category: ExerciseCategory.DUMBBELL, primaryMuscles: ['Shoulders'] },
  { name: 'Dumbbell Lateral Raise', category: ExerciseCategory.DUMBBELL, primaryMuscles: ['Shoulders'] },
  { name: 'Dumbbell Lunge', category: ExerciseCategory.DUMBBELL, primaryMuscles: ['Quadriceps', 'Glutes'] },
  { name: 'Dumbbell Curl', category: ExerciseCategory.DUMBBELL, primaryMuscles: ['Biceps'] },
  { name: 'Dumbbell Tricep Extension', category: ExerciseCategory.DUMBBELL, primaryMuscles: ['Triceps'] },
  { name: 'Dumbbell Goblet Squat', category: ExerciseCategory.DUMBBELL, primaryMuscles: ['Quadriceps'] },
  // Machine
  { name: 'Leg Press', category: ExerciseCategory.MACHINE, primaryMuscles: ['Quadriceps'] },
  { name: 'Lat Pulldown', category: ExerciseCategory.MACHINE, primaryMuscles: ['Back'] },
  { name: 'Cable Crossover', category: ExerciseCategory.MACHINE, primaryMuscles: ['Chest'] },
  { name: 'Seated Cable Row', category: ExerciseCategory.MACHINE, primaryMuscles: ['Back'] },
  { name: 'Leg Curl Machine', category: ExerciseCategory.MACHINE, primaryMuscles: ['Hamstrings'] },
  { name: 'Leg Extension Machine', category: ExerciseCategory.MACHINE, primaryMuscles: ['Quadriceps'] },
  { name: 'Chest Press Machine', category: ExerciseCategory.MACHINE, primaryMuscles: ['Chest'] },
  // Cable
  { name: 'Cable Fly', category: ExerciseCategory.CABLE, primaryMuscles: ['Chest'] },
  { name: 'Cable Tricep Pushdown', category: ExerciseCategory.CABLE, primaryMuscles: ['Triceps'] },
  { name: 'Cable Face Pull', category: ExerciseCategory.CABLE, primaryMuscles: ['Shoulders', 'Rear Delts'] },
  { name: 'Cable Curl', category: ExerciseCategory.CABLE, primaryMuscles: ['Biceps'] },
  // Bodyweight
  { name: 'Push-Up', category: ExerciseCategory.BODYWEIGHT, primaryMuscles: ['Chest', 'Triceps'] },
  { name: 'Pull-Up', category: ExerciseCategory.BODYWEIGHT, primaryMuscles: ['Back', 'Biceps'] },
  { name: 'Dip', category: ExerciseCategory.BODYWEIGHT, primaryMuscles: ['Triceps', 'Chest'] },
  { name: 'Bodyweight Squat', category: ExerciseCategory.BODYWEIGHT, primaryMuscles: ['Quadriceps'] },
  { name: 'Plank', category: ExerciseCategory.BODYWEIGHT, primaryMuscles: ['Core'] },
  { name: 'Chin-Up', category: ExerciseCategory.BODYWEIGHT, primaryMuscles: ['Back', 'Biceps'] },
  { name: 'Hanging Leg Raise', category: ExerciseCategory.BODYWEIGHT, primaryMuscles: ['Core'] },
  { name: 'Burpee', category: ExerciseCategory.BODYWEIGHT, primaryMuscles: ['Full Body'] },
  // Kettlebell
  { name: 'Kettlebell Swing', category: ExerciseCategory.KETTLEBELL, primaryMuscles: ['Hamstrings', 'Glutes'] },
  { name: 'Kettlebell Goblet Squat', category: ExerciseCategory.KETTLEBELL, primaryMuscles: ['Quadriceps'] },
  { name: 'Kettlebell Clean and Press', category: ExerciseCategory.KETTLEBELL, primaryMuscles: ['Shoulders', 'Full Body'] },
  // Resistance Band
  { name: 'Band Pull-Apart', category: ExerciseCategory.RESISTANCE_BAND, primaryMuscles: ['Shoulders', 'Rear Delts'] },
  { name: 'Band Squat', category: ExerciseCategory.RESISTANCE_BAND, primaryMuscles: ['Quadriceps', 'Glutes'] },
  { name: 'Band Curl', category: ExerciseCategory.RESISTANCE_BAND, primaryMuscles: ['Biceps'] },
];

async function main(): Promise<void> {
  console.log('Seeding default exercises...');

  // Use a sentinel UUID for system exercises so the unique constraint works
  const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000';

  for (const exercise of defaultExercises) {
    await prisma.exercise.upsert({
      where: { name_createdById: { name: exercise.name, createdById: SYSTEM_USER_ID } },
      update: {},
      create: {
        name: exercise.name,
        category: exercise.category,
        primaryMuscles: exercise.primaryMuscles,
        isSystemExercise: true,
        description: exercise.description ?? null,
        createdById: SYSTEM_USER_ID,
      },
    });
  }

  const count = await prisma.exercise.count({ where: { isSystemExercise: true } });
  console.log(`Seeded ${count} system exercises.`);
}

main()
  .catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
