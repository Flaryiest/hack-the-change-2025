import { PrismaClient, Prisma } from '@prisma/client';
const prisma = new PrismaClient();

async function signUp(data: Prisma.UserCreateInput) {
  try {
    return await prisma.user.create({ data });
  } catch (err) {
    console.log(err);
    return false;
  }
}

async function getUserInfo(name: string) {
  try {
    return await prisma.user.findUnique({
      where: { name },

    });
  } catch (err) {
    console.log(err);
    return false;
  }
}

export { signUp, getUserInfo };
