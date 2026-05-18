import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, ChevronDown, Globe, ArrowRightLeft, Download } from "lucide-react";
import { jsPDF } from "jspdf";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OMNIS Finances — Plano de economia personalizado" },
      { name: "description", content: "Crie um plano de economia personalizado para duplicar seu dinheiro com OMNIS Finances." },
    ],
  }),
  component: Index,
});

type Screen = "intro" | "plan" | "result" | "convert";
type Lang = "pt" | "en" | "es";
type PayMethod = "credit" | "cash" | "none";
type PayFreq = "none" | "daily" | "weekly" | "monthly";

interface PlanData {
  income: number;
  savings: number;
  months: number;
  payMethod: PayMethod;
  payFreq: PayFreq;
}

/* ---------- i18n ---------- */
const T: Record<Lang, Record<string, string>> = {
  pt: {
    start: "START", converter: "CONVERSOR", finances: "FINANCES",
    intro_sub: "Este app ajuda a criar planos de economia e te ajuda a gerir seu emprego ou negócios.",
    planTitle: "O seu plano garantido",
    income: "Quanto você ganha (mensal)", savings: "Quanto você tem", months: "Até quando quer duplicar (meses)",
    create: "CRIAR", method: "Método", freq: "Frequência",
    m_credit: "Cartão de crédito", m_cash: "Contado", m_none: "Sem nada",
    f_none: "Nenhum", f_daily: "Por dia", f_weekly: "Semanal", f_monthly: "Por mês",
    resultTitle: "Seu Plano Personalizado", diagnosis: "Diagnóstico",
    goal: "Meta: duplicar para", monthlySave: "Reserva mensal sugerida", incomePct: "% da sua renda",
    realistic: "Prazo realista", target: "Retorno alvo (a.a.)", steps: "Plano passo a passo",
    where: "Onde guardar com segurança", mistakes: "Erros a NÃO cometer",
    convTitle: "Conversor de Moedas", from: "Moeda", to: "Converter para", amount: "Valor", convert: "CONVERTER",
    lang: "Português", downloadPdf: "BAIXAR PDF", pdfTitle: "Plano Financeiro", pdfDate: "Data", pdfSummary: "Resumo",
  },
  en: {
    start: "START", converter: "CONVERTER", finances: "FINANCES",
    intro_sub: "This app helps you build savings plans and manage your job or business.",
    planTitle: "Your guaranteed plan",
    income: "How much you earn (monthly)", savings: "How much you have", months: "Months to double",
    create: "CREATE", method: "Method", freq: "Frequency",
    m_credit: "Credit card", m_cash: "Cash", m_none: "Nothing",
    f_none: "None", f_daily: "Daily", f_weekly: "Weekly", f_monthly: "Monthly",
    resultTitle: "Your Personalized Plan", diagnosis: "Diagnosis",
    goal: "Goal: double to", monthlySave: "Suggested monthly saving", incomePct: "% of your income",
    realistic: "Realistic timeline", target: "Target return (yearly)", steps: "Step by step plan",
    where: "Where to keep it safe", mistakes: "Mistakes to AVOID",
    convTitle: "Currency Converter", from: "Currency", to: "Convert to", amount: "Amount", convert: "CONVERT",
    lang: "English", downloadPdf: "DOWNLOAD PDF", pdfTitle: "Financial Plan", pdfDate: "Date", pdfSummary: "Summary",
  },
  es: {
    start: "START", converter: "CONVERSOR", finances: "FINANCES",
    intro_sub: "Esta app te ayuda a crear planes de ahorro y a gestionar tu empleo o negocio.",
    planTitle: "Tu plan garantizado",
    income: "Cuánto ganas (mensual)", savings: "Cuánto tienes", months: "Meses para duplicar",
    create: "CREAR", method: "Método", freq: "Frecuencia",
    m_credit: "Tarjeta de crédito", m_cash: "Efectivo", m_none: "Nada",
    f_none: "Ninguna", f_daily: "Diaria", f_weekly: "Semanal", f_monthly: "Mensual",
    resultTitle: "Tu Plan Personalizado", diagnosis: "Diagnóstico",
    goal: "Meta: duplicar a", monthlySave: "Ahorro mensual sugerido", incomePct: "% de tus ingresos",
    realistic: "Plazo realista", target: "Retorno objetivo (anual)", steps: "Plan paso a paso",
    where: "Dónde guardarlo seguro", mistakes: "Errores a EVITAR",
    convTitle: "Conversor de Monedas", from: "Moneda", to: "Convertir a", amount: "Cantidad", convert: "CONVERTIR",
    lang: "Español", downloadPdf: "DESCARGAR PDF", pdfTitle: "Plan Financiero", pdfDate: "Fecha", pdfSummary: "Resumen",
  },
};

function Index() {
  const [screen, setScreen] = useState<Screen>("intro");
  const [lang, setLang] = useState<Lang>("pt");
  const [income, setIncome] = useState("");
  const [savings, setSavings] = useState("");
  const [months, setMonths] = useState("");
  const [payMethod, setPayMethod] = useState<PayMethod>("cash");
  const [payFreq, setPayFreq] = useState<PayFreq>("none");
  const [plan, setPlan] = useState<PlanData | null>(null);
  const t = T[lang];

  const handleGenerate = () => {
    const i = parseFloat(income.replace(",", "."));
    const s = parseFloat(savings.replace(",", "."));
    const m = parseInt(months);
    if (!i || !s || !m || i <= 0 || s <= 0 || m <= 0) return;
    setPlan({ income: i, savings: s, months: m, payMethod, payFreq });
    setScreen("result");
  };

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: screen === "intro" ? "#04122e" : "#061a3d" }}>
      <AnimatedBackground blurred={screen !== "intro"} />
      <MoneyRain />

      <div className="relative z-10">
        {screen === "intro" && <Intro t={t} onStart={() => setScreen("plan")} onConvert={() => setScreen("convert")} />}
        {screen === "plan" && (
          <Planner
            t={t} lang={lang} setLang={setLang}
            income={income} savings={savings} months={months}
            setIncome={setIncome} setSavings={setSavings} setMonths={setMonths}
            payMethod={payMethod} setPayMethod={setPayMethod}
            payFreq={payFreq} setPayFreq={setPayFreq}
            onBack={() => setScreen("intro")}
            onGenerate={handleGenerate}
          />
        )}
        {screen === "result" && plan && (
          <Result t={t} plan={plan} onBack={() => setScreen("plan")} />
        )}
        {screen === "convert" && <Converter t={t} onBack={() => setScreen("intro")} />}
      </div>
    </div>
  );
}

/* ---------- Intro ---------- */
function Intro({ t, onStart, onConvert }: { t: Record<string, string>; onStart: () => void; onConvert: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <h1
        className="text-7xl sm:text-8xl font-black tracking-widest text-white"
        style={{ textShadow: "0 0 20px rgba(255,255,255,0.8), 0 0 40px rgba(120,180,255,0.6), 0 0 80px rgba(80,140,255,0.4)" }}
      >
        OMNIS
      </h1>
      <p
        className="mt-2 text-base sm:text-lg tracking-[0.5em] text-sky-200/90 font-light"
        style={{ textShadow: "0 0 10px rgba(125,211,252,0.5)" }}
      >
        {t.finances}
      </p>

      <div className="h-20" />

      <button onClick={onStart} className="relative px-16 py-4 rounded-xl font-bold text-xl tracking-[0.4em] text-white transition-transform active:scale-95 hover:scale-105"
        style={{ background: "linear-gradient(135deg, #38bdf8, #0ea5e9)", boxShadow: "0 0 30px rgba(56,189,248,0.8), 0 0 60px rgba(56,189,248,0.4), inset 0 1px 0 rgba(255,255,255,0.3)" }}>
        {t.start}
      </button>

      <button onClick={onConvert} className="mt-5 px-10 py-3 rounded-xl font-semibold text-sm tracking-[0.3em] text-white transition-transform active:scale-95 hover:scale-105 flex items-center gap-2"
        style={{ background: "linear-gradient(135deg, rgba(56,189,248,0.25), rgba(14,165,233,0.25))", border: "1px solid rgba(125,211,252,0.5)", boxShadow: "0 0 20px rgba(56,189,248,0.35)" }}>
        <ArrowRightLeft className="w-4 h-4" /> {t.converter}
      </button>

      <p className="mt-8 max-w-xs text-xs text-slate-300/70 leading-relaxed">
        {t.intro_sub}
      </p>
    </div>
  );
}

/* ---------- Planner ---------- */
function Planner(props: {
  t: Record<string, string>; lang: Lang; setLang: (l: Lang) => void;
  income: string; savings: string; months: string;
  setIncome: (v: string) => void; setSavings: (v: string) => void; setMonths: (v: string) => void;
  payMethod: PayMethod; setPayMethod: (m: PayMethod) => void;
  payFreq: PayFreq; setPayFreq: (f: PayFreq) => void;
  onBack: () => void; onGenerate: () => void;
}) {
  const { t } = props;
  return (
    <div className="min-h-screen px-6 pt-6 pb-32 relative">
      <button onClick={props.onBack} className="text-white/80 hover:text-white flex items-center gap-2">
        <ArrowLeft className="w-6 h-6" />
      </button>

      <h2 className="mt-8 text-center text-3xl font-bold text-white tracking-wide"
        style={{ textShadow: "0 0 15px rgba(125,211,252,0.6)" }}>
        {t.planTitle}
      </h2>

      <div className="mt-10 flex flex-col gap-5 max-w-md mx-auto">
        <Field label={t.income} value={props.income} onChange={props.setIncome} placeholder="3500" />

        {/* Mini selects below income */}
        <div className="flex gap-3 -mt-2">
          <MiniSelect
            value={props.payMethod}
            onChange={(v) => props.setPayMethod(v as PayMethod)}
            options={[
              { value: "credit", label: t.m_credit },
              { value: "cash", label: t.m_cash },
              { value: "none", label: t.m_none },
            ]}
          />
          <MiniSelect
            value={props.payFreq}
            onChange={(v) => props.setPayFreq(v as PayFreq)}
            options={[
              { value: "none", label: t.f_none },
              { value: "daily", label: t.f_daily },
              { value: "weekly", label: t.f_weekly },
              { value: "monthly", label: t.f_monthly },
            ]}
          />
        </div>

        <Field label={t.savings} value={props.savings} onChange={props.setSavings} placeholder="8000" />
        <Field label={t.months} value={props.months} onChange={props.setMonths} placeholder="18" />

        <button onClick={props.onGenerate}
          className="mt-4 py-4 rounded-xl font-bold text-lg tracking-[0.3em] text-white transition-transform active:scale-95 hover:scale-105"
          style={{ background: "linear-gradient(135deg, #38bdf8, #0ea5e9)", boxShadow: "0 0 30px rgba(56,189,248,0.8), 0 0 60px rgba(56,189,248,0.4)" }}>
          {t.create}
        </button>
      </div>

      {/* Language switcher bottom-right */}
      <LangSwitcher lang={props.lang} setLang={props.setLang} t={t} />
    </div>
  );
}

function MiniSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value)?.label ?? "";
  return (
    <div className="relative flex-1">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-white text-sm"
        style={{ background: "rgba(8,30,70,0.65)", border: "1px solid rgba(125,211,252,0.35)", boxShadow: "0 0 12px rgba(56,189,248,0.25)" }}>
        <span className="truncate">{current}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-30 left-0 right-0 mt-1 rounded-lg overflow-hidden"
          style={{ background: "rgba(8,30,70,0.95)", border: "1px solid rgba(125,211,252,0.4)", boxShadow: "0 8px 30px rgba(0,0,0,0.5)" }}>
          {options.map((o) => (
            <button key={o.value} onClick={() => { onChange(o.value); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm text-white hover:bg-sky-500/20 ${o.value === value ? "bg-sky-500/15" : ""}`}>
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function LangSwitcher({ lang, setLang, t }: { lang: Lang; setLang: (l: Lang) => void; t: Record<string, string> }) {
  const [open, setOpen] = useState(false);
  const langs: { v: Lang; label: string }[] = [
    { v: "en", label: "English" }, { v: "es", label: "Español" }, { v: "pt", label: "Português" },
  ];
  return (
    <div className="fixed bottom-5 right-5 z-40">
      {open && (
        <div className="mb-2 flex flex-col gap-2">
          {langs.map((l) => (
            <button key={l.v}
              onClick={() => { setLang(l.v); setOpen(false); }}
              className="px-4 py-2 rounded-lg text-white text-sm font-semibold transition-transform hover:scale-105"
              style={{
                background: l.v === lang ? "linear-gradient(135deg, #38bdf8, #0ea5e9)" : "rgba(8,30,70,0.85)",
                border: "1px solid rgba(125,211,252,0.5)",
                boxShadow: "0 0 18px rgba(56,189,248,0.45)",
              }}>
              {l.label}
            </button>
          ))}
        </div>
      )}
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold"
        style={{ background: "linear-gradient(135deg, #38bdf8, #0ea5e9)", boxShadow: "0 0 22px rgba(56,189,248,0.7)" }}>
        <Globe className="w-4 h-4" />
        {t.lang}
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="rounded-2xl p-4 backdrop-blur-md"
      style={{ background: "rgba(8, 30, 70, 0.55)", border: "1px solid rgba(125,211,252,0.25)", boxShadow: "0 4px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)" }}>
      <label className="block text-xs text-sky-200/80 mb-2 tracking-wider uppercase">{label}</label>
      <input inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-transparent text-white text-xl font-semibold outline-none placeholder:text-white/30" />
    </div>
  );
}

/* ---------- Converter ---------- */
const CURRENCIES = [
  { code: "BRL", label: "Real brasileiro (R$)", usd: 0.18 },
  { code: "USD", label: "Dólar americano ($)", usd: 1 },
  { code: "EUR", label: "Euro (€)", usd: 1.08 },
  { code: "AOA", label: "Kwanza (Kz)", usd: 0.0011 },
];

function Converter({ t, onBack }: { t: Record<string, string>; onBack: () => void }) {
  const [from, setFrom] = useState("BRL");
  const [to, setTo] = useState("USD");
  const [amount, setAmount] = useState("");
  const fromC = CURRENCIES.find((c) => c.code === from)!;
  const toC = CURRENCIES.find((c) => c.code === to)!;
  const n = parseFloat(amount.replace(",", ".")) || 0;
  const result = (n * fromC.usd) / toC.usd;

  return (
    <div className="min-h-screen px-6 pt-6 pb-12">
      <button onClick={onBack} className="text-white/80 hover:text-white">
        <ArrowLeft className="w-6 h-6" />
      </button>

      <h2 className="mt-8 text-center text-3xl font-bold text-white tracking-wide"
        style={{ textShadow: "0 0 15px rgba(125,211,252,0.6)" }}>
        {t.convTitle}
      </h2>

      <div className="mt-10 flex flex-col gap-5 max-w-md mx-auto">
        <div className="rounded-2xl p-4 backdrop-blur-md"
          style={{ background: "rgba(8,30,70,0.55)", border: "1px solid rgba(125,211,252,0.25)" }}>
          <label className="block text-xs text-sky-200/80 mb-2 tracking-wider uppercase">{t.from}</label>
          <CurrencyDropdown value={from} onChange={setFrom} />
          <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={t.amount}
            className="mt-3 w-full bg-transparent text-white text-2xl font-bold outline-none placeholder:text-white/30" />
        </div>

        <div className="rounded-2xl p-4 backdrop-blur-md"
          style={{ background: "rgba(8,30,70,0.55)", border: "1px solid rgba(125,211,252,0.25)" }}>
          <label className="block text-xs text-sky-200/80 mb-2 tracking-wider uppercase">{t.to}</label>
          <CurrencyDropdown value={to} onChange={setTo} />
          <div className="mt-3 text-white text-2xl font-bold">
            {result.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
        </div>

        <p className="text-xs text-white/50 text-center">Taxas aproximadas estáticas — uso indicativo.</p>
      </div>
    </div>
  );
}

function CurrencyDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const current = CURRENCIES.find((c) => c.code === value)!;
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-white text-sm"
        style={{ background: "rgba(8,30,70,0.7)", border: "1px solid rgba(125,211,252,0.35)" }}>
        <span>{current.label}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-30 left-0 right-0 mt-1 rounded-lg overflow-hidden"
          style={{ background: "rgba(8,30,70,0.95)", border: "1px solid rgba(125,211,252,0.4)" }}>
          {CURRENCIES.map((c) => (
            <button key={c.code} onClick={() => { onChange(c.code); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm text-white hover:bg-sky-500/20 ${c.code === value ? "bg-sky-500/15" : ""}`}>
              {c.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Result ---------- */
function Result({ t, plan, onBack }: { t: Record<string, string>; plan: PlanData; onBack: () => void }) {
  const generated = useMemo(() => buildPlan(plan), [plan]);
  return (
    <div className="min-h-screen px-6 pt-6 pb-16">
      <button onClick={onBack} className="text-white/80 hover:text-white">
        <ArrowLeft className="w-6 h-6" />
      </button>

      <h2 className="mt-6 text-center text-3xl font-bold text-white tracking-wide"
        style={{ textShadow: "0 0 15px rgba(125,211,252,0.6)" }}>
        {t.resultTitle}
      </h2>

      <div className="mt-8 max-w-md mx-auto space-y-5">
        <Card title={t.diagnosis}><p className="text-white/90 leading-relaxed">{generated.diagnosis}</p></Card>

        <Card title={`${t.goal} ${money(plan.savings * 2)}`}>
          <ul className="space-y-2 text-white/90">
            <Row k={t.monthlySave} v={money(generated.monthlySave)} />
            <Row k={t.incomePct} v={`${generated.savingPct.toFixed(1)}%`} />
            <Row k={t.realistic} v={`${generated.realisticMonths} meses`} />
            <Row k={t.target} v={`${(generated.targetReturn * 100).toFixed(1)}%`} />
          </ul>
        </Card>

        <Card title={t.steps}>
          <ol className="space-y-3 text-white/90 list-decimal list-inside">
            {generated.steps.map((s, i) => <li key={i} className="leading-relaxed">{s}</li>)}
          </ol>
        </Card>

        <Card title={t.where}>
          <ul className="space-y-2 text-white/90 list-disc list-inside">
            {generated.vehicles.map((v, i) => <li key={i} className="leading-relaxed">{v}</li>)}
          </ul>
        </Card>

        <Card title={t.mistakes} accent="#ef4444">
          <ul className="space-y-2 text-white/90 list-disc list-inside">
            {generated.mistakes.map((m, i) => <li key={i} className="leading-relaxed">{m}</li>)}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function Card({ title, children, accent = "#38bdf8" }: { title: string; children: React.ReactNode; accent?: string }) {
  return (
    <div className="rounded-2xl p-5 backdrop-blur-md"
      style={{ background: "rgba(8, 30, 70, 0.6)", border: `1px solid ${accent}44`, boxShadow: `0 4px 30px rgba(0,0,0,0.35), 0 0 20px ${accent}22` }}>
      <h3 className="font-bold mb-3 tracking-wide" style={{ color: accent, textShadow: `0 0 10px ${accent}66` }}>{title}</h3>
      {children}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <li className="flex justify-between border-b border-white/5 pb-1">
      <span className="text-white/70">{k}</span>
      <span className="font-semibold">{v}</span>
    </li>
  );
}

function money(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

/* ---------- Plan generation ---------- */
function buildPlan({ income, savings, months, payMethod, payFreq }: PlanData) {
  const target = savings * 2;
  const needed = target - savings;
  const baseMonthlySave = needed / months;
  const savingPct = (baseMonthlySave / income) * 100;
  const feasibleSave = Math.min(baseMonthlySave, income * 0.4);
  const realisticMonths = Math.max(months, Math.ceil(needed / Math.max(feasibleSave, income * 0.05)));
  const r = solveReturn(savings, feasibleSave, target, months);

  const methodSeed = payMethod === "credit" ? 101 : payMethod === "cash" ? 211 : 307;
  const freqSeed = payFreq === "daily" ? 53 : payFreq === "weekly" ? 89 : payFreq === "monthly" ? 167 : 19;
  const seed = Math.floor(income * 13 + savings * 7 + months * 31 + methodSeed * 47 + freqSeed * 29);
  const rng = mulberry(seed);

  const aggression: "conservador" | "equilibrado" | "agressivo" =
    savingPct < 15 ? "agressivo" : savingPct < 35 ? "equilibrado" : "conservador";

  const diagnosis = buildDiagnosis(income, savings, months, savingPct, aggression, payMethod, payFreq);

  // Inject method/freq-specific steps so plans differ
  const methodSteps: Record<PayMethod, string> = {
    credit: "Use o cartão de crédito apenas para gastos previamente orçados e pague 100% da fatura — nunca rotativo.",
    cash: "Como opera em dinheiro/débito, separe fisicamente envelopes ou contas distintas para cada categoria — barreira mental funciona.",
    none: "Sem cartão é possível: use conta-corrente ou carteira digital regulada e crie metas semanais visíveis para não perder o ritmo.",
  };
  const freqSteps: Record<PayFreq, string> = {
    none: "Sem renda fixa, divida {save} por semanas e guarde proporcional ao que entrar — meta dinâmica.",
    daily: "Recebendo por dia: separe {pct} de cada entrada diária imediatamente — antes de qualquer gasto.",
    weekly: "Recebendo semanal: programe transferência automática toda sexta para a conta-meta.",
    monthly: "Recebendo mensal: agende a transferência para o dia do pagamento — pague-se primeiro.",
  };

  const baseSteps = pick(STEP_POOL[aggression], 4, rng);
  const allSteps = [freqSteps[payFreq], methodSteps[payMethod], ...baseSteps]
    .map((tpl) => fill(tpl, { income, savings, months, monthlySave: feasibleSave, target }));

  const vehicles = pick(VEHICLE_POOL, 5, rng);
  const mistakes = pick(MISTAKE_POOL, 5, rng);
  if (payMethod === "credit") mistakes.unshift("Pagar só o mínimo do cartão — os juros destroem qualquer plano.");
  if (payFreq === "daily") mistakes.unshift("Gastar o caixa do dia antes de separar a poupança — você nunca acumulará.");

  return { diagnosis, monthlySave: feasibleSave, savingPct, realisticMonths, targetReturn: r, steps: allSteps, vehicles, mistakes: mistakes.slice(0, 6) };
}

function solveReturn(p: number, pmt: number, fv: number, n: number) {
  let lo = 0, hi = 0.05;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const grow = Math.pow(1 + mid, n);
    const v = p * grow + (mid === 0 ? pmt * n : pmt * (grow - 1) / mid);
    if (v < fv) lo = mid; else hi = mid;
  }
  const monthly = (lo + hi) / 2;
  return Math.pow(1 + monthly, 12) - 1;
}

function mulberry(a: number) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(arr: T[], n: number, rng: () => number): T[] {
  const a = [...arr];
  const out: T[] = [];
  while (out.length < n && a.length) {
    const idx = Math.floor(rng() * a.length);
    out.push(a.splice(idx, 1)[0]);
  }
  return out;
}

function fill(template: string, ctx: { income: number; savings: number; months: number; monthlySave: number; target: number }) {
  return template
    .replace("{save}", money(ctx.monthlySave))
    .replace("{income}", money(ctx.income))
    .replace("{savings}", money(ctx.savings))
    .replace("{target}", money(ctx.target))
    .replace("{months}", String(ctx.months))
    .replace("{pct}", ((ctx.monthlySave / ctx.income) * 100).toFixed(0) + "%");
}

function buildDiagnosis(income: number, savings: number, months: number, pct: number, mode: string, pm: PayMethod, pf: PayFreq) {
  const ratio = savings / income;
  const cushion = ratio < 1 ? "abaixo de uma reserva mínima de emergência" :
    ratio < 3 ? "com uma reserva pequena, ainda vulnerável" :
    ratio < 6 ? "com uma reserva razoável de emergência" :
    "com uma reserva de emergência confortável";
  const pmLabel = pm === "credit" ? "com cartão de crédito" : pm === "cash" ? "operando em dinheiro/débito" : "sem cartão";
  const pfLabel = pf === "daily" ? "renda diária" : pf === "weekly" ? "renda semanal" : pf === "monthly" ? "renda mensal" : "renda irregular";
  return `Com ${pfLabel} de ${money(income)} e patrimônio de ${money(savings)}, ${pmLabel}, você está ${cushion}. Para duplicar em ${months} meses, seu ritmo precisa ser ${mode}, comprometendo cerca de ${pct.toFixed(0)}% da sua renda. Plano calibrado para a sua realidade — não é genérico.`;
}

const STEP_POOL: Record<string, string[]> = {
  conservador: [
    "Automatize a transferência de {save} no dia em que recebe — pague-se primeiro antes de qualquer despesa.",
    "Mantenha 6 meses de despesas em reserva de liquidez imediata antes de aumentar o risco.",
    "Divida em 70% renda fixa pós-fixada / 20% renda fixa indexada à inflação / 10% multimercado.",
    "Revise mensalmente seu fluxo: meta de {pct} da renda guardada todo mês.",
    "Renegocie 2 contratos recorrentes este mês (internet, telefone, seguros) — meta de cortar 10%.",
    "Crie uma conta separada só para o objetivo de duplicar — nunca a use para gastos.",
    "Reinvista 100% dos juros e dividendos automaticamente.",
    "Faça um balanço patrimonial a cada 90 dias e ajuste a meta.",
  ],
  equilibrado: [
    "Reserve {save} todo mês via transferência automática no dia do pagamento.",
    "Monte primeiro uma reserva de 4 meses de despesas em liquidez antes de buscar retorno.",
    "Distribua: 50% renda fixa segura, 30% ETFs globais diversificados, 20% renda variável local.",
    "Aumente sua taxa de poupança em 2 pontos percentuais a cada trimestre.",
    "Identifique 3 categorias de gasto e corte 15% de cada — redirecione para o plano.",
    "Adicione uma fonte de renda extra que cubra pelo menos {save} ao mês.",
    "Rebalanceie a carteira a cada 6 meses, vendendo o que subiu e comprando o que ficou para trás.",
    "Use aportes extras (13º, bônus, restituições) integralmente para o objetivo.",
  ],
  agressivo: [
    "Você precisa de {pct} da renda — comece com {save}/mês e escale gastos fixos para baixo agora.",
    "Auditoria total de despesas em 7 dias: liste tudo e elimine 3 gastos não-essenciais hoje.",
    "Procure uma renda complementar que adicione pelo menos 20% à sua renda atual em 90 dias.",
    "Aloque: 40% renda fixa para reserva, 40% ETFs globais, 20% ativos de maior risco controlado.",
    "Considere estender o prazo de {months} para um número realista — duplicar exige tempo composto.",
    "Reinvista 100% dos rendimentos — nenhum saque até atingir {target}.",
    "Negocie aumento ou mude de função/cliente nos próximos 6 meses — sua renda é a alavanca maior.",
    "Acompanhe semanalmente o patrimônio em uma planilha simples — o que se mede, se ajusta.",
  ],
};

const VEHICLE_POOL = [
  "Conta remunerada ou fundo de liquidez diária do seu país (equivalente a money market) para a reserva de emergência.",
  "Títulos públicos pós-fixados ou indexados à inflação para a parte segura de longo prazo.",
  "ETFs globais diversificados (ex: índice mundial de ações) para exposição internacional com baixo custo.",
  "ETF de renda fixa global com hedge cambial para reduzir volatilidade.",
  "Conta em moeda forte (USD/EUR) para diversificação cambial, dentro do que a lei do seu país permite.",
  "Pequena alocação (até 5%) em ouro físico ou ETF de ouro como proteção contra crises.",
  "CDB/Depósitos a prazo de bancos sólidos com cobertura do fundo garantidor local.",
  "Fundos imobiliários listados em bolsa para renda passiva mensal recorrente.",
  "Plataforma de corretora regulada — nunca deixe valores relevantes em apps sem regulação clara.",
];

const MISTAKE_POOL = [
  "Investir antes de ter reserva de emergência — você será forçado a vender no pior momento.",
  "Concentrar tudo em uma única classe de ativo, empresa ou criptomoeda.",
  "Acreditar em promessas de retorno garantido acima de 2-3% ao mês — quase sempre é golpe.",
  "Sacar rendimentos antes de atingir a meta — quebra completamente o juros compostos.",
  "Aumentar o padrão de vida na mesma velocidade que a renda — a inflação do estilo de vida mata planos.",
  "Confiar no 'palpite quente' de conhecidos ou influenciadores sem entender o ativo.",
  "Misturar dinheiro pessoal com dinheiro do negócio — você perde controle dos dois.",
  "Ignorar inflação ao calcular metas — duplicar em valor nominal pode ser perder em poder de compra.",
  "Operar com alavancagem em ativos voláteis sem entender o risco de liquidação.",
  "Esquecer de revisar o plano por meses — disciplina sem revisão vira teimosia.",
];

/* ---------- Background animations ---------- */
function AnimatedBackground({ blurred }: { blurred: boolean }) {
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ filter: blurred ? "blur(3px)" : "none" }}>
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at top, rgba(56,189,248,0.15), transparent 60%)" }} />
      <StatsBars />
      <Candles />
    </div>
  );
}

function StatsBars() {
  const bars = useMemo(() => Array.from({ length: 22 }, (_, i) => ({
    left: (i / 22) * 100,
    up: i % 2 === 0,
    delay: (i * 0.23) % 3,
    dur: 2 + (i % 5) * 0.4,
    height: 30 + ((i * 17) % 50),
  })), []);
  return (
    <div className="absolute inset-0 overflow-hidden opacity-50">
      {bars.map((b, i) => (
        <div key={i} className="absolute bottom-0 w-2 rounded-t"
          style={{
            left: `${b.left}%`, height: `${b.height}%`,
            background: b.up
              ? "linear-gradient(to top, rgba(34,197,94,0.7), rgba(34,197,94,0))"
              : "linear-gradient(to bottom, rgba(239,68,68,0.7), rgba(239,68,68,0))",
            transform: b.up ? "translateY(0)" : "translateY(0) scaleY(-1)",
            transformOrigin: "bottom",
            animation: `barPulse ${b.dur}s ease-in-out ${b.delay}s infinite`,
            boxShadow: b.up ? "0 0 10px rgba(34,197,94,0.6)" : "0 0 10px rgba(239,68,68,0.6)",
          }} />
      ))}
      <style>{`@keyframes barPulse { 0%,100% { transform: scaleY(0.6); opacity: 0.5; } 50% { transform: scaleY(1.1); opacity: 0.9; } }`}</style>
    </div>
  );
}

function Candles() {
  const candles = useMemo(() => Array.from({ length: 30 }, (_, i) => ({
    left: (i * 3.3) % 100, top: 10 + ((i * 11) % 70), up: i % 3 !== 0, delay: (i * 0.4) % 4,
  })), []);
  return (
    <div className="absolute inset-0 overflow-hidden opacity-30">
      {candles.map((c, i) => (
        <div key={i} className="absolute" style={{ left: `${c.left}%`, top: `${c.top}%`, animation: `floatY 6s ease-in-out ${c.delay}s infinite` }}>
          <div style={{ width: 4, height: 18, background: c.up ? "#22c55e" : "#ef4444", boxShadow: c.up ? "0 0 8px #22c55e" : "0 0 8px #ef4444" }} />
        </div>
      ))}
      <style>{`@keyframes floatY { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }`}</style>
    </div>
  );
}

function MoneyRain() {
  const drops = useMemo(() => Array.from({ length: 18 }, (_, i) => ({
    left: (i * 6.1) % 100, delay: (i * 0.7) % 8, dur: 6 + (i % 4) * 1.5, size: 16 + (i % 3) * 6, rot: (i * 37) % 360,
  })), []);
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {drops.map((d, i) => (
        <div key={i} className="absolute font-bold"
          style={{
            left: `${d.left}%`, top: "-40px", fontSize: d.size, color: "#86efac",
            textShadow: "0 0 12px rgba(134,239,172,0.8)",
            animation: `fall ${d.dur}s linear ${d.delay}s infinite`,
            transform: `rotate(${d.rot}deg)`,
          }}>$</div>
      ))}
      <style>{`@keyframes fall { 0% { transform: translateY(0) rotate(0deg); opacity: 0; } 10% { opacity: 0.9; } 90% { opacity: 0.9; } 100% { transform: translateY(110vh) rotate(360deg); opacity: 0; } }`}</style>
    </div>
  );
}
