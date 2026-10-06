import type { Player } from "./types";

function num(value: unknown, fallback = 0) {
  const n = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : fallback;
}

function slug(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function fromRow(row: Record<string, unknown>, index: number): Player | null {
  const nome = String(row.nome ?? row.name ?? row.player ?? row["Nome"] ?? row["Name"] ?? "").trim();
  if (!nome) return null;
  const pos = String(row.pos ?? row.position ?? row["Posição"] ?? row["Position"] ?? "").trim();
  const idadeRaw = row.idade ?? row.age ?? row["Idade"] ?? row["Age"];
  const overallRaw = row.overall ?? row.rating ?? row.OVR ?? row["Overall"];
  if (!pos || idadeRaw === undefined || overallRaw === undefined || idadeRaw === "" || overallRaw === "") return null;
  const idade = Math.max(15, Math.min(60, Math.round(num(idadeRaw))));
  const overall = Math.max(1, Math.min(99, Math.round(num(overallRaw))));
  const valorMercado = num(row.valorMercado ?? row.marketValue ?? row["Valor de mercado"] ?? row["Market Value"], 0);
  const valorTransferencia = num(row.valorTransferencia ?? row.transferFee ?? row["Valor de transferência"] ?? row["Transfer Fee"], 0);
  return {
    id: String(row.id ?? row.externalId ?? slug(nome) + "-" + (index + 1)),
    nome, nomeCompleto: String(row.nomeCompleto ?? row.fullName ?? nome), pos, idade,
    nacionalidades: String(row.nacionalidades ?? row.nationality ?? row["Nacionalidade"] ?? "").split(/[|;,]/).map((v) => v.trim()).filter(Boolean),
    overall,
    potencial: row.potencial || row.potential ? Math.max(overall, Math.min(99, Math.round(num(row.potencial ?? row.potential)))) : undefined,
    valorMercado: valorMercado || undefined,
    moedaValor: String(row.moedaValor ?? row.currency ?? "EUR").toUpperCase() === "BRL" ? "BRL" : "EUR",
    moral: Math.max(0, Math.min(100, Math.round(num(row.moral, 50)))),
    forma: Math.max(0, Math.min(100, Math.round(num(row.forma ?? row.form, 50)))),
    confiancaTreinador: Math.max(0, Math.min(100, Math.round(num(row.confiancaTreinador, 50)))),
    papelElenco: String(row.papelElenco ?? row.role ?? "").trim() || undefined,
    contratoAte: String(row.contratoAte ?? row.contractUntil ?? row["Contrato"] ?? "").trim() || "—",
    disponivelNoJogo: row.disponivelNoJogo !== false, origem: "fc26",
    valorTransferencia: valorTransferencia || undefined,
    moedaTransferencia: String(row.moedaTransferencia ?? row.transferCurrency ?? "EUR").toUpperCase() === "BRL" ? "BRL" : "EUR",
    clubeOrigem: String(row.clubeOrigem ?? row.previousClub ?? row["Clube anterior"] ?? "").trim() || undefined,
    dataTransferencia: String(row.dataTransferencia ?? row.transferDate ?? "").trim() || undefined,
    observacoes: String(row.observacoes ?? row.notes ?? "").trim() || undefined,
  };
}

export function parsePlayersJson(text: string): Player[] {
  const parsed = JSON.parse(text);
  const rows = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.players) ? parsed.players : Array.isArray(parsed?.jogadores) ? parsed.jogadores : [];
  return rows.map((row, i) => fromRow(row as Record<string, unknown>, i)).filter(Boolean) as Player[];
}

function splitCsv(line: string) {
  const cells: string[] = []; let current = ""; let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === "\"" && line[i + 1] === "\"") { current += "\""; i++; continue; }
    if (c === "\"") { quoted = !quoted; continue; }
    if (c === "," && !quoted) { cells.push(current.trim()); current = ""; continue; }
    current += c;
  }
  cells.push(current.trim()); return cells;
}

export function parsePlayersCsv(text: string): Player[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = splitCsv(lines[0]).map((h) => h.replace(/^\uFEFF/, ""));
  return lines.slice(1).map((line, i) => {
    const values = splitCsv(line);
    return fromRow(Object.fromEntries(headers.map((h, idx) => [h, values[idx] ?? ""])), i);
  }).filter(Boolean) as Player[];
}

export function parsePlayerDatabase(text: string, fileName = "") {
  const trimmed = text.trim();
  if (fileName.toLowerCase().endsWith(".csv") || trimmed.startsWith("nome,") || trimmed.startsWith("name,")) return parsePlayersCsv(trimmed);
  return parsePlayersJson(trimmed);
}