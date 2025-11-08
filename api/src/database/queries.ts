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
      where: { name }
    });
  } catch (err) {
    console.log(err);
    return false;
  }
}

async function getAllUsers() {
  try {
    return await prisma.user.findMany();
  } catch (err) {
    console.log(err);
    return false;
  }
}

async function updateUser(id: number, data: Prisma.UserUpdateInput) {
  try {
    return await prisma.user.update({
      where: { id },
      data
    });
  } catch (err) {
    console.log(err);
    return false;
  }
}

async function deleteUser(id: number) {
  try {
    return await prisma.user.delete({
      where: { id }
    });
  } catch (err) {
    console.log(err);
    return false;
  }
}

export { signUp, getUserInfo, getAllUsers, updateUser, deleteUser };
