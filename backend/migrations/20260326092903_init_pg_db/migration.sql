-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "FitnessLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ELITE');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('IN_PROGRESS', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('STRENGTH', 'CARDIO', 'HIIT', 'YOGA', 'STRETCHING', 'CROSSFIT', 'CYCLING', 'SWIMMING', 'OTHER');

-- CreateEnum
CREATE TYPE "FitnessGoal" AS ENUM ('WEIGHT_LOSS', 'MUSCLE_GAIN', 'ENDURANCE', 'FLEXIBILITY', 'GENERAL_FITNESS', 'REHABILITATION');

-- CreateEnum
CREATE TYPE "NutritionGoal" AS ENUM ('WEIGHT_LOSS', 'MUSCLE_GAIN', 'MAINTENANCE', 'PERFORMANCE', 'HEALTH');

-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'PRE_WORKOUT', 'POST_WORKOUT');

-- CreateEnum
CREATE TYPE "MuscleCategory" AS ENUM ('CHEST', 'BACK', 'SHOULDERS', 'ARMS', 'LEGS', 'CORE', 'GLUTES', 'CARDIO', 'FULL_BODY');

-- CreateEnum
CREATE TYPE "Recurrence" AS ENUM ('NONE', 'DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "ScheduleStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'SKIPPED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED');

-- CreateEnum
CREATE TYPE "GoalCategory" AS ENUM ('RUNNING', 'FITNESS', 'NUTRITION', 'WEIGHT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "GoalStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'FAILED', 'PAUSED');

-- CreateEnum
CREATE TYPE "Feeling" AS ENUM ('TERRIBLE', 'BAD', 'OK', 'GOOD', 'GREAT');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "avatar_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_physical_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "birth_date" DATE NOT NULL,
    "gender" "Gender",
    "height_cm" DECIMAL(5,2) NOT NULL,
    "weight_kg" DECIMAL(5,2) NOT NULL,
    "wrist_cm" DECIMAL(4,2),
    "neck_cm" DECIMAL(4,2),
    "waist_cm" DECIMAL(4,2),
    "hip_cm" DECIMAL(4,2),
    "resting_hr" INTEGER,
    "max_hr" INTEGER,
    "fitness_level" "FitnessLevel",
    "health_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_physical_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_measurements" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "weight_kg" DECIMAL(5,2),
    "body_fat_pct" DECIMAL(4,2),
    "muscle_mass_kg" DECIMAL(5,2),
    "bmi" DECIMAL(4,2),
    "measured_at" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_measurements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "running_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT,
    "status" "SessionStatus" NOT NULL DEFAULT 'COMPLETED',
    "started_at" TIMESTAMP(3) NOT NULL,
    "ended_at" TIMESTAMP(3),
    "duration_seconds" INTEGER,
    "active_duration_sec" INTEGER,
    "distance_meters" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "avg_speed_kmh" DECIMAL(5,2),
    "max_speed_kmh" DECIMAL(5,2),
    "min_speed_kmh" DECIMAL(5,2),
    "avg_pace_sec_per_km" INTEGER,
    "calories_burned" DECIMAL(8,2),
    "avg_heart_rate" INTEGER,
    "max_heart_rate" INTEGER,
    "min_heart_rate" INTEGER,
    "elevation_gain_m" DECIMAL(7,2),
    "elevation_loss_m" DECIMAL(7,2),
    "max_altitude_m" DECIMAL(7,2),
    "min_altitude_m" DECIMAL(7,2),
    "start_lat" DECIMAL(10,8),
    "start_lng" DECIMAL(11,8),
    "end_lat" DECIMAL(10,8),
    "end_lng" DECIMAL(11,8),
    "weather_temp_c" DECIMAL(4,1),
    "weather_condition" TEXT,
    "route_data" JSONB,
    "is_synced" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "running_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "running_gps_points" (
    "id" BIGSERIAL NOT NULL,
    "session_id" TEXT NOT NULL,
    "sequence_num" INTEGER NOT NULL,
    "latitude" DECIMAL(10,8) NOT NULL,
    "longitude" DECIMAL(11,8) NOT NULL,
    "altitude_m" DECIMAL(7,2),
    "speed_kmh" DECIMAL(5,2),
    "heart_rate" INTEGER,
    "recorded_at" TIMESTAMP(3) NOT NULL,
    "accuracy_m" DECIMAL(5,2),

    CONSTRAINT "running_gps_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "running_splits" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "split_number" INTEGER NOT NULL,
    "distance_m" DECIMAL(8,2),
    "duration_sec" INTEGER,
    "pace_sec_per_km" INTEGER,
    "avg_speed_kmh" DECIMAL(5,2),
    "avg_heart_rate" INTEGER,
    "calories" DECIMAL(6,2),
    "elevation_gain" DECIMAL(6,2),

    CONSTRAINT "running_splits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "running_personal_records" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "session_id" TEXT,
    "record_type" TEXT NOT NULL,
    "value" DECIMAL(12,4) NOT NULL,
    "unit" TEXT,
    "achieved_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "running_personal_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fitness_plans" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "goal" "FitnessGoal",
    "difficulty" "FitnessLevel",
    "duration_weeks" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "started_at" DATE,
    "ends_at" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fitness_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercises" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_fr" TEXT,
    "description" TEXT,
    "category" "MuscleCategory",
    "equipment" TEXT,
    "difficulty" "FitnessLevel",
    "video_url" TEXT,
    "image_url" TEXT,
    "instructions" TEXT,
    "muscles_primary" TEXT[],
    "muscles_secondary" TEXT[],
    "is_custom" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_sessions" (
    "id" TEXT NOT NULL,
    "plan_id" TEXT,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "session_type" "SessionType",
    "target_duration_min" INTEGER,
    "target_calories" INTEGER,
    "difficulty" "FitnessLevel",
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workout_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_exercises" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "exercise_id" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL,
    "sets" INTEGER,
    "reps" INTEGER,
    "duration_sec" INTEGER,
    "rest_sec" INTEGER NOT NULL DEFAULT 60,
    "weight_kg" DECIMAL(6,2),
    "distance_m" DECIMAL(8,2),
    "notes" TEXT,

    CONSTRAINT "workout_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_schedules" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "recurrence" "Recurrence" NOT NULL DEFAULT 'NONE',
    "recurrence_end" DATE,
    "days_of_week" INTEGER[],
    "status" "ScheduleStatus" NOT NULL DEFAULT 'SCHEDULED',
    "reminder_min" INTEGER NOT NULL DEFAULT 30,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workout_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_logs" (
    "id" TEXT NOT NULL,
    "schedule_id" TEXT,
    "session_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL,
    "ended_at" TIMESTAMP(3),
    "duration_sec" INTEGER,
    "calories_burned" DECIMAL(8,2),
    "avg_heart_rate" INTEGER,
    "completion_pct" DECIMAL(5,2),
    "rating" INTEGER,
    "feeling" "Feeling",
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workout_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_log_sets" (
    "id" TEXT NOT NULL,
    "log_id" TEXT NOT NULL,
    "exercise_id" TEXT NOT NULL,
    "set_number" INTEGER NOT NULL,
    "reps_done" INTEGER,
    "weight_kg" DECIMAL(6,2),
    "duration_sec" INTEGER,
    "distance_m" DECIMAL(8,2),
    "is_completed" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workout_log_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "foods" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_fr" TEXT,
    "brand" TEXT,
    "barcode" TEXT,
    "calories_per100g" DECIMAL(7,2),
    "protein_g" DECIMAL(6,2),
    "carbs_g" DECIMAL(6,2),
    "fat_g" DECIMAL(6,2),
    "fiber_g" DECIMAL(6,2),
    "sugar_g" DECIMAL(6,2),
    "sodium_mg" DECIMAL(7,2),
    "category" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "foods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nutrition_plans" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "goal" "NutritionGoal",
    "daily_calories" INTEGER,
    "protein_g" DECIMAL(6,2),
    "carbs_g" DECIMAL(6,2),
    "fat_g" DECIMAL(6,2),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "started_at" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nutrition_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meals" (
    "id" TEXT NOT NULL,
    "plan_id" TEXT,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "meal_type" "MealType",
    "scheduled_time" TEXT,
    "logged_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meal_foods" (
    "id" TEXT NOT NULL,
    "meal_id" TEXT NOT NULL,
    "food_id" TEXT NOT NULL,
    "quantity_g" DECIMAL(8,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meal_foods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nutrition_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "log_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total_calories" DECIMAL(8,2),
    "total_protein_g" DECIMAL(7,2),
    "total_carbs_g" DECIMAL(7,2),
    "total_fat_g" DECIMAL(7,2),
    "water_ml" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nutrition_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "schedule_id" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "data" JSONB,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "scheduled_for" TIMESTAMP(3),
    "sent_at" TIMESTAMP(3),
    "read_at" TIMESTAMP(3),
    "push_token" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "workout_reminders" BOOLEAN NOT NULL DEFAULT true,
    "achievement_alerts" BOOLEAN NOT NULL DEFAULT true,
    "weekly_summary" BOOLEAN NOT NULL DEFAULT true,
    "nutrition_reminders" BOOLEAN NOT NULL DEFAULT true,
    "push_enabled" BOOLEAN NOT NULL DEFAULT true,
    "push_token" TEXT,
    "quiet_start_time" TEXT NOT NULL DEFAULT '22:00',
    "quiet_end_time" TEXT NOT NULL DEFAULT '07:00',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_goals" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "category" "GoalCategory",
    "title" TEXT NOT NULL,
    "description" TEXT,
    "target_value" DECIMAL(12,4),
    "current_value" DECIMAL(12,4) NOT NULL DEFAULT 0,
    "unit" TEXT,
    "deadline" DATE,
    "status" "GoalStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name_fr" TEXT,
    "name_en" TEXT,
    "description_fr" TEXT,
    "icon_url" TEXT,
    "category" TEXT,
    "points" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_achievements" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "achievement_id" TEXT NOT NULL,
    "unlocked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_physical_profiles_user_id_key" ON "user_physical_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "running_sessions_user_id_started_at_idx" ON "running_sessions"("user_id", "started_at" DESC);

-- CreateIndex
CREATE INDEX "running_gps_points_session_id_sequence_num_idx" ON "running_gps_points"("session_id", "sequence_num");

-- CreateIndex
CREATE UNIQUE INDEX "running_personal_records_user_id_record_type_key" ON "running_personal_records"("user_id", "record_type");

-- CreateIndex
CREATE INDEX "workout_schedules_user_id_scheduled_at_idx" ON "workout_schedules"("user_id", "scheduled_at");

-- CreateIndex
CREATE INDEX "workout_logs_user_id_started_at_idx" ON "workout_logs"("user_id", "started_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "nutrition_logs_user_id_log_date_key" ON "nutrition_logs"("user_id", "log_date");

-- CreateIndex
CREATE INDEX "notifications_user_id_status_scheduled_for_idx" ON "notifications"("user_id", "status", "scheduled_for");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_user_id_key" ON "notification_preferences"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "achievements_code_key" ON "achievements"("code");

-- CreateIndex
CREATE UNIQUE INDEX "user_achievements_user_id_achievement_id_key" ON "user_achievements"("user_id", "achievement_id");

-- AddForeignKey
ALTER TABLE "user_physical_profiles" ADD CONSTRAINT "user_physical_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_measurements" ADD CONSTRAINT "user_measurements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "running_sessions" ADD CONSTRAINT "running_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "running_gps_points" ADD CONSTRAINT "running_gps_points_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "running_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "running_splits" ADD CONSTRAINT "running_splits_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "running_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "running_personal_records" ADD CONSTRAINT "running_personal_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fitness_plans" ADD CONSTRAINT "fitness_plans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "fitness_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_sessions" ADD CONSTRAINT "workout_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "workout_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_schedules" ADD CONSTRAINT "workout_schedules_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "workout_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_schedules" ADD CONSTRAINT "workout_schedules_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_logs" ADD CONSTRAINT "workout_logs_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "workout_schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_logs" ADD CONSTRAINT "workout_logs_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "workout_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_logs" ADD CONSTRAINT "workout_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_log_sets" ADD CONSTRAINT "workout_log_sets_log_id_fkey" FOREIGN KEY ("log_id") REFERENCES "workout_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_log_sets" ADD CONSTRAINT "workout_log_sets_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nutrition_plans" ADD CONSTRAINT "nutrition_plans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meals" ADD CONSTRAINT "meals_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "nutrition_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meals" ADD CONSTRAINT "meals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_foods" ADD CONSTRAINT "meal_foods_meal_id_fkey" FOREIGN KEY ("meal_id") REFERENCES "meals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_foods" ADD CONSTRAINT "meal_foods_food_id_fkey" FOREIGN KEY ("food_id") REFERENCES "foods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nutrition_logs" ADD CONSTRAINT "nutrition_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "workout_schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_goals" ADD CONSTRAINT "user_goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "achievements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
