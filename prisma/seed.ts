import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create coaches
  const coach1 = await prisma.coach.upsert({
    where: { email: "jean.dupont@example.com" },
    update: {},
    create: {
      firstName: "Jean",
      lastName: "Dupont",
      email: "jean.dupont@example.com",
      phone: "+33 6 12 34 56 78",
      specialty: "Mathématiques",
    },
  });

  const coach2 = await prisma.coach.upsert({
    where: { email: "marie.martin@example.com" },
    update: {},
    create: {
      firstName: "Marie",
      lastName: "Martin",
      email: "marie.martin@example.com",
      phone: "+33 6 98 76 54 32",
      specialty: "Informatique",
    },
  });

  const coach3 = await prisma.coach.upsert({
    where: { email: "pierre.bernard@example.com" },
    update: {},
    create: {
      firstName: "Pierre",
      lastName: "Bernard",
      email: "pierre.bernard@example.com",
      specialty: "Physique",
    },
  });

  console.log("Created coaches:", { coach1, coach2, coach3 });

  // Create students
  const student1 = await prisma.student.upsert({
    where: { email: "alice.durand@student.com" },
    update: {},
    create: {
      firstName: "Alice",
      lastName: "Durand",
      email: "alice.durand@student.com",
      phone: "+33 7 11 22 33 44",
      address: "123 Rue de Paris, Kinshasa",
      tradingLevel: "debutant",
      hasDeriv: "non",
      paymentMethod: "mobile",
      preferredSchedule: "avant-midi",
    },
  });

  const student2 = await prisma.student.upsert({
    where: { email: "bob.leroy@student.com" },
    update: {},
    create: {
      firstName: "Bob",
      lastName: "Leroy",
      email: "bob.leroy@student.com",
      phone: "+33 7 55 66 77 88",
      address: "456 Avenue Lumumba, Lubumbashi",
      tradingLevel: "intermediaire",
      hasDeriv: "oui_actif",
      paymentMethod: "crypto",
      preferredSchedule: "apres-midi",
    },
  });

  const student3 = await prisma.student.upsert({
    where: { email: "claire.petit@student.com" },
    update: {},
    create: {
      firstName: "Claire",
      lastName: "Petit",
      email: "claire.petit@student.com",
      phone: "+243 99 123 45 67",
      address: "789 Boulevard du 30 Juin, Goma",
      tradingLevel: "avance",
      hasDeriv: "oui_inactif",
      paymentMethod: "virement",
      preferredSchedule: "samedi",
    },
  });

  console.log("Created students:", { student1, student2, student3 });

  // Create a session
  const session1 = await prisma.courseSession.upsert({
    where: { id: "session-2024-spring" },
    update: {},
    create: {
      id: "session-2024-spring",
      name: "Session Printemps 2024",
      description: "Session de formation du printemps 2024",
      startDate: new Date("2024-03-01"),
      endDate: new Date("2024-06-30"),
      isActive: true,
    },
  });

  console.log("Created session:", session1);

  // Create courses
  const course1 = await prisma.course.upsert({
    where: { id: "course-math-101" },
    update: {},
    create: {
      id: "course-math-101",
      name: "Mathématiques 101",
      description: "Introduction aux mathématiques avancées",
      location: "Salle A101",
      maxStudents: 25,
      sessionId: session1.id,
      coachId: coach1.id,
      schedules: {
        create: [
          {
            date: new Date("2024-03-04"),
            startTime: new Date("2024-03-04T09:00:00"),
            endTime: new Date("2024-03-04T11:00:00"),
          },
          {
            date: new Date("2024-03-11"),
            startTime: new Date("2024-03-11T09:00:00"),
            endTime: new Date("2024-03-11T11:00:00"),
          },
          {
            date: new Date("2024-03-18"),
            startTime: new Date("2024-03-18T09:00:00"),
            endTime: new Date("2024-03-18T11:00:00"),
          },
        ],
      },
    },
  });

  const course2 = await prisma.course.upsert({
    where: { id: "course-info-101" },
    update: {},
    create: {
      id: "course-info-101",
      name: "Programmation Python",
      description: "Initiation à la programmation avec Python",
      location: "En ligne",
      maxStudents: 20,
      sessionId: session1.id,
      coachId: coach2.id,
      schedules: {
        create: [
          {
            date: new Date("2024-03-05"),
            startTime: new Date("2024-03-05T14:00:00"),
            endTime: new Date("2024-03-05T16:00:00"),
          },
          {
            date: new Date("2024-03-12"),
            startTime: new Date("2024-03-12T14:00:00"),
            endTime: new Date("2024-03-12T16:00:00"),
          },
        ],
      },
    },
  });

  const course3 = await prisma.course.upsert({
    where: { id: "course-phys-101" },
    update: {},
    create: {
      id: "course-phys-101",
      name: "Physique Fondamentale",
      description: "Les bases de la physique classique",
      location: "Amphi C",
      maxStudents: 30,
      sessionId: session1.id,
      coachId: coach3.id,
      schedules: {
        create: [
          {
            date: new Date("2024-03-07"),
            startTime: new Date("2024-03-07T10:00:00"),
            endTime: new Date("2024-03-07T12:00:00"),
          },
          {
            date: new Date("2024-03-14"),
            startTime: new Date("2024-03-14T10:00:00"),
            endTime: new Date("2024-03-14T12:00:00"),
          },
          {
            date: new Date("2024-03-21"),
            startTime: new Date("2024-03-21T10:00:00"),
            endTime: new Date("2024-03-21T12:00:00"),
          },
        ],
      },
    },
  });

  console.log("Created courses:", { course1, course2, course3 });

  // Create enrollments
  const enrollment1 = await prisma.enrollment.upsert({
    where: {
      studentId_courseId: {
        studentId: student1.id,
        courseId: course1.id,
      },
    },
    update: {},
    create: {
      studentId: student1.id,
      courseId: course1.id,
      status: "active",
    },
  });

  const enrollment2 = await prisma.enrollment.upsert({
    where: {
      studentId_courseId: {
        studentId: student1.id,
        courseId: course2.id,
      },
    },
    update: {},
    create: {
      studentId: student1.id,
      courseId: course2.id,
      status: "active",
    },
  });

  const enrollment3 = await prisma.enrollment.upsert({
    where: {
      studentId_courseId: {
        studentId: student2.id,
        courseId: course1.id,
      },
    },
    update: {},
    create: {
      studentId: student2.id,
      courseId: course1.id,
      status: "active",
    },
  });

  const enrollment4 = await prisma.enrollment.upsert({
    where: {
      studentId_courseId: {
        studentId: student3.id,
        courseId: course3.id,
      },
    },
    update: {},
    create: {
      studentId: student3.id,
      courseId: course3.id,
      status: "active",
    },
  });

  console.log("Created enrollments:", { enrollment1, enrollment2, enrollment3, enrollment4 });

  // Create evaluations
  await prisma.evaluation.upsert({
    where: { enrollmentId: enrollment1.id },
    update: {},
    create: {
      enrollmentId: enrollment1.id,
      grade: 16.5,
      observation: "Excellent travail, très bonne participation en cours.",
    },
  });

  await prisma.evaluation.upsert({
    where: { enrollmentId: enrollment3.id },
    update: {},
    create: {
      enrollmentId: enrollment3.id,
      grade: 14,
      observation: "Bon niveau, peut encore progresser.",
    },
  });

  console.log("Created evaluations");

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
