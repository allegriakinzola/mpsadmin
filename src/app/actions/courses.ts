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

export async function createCourse(data: {
  name: string;
  description?: string;
  imageUrl?: string;
  location?: string;
  maxStudents?: number;
  sessionId: string;
  coachId: string;
  schedules: ScheduleInput[];
}) {
  const course = await prisma.course.create({
    data: {
      name: data.name,
      description: data.description,
      imageUrl: data.imageUrl,
      location: data.location,
      maxStudents: data.maxStudents || 30,
      sessionId: data.sessionId,
      coachId: data.coachId,
      schedules: {
        create: data.schedules.map((schedule) => ({
          date: schedule.date,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
        })),
      },
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
    maxStudents?: number;
    coachId?: string;
    schedules?: ScheduleInput[];
  }
) {
  // Si des schedules sont fournis, on les remplace tous
  if (data.schedules) {
    // Supprimer les anciens schedules
    await prisma.courseSchedule.deleteMany({
      where: { courseId: id },
    });
    
    // Créer les nouveaux schedules
    await prisma.courseSchedule.createMany({
      data: data.schedules.map((schedule) => ({
        courseId: id,
        date: schedule.date,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
      })),
    });
  }

  const { schedules, ...courseData } = data;
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
