import { PrismaClient } from "../generated/prisma/index.js";

const prisma = new PrismaClient({
    log: ['info', 'query', 'error'],
});

const members = ({
    data: [
        { first_name: "Alice", last_name: "Wonderland", email: "alice@wonder.land" },
        { first_name: "Bob", last_name: "Builder", email: "bob@builder.com" },
        { first_name: "Charlie", last_name: "Sheen", email: "charlie.sheen@gmail" },
    ]
});

await prisma.member.findMany();
// await prisma.member.createMany(members);

// const courses = {
//     data: [
//         {
//             name: 'Prisma ORM',
//             assigments: {
//                 create: [
//                     { name: 'npm init', description: 'copy paste npm-von-null-auf.txt' },
//                     { name: 'models schreiben', description: 'schreib die Modelle in schema.prisma' },
//                     { name: 'migrations', description: 'mach die migration npx prisma migrate dev' },
//                 ]
//             },
//         },
//         {
//             name: 'Git',
//             assigments: {
//                 create: [
//                     { name: 'Issue', description: 'erstelle ein issue auf github' },
//                     { name: 'Branch', description: 'mach einen branch mit der issue nbr' },
//                     { name: 'pull', description: 'wenn du fertig bist mach einen pull request' },
//                 ]
//             },
//         }
//     ]
// };

// await prisma.assigment.deleteMany();
// await prisma.course.deleteMany();
// createMany kann keine verschachtelten creates (assigments), darum jeden Kurs einzeln mit create:
// for (const kurs of courses.data) {
//     await prisma.course.create({ data: kurs });
// }