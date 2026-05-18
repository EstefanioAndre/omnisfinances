## Objetivo
Adicionar um botão azul brilhante "Baixar PDF" na tela de resultado (após gerar o plano) que exporta um PDF com resumo, meta e passo a passo.

## Mudanças

**Arquivo:** `src/routes/index.tsx` (única alteração)

1. Adicionar dependência `jspdf` via `bun add jspdf`.
2. Na tela de resultado, abaixo do botão "Gerar / Voltar", incluir novo botão `BAIXAR PDF` (estilo azul-bebê brilhante, mesma identidade visual dos demais).
3. Criar função `downloadPlanPDF(plan, inputs, lang)` que gera o PDF contendo:
   - **Cabeçalho:** "OMNIS FINANCES — Plano Financeiro" + data
   - **Resumo / Diagnóstico:** renda, reserva atual, método de pagamento, frequência
   - **Meta:** valor a duplicar, meses realistas, retorno-alvo (CAGR), economia mensal sugerida, % da renda
   - **Passo a passo:** lista numerada dos steps gerados
   - **Veículos sugeridos** e **Erros a evitar**
4. Textos do PDF traduzidos conforme `lang` (PT/EN/ES) usando o objeto `T` já existente.
5. Nome do arquivo: `omnis-plano-YYYY-MM-DD.pdf`.

## Notas técnicas
- `jspdf` funciona 100% no browser (sem dependência de Node) — seguro com Vite/TanStack Start.
- Geração feita client-side ao clicar; sem chamadas de servidor.
- Sem mudanças em outras telas, lógica de cálculo (`buildPlan`, `solveReturn`) ou no conversor.