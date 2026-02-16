"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type ScheduleInput = {
  date: Date;
  startTime: Date;
  endTime: Date;
};

export async function getCourses() {
  return prisma.course.findMany({
    include: {
      session: true,
      coach: true,
      enrollments: {
        include: {
          student: true,
        },
      },
      schedules: {
        orderBy: { date: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCourse(id: string) {
  return prisma.course.findUnique({
    where: { id },
    include: {
      session: true,
      coach: true,
      enrollments: {
        include: {
          student: true,
          evaluation: true,
        },
      },
      schedules: {
        orderBy: { date: "asc" },
      },
    },
  });
}

// Fonction pour parser une date sans décalage de fuseau horaire
function parseLocalDate(date: Date): Date {
  const d = new Date(date);
  // Extraire les composants UTC et créer une date locale
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth();
  const day = d.getUTCDate();
  return new Date(year, month, day, 12, 0, 0, 0); // Midi pour éviter les problèmes de changement de jour
}

// Fonction pour générer les dates de séances basées sur les jours de la semaine
function generateScheduleDates(
  startDate: Date,
  endDate: Date,
  weekDays: string[],
  vacations: string[]
): { date: Date; startTime: Date; endTime: Date }[] {
  const schedules: { date: Date; startTime: Date; endTime: Date }[] = [];
  
  const dayMapping: Record<string, number> = {
    dimanche: 0,
    lundi: 1,
    mardi: 2,
    mercredi: 3,
    jeudi: 4,
    vendredi: 5,
    samedi: 6,
  };

  // Heures en UTC qui s'afficheront correctement en heure locale (UTC+1 pour RDC)
  // Pour afficher 06:00 en local, on stocke 05:00 UTC
  const vacationTimes: Record<string, { start: string; end: string }> = {
    "avant-midi": { start: "05:00", end: "07:30" },   // Affichera 06:00 - 08:30 en UTC+1
    "apres-midi": { start: "15:30", end: "18:00" },   // Affichera 16:30 - 19:00 en UTC+1
    "samedi": { start: "07:00", end: "09:30" },       // Affichera 08:00 - 10:30 en UTC+1
  };

  const targetDays = weekDays.map(day => dayMapping[day]).filter(d => d !== undefined);
  
  // Utiliser parseLocalDate pour éviter le décalage de fuseau horaire
  const current = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);

  while (current <= end) {
    const dayOfWeek = current.getDay();
    
    if (targetDays.includes(dayOfWeek)) {
      // Pour chaque vacation disponible, créer une séance
      for (const vacation of vacations) {
        const times = vacationTimes[vacation];
        if (times) {
          const [startHour, startMin] = times.start.split(":").map(Number);
          const [endHour, endMin] = times.end.split(":").map(Number);
          
          // Utiliser les composants de date actuels pour créer des dates UTC
          const year = current.getFullYear();
          const month = current.getMonth();
          const day = current.getDate();
          
          // Créer les dates en UTC pour éviter le décalage de fuseau horaire
          const scheduleDate = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
          const startTime = new Date(Date.UTC(year, month, day, startHour, startMin, 0, 0));
          const endTime = new Date(Date.UTC(year, month, day, endHour, endMin, 0, 0));
          
          schedules.push({ date: scheduleDate, startTime, endTime });
        }
      }
    }
    
    current.setDate(current.getDate() + 1);
  }

  return schedules;
}

export async function createCourse(data: {
  name: string;
  description?: string;
  imageUrl?: string;
  location?: string;
  price?: number;
  maxStudents?: number;
  sessionsPerDay?: number;
  weekDays?: string[];
  vacations?: string[];
  startDate?: Date;
  endDate?: Date;
  sessionId: string;
  coachId: string;
}) {
  // Générer automatiquement les schedules si dates et jours sont fournis
  let generatedSchedules: { date: Date; startTime: Date; endTime: Date }[] = [];
  if (data.startDate && data.endDate && data.weekDays && data.weekDays.length > 0 && data.vacations && data.vacations.length > 0) {
    generatedSchedules = generateScheduleDates(
      data.startDate,
      data.endDate,
      data.weekDays,
      data.vacations
    );
  }

  const course = await prisma.course.create({
    data: {
      name: data.name,
      description: data.description,
      imageUrl: data.imageUrl,
      location: data.location,
      price: data.price || 0,
      maxStudents: data.maxStudents || 30,
      sessionsPerDay: data.sessionsPerDay || 1,
      weekDays: data.weekDays || [],
      vacations: data.vacations || [],
      startDate: data.startDate,
      endDate: data.endDate,
      sessionId: data.sessionId,
      coachId: data.coachId,
      ...(generatedSchedules.length > 0 && {
        schedules: {
          create: generatedSchedules.map((schedule) => ({
            date: schedule.date,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
          })),
        },
      }),
    },
    include: {
      schedules: true,
    },
  });
  revalidatePath("/dashboard/courses");
  revalidatePath(`/dashboard/sessions/${data.sessionId}`);
  return course;
}

export async function updateCourse(
  id: string,
  data: {
    name?: string;
    description?: string;
    imageUrl?: string;
    location?: string;
    price?: number;
    maxStudents?: number;
    sessionsPerDay?: number;
    weekDays?: string[];
    vacations?: string[];
    startDate?: Date;
    endDate?: Date;
    coachId?: string;
    regenerateSchedules?: boolean;
  }
) {
  // Si regenerateSchedules est true et que toutes les données nécessaires sont présentes, régénérer le calendrier
  if (data.regenerateSchedules) {
    // Vérifier que toutes les données nécessaires sont présentes
    if (data.startDate && data.endDate && data.weekDays && data.weekDays.length > 0 && data.vacations && data.vacations.length > 0) {
      // Générer les nouveaux schedules
      const generatedSchedules = generateScheduleDates(
        data.startDate,
        data.endDate,
        data.weekDays,
        data.vacations
      );

      // Seulement supprimer et recréer si on a des schedules à créer
      if (generatedSchedules.length > 0) {
        // Supprimer les anciens schedules
        await prisma.courseSchedule.deleteMany({
          where: { courseId: id },
        });
        
        await prisma.courseSchedule.createMany({
          data: generatedSchedules.map((schedule) => ({
            courseId: id,
            date: schedule.date,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
          })),
        });
      }
    }
  }

  const { regenerateSchedules, ...courseData } = data;
  const course = await prisma.course.update({
    where: { id },
    data: courseData,
    include: {
      schedules: true,
    },
  });
  revalidatePath("/dashboard/courses");
  revalidatePath(`/dashboard/courses/${id}`);
  return course;
}

export async function deleteCourse(id: string) {
  const course = await prisma.course.findUnique({ where: { id } });
  await prisma.course.delete({
    where: { id },
  });
  revalidatePath("/dashboard/courses");
  if (course) {
    revalidatePath(`/dashboard/sessions/${course.sessionId}`);
  }
}

export async function addCourseSchedule(courseId: string, schedule: ScheduleInput) {
  const newSchedule = await prisma.courseSchedule.create({
    data: {
      courseId,
      date: schedule.date,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
    },
  });
  revalidatePath(`/dashboard/courses/${courseId}`);
  return newSchedule;
}

export async function deleteCourseSchedule(scheduleId: string) {
  const schedule = await prisma.courseSchedule.findUnique({ where: { id: scheduleId } });
  await prisma.courseSchedule.delete({
    where: { id: scheduleId },
  });
  if (schedule) {
    revalidatePath(`/dashboard/courses/${schedule.courseId}`);
  }
}
