"use server";

import prisma from "@/lib/prisma";
import { getDbUserId } from "./user.action";
import { revalidatePath } from "next/cache";

export async function createChallenge(
  title: string,
  description: string,
  xpReward: number,
  dueDate: Date | null
): Promise<{ success: boolean; challenge?: any; error?: string }> {
  try {
    const userId = await getDbUserId();
    if (!userId) {
      return { success: false, error: "User not found" };
    }

    const challenge = await prisma.challenge.create({
      data: {
        title,
        description,
        xpReward,
        dueDate,
        creatorId: userId,
      },
    });

    // Add the creator as a participant
    await prisma.challengeParticipants.create({
      data: {
        challengeId: challenge.id,
        participantId: userId,
      },
    });

    revalidatePath("/challenges");
    return { success: true, challenge };
  } catch (error: any) {
    console.error("Failed to create challenge:", error.message || error);
    return { success: false, error: "Failed to create challenge" };
  }
}

export async function getChallenges(): Promise<any[]> {
  try {
    const challenges = await prisma.challenge.findMany({
      include: {
        participants: {
          select: {
            participant: {
              select: {
                id: true,
                username: true,
                image: true,
                name: true,
              },
            },
            participantId: true, // Add this line
            completed: true,
            completedAt: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true,
          },
        },
      },
    });

    return challenges;
  } catch (error: any) {
    console.error("Error in getChallenges:", error.message || error);
    throw new Error("Failed to fetch challenges");
  }
}

export async function toggleChallengeCompletion(
  challengeId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getDbUserId();
    if (!userId) {
      return { success: false, error: "User not found" };
    }

    const participant = await prisma.challengeParticipants.findUnique({
      where: {
        challengeId_participantId: {
          challengeId,
          participantId: userId,
        },
      },
    });

    if (!participant) {
      return { success: false, error: "You are not a participant of this challenge" };
    }

    const updatedParticipant = await prisma.challengeParticipants.update({
      where: {
        challengeId_participantId: {
          challengeId,
          participantId: userId,
        },
      },
      data: {
        completed: !participant.completed,
        completedAt: !participant.completed ? new Date() : null,
      },
    });

    revalidatePath("/challenges");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to toggle challenge completion:", error.message || error);
    return { success: false, error: "Failed to toggle challenge completion" };
  }
}
