import { useRef, useState } from "react";
import Papa from "papaparse";
import { Upload, Download, Filter, Database } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LeadRow, segmentLeads } from "@/lib/lead-segmentation";
const sample: LeadRow[] = [
  { nome: "Carlos Mendes", email: "carlos@exemplo.com", origem: "Meta", cidade: "São Paulo", score: "85" },
  { nome: "Ana Beatriz", email: "ana@exemplo.com", origem: "Google", cidade: "Rio de Janeiro", score: "92" },
  { nome: "Marina Souza", email: "marina@exemplo.com", origem: "Meta", cidade: "São Paulo", score: "68" },
  { nome: "Roberto Lima", email: "roberto@exemplo.com", origem: "Site", cidade: "Belo Horizonte", score: "78" },
  { nome: "Bianca Martins", email: "bianca@exemplo.com", origem: "Indicação", cidade: "Curitiba", score: "88" },
];
export default function LeadSegmenter() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<LeadRow[]>([]);
  const [result, setResult] = useState<LeadRow[] | null>(null);
  const [filename, setFilename] = useState("");
  const [column, setColumn] = useState("");
  const [operation, setOperation] = useState("contains");
  const [value, setValue] = useState("");
  const columns = rows.length ? Object.keys(rows[0]) : [];
  const load = (data: LeadRow[], name: string) => { setRows(data); setFilename(name); setColumn(Object.keys(data[0] ?? {})[0] ?? ""); setResult(null); setValue(""); };
  const download = () => {
    if (!result) return;
    const url = URL.createObjectURL(new Blob(["\ufeff" + Papa.unparse(result, { escapeFormulae: true })], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = "leads-segmentados.csv"; a.click(); URL.revokeObjectURL(url);
  };
  return <section className="space-y-6">
    <div className="flex flex-wrap justify-between gap-4"><div><h2 className="text-xl font-semibold">Segmentador de leads</h2><p className="mt-1 text-sm text-muted-foreground">Bases e segmentos</p></div><span className="text-xs text-muted-foreground">Teste · processamento neste navegador</span></div>
    <div className="border-2 border-dashed border-border rounded-lg px-5 py-8 text-center"><Database className="mx-auto mb-3 text-primary" size={28} /><h3 className="font-semibold">{filename || "Importar base de leads"}</h3><p className="text-sm text-muted-foreground mt-1">CSV · {rows.length ? `${rows.length} contatos encontrados` : "Nenhuma base selecionada"}</p><div className="flex flex-wrap justify-center gap-3 mt-5"><Button variant="outline" onClick={() => fileRef.current?.click()}><Upload /> Importar CSV</Button><Button variant="ghost" onClick={() => load(sample, "Base de demonstração")}>Usar base de exemplo</Button></div>
      <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" aria-label="Importar base CSV" onChange={e => { const file = e.target.files?.[0]; if (!file) return; Papa.parse<LeadRow>(file, { header: true, skipEmptyLines: "greedy", transformHeader: h => h.trim(), complete: parsed => { if (parsed.errors.length || !parsed.data.length) { toast.error("Não foi possível ler a base. Confira o CSV."); return; } load(parsed.data, file.name); }, error: () => toast.error("Erro ao importar CSV") }); e.target.value = ""; }} />
    </div>
    {rows.length > 0 && <><div className="grid sm:grid-cols-3 gap-4"><div className="space-y-2"><Label>Campo</Label><Select value={column} onValueChange={setColumn}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{columns.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label>Condição</Label><Select value={operation} onValueChange={setOperation}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="contains">Contém</SelectItem><SelectItem value="equals">É igual a</SelectItem><SelectItem value="not">Não contém</SelectItem><SelectItem value="greater">Maior ou igual a</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label htmlFor="segment-value">Valor</Label><Input id="segment-value" value={value} onChange={e => setValue(e.target.value)} placeholder="Ex: Meta" /></div></div>
      <Button onClick={() => setResult(segmentLeads(rows, column, value, operation))}><Filter /> Segmentar base</Button>
      {result && <div className="border-t border-border pt-5"><div className="flex items-center justify-between gap-2 mb-4"><h3 className="font-semibold">{result.length} de {rows.length} leads no segmento</h3><Button variant="outline" disabled={!result.length} onClick={download}><Download /> Exportar CSV</Button></div><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr>{columns.map(c => <th key={c} className="p-3 text-left text-muted-foreground border-b border-border">{c}</th>)}</tr></thead><tbody>{result.slice(0, 20).map((r, i) => <tr key={i}>{columns.map(c => <td key={c} className="p-3 border-b border-border">{r[c]}</td>)}</tr>)}</tbody></table></div>{!result.length && <p className="text-muted-foreground py-6">Nenhum lead corresponde aos critérios.</p>}</div>}
    </>}
  </section>;
}