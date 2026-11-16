import { getConsensusPointsByElection } from "@/lib/data";
import { HomeClient } from "@/components/HomeClient";

export const revalidate = 3600;

export default async function HomePage() {
  // Get recent 2024 legislative or european points for the recent barometer
  const points2024 = await getConsensusPointsByElection("legis-2024-t2");
  const pointsToDisplay =
    points2024.length > 0
      ? points2024
      : await getConsensusPointsByElection("euro-2024");

  return <HomeClient pointsToDisplay={pointsToDisplay} />;
}
