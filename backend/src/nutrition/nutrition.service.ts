import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class NutritionService {
  constructor(private prisma: PrismaService) {}

  async calculateCalories(userId: string) {
    const profile = await this.prisma.userPhysicalProfile.findUnique({ where: { userId } });
    if (!profile) return { dailyCalories: 2000, macros: { protein: 150, carbs: 200, fat: 65 } };

    const weight = Number(profile.weightKg);
    const height = Number(profile.heightCm);
    const age = new Date().getFullYear() - profile.birthDate.getFullYear();
    const isMale = profile.gender === 'MALE';

    // Mifflin-St Jeor Equation
    let bmr = 10 * weight + 6.25 * height - 5 * age + (isMale ? 5 : -161);
    
    // TDEE (Total Daily Energy Expenditure) - assume Moderate Activity (1.55) as default if not specified
    const activityMultiplier = 1.55; 
    let tdee = Math.round(bmr * activityMultiplier);

    // Objective adjustment
    const goal = await this.prisma.nutritionPlan.findFirst({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    let targetCalories = tdee;
    if (goal?.goal === 'WEIGHT_LOSS') targetCalories -= 500;
    if (goal?.goal === 'MUSCLE_GAIN') targetCalories += 300;

    // Macro distribution (approx: 30% Protein, 45% Carbs, 25% Fat)
    const protein = Math.round((targetCalories * 0.3) / 4);
    const carbs = Math.round((targetCalories * 0.45) / 4);
    const fat = Math.round((targetCalories * 0.25) / 9);

    return { 
      dailyCalories: targetCalories,
      bmr,
      tdee,
      macros: { protein, carbs, fat }
    };
  }

  async recommendMeals(userId: string) {
    const info = await this.calculateCalories(userId);
    const target = info.dailyCalories;

    return {
      totalTarget: target,
      macros: info.macros,
      recommendations: [
        { 
          type: 'BREAKFAST', 
          calories: Math.round(target * 0.25), 
          suggestions: [
            'Omelette (3 œufs) aux épinards et fromage feta',
            'Flocons d\'avoine avec baies et amandes',
            'Smoothie protéiné : Whey, banane, beurre de cacahuète'
          ]
        },
        { 
          type: 'LUNCH', 
          calories: Math.round(target * 0.35), 
          suggestions: [
            'Poulet grillé (150g), riz complet (100g) et brocolis vapeur',
            'Salade marocaine (Zaâlouk) avec pain complet et blanc de poulet',
            'Tajine de viande aux pruneaux (portion légère, peu de sauce)'
          ]
        },
        { 
          type: 'DINNER', 
          calories: Math.round(target * 0.30), 
          suggestions: [
            'Dinde hachée revenue avec courgettes et poivrons',
            'Bol de Harira marocaine riche en légumineuses avec dattes',
            'Lentilles corail aux épices et riz basmati'
          ]
        },
        { 
          type: 'SNACK', 
          calories: Math.round(target * 0.10), 
          suggestions: [
            'Fromage blanc (0-3%) avec un filet de miel',
            'Une pomme et une poignée de noix de Grenoble',
            'Une barre énergétique faite maison'
          ]
        },
      ],
    };
  }

  async logWater(userId: string, waterMl: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const log = await this.prisma.nutritionLog.findFirst({
      where: { userId, logDate: { gte: today } },
    });

    if (log) {
      return this.prisma.nutritionLog.update({
        where: { id: log.id },
        data: { waterMl: (log.waterMl || 0) + waterMl },
      });
    }

    return this.prisma.nutritionLog.create({
      data: {
        userId,
        logDate: new Date(),
        waterMl,
      },
    });
  }

  async checkGoalAlerts(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const log = await this.prisma.nutritionLog.findFirst({
      where: { userId, logDate: { gte: today } },
    });
    const profile = await this.calculateCalories(userId);
    const totalCalories = log?.totalCalories ? Number(log.totalCalories) : 0;
    
    const alerts: string[] = [];
    if (totalCalories >= profile.dailyCalories) {
      alerts.push('Daily calorie goal reached!');
    }
    if ((log?.waterMl || 0) < 2000 && new Date().getHours() > 18) {
      alerts.push('Remember to drink water!');
    }
    return alerts;
  }

  async logQuickMeal(userId: string, data: { name: string, calories: number, mealType: any }) {
    // Frictionless fast logging
    const log = await this.prisma.meal.create({
      data: {
        userId,
        name: data.name,
        mealType: data.mealType,
        loggedAt: new Date()
      }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nutritionLog = await this.prisma.nutritionLog.findFirst({
      where: { userId, logDate: { gte: today } },
    });

    if (nutritionLog) {
      await this.prisma.nutritionLog.update({
        where: { id: nutritionLog.id },
        data: { totalCalories: Number(nutritionLog.totalCalories || 0) + data.calories }
      });
    } else {
      await this.prisma.nutritionLog.create({
        data: {
          userId,
          logDate: new Date(),
          totalCalories: data.calories
        }
      });
    }

    return { success: true, message: 'Meal logged quickly!', meal: log };
  }
}
