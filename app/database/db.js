import { PrismaClient } from "@prisma/client"; 
const prisma = new PrismaClient()



const newUser = await prisma.users.create({
    data: {
      firstName: 'Michal',
      lastName: "Doležel",
      email: 'dezy@dezy.cz',
    },
  })
  
  const users = await prisma.user.findMany()