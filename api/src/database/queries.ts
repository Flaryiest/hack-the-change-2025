import { PrismaClient, Prisma } from '@prisma/client';
const prisma = new PrismaClient();

// Note: Read operations are handled by MCP server
// This module focuses on write operations and authentication queries

// Create new user/village (used by auth signup)
async function signUp(data: Prisma.UserCreateInput) {
  try {
    return await prisma.user.create({ data });
  } catch (err) {
    console.log(err);
    return false;
  }
}

// Get user for authentication (needed for login)
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

// Update user/village information
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

// Delete user/village from network
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

export { signUp, getUserInfo, updateUser, deleteUser };
