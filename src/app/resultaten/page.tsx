"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  TrendingDown,
  TrendingUp,
  Calendar,
  Calculator,
  Info,
  ExternalLink,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { WizardData, DEFAULT_WIZARD_DATA } from "@/types/wizard";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  getCanonRate,
  getBlootEigendomKoopprijs,
  DEFAULTS,
  AB1986_CANON_RATES,
  AB2024_CANON_RATES,
  BLOOT_EIGENDOM_KOOPPRIJS_STAFFEL,
} from "@/data/denhaag-canonpercentages";
import {
  buildCanonCashflows,
  buildAfkoopCashflows,
  buildEigenGrondCashflows,
  buildScenario,
  calcCumulativeCosts,
  calcBreakEvenYear,
  calcNPV,
  getAfkoopBedrag,
  Scenario,
} from "@/lib/calculations";

const STORAGE_KEY = "erfpacht-wizard-data";

export default function ResultatenPage() {
  const [data, setData] = useState<WizardData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setData({ ...DEFAULT_WIZARD_DATA, ...parsed });
      } catch {
        setData(DEFAULT_WIZARD_DATA);
      }
    } else {
      setData(DEFAULT_WIZARD_DATA);
    }
    setIsLoaded(true);
  }, []);

  const scenarios = useMemo(() => {
    if (!data) return [];

    const contractType = data.contractType === "unknown" ? "AB1986" : data.contractType;
    const canonRate =
      data.customCanonRate || getCanonRate(contractType, data.selectedYear) || 0.033;
    const ab2024Rate =
      getCanonRate("AB2024", data.selectedYear) || AB2024_CANON_RATES[2026] || 0.022;

    const years = DEFAULTS.projectionYears;
    const result: Scenario[] = [];

    // Scenario 1: Huidige situatie (AB1986 of AB2024)
    const currentCashflows = buildCanonCashflows({
      years,
      groundValue: data.grondwaarde,
      canonRate,
      managementFee: data.beheerkosten,
      isOwnHome: data.isEigenWoning,
      marginalTaxRate: data.marginaleTariefgroep,
    });

    result.push(
      buildScenario(
        "current",
        `Huidige situatie (${contractType})`,
        `Doorgaan met canonbetaling onder ${contractType}`,
        currentCashflows
      )
    );

    // Scenario 2: Overstappen naar AB2024 (alleen bij AB1986)
    if (contractType === "AB1986") {
      const ab2024Cashflows = buildCanonCashflows({
        years,
        groundValue: data.grondwaarde,
        canonRate: ab2024Rate,
        managementFee: data.beheerkosten,
        isOwnHome: data.isEigenWoning,
        marginalTaxRate: data.marginaleTariefgroep,
      });

      result.push(
        buildScenario(
          "ab2024",
          "Overstappen naar AB2024",
          "Vrijwillig overstappen naar de nieuwe voorwaarden",
          ab2024Cashflows
        )
      );
    }

    // Scenario 3: Afkoop canon
    // Afkoopsom = grondwaarde (officieel tarief gemeente Den Haag)
    const afkoopBedrag = data.afkoopBedrag || getAfkoopBedrag(data.grondwaarde);

    const afkoopCashflows = buildAfkoopCashflows({
      years,
      afkoopBedrag,
      managementFee: data.beheerkosten,
      includeManagementFee: data.afkoopBeheerkosten,
      financierenMetLening: data.financierenMetLening,
      loanInterestRate: data.leningRente,
      loanTermYears: data.leningLooptijd,
      isOwnHome: data.isEigenWoning,
      marginalTaxRate: data.marginaleTariefgroep,
    });

    const afkoopScenario = buildScenario(
      "afkoop",
      "Eeuwigdurend afkopen",
      `Eenmalige afkoop van €${Math.round(afkoopBedrag).toLocaleString("nl-NL")}`,
      afkoopCashflows
    );

    // Bereken break-even
    const currentCumulative = calcCumulativeCosts(currentCashflows.netto);
    const afkoopCumulative = calcCumulativeCosts(afkoopCashflows.netto);
    afkoopScenario.breakEvenYear = calcBreakEvenYear(currentCumulative, afkoopCumulative) ?? undefined;

    result.push(afkoopScenario);

    // Scenario 4: Eigen grond (bloot eigendom)
    // Totale kosten = afkoop canon (grondwaarde) + koopprijs bloot eigendom (WOZ staffel)
    // De bloot eigendom koopprijs is €700-€6980 afhankelijk van WOZ-waarde
    // Je MOET eerst de canon afkopen voordat je bloot eigendom kunt kopen
    if (data.wozWaarde) {
      const blootEigendomKoopprijs = getBlootEigendomKoopprijs(data.wozWaarde);
      const extraBedrag = data.extraBouwMogelijkheden || 0;
      // Totaal = afkoop canon + bloot eigendom prijs + eventuele extra
      const totalKoopBedrag = afkoopBedrag + blootEigendomKoopprijs + extraBedrag;

      const eigenGrondCashflows = buildEigenGrondCashflows({
        years,
        koopBedrag: totalKoopBedrag, // Inclusief afkoop canon
        extraBedrag: 0, // Al inbegrepen in totalKoopBedrag
        financierenMetLening: data.financierenMetLening,
        loanInterestRate: data.leningRente,
        loanTermYears: data.leningLooptijd,
        isOwnHome: data.isEigenWoning,
        marginalTaxRate: data.marginaleTariefgroep,
      });

      const eigenGrondScenario = buildScenario(
        "eigengrond",
        "Eigen grond (bloot eigendom)",
        `Afkoop €${Math.round(afkoopBedrag).toLocaleString("nl-NL")} + grond €${Math.round(blootEigendomKoopprijs).toLocaleString("nl-NL")}`,
        eigenGrondCashflows
      );

      const eigenGrondCumulative = calcCumulativeCosts(eigenGrondCashflows.netto);
      eigenGrondScenario.breakEvenYear = calcBreakEvenYear(currentCumulative, eigenGrondCumulative) ?? undefined;

      result.push(eigenGrondScenario);
    }

    return result;
  }, [data]);

  // Chart data
  const cumulativeChartData = useMemo(() => {
    if (scenarios.length === 0) return [];

    const years = DEFAULTS.projectionYears;
    const data: Record<string, number | string>[] = [];

    for (let i = 0; i < years; i++) {
      const point: Record<string, number | string> = { year: i };

      scenarios.forEach((scenario) => {
        const cumulative = calcCumulativeCosts(scenario.cashflowsNetto);
        point[scenario.id] = Math.round(cumulative[i]);
      });

      data.push(point);
    }

    return data;
  }, [scenarios]);

  const npvChartData = useMemo(() => {
    return scenarios.map((s) => ({
      name: s.label,
      npv: Math.round(s.npvNetto),
    }));
  }, [scenarios]);

  if (!isLoaded || !data) {
    return (
      <main className="min-h-screen gradient-bg-light flex items-center justify-center">
        <p className="text-slate-400 dark:text-slate-500">Laden...</p>
      </main>
    );
  }

  const currentScenario = scenarios.find((s) => s.id === "current");
  const ab2024Scenario = scenarios.find((s) => s.id === "ab2024");
  const afkoopScenario = scenarios.find((s) => s.id === "afkoop");

  const formatCurrency = (value: number) =>
    `€${Math.round(value).toLocaleString("nl-NL")}`;

  return (
    <main className="min-h-screen gradient-bg-light">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link
            href="/wizard"
            className="flex items-center gap-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Terug naar invoer</span>
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">Resultaten</h1>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Summary Cards */}
      <section className="container mx-auto px-4 mb-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Jaarlijkse netto last */}
          <Card className="glass-card-strong border border-slate-200/60 dark:border-slate-700/60 shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="pt-6 pb-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Jaarlijkse netto last</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {currentScenario ? formatCurrency(currentScenario.yearlyNetto) : "-"}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">na belastingaftrek</p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Calculator className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AB2024 verschil */}
          {ab2024Scenario && currentScenario && (
            <Card className="glass-card-strong border border-slate-200/60 dark:border-slate-700/60 shadow-sm rounded-2xl overflow-hidden">
              <CardContent className="pt-6 pb-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">AB2024 besparing</p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
                      {formatCurrency(currentScenario.yearlyNetto - ab2024Scenario.yearlyNetto)}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">per jaar</p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <TrendingDown className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Break-even afkoop */}
          {afkoopScenario && (
            <Card className="glass-card-strong border border-slate-200/60 dark:border-slate-700/60 shadow-sm rounded-2xl overflow-hidden">
              <CardContent className="pt-6 pb-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Break-even afkoop</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                      {afkoopScenario.breakEvenYear != null
                        ? `${afkoopScenario.breakEvenYear} jaar`
                        : "> 30 jaar"}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">terugverdientijd</p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* NPV verschil */}
          {afkoopScenario && currentScenario && (
            <Card className="glass-card-strong border border-slate-200/60 dark:border-slate-700/60 shadow-sm rounded-2xl overflow-hidden">
              <CardContent className="pt-6 pb-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">NPV voordeel afkoop</p>
                    <p
                      className={`text-2xl font-bold tracking-tight ${
                        currentScenario.npvNetto > afkoopScenario.npvNetto
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {formatCurrency(currentScenario.npvNetto - afkoopScenario.npvNetto)}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">netto contante waarde</p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                    {currentScenario.npvNetto > afkoopScenario.npvNetto ? (
                      <TrendingDown className="w-5 h-5 text-white" />
                    ) : (
                      <TrendingUp className="w-5 h-5 text-white" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Tabs */}
      <section className="container mx-auto px-4 pb-12">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-xl">
            <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm dark:text-slate-300 dark:data-[state=active]:text-white">Overzicht</TabsTrigger>
            <TabsTrigger value="compare" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm dark:text-slate-300 dark:data-[state=active]:text-white">Scenario&apos;s vergelijken</TabsTrigger>
            <TabsTrigger value="sources" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm dark:text-slate-300 dark:data-[state=active]:text-white">Aannames & Bronnen</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Scenario cards */}
            <div className="grid md:grid-cols-2 gap-5">
              {scenarios.map((scenario) => (
                <Card key={scenario.id} className="group glass-card-strong border border-slate-200/60 dark:border-slate-700/60 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg tracking-tight text-slate-900 dark:text-white">{scenario.label}</CardTitle>
                    <CardDescription className="text-slate-500 dark:text-slate-400">{scenario.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">Jaarlijks bruto</p>
                        <p className="text-xl font-semibold text-slate-700 dark:text-slate-200 tracking-tight">
                          {formatCurrency(scenario.yearlyBruto)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">Jaarlijks netto</p>
                        <p className="text-xl font-semibold text-emerald-600 dark:text-emerald-400 tracking-tight">
                          {formatCurrency(scenario.yearlyNetto)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">Totaal 30 jaar</p>
                        <p className="text-xl font-semibold text-slate-700 dark:text-slate-200 tracking-tight">
                          {formatCurrency(scenario.totalNetto)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">NPV</p>
                        <p className="text-xl font-semibold text-slate-700 dark:text-slate-200 tracking-tight">
                          {formatCurrency(scenario.npvNetto)}
                        </p>
                      </div>
                    </div>
                    {scenario.breakEvenYear !== undefined && scenario.breakEvenYear !== null && (
                      <div className="mt-4 pt-4 border-t border-slate-100/80 dark:border-slate-700/80">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Break-even t.o.v. huidige situatie:{" "}
                          <span className="font-semibold text-slate-700 dark:text-slate-200">
                            {scenario.breakEvenYear} jaar
                          </span>
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Input summary */}
            <Card className="glass-card-strong border border-slate-200/60 dark:border-slate-700/60 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-medium text-slate-500 dark:text-slate-400">Jouw invoer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                  <div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">Contract</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">{data.contractType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">Grondwaarde</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">{formatCurrency(data.grondwaarde)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">Berekeningsjaar</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">{data.selectedYear}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">Belastingdruk</p>
                    <p className="font-semibold text-slate-700 dark:text-slate-200">{(data.marginaleTariefgroep * 100).toFixed(0)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Legende / begrippen uitleg */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-800/30 border border-slate-200/60 dark:border-slate-700/60">
                <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1.5 text-sm">Jaarlijks bruto</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                  Totale kosten per jaar vóór belastingaftrek
                </p>
              </div>
              <div className="p-5 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-800/30 border border-slate-200/60 dark:border-slate-700/60">
                <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1.5 text-sm">Jaarlijks netto</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                  Kosten na aftrek hypotheekrenteaftrek
                </p>
              </div>
              <div className="p-5 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-800/30 border border-slate-200/60 dark:border-slate-700/60">
                <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1.5 text-sm">NPV</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                  Toekomstige kosten teruggerekend naar vandaag. Lager = beter.
                </p>
              </div>
              <div className="p-5 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-800/30 border border-slate-200/60 dark:border-slate-700/60">
                <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1.5 text-sm">Break-even</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                  Jaren tot scenario voordeliger wordt dan canon betalen.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Compare Tab */}
          <TabsContent value="compare" className="space-y-6">
            {/* Cumulative costs chart */}
            <Card className="glass-card-strong border border-slate-200/60 dark:border-slate-700/60 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg tracking-tight text-slate-900 dark:text-white">Cumulatieve kosten over 30 jaar</CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400">Netto kosten na belastingaftrek</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={cumulativeChartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" vertical={false} />
                      <XAxis
                        dataKey="year"
                        label={{ value: "Jaar", position: "bottom", offset: -5 }}
                        className="stroke-slate-400 dark:stroke-slate-500 fill-slate-500 dark:fill-slate-400"
                        fontSize={12}
                      />
                      <YAxis
                        tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`}
                        className="stroke-slate-400 dark:stroke-slate-500 fill-slate-500 dark:fill-slate-400"
                        fontSize={12}
                      />
                      <RechartsTooltip
                        formatter={(value) => [formatCurrency(value as number), ""]}
                        labelFormatter={(label) => `Jaar ${label}`}
                        contentStyle={{ borderRadius: "12px", border: "1px solid var(--border)", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", backgroundColor: "var(--background)" }}
                        labelStyle={{ color: "var(--foreground)" }}
                        itemStyle={{ color: "var(--foreground)" }}
                      />
                      <Legend wrapperStyle={{ color: "var(--foreground)" }} />
                      <Line
                        type="monotone"
                        dataKey="current"
                        name="Huidige situatie"
                        stroke="#3b82f6"
                        strokeWidth={2.5}
                        dot={false}
                      />
                      {scenarios.find((s) => s.id === "ab2024") && (
                        <Line
                          type="monotone"
                          dataKey="ab2024"
                          name="AB2024"
                          stroke="#10b981"
                          strokeWidth={2.5}
                          dot={false}
                        />
                      )}
                      <Line
                        type="monotone"
                        dataKey="afkoop"
                        name="Afkoop"
                        stroke="#8b5cf6"
                        strokeWidth={2.5}
                        dot={false}
                      />
                      {scenarios.find((s) => s.id === "eigengrond") && (
                        <Line
                          type="monotone"
                          dataKey="eigengrond"
                          name="Eigen grond"
                          stroke="#f59e0b"
                          strokeWidth={2.5}
                          dot={false}
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* NPV comparison */}
            <Card className="glass-card-strong border border-slate-200/60 dark:border-slate-700/60 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg tracking-tight text-slate-900 dark:text-white">NPV vergelijking</CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400">
                  Netto contante waarde bij {(DEFAULTS.discountRate * 100).toFixed(1)}% discontovoet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={npvChartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" horizontal={false} />
                      <XAxis
                        type="number"
                        tickFormatter={(v) => `€${(v / 1000).toFixed(0)}k`}
                        className="stroke-slate-400 dark:stroke-slate-500 fill-slate-500 dark:fill-slate-400"
                        fontSize={12}
                      />
                      <YAxis type="category" dataKey="name" width={150} className="stroke-slate-400 dark:stroke-slate-500 fill-slate-500 dark:fill-slate-400" fontSize={12} />
                      <RechartsTooltip 
                        formatter={(value) => [formatCurrency(value as number), "NPV"]} 
                        contentStyle={{ borderRadius: "12px", border: "1px solid var(--border)", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", backgroundColor: "var(--background)" }}
                        labelStyle={{ color: "var(--foreground)" }}
                        itemStyle={{ color: "var(--foreground)" }}
                      />
                      <Bar dataKey="npv" fill="url(#npvGradient)" radius={[0, 8, 8, 0]} />
                      <defs>
                        <linearGradient id="npvGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#6366f1" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sources Tab */}
          <TabsContent value="sources" className="space-y-6">
            {/* Afkoop uitleg */}
            <Card className="border-0 shadow-md bg-blue-50 dark:bg-blue-950/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-slate-900 dark:text-white">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Waar komen de bedragen vandaan?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-200">Afkoopsom canon = Grondwaarde</h4>
                  <p className="text-blue-800 dark:text-blue-300">
                    Bij eeuwigdurende afkoop betaal je de volledige grondwaarde als eenmalig bedrag.
                    In jouw geval: <strong>{formatCurrency(data.grondwaarde)}</strong>
                  </p>
                </div>
                <Separator className="bg-blue-200 dark:bg-blue-800" />
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-200">Bloot eigendom koopprijs = WOZ-staffel</h4>
                  <p className="text-blue-800 dark:text-blue-300 mb-2">
                    De koopprijs voor bloot eigendom is een vast bedrag op basis van je WOZ-waarde, 
                    variërend van €700 tot €6.980. Dit is <em>bovenop</em> de afkoopsom.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {BLOOT_EIGENDOM_KOOPPRIJS_STAFFEL.map((item, i) => (
                      <div key={i} className="bg-white dark:bg-slate-800 p-2 rounded border border-blue-200 dark:border-blue-800">
                        <span className="text-blue-600 dark:text-blue-400">
                          {item.max === Infinity 
                            ? `> €${(item.min / 1000).toFixed(0)}k` 
                            : `€${(item.min / 1000).toFixed(0)}k - €${(item.max / 1000).toFixed(0)}k`}:
                        </span>{" "}
                        <span className="font-medium dark:text-white">€{item.bedrag.toLocaleString("nl-NL")}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator className="bg-blue-200 dark:bg-blue-800" />
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-200">Totaal eigen grond</h4>
                  <p className="text-blue-800 dark:text-blue-300">
                    = Afkoop canon + Bloot eigendom koopprijs
                    {data.wozWaarde && (
                      <>
                        <br />
                        = {formatCurrency(data.grondwaarde)} + {formatCurrency(getBlootEigendomKoopprijs(data.wozWaarde))}
                        = <strong>{formatCurrency(data.grondwaarde + getBlootEigendomKoopprijs(data.wozWaarde))}</strong>
                      </>
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md glass-card-strong">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900 dark:text-white">Canonpercentages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2 text-slate-700 dark:text-slate-200">AB1986</h4>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    {Object.entries(AB1986_CANON_RATES).map(([year, rate]) => (
                      <div key={year} className="bg-slate-50 dark:bg-slate-800 p-2 rounded">
                        <span className="text-slate-500 dark:text-slate-400">{year}:</span>{" "}
                        <span className="font-medium dark:text-white">{(rate * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator className="dark:bg-slate-700" />
                <div>
                  <h4 className="font-medium mb-2 text-slate-700 dark:text-slate-200">AB2024 (tienjaarsgemiddelde)</h4>
                  <div className="grid grid-cols-4 gap-2 text-sm">
                    {Object.entries(AB2024_CANON_RATES).map(([year, rate]) => (
                      <div key={year} className="bg-slate-50 dark:bg-slate-800 p-2 rounded">
                        <span className="text-slate-500 dark:text-slate-400">{year}:</span>{" "}
                        <span className="font-medium dark:text-white">{(rate * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md glass-card-strong">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900 dark:text-white">AB1986 vs AB2024</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <span className="text-blue-600 dark:text-blue-400">•</span>
                    <span className="text-slate-700 dark:text-slate-300">
                      <strong>AB1986:</strong> Canonpercentage wordt jaarlijks vastgesteld op basis
                      van actuele rentes (BNG-lening en hypotheekrente gemiddelde).
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-600 dark:text-green-400">•</span>
                    <span className="text-slate-700 dark:text-slate-300">
                      <strong>AB2024:</strong> Gebruikt een tienjaarsgemiddelde, wat schokken dempt
                      en meer stabiliteit biedt.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-purple-600 dark:text-purple-400">•</span>
                    <span className="text-slate-700 dark:text-slate-300">
                      Overstappen van AB1986 naar AB2024 is mogelijk, maar check de voorwaarden bij
                      de gemeente.
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md glass-card-strong">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900 dark:text-white">Fiscale regels</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <span className="text-green-600 dark:text-green-400">✓</span>
                    <span className="text-slate-700 dark:text-slate-300">Periodieke canonbetalingen zijn aftrekbaar in box 1 (eigen woning).</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-red-600 dark:text-red-400">✗</span>
                    <span className="text-slate-700 dark:text-slate-300">Een afkoopsom zelf is niet aftrekbaar.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-green-600 dark:text-green-400">✓</span>
                    <span className="text-slate-700 dark:text-slate-300">
                      Rente op een lening voor afkoop of aankoop is vaak wel aftrekbaar (check
                      voorwaarden).
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md glass-card-strong">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900 dark:text-white">Bronnen</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li>
                    <a
                      href="https://www.denhaag.nl/nl/wonen-en-bouwen/erfpacht.htm"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Gemeente Den Haag - Erfpacht
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/woning/eigen_woning/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Belastingdienst - Eigen woning
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://denhaag.raadsinformatie.nl/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Den Haag RIS - Raadsinformatie
                    </a>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <Info className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-amber-900 dark:text-amber-200 mb-2">Disclaimer</h4>
                    <p className="text-sm text-amber-800 dark:text-amber-300">
                      Deze tool geeft <strong>indicatieve</strong> berekeningen. De daadwerkelijke
                      kosten, afkoopbedragen en voorwaarden kunnen afwijken. Raadpleeg altijd je
                      erfpachtakte, het aanbod van de gemeente, en bij twijfel een adviseur.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <Link href="/wizard">
            <Button variant="outline" className="gap-2 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
              <ArrowLeft className="w-4 h-4" />
              Pas invoer aan
            </Button>
          </Link>
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
            Berekening op basis van gegevens gemeente Den Haag
          </p>
        </div>
      </footer>
    </main>
  );
}
