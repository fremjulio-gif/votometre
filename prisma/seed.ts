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

  if (p.includes("LO") || p.includes("NPA") || p === "EXG" || n.includes("ARTHAUD") || n.includes("POUTOU") || n.includes("LAGUILLER") || n.includes("BESANCENOT")) {
    return { famille: "Extrême gauche", couleurHex: "#922B21" };
  }
  if (p.includes("LFI") || p === "FI" || n.includes("MÉLENCHON") || n.includes("MELENCHON") || n.includes("CHIKIROU") || p.includes("PG") || f.includes("GAUCHE RADICALE") || n.includes("AUBRY")) {
    return { famille: "Gauche radicale", couleurHex: "#C0392B" };
  }
  if (p === "COM" || p.includes("PCF") || n.includes("ROUSSEL") || n.includes("LECOQ") || n.includes("BUFFET") || n.includes("HUE") || n.includes("DEFFONTAINES")) {
    return { famille: "Parti communiste", couleurHex: "#CB4335" };
  }
  if (p === "UG" || p.includes("NFP") || p.includes("NOUVEAU FRONT POPULAIRE") || p.includes("UNION DE LA GAUCHE") || p.includes("NUPES") || f.includes("UNION DE LA GAUCHE")) {
    return { famille: "Union de la gauche", couleurHex: "#C0392B" };
  }
  if (p === "VEC" || p.includes("EELV") || p.includes("ECOL") || p === "ECO" || n.includes("JADOT") || n.includes("TONDELIER") || n.includes("DOUCET") || n.includes("HURMIC") || n.includes("DENIS") || n.includes("VOYNET")) {
    return { famille: "Écologiste", couleurHex: "#27AE60" };
  }
  if (p === "SOC" || p.includes("PS") || p === "DVG" || p.includes("PRG") || p.includes("PP") || n.includes("GLUCKSMANN") || n.includes("PAYAN") || n.includes("GRÉGOIRE") || n.includes("GREGOIRE") || n.includes("MAYER-ROSSIGNOL") || n.includes("MARBOT") || n.includes("HOLLANDE") || n.includes("ROYAL") || n.includes("JOSPIN") || n.includes("HAMON") || n.includes("HIDALGO") || f.includes("GAUCHE")) {
    return { famille: "Gauche républicaine & DVG", couleurHex: "#E74C3C" };
  }
  if (p === "DVC" || p === "UC" || p === "RE" || p.includes("ENS") || p.includes("LREM") || p.includes("RENAISSANCE") || p.includes("MODEM") || p.includes("HOR") || n.includes("MACRON") || n.includes("ATTAL") || n.includes("PHILIPPE") || n.includes("ARMAND") || n.includes("CAZENAVE") || n.includes("BÉCHU") || n.includes("BECHU") || n.includes("HAYER") || n.includes("BAYROU") || f.includes("CENTRE") || f.includes("MAJORITÉ PRÉSIDENTIELLE")) {
    return { famille: "Bloc central & DVC", couleurHex: "#F39C12" };
  }
  if (p === "DVD" || p === "UD" || p === "UDI" || p === "LFA" || p.includes("LR") || p.includes("UMP") || p.includes("RPR") || p.includes("UDF") || n.includes("DATI") || n.includes("AULAS") || n.includes("MOUDENC") || n.includes("FAGAUT") || n.includes("MOTHRON") || n.includes("JOISSAINS") || n.includes("CHIRAC") || n.includes("SARKOZY") || n.includes("FILLON") || n.includes("PÉCRESSE") || n.includes("BELLAMY") || n.includes("RETAILLEAU") || n.includes("WAUQUIEZ") || f.includes("DROITE")) {
    return { famille: "Droite républicaine & DVD", couleurHex: "#2980B9" };
  }
  if (p.includes("REC") || n.includes("ZEMMOUR") || n.includes("MARÉCHAL") || n.includes("MARECHAL")) {
    return { famille: "Reconquête", couleurHex: "#8E44AD" };
  }
  if (p === "UXD" || p === "UDR" || p === "EXD" || p.includes("RN") || p.includes("FN") || n.includes("ALLISIO") || n.includes("LE PEN") || n.includes("BARDELLA") || n.includes("CIOTTI") || f.includes("EXTRÊME DROITE") || f.includes("NATIONALISTE")) {
    return { famille: "Rassemblement National & Alliés", couleurHex: "#1B4F72" };
  }
  if (p === "REG" || p === "DSV" || p === "DIV" || p.includes("DLF") || n.includes("DUPONT-AIGNAN") || p.includes("UPR") || n.includes("ASSELINEAU") || n.includes("LASSALLE") || n.includes("RÉSISTONS")) {
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

  // ==========================================
  // 7. ELECTIONS MUNICIPALES 2026
  // ==========================================
  console.log("\n📦 Ingesting Élections Municipales 2026...");
  const muniFile = path.join(dataDir, "resultats_municipales_2026.xlsx");

  if (fs.existsSync(muniFile)) {
    const muniWb = XLSX.readFile(muniFile);
    const muniNuanceRows: any[] = XLSX.utils.sheet_to_json(muniWb.Sheets["Resultats_Nuances_National"], { range: 3 });
    const muniVillesRows: any[] = XLSX.utils.sheet_to_json(muniWb.Sheets["Grandes_Villes_100k"], { range: 3 });
    const muniWitnessRows: any[] = XLSX.utils.sheet_to_json(muniWb.Sheets["Enjeux_Sondages_2026"], { range: 12 });

    // 1. Synthese Participation National T1 & T2
    const elMuniT1 = await prisma.election.upsert({
      where: { slug: "muni-2026-t1" },
      update: {
        inscrits: 48474213,
        votants: 27678488,
        exprimes: 26182365,
        tauxAbstention: 42.9,
      },
      create: {
        slug: "muni-2026-t1",
        type: ScrutinType.MUNICIPALE,
        annee: 2026,
        tour: 1,
        dateScrutin: new Date("2026-03-15T00:00:00.000Z"),
        inscrits: 48474213,
        votants: 27678488,
        exprimes: 26182365,
        tauxAbstention: 42.9,
      },
    });
    electionMap.set("muni-2026-t1", elMuniT1.id);

    const elMuniT2 = await prisma.election.upsert({
      where: { slug: "muni-2026-t2" },
      update: {
        inscrits: 16879356,
        votants: 9625762,
        exprimes: 9391407,
        tauxAbstention: 42.97,
      },
      create: {
        slug: "muni-2026-t2",
        type: ScrutinType.MUNICIPALE,
        annee: 2026,
        tour: 2,
        dateScrutin: new Date("2026-03-22T00:00:00.000Z"),
        inscrits: 16879356,
        votants: 9625762,
        exprimes: 9391407,
        tauxAbstention: 42.97,
      },
    });
    electionMap.set("muni-2026-t2", elMuniT2.id);

    // 2. Resultats Nuances National
    for (const r of muniNuanceRows) {
      const nuanceNom = r["Nuance Politique"];
      const sigle = r["Sigle"] || "DIV";
      if (!nuanceNom || String(nuanceNom).includes("TOTAL")) continue;

      const candidatId = await getOrCreateCandidat(
        `${nuanceNom} (${sigle})`,
        sigle,
        nuanceNom,
        `muni_nuance_${sigle}`
      );

      // T1
      if (r["% Exprimés T1"] || r["Voix T1"]) {
        const voixT1 = r["Voix T1"] ? BigInt(Math.round(Number(r["Voix T1"]))) : null;
        const pctT1 = normalizePct(r["% Exprimés T1"]);
        const siegesT1 = r["Sièges T1"] ? Number(r["Sièges T1"]) : null;
        const villesT1 = r["Villes Gagnées T1"] ? Number(r["Villes Gagnées T1"]) : 0;
        await prisma.resultatReel.upsert({
          where: { electionId_candidatId: { electionId: elMuniT1.id, candidatId } },
          update: { voix: voixT1, pourcentage: pctT1, sieges: siegesT1, statut: `${villesT1} villes remportées (T1)` },
          create: { electionId: elMuniT1.id, candidatId, voix: voixT1, pourcentage: pctT1, sieges: siegesT1, statut: `${villesT1} villes remportées (T1)` },
        });
      }

      // T2
      if (r["% Exprimés T2"] || r["Voix T2"]) {
        const voixT2 = r["Voix T2"] ? BigInt(Math.round(Number(r["Voix T2"]))) : null;
        const pctT2 = normalizePct(r["% Exprimés T2"]);
        const siegesT2 = r["Sièges T2"] ? Number(r["Sièges T2"]) : null;
        const villesT2 = r["Villes Gagnées T2"] ? Number(r["Villes Gagnées T2"]) : 0;
        await prisma.resultatReel.upsert({
          where: { electionId_candidatId: { electionId: elMuniT2.id, candidatId } },
          update: { voix: voixT2, pourcentage: pctT2, sieges: siegesT2, statut: `${villesT2} villes remportées (T2)` },
          create: { electionId: elMuniT2.id, candidatId, voix: voixT2, pourcentage: pctT2, sieges: siegesT2, statut: `${villesT2} villes remportées (T2)` },
        });
      }
    }

    // 3. Grandes Villes (42 communes de +100k)
    for (const r of muniVillesRows) {
      const commune = r["Commune"];
      if (!commune) continue;
      const departement = r["Département"] || "";
      const slugCommune = `muni-2026-${normalizeKey(commune).replace(/\s+/g, "-")}`;

      const elCity = await prisma.election.upsert({
        where: { slug: slugCommune },
        update: { commune, departement },
        create: {
          slug: slugCommune,
          type: ScrutinType.MUNICIPALE,
          annee: 2026,
          tour: 2,
          dateScrutin: new Date("2026-03-22T00:00:00.000Z"),
          commune,
          departement,
        },
      });

      const maireElu = r["Maire Élu(e) 2026"] || "Maire";
      const partiElu = r["Parti Élu 2026"] || "Indépendant";
      const evolution = r["Évolution Politique"] || "Maintien";

      const candidatId = await getOrCreateCandidat(
        maireElu,
        partiElu,
        undefined,
        `maire_2026_${normalizeKey(commune)}`
      );

      await prisma.resultatReel.upsert({
        where: { electionId_candidatId: { electionId: elCity.id, candidatId } },
        update: {
          pourcentage: 50.0,
          statut: evolution,
          commune,
          departement,
        },
        create: {
          electionId: elCity.id,
          candidatId,
          pourcentage: 50.0,
          statut: evolution,
          commune,
          departement,
        },
      });
    }

    // 4. Enquêtes & Confrontation Sondages vs Réel dans les Métropoles témoins
    const defaultInstitutId = await getOrCreateInstitut("Ipsos");

    for (const w of muniWitnessRows) {
      const ville = w["Ville"];
      const candidatNom = w["Candidat / Tête de liste"];
      if (!ville || !candidatNom) continue;

      const nuance = w["Nuance"] || "DIV";
      const tourStr = w["Tour"] || "1er tour";
      const tour = tourStr.includes("2") ? 2 : 1;
      const dateVote = tour === 1 ? new Date("2026-03-15T00:00:00.000Z") : new Date("2026-03-22T00:00:00.000Z");
      const slugWitness = `muni-2026-${normalizeKey(ville).replace(/\s+/g, "-")}-t${tour}`;

      let elWitness = await prisma.election.findUnique({ where: { slug: slugWitness } });
      if (!elWitness) {
        elWitness = await prisma.election.create({
          data: {
            slug: slugWitness,
            type: ScrutinType.MUNICIPALE,
            annee: 2026,
            tour,
            dateScrutin: dateVote,
            commune: ville,
          },
        });
      }

      // Check or create candidate
      const candKey = `muni_witness_${normalizeKey(ville)}_${normalizeKey(candidatNom)}`;
      const candidatId = await getOrCreateCandidat(candidatNom, nuance, undefined, candKey);

      // Real result
      const scoreReel = normalizePct(w["Résultat Proclamé"]);
      await prisma.resultatReel.upsert({
        where: { electionId_candidatId: { electionId: elWitness.id, candidatId } },
        update: { pourcentage: scoreReel, statut: "Candidat Métropole" },
        create: { electionId: elWitness.id, candidatId, pourcentage: scoreReel, statut: "Candidat Métropole" },
      });

      // Sondage Vague for this city election
      const codeSondage = `POLL_MUNI_2026_${normalizeKey(ville).toUpperCase()}_T${tour}`;
      let vague = await prisma.sondageVague.findFirst({
        where: { electionId: elWitness.id, codeSondage },
      });

      if (!vague) {
        vague = await prisma.sondageVague.create({
          data: {
            codeSondage,
            electionId: elWitness.id,
            institutId: defaultInstitutId,
            commanditaire: `Sondage de veille ${ville}`,
            datePublication: dateVote,
            estDernierSondage: true,
            statut: `Veille scrutin ${ville} (Tour ${tour})`,
          },
        });
      }

      // Sondage Mesure
      const intentionPct = normalizePct(w["Estimation Sondeur"]);
      await prisma.sondageMesure.create({
        data: {
          sondageVagueId: vague.id,
          candidatId,
          intentionVotePct: intentionPct,
        },
      });
    }
  }

  // ==========================================
  // 8. STATISTIQUES PARTICIPATION, ABSTENTION & SOCIOLOGIE DU VOTE
  // ==========================================
  console.log("\n📦 Ingesting Statistiques Participation, Abstention & Sociologie...");
  const abstentionFile = path.join(dataDir, "statistiques_participation_abstention.xlsx");

  if (fs.existsSync(abstentionFile)) {
    const absWb = XLSX.readFile(abstentionFile);
    const partRows: any[] = XLSX.utils.sheet_to_json(absWb.Sheets["Evolution_Participation"], { range: 3 });

    for (const r of partRows) {
      const scrutin = String(r["Scrutin"] || "");
      const annee = Number(r["Année"]);
      const tour = Number(r["Tour"]) || 1;
      let prefix = "";
      let scrutinType: ScrutinType = ScrutinType.PRESIDENTIELLE;

      if (scrutin.includes("Présidentielle")) {
        prefix = "presi";
        scrutinType = ScrutinType.PRESIDENTIELLE;
      } else if (scrutin.includes("Législatives")) {
        prefix = "legis";
        scrutinType = ScrutinType.LEGISLATIVE;
      } else if (scrutin.includes("Européennes")) {
        prefix = "euro";
        scrutinType = ScrutinType.EUROPEENNE;
      } else if (scrutin.includes("Municipales")) {
        prefix = "muni";
        scrutinType = ScrutinType.MUNICIPALE;
      }

      const slug = `${prefix}-${annee}-t${tour}`;
      const inscrits = r["Inscrits"] ? Number(r["Inscrits"]) : null;
      const votants = r["Votants"] ? Number(r["Votants"]) : null;
      const exprimes = r["Suffrages Exprimés"] ? Number(r["Suffrages Exprimés"]) : null;
      const votesBlancs = r["Votes Blancs"] ? Number(r["Votes Blancs"]) : null;
      const votesNuls = r["Votes Nuls"] ? Number(r["Votes Nuls"]) : null;
      const tauxAbstention =
        inscrits && votants
          ? Math.round(((inscrits - votants) / inscrits) * 10000) / 100
          : null;
      const dateScrutin = r["Date"] ? new Date(`${r["Date"]}T00:00:00.000Z`) : new Date(`${annee}-05-01T00:00:00.000Z`);

      await prisma.election.upsert({
        where: { slug },
        update: {
          inscrits,
          votants,
          exprimes,
          tauxAbstention,
          votesBlancs,
          votesNuls,
        },
        create: {
          slug,
          type: scrutinType,
          annee,
          tour,
          dateScrutin,
          inscrits,
          votants,
          exprimes,
          tauxAbstention,
          votesBlancs,
          votesNuls,
        },
      });
    }

    console.log(`✅ Ingested ${partRows.length} participation records into official elections.`);
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
