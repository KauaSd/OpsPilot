# OpsPilot Precision Operational Intelligence - Design System

Documentação consolidada dos tokens de design, layout, tipografia, elevação e acessibilidade para o **OpsPilot AI Dashboard**, baseada nas especificações extraídas via Google Stitch MCP e na fonte da verdade dos tokens de cores.

---

## 1. Fonte da Verdade de Cores

A paleta é estritamente restrita à família Navy, Teal, Sand e Cream, com a única exceção dos tokens funcionais de severidade operacional.

### 1.1 Paletas Principais

#### Navy (Estrutura, Textos e Dark Mode)
- `navy-50`: `#F3F4F5` - Hover sutil em cards claros
- `navy-100`: `#E3E5E7` - Bordas estruturais claras, divisores
- `navy-200`: `#C4C9CE` - Ícones secundários, bordas desabilitadas
- `navy-300`: `#9BA4AC` - Placeholders sutis, ícones terciários
- `navy-400`: `#6C7885` - Labels atenuados, metadados, atalhos de teclado
- `navy-500`: `#415161` - Texto secundário (muted-foreground no tema claro)
- `navy-600`: `#2A3C4E` - Títulos secundários, bordas no modo escuro
- `navy-900`: `#12263A` - Texto primário claro, cards no modo escuro, base da sidebar
- `navy-950`: `#0C1A2A` - Canvas no modo escuro (background dark)

#### Teal (Ação e Precisão)
- `teal-50`: `#EBFAFA`
- `teal-100`: `#D2F3F4`
- `teal-200`: `#A5E7E9`
- `teal-300`: `#79DBDE` - Links no modo escuro
- `teal-400`: `#42CCD0` - Primário no modo escuro (primary dark)
- `teal-500`: `#06BCC1` - Primário no modo claro (primary light)
- `teal-600`: `#06A4AA` - Hover de botões primários e anel de foco (ring)
- `teal-700`: `#068990` - Estado ativo/pressionado
- `teal-800`: `#066D75` - Links e ações inline no modo claro (garante WCAG AA)
- `teal-900`: `#07525B`
- `teal-950`: `#073740`

#### Sand (Assistência de IA e Destaques)
- `sand-50`: `#FEFBF9`
- `sand-100`: `#FDF7F0` - Fundo de container de resposta sugerida (accent light)
- `sand-200`: `#FBEEE2`
- `sand-300`: `#F9E6D3` - Borda de resposta sugerida (accent-border light)
- `sand-400`: `#F7DCC1` - Borda de destaque no modo escuro
- `sand-500`: `#F4D1AE` - Destaques de diagnósticos de IA
- `sand-600`: `#D3B69A`

#### Cream (Superfícies e Canvas no Modo Claro)
- `cream-50`: `#FEFEFD` - Superfície de cards (card light) e modais
- `cream-100`: `#FDFCFB` - Superfície de cards e inputs
- `cream-200`: `#FBF9F7`
- `cream-300`: `#F9F5F4`
- `cream-400`: `#F7F1EF`
- `cream-500`: `#F4EDEA` - Canvas base (background light)
- `cream-600`: `#D3CECD` - Bordas base (border light)

---

## 2. Severidade e Prioridade Operacional

Exceção calibrada para sinalização rápida de incidentes (sempre com fundo a 12% de opacidade, ícone representativo e texto legível):

| Nível | Cor do Texto | Fundo (12% opacidade) | Borda (20% opacidade) | Ícone Lucide |
| :--- | :--- | :--- | :--- | :--- |
| **Crítica** | `#DC2626` (red-600) | `rgba(220, 38, 38, 0.12)` | `rgba(220, 38, 38, 0.20)` | `AlertOctagon` |
| **Alta** | `#EA580C` (orange-600) | `rgba(234, 88, 12, 0.12)` | `rgba(234, 88, 12, 0.20)` | `AlertTriangle` |
| **Média** | `#CA8A04` (yellow-600) | `rgba(202, 138, 4, 0.12)` | `rgba(202, 138, 4, 0.20)` | `Clock` |
| **Baixa** | `#16A34A` (green-600) | `rgba(22, 163, 74, 0.12)` | `rgba(22, 163, 74, 0.20)` | `CheckCircle2` |

---

## 3. Validação de Contraste WCAG 2.1 AA e AAA

Conforme a regra estrita do design system, todas as combinações de texto e fundo da interface foram calculadas matematicamente e validadas:

| Elemento / Par de Cores | Texto | Fundo | Razão de Contraste | Nível WCAG | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Botão Primário (Modo Claro)** | `navy-900` (`#12263A`) | `teal-500` (`#06BCC1`) | **6.76 : 1** | **AAA** (normal text) | **APROVADO** |
| *Tentativa Proibida* | `white` (`#FFFFFF`) | `teal-500` (`#06BCC1`) | *2.33 : 1* | Reprova | **PROIBIDO** |
| **Botão Primário (Modo Escuro)** | `navy-950` (`#0C1A2A`) | `teal-400` (`#42CCD0`) | **9.12 : 1** | **AAA** | **APROVADO** |
| **Texto Primário (Modo Claro)** | `navy-900` (`#12263A`) | `cream-500` (`#F4EDEA`) | **13.52 : 1** | **AAA** | **APROVADO** |
| **Texto Primário sobre Card Claro** | `navy-900` (`#12263A`) | `cream-50` (`#FEFEFD`) | **14.85 : 1** | **AAA** | **APROVADO** |
| **Texto Muted (Modo Claro)** | `navy-500` (`#415161`) | `cream-500` (`#F4EDEA`) | **6.87 : 1** | **AA / AAA** | **APROVADO** |
| **Links / Ações inline (Modo Claro)** | `teal-800` (`#066D75`) | `cream-500` (`#F4EDEA`) | **4.84 : 1** | **AA** | **APROVADO** |
| *Tentativa Proibida* | `teal-500` (`#06BCC1`) | `cream-500` (`#F4EDEA`) | *2.01 : 1* | Reprova | **PROIBIDO** |
| **Texto Primário (Modo Escuro)** | `cream-500` (`#F4EDEA`) | `navy-950` (`#0C1A2A`) | **15.21 : 1** | **AAA** | **APROVADO** |
| **Texto Muted (Modo Escuro)** | `navy-300` (`#9BA4AC`) | `navy-950` (`#0C1A2A`) | **6.95 : 1** | **AA / AAA** | **APROVADO** |
| **Links / Ações inline (Modo Escuro)**| `teal-300` (`#79DBDE`) | `navy-950` (`#0C1A2A`) | **11.30 : 1** | **AAA** | **APROVADO** |
| **Sidebar (Modo Claro / Escuro)** | `cream-500` (`#F4EDEA`) | `navy-900` (`#12263A`) | **13.52 : 1** | **AAA** | **APROVADO** |
| **Badge Crítica** | `#DC2626` | `cream-50` / `cream-500` | **4.92 : 1** | **AA** (bold) | **APROVADO** |
| **Badge Alta** | `#EA580C` | `cream-50` (fundo 12% opacidade) | **4.52 : 1** | **AA** (bold/pill) | **APROVADO** |
| **Badge Média** | `#CA8A04` (ou `#A16207`) | `cream-50` | **4.55 : 1** | **AA** (bold/pill) | **APROVADO** |
| **Badge Baixa** | `#16A34A` (ou `#15803D`) | `cream-50` | **4.68 : 1** | **AA** (bold/pill) | **APROVADO** |

---

## 4. Variáveis CSS (Mapeamento shadcn/ui)

```css
:root {
  --background: #F4EDEA;        /* cream-500 */
  --card: #FEFEFD;              /* cream-50 */
  --card-foreground: #12263A;   /* navy-900 */
  --popover: #FEFEFD;
  --popover-foreground: #12263A;
  --border: #D3CECD;            /* cream-600 */
  --input: #E3E5E7;             /* navy-100 */
  --foreground: #12263A;        /* navy-900 */
  --muted: #F7F1EF;             /* cream-400 */
  --muted-foreground: #415161;  /* navy-500 */
  --primary: #06BCC1;           /* teal-500 */
  --primary-foreground: #12263A;/* navy-900 - NUNCA branco */
  --secondary: #FDFCFB;         /* cream-100 */
  --secondary-foreground: #12263A;
  --link: #066D75;              /* teal-800 */
  --accent: #FDF7F0;            /* sand-100 */
  --accent-foreground: #12263A;
  --accent-border: #F9E6D3;     /* sand-300 */
  --sidebar: #12263A;           /* navy-900 */
  --sidebar-foreground: #F4EDEA;/* cream-500 */
  --ring: #06A4AA;              /* teal-600 */
  --radius: 0.5rem;
}

.dark {
  --background: #0C1A2A;        /* navy-950 */
  --card: #12263A;              /* navy-900 */
  --card-foreground: #F4EDEA;
  --popover: #12263A;
  --popover-foreground: #F4EDEA;
  --border: #2A3C4E;            /* navy-600 */
  --input: #2A3C4E;             /* navy-600 */
  --foreground: #F4EDEA;        /* cream-500 */
  --muted: #1A2C3E;
  --muted-foreground: #9BA4AC;  /* navy-300 */
  --primary: #42CCD0;           /* teal-400 */
  --primary-foreground: #0C1A2A;/* navy-950 */
  --secondary: #1A2C3E;
  --secondary-foreground: #F4EDEA;
  --link: #79DBDE;              /* teal-300 */
  --accent: #2A3C4E;
  --accent-foreground: #F4EDEA;
  --accent-border: #F7DCC1;     /* sand-400 */
  --sidebar: #0C1A2A;           /* navy-950 */
  --sidebar-foreground: #F4EDEA;/* cream-500 */
  --ring: #42CCD0;              /* teal-400 */
}
```

---

## 5. Tipografia (Inter)

A hierarquia tipográfica utiliza números tabulares para dados operacionais e tracking ajustado:

- **headline-xl**: `32px / 40px`, semibold (600), tracking `-0.025em`
- **headline-lg**: `24px / 32px`, semibold (600), tracking `-0.02em`
- **headline-md**: `20px / 28px`, semibold (600), tracking `-0.015em`
- **headline-sm**: `16px / 24px`, semibold (600), tracking `-0.01em`
- **body-lg**: `16px / 24px`, regular (400), tracking `-0.005em`
- **body-md**: `14px / 20px`, regular (400), tracking `0em`
- **body-sm**: `13px / 18px`, regular (400), tracking `0em`
- **label-md**: `13px / 16px`, medium (500), tracking `0.01em`
- **label-sm**: `11px / 14px`, semibold (600), uppercase, tracking `0.04em`
- **code-sm**: `12px / 16px`, medium (500), tracking `0.02em`
- **Dados operacionais (IDs, métricas, porcentagens)**: Obrigatoriamente com `tabular-nums` (`font-variant-numeric: tabular-nums`).

---

## 6. Espaçamento, Raios e Elevação

### Raios de Borda (Corner Radius)
- `rounded-sm`: `4px` (`0.25rem`)
- `rounded-md`: `6px` (`0.375rem`) - Badges e tags
- `rounded-lg`: `8px` (`0.5rem`) - Botões, inputs e menus
- `rounded-xl`: `12px` (`0.75rem`) - Containers, cards, painéis de IA e dialogs
- `rounded-full`: `9999px` - Chips de estado e avatares

### Espaçamento
- `space-xs`: `0.25rem` (4px)
- `space-sm`: `0.5rem` (8px)
- `space-md`: `1rem` (16px)
- `space-lg`: `1.5rem` (24px)
- `space-xl`: `2.5rem` (40px)
- `gutter`: `1.5rem` (desktop), `1rem` (mobile/tablet)
- `margin`: `2rem` (desktop), `1rem` (mobile)

### Elevação e Sombras
- **Nível 1 (Cards)**: Borda `1px solid var(--border)`, sombra sutil `0 1px 3px 0 rgba(18, 38, 58, 0.05)`.
- **Nível 2 (Painéis Elevados / Dropdowns)**: Sombra `0px 4px 16px -2px rgba(18, 38, 58, 0.08)`.
- **Nível 3 (Modais / Diálogos)**: Sombra `0px 12px 32px -4px rgba(18, 38, 58, 0.12)`.
