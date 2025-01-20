import { getChallenges, toggleChallengeCompletion } from "@/actions/challenge.action";
import { getDbUserId } from "@/actions/user.action";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@radix-ui/react-checkbox";

export default async function ChallengePage() {
  const challenges = await getChallenges();

  return (
    <div className="container mx-auto my-8">
      <h1 className="text-2xl font-bold mb-4">Challenges</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {challenges.map((challenge) => (
          <Card key={challenge.id}>
            <div className="flex flex-col justify-between h-full">
              <div>
                <h2 className="text-xl font-bold">{challenge.title}</h2>
                <p className="text-gray-500">{challenge.description}</p>
                <p className="text-gray-500">XP Reward: {challenge.xpReward}</p>
                {challenge.dueDate && (
                  <p className="text-gray-500">Due Date: {challenge.dueDate.toLocaleDateString()}</p>
                )}
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <img
                    src={challenge.creator.image || "/avatar.png"}
                    alt={challenge.creator.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <span>{challenge.creator.name}</span>
                </div>

                <Checkbox
                  checked={
                    challenge.participants.find(
                      (p: { participantId: Promise<string | null>; }) => p.participantId === (getDbUserId())
                    )?.completed
                  }
                  onChange={() => toggleChallengeCompletion(challenge.id)}
                >
                  Completed
                </Checkbox>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
