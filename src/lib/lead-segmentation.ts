export type LeadRow = Record<string, string>;
export function segmentLeads(rows: LeadRow[], column: string, value: string, operation: string): LeadRow[] {
  if (!column || !value.trim()) return rows;
  const match = value.toLocaleLowerCase().trim();
  return rows.filter(row => {
    const cell = (row[column] ?? "").toLocaleLowerCase().trim();
    if (operation === "equals") return cell === match;
    if (operation === "greater") return Number(cell) >= Number(value);
    if (operation === "not") return !cell.includes(match);
    return cell.includes(match);
  });
}