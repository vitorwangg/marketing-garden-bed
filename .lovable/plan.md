

## Plan: Update Brand DNA Page — UI Changes + Supabase Integration

### Current State
- Auth is **mock-based** (no real Supabase auth) — `user_id` will be stored as the mock user's email for now
- The `marcas` table exists with all needed columns; no schema changes required
- Storage bucket `brand_logos` exists and is public
- RLS is enabled on `marcas` but **no policies exist** — inserts/selects will fail

### Step 1: Add RLS Policies for `marcas`
Since there's no real auth, we need a permissive policy (or disable RLS). Since the auth is mock-based, we'll add policies that allow all authenticated AND anonymous access for now, with a note to tighten once real auth is added.

```sql
CREATE POLICY "Allow all access to marcas" ON public.marcas
  FOR ALL USING (true) WITH CHECK (true);
```

Also need storage policies for `brand_logos`:
```sql
CREATE POLICY "Allow public read brand_logos" ON storage.objects
  FOR SELECT USING (bucket_id = 'brand_logos');
CREATE POLICY "Allow insert brand_logos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'brand_logos');
CREATE POLICY "Allow update brand_logos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'brand_logos');
```

### Step 2: Rewrite `BrandDNA.tsx`

**Remove:**
- `audienceFields` entries for `location`, `income`, `interest`
- All mock brand data (`brandDataMock`)
- Session-only logo state

**Add new form fields:**
- **Pitch/Bio**: `<Textarea>` mapped to `pitch_bio`
- **Modelo de Venda**: `<Select>` with B2B/B2C/Ambos → `modelo_venda`
- **Idioma Padrão**: `<Select>` with PT-BR/EN/DE/FR → `idioma_padrao`
- **Mercado/Nicho**: Tag input (same pattern as Palavras Proibidas) → `mercado_nicho`

**Keep intact:**
- Tom de Voz chips
- Palavras Proibidas tag input
- Público-Alvo (only Faixa Etária + Gênero)
- Identidade Visual (3 logo uploads + color picker)

**Supabase integration logic:**

1. **On page load**: Fetch all `marcas` for current mock user (`user_id = user.email`). Populate brand cards from DB instead of mock data.

2. **On brand card click (edit)**: Load that brand's data into the editor form, including displaying logos from their public URLs.

3. **On Save**:
   - Upload logo files (if changed) to `brand_logos/{brandId}/{slot}` using `supabase.storage`
   - Get public URLs for uploaded logos
   - Upsert into `marcas` table with all form fields mapped to columns:
     - `nome_da_marca`, `pitch_bio`, `modelo_venda`, `idioma_padrao`
     - `mercado_nicho` (string array), `tom_de_voz` (string array), `palavras_proibidas` (string array)
     - `publico_faixa_etaria` (string array), `publico_genero` (string)
     - `cor_primaria`, `cor_secundaria`, `cor_terciaria`
     - `logo_principal_url`, `logo_branca_url`, `logo_preta_url`
     - `user_id` (mock user email)

4. **On "Add New Brand"**: Same flow but INSERT instead of UPDATE.

### Column Mapping

| UI Field | DB Column | Type |
|----------|-----------|------|
| Logo Principal | `logo_principal_url` | text (public URL) |
| Logo Monocromática | `logo_branca_url` | text |
| Logo Ícone | `logo_preta_url` | text |
| Colors [0,1,2] | `cor_primaria/secundaria/terciaria` | text |
| Tom de Voz | `tom_de_voz` | text[] |
| Faixa Etária | `publico_faixa_etaria` | text[] |
| Gênero | `publico_genero` | text |
| Palavras Proibidas | `palavras_proibidas` | text[] |
| Pitch/Bio | `pitch_bio` | text |
| Modelo de Venda | `modelo_venda` | text |
| Idioma Padrão | `idioma_padrao` | text |
| Mercado/Nicho | `mercado_nicho` | text[] |

### Important Note
Since auth is mock-based, RLS will be fully open. Once real authentication is implemented, policies should be tightened to `auth.uid() = user_id`.

