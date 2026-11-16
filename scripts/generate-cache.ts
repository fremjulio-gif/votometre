import {
  getMacroMetrics,
  getAllStatPoints,
  getLeaderboardInstituts,
  getProspectif2027Data,
  getLegislativesHemicycleData,
  getConsensusPointsByElection,
  getMunicipales2026Data,
} from "../lib/data";
import { prisma } from "../lib/prisma";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("Generating static data cache for Vercel...");

  const macro = await getMacroMetrics();
  const allPoints = await getAllStatPoints();
  const instituts = await getLeaderboardInstituts();
  const prospectif = await getProspectif2027Data();
  const municipales = await getMunicipales2026Data();

  const elections = await prisma.election.findMany({
    orderBy: [{ annee: "desc" }, { tour: "asc" }],
    include: {
      resultats: {
        include: { candidat: true },
      },
    },
  });

  const consensusMap: Record<string, any> = {};
  for (const el of elections) {
    consensusMap[el.slug] = await getConsensusPointsByElection(el.slug);
  }

  const hemicycleMap: Record<number, any> = {};
  for (const yr of [2024, 2022, 2017, 2012, 2007, 2002]) {
    hemicycleMap[yr] = await getLegislativesHemicycleData(yr);
  }

  const cache = {
    generatedAt: new Date().toISOString(),
    macro,
    allPoints,
    instituts,
    prospectif,
    municipales,
    elections,
    consensusMap,
    hemicycleMap,
  };

  const outputPath = path.join(process.cwd(), "lib", "data-cache.json");
  fs.writeFileSync(outputPath, JSON.stringify(cache, (_, v) => (typeof v === "bigint" ? Number(v) : v), 2), "utf-8");

  console.log(`✅ Data cache written to ${outputPath} (${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB)`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
