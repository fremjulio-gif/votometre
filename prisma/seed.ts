import { PrismaClient, ScrutinType } from "@prisma/client";
import * as XLSX from "xlsx";
import * as path from "path";
import * as fs from "fs";

const prisma = new PrismaClient();

// Helper to normalize political family and colors
function getPolitiqueMetadata(nom: string, parti: string, familleInput?: string): { famille: string; couleurHex: string } {
  const p = (parti || "").toUpperCase();
  const n = (nom || "").toUpperCase();
  const f = (familleInput || "").toUpperCase();

  if (p.includes("LO") || p.includes("NPA") || n.includes("ARTHAUD") || n.includes("POUTOU") || n.includes("LAGUILLER") || n.includes("BESANCENOT")) {
    return { famille: "Extrême gauche", couleurHex: "#922B21" };
  }
  if (p.includes("LFI") || p.includes("FI") || n.includes("MÉLENCHON") || n.includes("MELENCHON") || p.includes("PG") || f.includes("GAUCHE RADICALE") || n.includes("AUBRY")) {
    return { famille: "Gauche radicale", couleurHex: "#C0392B" };
  }
  if (p.includes("PCF") || n.includes("ROUSSEL") || n.includes("BUFFET") || n.includes("HUE") || n.includes("DEFFONTAINES")) {
    return { famille: "Parti communiste", couleurHex: "#CB4335" };
  }
  if (p.includes("NFP") || n.includes("NOUVEAU FRONT POPULAIRE") || n.includes("UNION DE LA GAUCHE") || p.includes("NUPES") || n.includes("GAUCHE PLURIELLE")) {
    return { famille: "Union de la gauche", couleurHex: "#C0392B" };
  }
  if (p.includes("EELV") || p.includes("ECOL") || n.includes("JADOT") || n.includes("TONDELIER") || n.includes("VOYNET") || n.includes("MAMÈRE") || n.includes("JOLY") || n.includes("TOUSSAINT")) {
    return { famille: "Écologiste", couleurHex: "#27AE60" };
  }
  if (p.includes("PS") || p.includes("PRG") || p.includes("PP") || n.includes("GLUCKSMANN") || n.includes("HOLLANDE") || n.includes("ROYAL") || n.includes("JOSPIN") || n.includes("HAMON") || n.includes("HIDALGO") || f.includes("GAUCHE")) {
    return { famille: "Gauche républicaine", couleurHex: "#E74C3C" };
  }
  if (p.includes("ENS") || p.includes("LREM") || p.includes("RENAISSANCE") || p.includes("MODEM") || p.includes("HOR") || n.includes("MACRON") || n.includes("ATTAL") || n.includes("PHILIPPE") || n.includes("HAYER") || n.includes("BAYROU") || f.includes("CENTRE") || f.includes("MAJORITÉ PRÉSIDENTIELLE")) {
    return { famille: "Bloc central", couleurHex: "#F39C12" };
  }
  if (p.includes("LR") || p.includes("UMP") || p.includes("RPR") || p.includes("UDF") || n.includes("CHIRAC") || n.includes("SARKOZY") || n.includes("FILLON") || n.includes("PÉCRESSE") || n.includes("BELLAMY") || n.includes("RETAILLEAU") || n.includes("WAUQUIEZ") || f.includes("DROITE")) {
    return { famille: "Droite républicaine", couleurHex: "#2980B9" };
  }
  if (p.includes("REC") || n.includes("ZEMMOUR") || n.includes("MARÉCHAL") || n.includes("MARECHAL")) {
    return { famille: "Reconquête", couleurHex: "#8E44AD" };
  }
  if (p.includes("RN") || p.includes("FN") || n.includes("LE PEN") || n.includes("BARDELLA") || n.includes("CIOTTI") || f.includes("EXTRÊME DROITE") || f.includes("NATIONALISTE")) {
    return { famille: "Rassemblement National", couleurHex: "#1B4F72" };
  }
  if (p.includes("DLF") || n.includes("DUPONT-AIGNAN") || p.includes("UPR") || n.includes("ASSELINEAU") || n.includes("LASSALLE") || n.includes("RÉSISTONS")) {
    return { famille: "Souverainistes & Divers", couleurHex: "#7F8C8D" };
  }
  return { famille: familleInput || "Autre", couleurHex: "#7F8C8D" };
}

function normalizeKey(str: string): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseExcelSheet(filePath: string, sheetName: string): any[] {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) return [];
  const rawData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const targetHeaders = [
    "election_id",
    "sondage_id",
    "legislature_id",
    "election_annee",
    "annee_election",
    "candidat_nom",
    "liste_nom",
    "bloc_coalition",
    "groupe_parlementaire",
  ];

  let headerRowIndex = 0;
  for (let i = 0; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row) continue;
    const match = row.filter(
      (c: any) =>
        typeof c === "string" && targetHeaders.some((th) => c.trim().toLowerCase() === th.toLowerCase())
    );
    if (match.length >= 1) {
      headerRowIndex = i;
      break;
    }
  }

  const headers = rawData[headerRowIndex]?.map((h: any) => String(h).trim()) || [];
  const rows: any[] = [];
  for (let i = headerRowIndex + 1; i < rawData.length; i++) {
    const r = rawData[i];
    if (!r || r.length === 0 || r.every((c: any) => c === null || c === undefined || c === "")) continue;
    const obj: any = {};
    headers.forEach((h: string, idx: number) => {
      obj[h] = r[idx];
    });
    rows.push(obj);
  }
  return rows;
}

function normalizePct(val: any): number {
  if (val === null || val === undefined || isNaN(Number(val))) return 0;
  const num = Number(val);
  return num > 0 && num <= 1 ? Math.round(num * 10000) / 100 : Math.round(num * 100) / 100;
}

function parseDate(val: any, fallbackYear = 2022): Date {
  if (!val) return new Date(`${fallbackYear}-05-01T00:00:00.000Z`);
  if (val instanceof Date) return val;
  if (typeof val === "number") {
    const d = XLSX.SSF.parse_date_code(val);
    return new Date(Date.UTC(d.y, d.m - 1, d.d));
  }
  const str = String(val).trim();
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) return parsed;
  return new Date(`${fallbackYear}-05-01T00:00:00.000Z`);
}

async function main() {
  console.log("🚀 Starting enhanced database seeding for 'Le Votomètre'...");

  // Clean existing data
  await prisma.sondageMesure.deleteMany();
  await prisma.sondageVague.deleteMany();
  await prisma.institut.deleteMany();
  await prisma.resultatReel.deleteMany();
  await prisma.election.deleteMany();
  await prisma.candidatOuListe.deleteMany();

  const dataDir = fs.existsSync(path.join(process.cwd(), "raw_data"))
    ? path.join(process.cwd(), "raw_data")
    : path.join(process.cwd(), "data");

  const institutMap = new Map<string, string>();
  const candidatKeyMap = new Map<string, string>(); // normalizedKey -> id
  const electionMap = new Map<string, string>();

  // Pre-seed major instituts
  const majorInstituts = [
    "Ipsos",
    "Ifop-Fiducial",
    "OpinionWay",
    "Elabe",
    "Harris Interactive",
    "BVA",
    "Cluster 17",
    "Odoxa",
    "CSA",
    "TNS Sofres",
    "Kantar",
    "YouGov",
    "Ipsos Sopra-Steria",
  ];
  for (const name of majorInstituts) {
    const inst = await prisma.institut.create({ data: { nom: name } });
    institutMap.set(name, inst.id);
  }

  async function getOrCreateInstitut(name: string): Promise<string> {
    const cleanName = (name || "Institut Inconnu").trim();
    if (institutMap.has(cleanName)) return institutMap.get(cleanName)!;
    // Check if normalized match exists
    for (const [existingName, id] of institutMap.entries()) {
      if (normalizeKey(existingName) === normalizeKey(cleanName)) {
        institutMap.set(cleanName, id);
        return id;
      }
    }
    const inst = await prisma.institut.create({ data: { nom: cleanName } });
    institutMap.set(cleanName, inst.id);
    return inst.id;
  }

  async function getOrCreateCandidat(nom: string, parti: string, famille?: string, customKey?: string): Promise<string> {
    const cleanNom = (nom || "Autre").trim();
    const cleanParti = (parti || "Indépendant").trim();
    const lookupKey = customKey || normalizeKey(cleanNom);

    if (candidatKeyMap.has(lookupKey)) return candidatKeyMap.get(lookupKey)!;

    const meta = getPolitiqueMetadata(cleanNom, cleanParti, famille);
    const created = await prisma.candidatOuListe.create({
      data: {
        nom: cleanNom,
        parti: cleanParti,
        famille: meta.famille,
        couleurHex: meta.couleurHex,
      },
    });
    candidatKeyMap.set(lookupKey, created.id);
    return created.id;
  }

  // ==========================================
  // 1. ELECTIONS PRESIDENTIELLES (2002-2022)
  // ==========================================
  console.log("\n📦 Ingesting Élections Présidentielles (2002-2022)...");
  const presiFile = path.join(dataDir, "resultats_presidentielles_2002_2022.xlsx");
  const presiPartRows = parseExcelSheet(presiFile, "Participation_Contexte");
  const presiResRows = parseExcelSheet(presiFile, "Resultats_Detailles");

  for (const row of presiPartRows) {
    const annee = Number(row.annee);
    const tour = Number(row.tour) || 1;
    const slug = `presi-${annee}-t${tour}`;
    const dateScrutin = parseDate(row.date_scrutin, annee);
    const inscrits = row.inscrits ? Number(row.inscrits) : null;
    const votants = row.votants ? Number(row.votants) : null;
    const exprimes = row.suffrages_exprimes ? Number(row.suffrages_exprimes) : null;
    const tauxAbstention = row.taux_abstention ? normalizePct(row.taux_abstention) : null;

    const election = await prisma.election.upsert({
      where: { slug },
      update: { inscrits, votants, exprimes, tauxAbstention },
      create: {
        slug,
        type: ScrutinType.PRESIDENTIELLE,
        annee,
        tour,
        dateScrutin,
        inscrits,
        votants,
        exprimes,
        tauxAbstention,
      },
    });
    electionMap.set(slug, election.id);
    electionMap.set(`presi-${annee}`, election.id);
  }

  for (const row of presiResRows) {
    const annee = Number(row.annee);
    const tour = Number(row.tour) || 1;
    const slug = `presi-${annee}-t${tour}`;
    let electionId = electionMap.get(slug);

    if (!electionId) {
      const el = await prisma.election.create({
        data: {
          slug,
          type: ScrutinType.PRESIDENTIELLE,
          annee,
          tour,
          dateScrutin: parseDate(row.date_scrutin, annee),
        },
      });
      electionId = el.id;
      electionMap.set(slug, electionId);
    }

    // Key presidential candidates primarily by candidate name so polls match results
    const candidateKey = normalizeKey(row.candidat_nom);
    const candidatId = await getOrCreateCandidat(row.candidat_nom, row.parti_nuance, row.famille_politique, candidateKey);
    const pourcentage = normalizePct(row.pourcentage_exprimes);
    const voix = row.voix ? BigInt(Math.round(Number(row.voix))) : null;
    const statut = row.statut_candidat ? String(row.statut_candidat) : null;

    await prisma.resultatReel.upsert({
      where: { electionId_candidatId: { electionId, candidatId } },
      update: { voix, pourcentage, statut },
      create: { electionId, candidatId, voix, pourcentage, statut },
    });
  }

  // ==========================================
  // 2. ELECTIONS EUROPEENNES (2004-2024)
  // ==========================================
  console.log("\n📦 Ingesting Élections Européennes (2004-2024)...");
  const euroFile = path.join(dataDir, "resultats_europeennes_2004_2024.xlsx");
  const euroPartRows = parseExcelSheet(euroFile, "Participation_Contexte");
  const euroResRows = parseExcelSheet(euroFile, "Resultats_Listes_National");

  for (const row of euroPartRows) {
    const annee = Number(row.annee);
    const slug = `euro-${annee}`;
    const dateScrutin = parseDate(row.date_scrutin, annee);
    const inscrits = row.inscrits ? Number(row.inscrits) : null;
    const votants = row.votants ? Number(row.votants) : null;
    const exprimes = row.suffrages_exprimes ? Number(row.suffrages_exprimes) : null;
    const tauxAbstention = row.taux_abstention ? normalizePct(row.taux_abstention) : null;

    const election = await prisma.election.upsert({
      where: { slug },
      update: { inscrits, votants, exprimes, tauxAbstention },
      create: {
        slug,
        type: ScrutinType.EUROPEENNE,
        annee,
        tour: 1,
        dateScrutin,
        inscrits,
        votants,
        exprimes,
        tauxAbstention,
      },
    });
    electionMap.set(slug, election.id);
  }

  for (const row of euroResRows) {
    const annee = Number(row.annee);
    const slug = `euro-${annee}`;
    let electionId = electionMap.get(slug);

    if (!electionId) {
      const el = await prisma.election.create({
        data: {
          slug,
          type: ScrutinType.EUROPEENNE,
          annee,
          tour: 1,
          dateScrutin: parseDate(row.date_scrutin, annee),
        },
      });
      electionId = el.id;
      electionMap.set(slug, electionId);
    }

    const nomListe = row.tete_de_liste ? `${row.liste_nom} (${row.tete_de_liste})` : row.liste_nom;
    const key = `euro_${annee}_${normalizeKey(row.tete_de_liste || row.liste_nom)}`;
    const candidatId = await getOrCreateCandidat(nomListe, row.parti_nuance || row.groupe_pe || "Europe", row.groupe_pe, key);
    // Also map alternative keys for matching polls
    if (row.tete_de_liste) {
      candidatKeyMap.set(`euro_${annee}_${normalizeKey(row.tete_de_liste)}`, candidatId);
      // First name / last name variations
      const parts = row.tete_de_liste.split(/[\s/]+/);
      for (const p of parts) {
        if (p.length > 3) candidatKeyMap.set(`euro_${annee}_${normalizeKey(p)}`, candidatId);
      }
    }
    candidatKeyMap.set(`euro_${annee}_${normalizeKey(row.liste_nom)}`, candidatId);

    const pourcentage = normalizePct(row.pourcentage_exprimes);
    const voix = row.voix ? BigInt(Math.round(Number(row.voix))) : null;
    const sieges = row.sieges_obtenus ? Number(row.sieges_obtenus) : 0;

    await prisma.resultatReel.upsert({
      where: { electionId_candidatId: { electionId, candidatId } },
      update: { voix, pourcentage, sieges },
      create: { electionId, candidatId, voix, pourcentage, sieges },
    });
  }

  // ==========================================
  // 3. ELECTIONS LEGISLATIVES (2002-2024)
  // ==========================================
  console.log("\n📦 Ingesting Élections Législatives (2002-2024)...");
  const legisFile = path.join(dataDir, "resultats_legislatives_2002_2024.xlsx");
  const legisPartRows = parseExcelSheet(legisFile, "Participation_Legislatives");
  const legisCompRows = parseExcelSheet(legisFile, "Composition_Assemblee");

  for (const row of legisPartRows) {
    const annee = Number(row.annee);
    const tour = Number(row.tour) || 1;
    const slug = `legis-${annee}-t${tour}`;
    const dateScrutin = parseDate(row.date_scrutin, annee);
    const inscrits = row.inscrits ? Number(row.inscrits) : null;
    const votants = row.votants ? Number(row.votants) : null;
    const tauxAbstention = row.taux_abstention ? normalizePct(row.taux_abstention) : null;

    const election = await prisma.election.upsert({
      where: { slug },
      update: { inscrits, votants, tauxAbstention },
      create: {
        slug,
        type: ScrutinType.LEGISLATIVE,
        annee,
        tour,
        dateScrutin,
        inscrits,
        votants,
        tauxAbstention,
      },
    });
    electionMap.set(slug, election.id);
    if (tour === 2 || !electionMap.has(`legis-${annee}`)) {
      electionMap.set(`legis-${annee}`, election.id);
    }
  }

  // Ingest assembly groups
  for (const row of legisCompRows) {
    const annee = Number(row.annee_election);
    if (isNaN(annee) || !annee) continue;

    let slug = `legis-${annee}-t2`;
    let electionId = electionMap.get(slug) || electionMap.get(`legis-${annee}`);

    if (!electionId) {
      const el = await prisma.election.create({
        data: {
          slug,
          type: ScrutinType.LEGISLATIVE,
          annee,
          tour: 2,
          dateScrutin: new Date(`${annee}-06-20T00:00:00.000Z`),
        },
      });
      electionId = el.id;
      electionMap.set(slug, electionId);
    }

    const groupeNom = row.groupe_parlementaire || row.sigle_groupe;
    const key = `legis_grp_${annee}_${normalizeKey(groupeNom)}`;
    const candidatId = await getOrCreateCandidat(groupeNom, row.sigle_groupe || "AN", row.position_politique, key);
    const sieges = row.sieges_obtenus ? Number(row.sieges_obtenus) : 0;
    const partPct = row.part_assemblee_pct ? normalizePct(row.part_assemblee_pct) : Math.round((sieges / 577) * 10000) / 100;
    const statut = row.configuration_majorite || row.position_politique;

    await prisma.resultatReel.upsert({
      where: { electionId_candidatId: { electionId, candidatId } },
      update: { pourcentage: partPct, sieges, statut },
      create: { electionId, candidatId, pourcentage: partPct, sieges, statut },
    });
  }

  // Also ingest legislative coalition results from Synthese_Derniers_Sondages
  const sondageLegisFile = path.join(dataDir, "sondage_legis.xlsx");
  const legisSyntheseRows = parseExcelSheet(sondageLegisFile, "Synthese_Derniers_Sondages");
  for (const row of legisSyntheseRows) {
    const annee = Number(row.election_annee);
    if (!annee || isNaN(annee)) continue;
    const slug = `legis-${annee}-t2`;
    const electionId = electionMap.get(slug) || electionMap.get(`legis-${annee}`);
    if (!electionId) continue;

    const blocNom = row.bloc_coalition;
    const key = `legis_bloc_${annee}_${normalizeKey(blocNom)}`;
    const candidatId = await getOrCreateCandidat(blocNom, "Coalition", blocNom, key);
    // Also associate normalized keywords
    candidatKeyMap.set(`legis_coal_${annee}_${normalizeKey(blocNom)}`, candidatId);

    const sieges = row.sieges_reels ? Number(row.sieges_reels) : 0;
    const partPct = Math.round((sieges / 577) * 10000) / 100;
    const statut = row.majorite_reelle || (sieges >= 289 ? "Majorité absolue" : "Minorité");

    await prisma.resultatReel.upsert({
      where: { electionId_candidatId: { electionId, candidatId } },
      update: { pourcentage: partPct, sieges, statut },
      create: { electionId, candidatId, pourcentage: partPct, sieges, statut },
    });
  }

  // ==========================================
  // 4. SONDAGES PRESIDENTIELLES (2002-2022 + PROSPECTIF 2027)
  // ==========================================
  console.log("\n📦 Ingesting Sondages Présidentielles (2002-2022 & 2027)...");
  const sondagePresiFile = path.join(dataDir, "sondage_presi.xlsx");
  const presiPollRows = parseExcelSheet(sondagePresiFile, "Vagues_Sondages_2002_2022");
  const presi2027Rows = parseExcelSheet(sondagePresiFile, "Prospectif_2027");

  const presiPollMap = new Map<string, any[]>();
  for (const r of presiPollRows) {
    const sId = r.sondage_id || `POLL_PRES_${r.election_annee}_${r.institut}`;
    if (!presiPollMap.has(sId)) presiPollMap.set(sId, []);
    presiPollMap.get(sId)!.push(r);
  }

  for (const [sondageCode, rows] of presiPollMap.entries()) {
    const first = rows[0];
    const annee = Number(first.election_annee);
    const tour = Number(first.tour) || 1;
    const slug = `presi-${annee}-t${tour}`;
    let electionId = electionMap.get(slug);

    if (!electionId) {
      const el = await prisma.election.create({
        data: {
          slug,
          type: ScrutinType.PRESIDENTIELLE,
          annee,
          tour,
          dateScrutin: parseDate(first.date_publication, annee),
        },
      });
      electionId = el.id;
      electionMap.set(slug, electionId);
    }

    const institutId = await getOrCreateInstitut(first.institut);
    const datePublication = parseDate(first.date_publication, annee);
    const dateDebut = first.date_debut ? parseDate(first.date_debut, annee) : null;
    const dateFin = first.date_fin ? parseDate(first.date_fin, annee) : null;
    const tailleEchantillon = first.taille_echantillon ? Number(first.taille_echantillon) : null;
    const joursAvantScrutin = first.jours_avant_scrutin ? Number(first.jours_avant_scrutin) : null;
    const estDernierSondage = Boolean(
      first.statut_sondage && String(first.statut_sondage).toLowerCase().includes("dernier")
    );

    const vague = await prisma.sondageVague.create({
      data: {
        codeSondage: sondageCode,
        electionId,
        institutId,
        commanditaire: first.commanditaire ? String(first.commanditaire) : null,
        dateDebut,
        dateFin,
        datePublication,
        joursAvantScrutin,
        tailleEchantillon,
        methode: first.methode ? String(first.methode) : null,
        statut: first.statut_sondage ? String(first.statut_sondage) : null,
        estDernierSondage,
      },
    });

    for (const r of rows) {
      const candidateKey = normalizeKey(r.candidat_nom);
      const candidatId = await getOrCreateCandidat(r.candidat_nom, r.parti_nuance, undefined, candidateKey);
      const intentionVotePct = normalizePct(r.intention_vote_pct);
      await prisma.sondageMesure.create({
        data: {
          sondageVagueId: vague.id,
          candidatId,
          intentionVotePct,
        },
      });
    }
  }

  // Ingest Prospectif 2027
  console.log("  ↳ Ingesting Prospectif 2027...");
  const slug2027 = "presi-2027-t1";
  let el2027 = await prisma.election.findUnique({ where: { slug: slug2027 } });
  if (!el2027) {
    el2027 = await prisma.election.create({
      data: {
        slug: slug2027,
        type: ScrutinType.PRESIDENTIELLE,
        annee: 2027,
        tour: 1,
        dateScrutin: new Date("2027-04-25T00:00:00.000Z"),
      },
    });
  }

  const poll2027Map = new Map<string, any[]>();
  for (const r of presi2027Rows) {
    const sId = r.sondage_id || `POLL_2027_${r.institut}`;
    if (!poll2027Map.has(sId)) poll2027Map.set(sId, []);
    poll2027Map.get(sId)!.push(r);
  }

  for (const [sondageCode, rows] of poll2027Map.entries()) {
    const first = rows[0];
    const institutId = await getOrCreateInstitut(first.institut);
    const vague = await prisma.sondageVague.create({
      data: {
        codeSondage: sondageCode,
        electionId: el2027.id,
        institutId,
        commanditaire: first.commanditaire ? String(first.commanditaire) : null,
        dateDebut: first.date_debut ? parseDate(first.date_debut, 2026) : null,
        dateFin: first.date_fin ? parseDate(first.date_fin, 2026) : null,
        datePublication: parseDate(first.date_publication, 2026),
        tailleEchantillon: first.taille_echantillon ? Number(first.taille_echantillon) : null,
        methode: first.methode ? String(first.methode) : null,
        statut: first.hypothese_testee ? String(first.hypothese_testee) : "Hypothèse 2027",
        estDernierSondage: true,
      },
    });

    for (const r of rows) {
      const candidateKey = normalizeKey(r.candidat_nom);
      const candidatId = await getOrCreateCandidat(r.candidat_nom, r.parti_nuance, undefined, candidateKey);
      const intentionVotePct = normalizePct(r.intention_vote_pct);
      await prisma.sondageMesure.create({
        data: {
          sondageVagueId: vague.id,
          candidatId,
          intentionVotePct,
        },
      });
    }
  }

  // ==========================================
  // 5. SONDAGES EUROPEENNES (2004-2024)
  // ==========================================
  console.log("\n📦 Ingesting Sondages Européennes (2004-2024)...");
  const sondageEuroFile = path.join(dataDir, "sondage_euro.xlsx");
  const euroPollRows = parseExcelSheet(sondageEuroFile, "Vagues_Sondages_2004_2024");

  const euroPollMap = new Map<string, any[]>();
  for (const r of euroPollRows) {
    const sId = r.sondage_id || `POLL_EUR_${r.election_annee}_${r.institut}`;
    if (!euroPollMap.has(sId)) euroPollMap.set(sId, []);
    euroPollMap.get(sId)!.push(r);
  }

  for (const [sondageCode, rows] of euroPollMap.entries()) {
    const first = rows[0];
    const annee = Number(first.election_annee);
    const slug = `euro-${annee}`;
    let electionId = electionMap.get(slug);

    if (!electionId) {
      const el = await prisma.election.create({
        data: {
          slug,
          type: ScrutinType.EUROPEENNE,
          annee,
          tour: 1,
          dateScrutin: parseDate(first.date_publication, annee),
        },
      });
      electionId = el.id;
      electionMap.set(slug, electionId);
    }

    const institutId = await getOrCreateInstitut(first.institut);
    const datePublication = parseDate(first.date_publication, annee);
    const dateDebut = first.date_debut ? parseDate(first.date_debut, annee) : null;
    const dateFin = first.date_fin ? parseDate(first.date_fin, annee) : null;
    const tailleEchantillon = first.taille_echantillon ? Number(first.taille_echantillon) : null;
    const estDernierSondage = Boolean(
      first.dernier_sondage_veille && String(first.dernier_sondage_veille).toLowerCase().includes("dernier")
    );

    const vague = await prisma.sondageVague.create({
      data: {
        codeSondage: sondageCode,
        electionId,
        institutId,
        commanditaire: first.commanditaire ? String(first.commanditaire) : null,
        dateDebut,
        dateFin,
        datePublication,
        tailleEchantillon,
        statut: first.dernier_sondage_veille ? String(first.dernier_sondage_veille) : null,
        estDernierSondage,
      },
    });

    for (const r of rows) {
      const nomListe = r.tete_de_liste ? `${r.liste_nom} (${r.tete_de_liste})` : r.liste_nom;
      // Match candidate by tete_de_liste or liste_nom
      let candidatId = r.tete_de_liste ? candidatKeyMap.get(`euro_${annee}_${normalizeKey(r.tete_de_liste)}`) : undefined;
      if (!candidatId) {
        candidatId = candidatKeyMap.get(`euro_${annee}_${normalizeKey(r.liste_nom)}`);
      }
      if (!candidatId && r.tete_de_liste) {
        // Try searching for surname
        for (const [key, id] of candidatKeyMap.entries()) {
          if (key.startsWith(`euro_${annee}_`) && key.includes(normalizeKey(r.tete_de_liste))) {
            candidatId = id;
            break;
          }
        }
      }
      if (!candidatId) {
        const key = `euro_${annee}_${normalizeKey(r.tete_de_liste || r.liste_nom)}`;
        candidatId = await getOrCreateCandidat(nomListe, r.groupe_affiliation || "Europe", r.groupe_affiliation, key);
      }

      const intentionVotePct = normalizePct(r.intention_vote_pct);
      const siegesMin = r.sieges_estimes_min ? Number(r.sieges_estimes_min) : null;
      const siegesMax = r.sieges_estimes_max ? Number(r.sieges_estimes_max) : null;

      await prisma.sondageMesure.create({
        data: {
          sondageVagueId: vague.id,
          candidatId,
          intentionVotePct,
          siegesMin,
          siegesMax,
        },
      });
    }
  }

  // ==========================================
  // 6. SONDAGES LEGISLATIVES (2002-2024)
  // ==========================================
  console.log("\n📦 Ingesting Sondages Législatives (2002-2024)...");
  const legisPollRows = parseExcelSheet(sondageLegisFile, "Vagues_Sondages_2002_2024");

  const legisPollMap = new Map<string, any[]>();
  for (const r of legisPollRows) {
    const sId = r.sondage_id || `POLL_LEG_${r.election_annee}_${r.institut}`;
    if (!legisPollMap.has(sId)) legisPollMap.set(sId, []);
    legisPollMap.get(sId)!.push(r);
  }

  for (const [sondageCode, rows] of legisPollMap.entries()) {
    const first = rows[0];
    const annee = Number(first.election_annee);
    const tour = Number(first.tour_sondage) || 2;
    const slug = `legis-${annee}-t${tour}`;
    let electionId = electionMap.get(slug) || electionMap.get(`legis-${annee}`);

    if (!electionId) {
      const el = await prisma.election.create({
        data: {
          slug,
          type: ScrutinType.LEGISLATIVE,
          annee,
          tour,
          dateScrutin: parseDate(first.date_publication, annee),
        },
      });
      electionId = el.id;
      electionMap.set(slug, electionId);
    }

    const institutId = await getOrCreateInstitut(first.institut);
    const datePublication = parseDate(first.date_publication, annee);
    const dateDebut = first.date_debut ? parseDate(first.date_debut, annee) : null;
    const dateFin = first.date_fin ? parseDate(first.date_fin, annee) : null;
    const tailleEchantillon = first.taille_echantillon ? Number(first.taille_echantillon) : null;

    const vague = await prisma.sondageVague.create({
      data: {
        codeSondage: sondageCode,
        electionId,
        institutId,
        commanditaire: first.commanditaire ? String(first.commanditaire) : null,
        dateDebut,
        dateFin,
        datePublication,
        tailleEchantillon,
        statut: first.contexte_campagne ? String(first.contexte_campagne) : null,
        estDernierSondage: true,
      },
    });

    for (const r of rows) {
      const blocNom = r.bloc_coalition;
      // Match with seeded coalition candidate
      let candidatId = candidatKeyMap.get(`legis_coal_${annee}_${normalizeKey(blocNom)}`);
      if (!candidatId) {
        candidatId = candidatKeyMap.get(`legis_bloc_${annee}_${normalizeKey(blocNom)}`);
      }
      if (!candidatId) {
        // Try substring search on coalition names for that year
        for (const [key, id] of candidatKeyMap.entries()) {
          if (key.startsWith(`legis_bloc_${annee}_`)) {
            const cleanKey = key.replace(`legis_bloc_${annee}_`, "");
            const cleanB = normalizeKey(blocNom);
            if (cleanB.includes(cleanKey) || cleanKey.includes(cleanB) ||
                (cleanB.includes("front populaire") && cleanKey.includes("front populaire")) ||
                (cleanB.includes("ensemble") && cleanKey.includes("ensemble")) ||
                (cleanB.includes("rassemblement national") && cleanKey.includes("rassemblement national")) ||
                (cleanB.includes("republicains") && cleanKey.includes("republicains"))) {
              candidatId = id;
              break;
            }
          }
        }
      }
      if (!candidatId) {
        const key = `legis_bloc_${annee}_${normalizeKey(blocNom)}`;
        candidatId = await getOrCreateCandidat(blocNom, "Coalition", blocNom, key);
      }

      const intentionVotePct = normalizePct(r.intention_vote_nat_pct);
      const siegesMin = r.sieges_fourchette_basse ? Number(r.sieges_fourchette_basse) : null;
      const siegesMax = r.sieges_fourchette_haute ? Number(r.sieges_fourchette_haute) : null;

      await prisma.sondageMesure.create({
        data: {
          sondageVagueId: vague.id,
          candidatId,
          intentionVotePct,
          siegesMin,
          siegesMax,
        },
      });
    }
  }

  // Summary counts
  const totalElections = await prisma.election.count();
  const totalCandidats = await prisma.candidatOuListe.count();
  const totalInstituts = await prisma.institut.count();
  const totalVagues = await prisma.sondageVague.count();
  const totalMesures = await prisma.sondageMesure.count();
  const totalResultats = await prisma.resultatReel.count();

  console.log("\n==========================================");
  console.log("✅ ENHANCED SEEDING COMPLETE FOR 'LE VOTOMÈTRE'!");
  console.log(`📊 Elections: ${totalElections}`);
  console.log(`👤 Candidats / Listes: ${totalCandidats}`);
  console.log(`🏢 Instituts: ${totalInstituts}`);
  console.log(`🗳️  Résultats réels: ${totalResultats}`);
  console.log(`📈 Vagues de sondages: ${totalVagues}`);
  console.log(`📋 Mesures d'intentions: ${totalMesures}`);
  console.log("==========================================\n");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
