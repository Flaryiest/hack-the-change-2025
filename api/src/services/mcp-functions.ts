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

export async function getAllUsers(): Promise<User[]> {
  return await prisma.user.findMany();
}

export async function getUserByName(name: string): Promise<User | null> {
  return await prisma.user.findUnique({
    where: { name }
  });
}

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

export async function searchUsersByFact(keyword: string): Promise<User[]> {
  const allUsers = await prisma.user.findMany();
  return allUsers.filter((user) =>
    user.facts.some((fact) =>
      fact.toLowerCase().includes(keyword.toLowerCase())
    )
  );
}

export async function matchUserNeed(
  request: MatchRequest
): Promise<{ matches: MatchResult[]; requestingUser?: User }> {
  let requestingUser: User | null = null;

  if (request.userName) {
    requestingUser = await getUserByName(request.userName);
  }

  const allUsers = await prisma.user.findMany({
    where: request.userName
      ? {
          NOT: {
            name: request.userName
          }
        }
      : undefined
  });

  const needKeywords = [
    ...(request.keywords || []),
    ...request.need.toLowerCase().split(' ')
  ].filter((k) => k.length > 2);

  const matches = allUsers
    .map((user) => {
      let score = 0;
      const matchedFacts: string[] = [];

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

      if (
        user.location &&
        requestingUser?.location &&
        user.location
          .toLowerCase()
          .includes(requestingUser.location.toLowerCase())
      ) {
        score += 2;
      }

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
