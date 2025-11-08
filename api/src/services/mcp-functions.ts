import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface User {
  id: number;
  name: string;
  location: string | null;
  coordinates: string | null;
  facts: string[];
}

export interface MatchResult {
  name: string;
  location: string | null;
  coordinates: string | null;
  matchScore: number;
  relevantCapabilities: string[];
}

export interface MatchRequest {
  userName?: string;
  need: string;
  keywords?: string[];
  location?: string;
}

/**
 * Get all users from database
 */
export async function getAllUsers(): Promise<User[]> {
  return await prisma.user.findMany();
}

/**
 * Get user by name
 */
export async function getUserByName(name: string): Promise<User | null> {
  return await prisma.user.findUnique({
    where: { name }
  });
}

/**
 * Search users by location
 */
export async function searchUsersByLocation(location: string): Promise<User[]> {
  return await prisma.user.findMany({
    where: {
      location: {
        contains: location,
        mode: 'insensitive'
      }
    }
  });
}

/**
 * Search users by keyword in facts
 */
export async function searchUsersByFact(keyword: string): Promise<User[]> {
  const allUsers = await prisma.user.findMany();
  return allUsers.filter((user) =>
    user.facts.some((fact) =>
      fact.toLowerCase().includes(keyword.toLowerCase())
    )
  );
}

/**
 * Match user need with potential helpers - Core matching algorithm
 */
export async function matchUserNeed(
  request: MatchRequest
): Promise<{ matches: MatchResult[]; requestingUser?: User }> {
  let requestingUser: User | null = null;

  // Get requesting user if name provided
  if (request.userName) {
    requestingUser = await getUserByName(request.userName);
  }

  // Get all potential helpers
  const allUsers = await prisma.user.findMany({
    where: request.userName
      ? {
          NOT: {
            name: request.userName
          }
        }
      : undefined
  });

  // Extract keywords from need
  const needKeywords = [
    ...(request.keywords || []),
    ...request.need.toLowerCase().split(' ')
  ].filter((k) => k.length > 2);

  // Match and score users
  const matches = allUsers
    .map((user) => {
      let score = 0;
      const matchedFacts: string[] = [];

      // Check each fact against need keywords
      user.facts.forEach((fact) => {
        const factLower = fact.toLowerCase();
        needKeywords.forEach((keyword) => {
          if (factLower.includes(keyword)) {
            score++;
            if (!matchedFacts.includes(fact)) {
              matchedFacts.push(fact);
            }
          }
        });
      });

      // Bonus for same/nearby location
      if (
        user.location &&
        requestingUser?.location &&
        user.location
          .toLowerCase()
          .includes(requestingUser.location.toLowerCase())
      ) {
        score += 2;
      }

      // Bonus for location match in request
      if (
        request.location &&
        user.location &&
        user.location.toLowerCase().includes(request.location.toLowerCase())
      ) {
        score += 2;
      }

      return {
        user,
        score,
        matchedFacts
      };
    })
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score);

  // Convert to MatchResult format
  const matchResults: MatchResult[] = matches.map((m) => ({
    name: m.user.name,
    location: m.user.location,
    coordinates: m.user.coordinates,
    matchScore: m.score,
    relevantCapabilities: m.matchedFacts
  }));

  return {
    matches: matchResults,
    requestingUser: requestingUser || undefined
  };
}

/**
 * Create new user
 */
export async function createUser(data: {
  name: string;
  location?: string;
  coordinates?: string;
  facts?: string[];
}): Promise<User> {
  return await prisma.user.create({
    data: {
      name: data.name,
      location: data.location || null,
      coordinates: data.coordinates || null,
      facts: data.facts || []
    }
  });
}
