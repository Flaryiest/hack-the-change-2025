#!/usr/bin/env node

/**
 * Test script for TelePod MCP Server
 * 
 * This script demonstrates how to interact with the MCP server
 * in a development/testing environment.
 */

import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function testConnection() {
  console.log("🔍 Testing database connection...\n");

  try {
    // Test 1: Get all users
    console.log("Test 1: Fetching all users");
    const users = await prisma.user.findMany();
    console.log(`✅ Found ${users.length} users`);
    console.log(JSON.stringify(users, null, 2));
    console.log("\n" + "=".repeat(50) + "\n");

    // Test 2: Search by location
    if (users.length > 0 && users[0].location) {
      console.log("Test 2: Searching users by location");
      const locationUsers = await prisma.user.findMany({
        where: {
          location: {
            contains: users[0].location.split(",")[0],
            mode: "insensitive",
          },
        },
      });
      console.log(`✅ Found ${locationUsers.length} users in similar location`);
      console.log(JSON.stringify(locationUsers, null, 2));
      console.log("\n" + "=".repeat(50) + "\n");
    }

    // Test 3: Search by fact
    console.log("Test 3: Demonstrating fact search");
    const allUsers = await prisma.user.findMany();
    if (allUsers.length > 0 && allUsers[0].facts.length > 0) {
      const sampleFact = allUsers[0].facts[0];
      console.log(`Searching for users with fact containing: "${sampleFact}"`);
      
      const matchedUsers = allUsers.filter((user) =>
        user.facts.some((fact) =>
          fact.toLowerCase().includes(sampleFact.toLowerCase())
        )
      );
      console.log(`✅ Found ${matchedUsers.length} matching users`);
      console.log(JSON.stringify(matchedUsers, null, 2));
    }
    console.log("\n" + "=".repeat(50) + "\n");

    // Test 4: Match simulation
    console.log("Test 4: Simulating demand matching");
    if (users.length >= 2) {
      const requestingUser = users[0];
      const need = "help";
      
      console.log(`User: ${requestingUser.name}`);
      console.log(`Need: ${need}`);
      
      const otherUsers = users.filter(u => u.id !== requestingUser.id);
      console.log(`✅ Found ${otherUsers.length} potential helpers`);
      console.log(JSON.stringify(otherUsers.slice(0, 3), null, 2));
    }

    console.log("\n✅ All tests completed successfully!");
    console.log("\n📡 MCP Server is ready to use!");
    console.log("\nAvailable tools:");
    console.log("  - get_all_users");
    console.log("  - get_user_by_name");
    console.log("  - search_users_by_location");
    console.log("  - search_users_by_fact");
    console.log("  - create_user");
    console.log("  - match_user_need");

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
