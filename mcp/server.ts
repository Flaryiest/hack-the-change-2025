#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: "../api/.env" });

// Initialize Prisma Client
const prisma = new PrismaClient();

// Define the tools available in this MCP server
const TOOLS: Tool[] = [
  {
    name: "get_all_users",
    description:
      "Retrieves all users from the TelePod database. Returns user information including name, location, coordinates, and facts about each user/village.",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "get_user_by_name",
    description:
      "Retrieves a specific user/village by their name from the TelePod database.",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "The name of the user/village to retrieve",
        },
      },
      required: ["name"],
    },
  },
  {
    name: "search_users_by_location",
    description:
      "Searches for users/villages in a specific location. Useful for finding nearby communities.",
    inputSchema: {
      type: "object",
      properties: {
        location: {
          type: "string",
          description: "The location to search for (e.g., 'Calgary, AB')",
        },
      },
      required: ["location"],
    },
  },
  {
    name: "search_users_by_fact",
    description:
      "Searches for users/villages that have specific skills, needs, or characteristics. Useful for matching demands with suppliers.",
    inputSchema: {
      type: "object",
      properties: {
        keyword: {
          type: "string",
          description:
            "Keyword to search in user facts (e.g., 'farming', 'medical', 'education')",
        },
      },
      required: ["keyword"],
    },
  },
  {
    name: "create_user",
    description:
      "Creates a new user/village in the TelePod network with their information, location, and capabilities/needs.",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Unique name of the user/village",
        },
        location: {
          type: "string",
          description: "Location of the user/village (optional)",
        },
        coordinates: {
          type: "string",
          description: "GPS coordinates in format 'latitude,longitude' (optional)",
        },
        facts: {
          type: "array",
          items: { type: "string" },
          description:
            "Array of facts about the user/village (skills, needs, resources)",
        },
      },
      required: ["name"],
    },
  },
  {
    name: "match_user_need",
    description:
      "Intelligently matches a user's need or demand with other users who have the capability to help. Returns potential matches based on facts and location.",
    inputSchema: {
      type: "object",
      properties: {
        userName: {
          type: "string",
          description: "Name of the user who has a need",
        },
        need: {
          type: "string",
          description: "Description of what they need (e.g., 'medical supplies', 'farming equipment')",
        },
      },
      required: ["userName", "need"],
    },
  },
];

// Create the MCP server
const server = new Server(
  {
    name: "telepod-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handler for listing available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: TOOLS,
  };
});

// Handler for tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "get_all_users": {
        const users = await prisma.user.findMany();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(users, null, 2),
            },
          ],
        };
      }

      case "get_user_by_name": {
        const { name: userName } = args as { name: string };
        const user = await prisma.user.findUnique({
          where: { name: userName },
        });

        if (!user) {
          return {
            content: [
              {
                type: "text",
                text: `User "${userName}" not found in the TelePod network.`,
              },
            ],
          };
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(user, null, 2),
            },
          ],
        };
      }

      case "search_users_by_location": {
        const { location } = args as { location: string };
        const users = await prisma.user.findMany({
          where: {
            location: {
              contains: location,
              mode: "insensitive",
            },
          },
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(users, null, 2),
            },
          ],
        };
      }

      case "search_users_by_fact": {
        const { keyword } = args as { keyword: string };
        const users = await prisma.user.findMany({
          where: {
            facts: {
              hasSome: [keyword],
            },
          },
        });

        // If no exact match, search with contains
        if (users.length === 0) {
          const allUsers = await prisma.user.findMany();
          const matchedUsers = allUsers.filter((user) =>
            user.facts.some((fact) =>
              fact.toLowerCase().includes(keyword.toLowerCase())
            )
          );

          return {
            content: [
              {
                type: "text",
                text: matchedUsers.length > 0
                  ? JSON.stringify(matchedUsers, null, 2)
                  : `No users found with fact containing "${keyword}"`,
              },
            ],
          };
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(users, null, 2),
            },
          ],
        };
      }

      case "create_user": {
        const { name: userName, location, coordinates, facts } = args as {
          name: string;
          location?: string;
          coordinates?: string;
          facts?: string[];
        };

        const newUser = await prisma.user.create({
          data: {
            name: userName,
            location: location || null,
            coordinates: coordinates || null,
            facts: facts || [],
          },
        });

        return {
          content: [
            {
              type: "text",
              text: `Successfully created user in TelePod network:\n${JSON.stringify(newUser, null, 2)}`,
            },
          ],
        };
      }

      case "match_user_need": {
        const { userName, need } = args as { userName: string; need: string };

        // Get the requesting user
        const requestingUser = await prisma.user.findUnique({
          where: { name: userName },
        });

        if (!requestingUser) {
          return {
            content: [
              {
                type: "text",
                text: `User "${userName}" not found in the TelePod network.`,
              },
            ],
          };
        }

        // Get all other users
        const allUsers = await prisma.user.findMany({
          where: {
            NOT: {
              name: userName,
            },
          },
        });

        // Match based on facts and need keywords
        const needKeywords = need.toLowerCase().split(" ");
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

            // Bonus for same location (nearby help)
            if (
              user.location &&
              requestingUser.location &&
              user.location.toLowerCase().includes(requestingUser.location.toLowerCase())
            ) {
              score += 2;
            }

            return {
              user,
              score,
              matchedFacts,
            };
          })
          .filter((match) => match.score > 0)
          .sort((a, b) => b.score - a.score);

        if (matches.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: `No matches found for "${need}". No users in the TelePod network have relevant capabilities at this time.`,
              },
            ],
          };
        }

        const result = {
          requestingUser: {
            name: requestingUser.name,
            location: requestingUser.location,
          },
          need,
          matches: matches.map((m) => ({
            name: m.user.name,
            location: m.user.location,
            coordinates: m.user.coordinates,
            matchScore: m.score,
            relevantCapabilities: m.matchedFacts,
          })),
        };

        return {
          content: [
            {
              type: "text",
              text: `Found ${matches.length} potential match(es) for "${need}":\n\n${JSON.stringify(result, null, 2)}`,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text",
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("TelePod MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
