"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  Calculator, 
  Home, 
  Landmark, 
  ArrowRight, 
  ChevronRight,
  Key,
  Receipt,
  Wallet,
  Scale,
  ExternalLink,
  MapPin,
  Shield,
} from "lucide-react";

const FEATURES = [
  {
    id: "erfpacht",
    icon: Home,
    emoji: "🏠",
    color: "from-blue-500 to-indigo-600",
    shadowColor: "shadow-blue-500/25",
    title: "Erfpacht uitgelegd",
    shortDesc: "Eigenaar van je huis, maar huur de grond van de gemeente.",
    fullTitle: "Wat is erfpacht precies?",
    fullDesc: [
      "Bij erfpacht ben je volledig eigenaar van je woning (het opstal), maar de grond waarop je huis staat is eigendom van de gemeente Den Haag.",
      "Voor het gebruik van deze grond betaal je jaarlijks een vergoeding: de canon. Dit is vergelijkbaar met huur, maar dan voor de grond onder je huis.",
      "De erfpachtvoorwaarden zijn vastgelegd in de Algemene Bepalingen. In Den Haag zijn er twee varianten: AB1986 (de oude regeling) en AB2024 (de nieuwe regeling met een tienjaarsgemiddelde).",
      "Erfpacht is eeuwigdurend, wat betekent dat je niet bang hoeft te zijn dat je je huis kwijtraakt. Je hebt wel te maken met periodieke herzieningen van de canon.",
    ],
    stats: [
      { label: "Huizen op erfpacht in Den Haag", value: "~45.000" },
      { label: "Gemiddelde grondwaarde", value: "€150k - €400k" },
    ],
  },
  {
    id: "vergelijking",
    icon: Scale,
    emoji: "⚖️",
    color: "from-emerald-500 to-teal-600",
    shadowColor: "shadow-emerald-500/25",
    title: "AB1986 vs AB2024",
    shortDesc: "De nieuwe regeling dempt schommelingen in je canon.",
    fullTitle: "Verschil tussen AB1986 en AB2024",
    fullDesc: [
      "AB1986 berekent de canon op basis van de actuele rente van dat jaar. Dit kan leiden tot grote schommelingen in je jaarlijkse kosten.",
      "AB2024 gebruikt een tienjaarsgemiddelde van de rente. Hierdoor zijn de kosten stabieler en voorspelbaarder, al kunnen ze op korte termijn hoger uitvallen.",
      "Je kunt vrijwillig overstappen van AB1986 naar AB2024. Dit is een eenmalige keuze - terug kan niet. De gemeente berekent wat voor jouw situatie het voordeligst is.",
      "Let op: bij overstap worden de voorwaarden voor de gehele resterende looptijd vastgelegd. Dit kan voordelig zijn als je verwacht dat rentes gaan stijgen.",
    ],
    stats: [
      { label: "Canon AB1986 (2026)", value: "3,3%" },
      { label: "Canon AB2024 (2026)", value: "2,2%" },
    ],
  },
  {
    id: "afkoop",
    icon: Key,
    emoji: "🔑",
    color: "from-violet-500 to-purple-600",
    shadowColor: "shadow-violet-500/25",
    title: "Afkopen of eigen grond",
    shortDesc: "Eenmalig betalen en nooit meer canon.",
    fullTitle: "Canon afkopen of grond kopen",
    fullDesc: [
      "Je kunt de canon eeuwigdurend afkopen door de volledige grondwaarde in één keer te betalen. Daarna betaal je geen canon meer, alleen nog beheerkosten (€34/jaar).",
      "Na afkoop kun je ook het 'bloot eigendom' kopen - dan word je volledig eigenaar van de grond. De kosten hiervoor variëren van €700 tot €6.980 afhankelijk van je WOZ-waarde.",
      "Afkoop kan interessant zijn als je lang in je huis blijft wonen en je beschikt over voldoende kapitaal of financieringsmogelijkheden.",
      "Let op: de afkoopsom zelf is niet fiscaal aftrekbaar. Wel kun je eventuele rente op een lening voor de afkoop aftrekken als het een eigenwoningschuld betreft.",
    ],
    stats: [
      { label: "Afkoopsom", value: "= Grondwaarde" },
      { label: "Bloot eigendom", value: "€700 - €6.980" },
    ],
  },
  {
    id: "belasting",
    icon: Receipt,
    emoji: "📋",
    color: "from-amber-500 to-orange-600",
    shadowColor: "shadow-amber-500/25",
    title: "Belastingvoordeel",
    shortDesc: "Canon is aftrekbaar, afkoopsom niet.",
    fullTitle: "Fiscale aspecten van erfpacht",
    fullDesc: [
      "Periodieke canonbetalingen zijn volledig aftrekbaar in box 1 als je de woning als eigen woning hebt. Dit verlaagt je netto kosten aanzienlijk.",
      "Een eenmalige afkoopsom is niet aftrekbaar. Dit is een belangrijke overweging bij de keuze tussen blijven betalen of afkopen.",
      "Als je de afkoop financiert met een lening, is de rente op die lening vaak wél aftrekbaar (mits het een eigenwoningschuld is).",
      "Het maximale aftrekpercentage voor hypotheekrente (en dus ook canon) is in 2026 gemaximeerd op 36,97%. Bij een hoger inkomen profiteer je dus niet extra van de aftrek.",
    ],
    stats: [
      { label: "Max. aftrek 2026", value: "36,97%" },
      { label: "Boven €76.817", value: "49,50% tarief" },
    ],
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen gradient-bg-light">
      {/* Header with theme toggle */}
      <header className="container mx-auto px-4 py-4">
        <div className="flex justify-end">
          <ThemeToggle />
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-8 pb-16 md:pt-16 md:pb-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8 glass-card gradient-border">
            <span className="text-lg">🏛️</span>
            <span className="text-slate-700 dark:text-slate-200">Erfpacht Den Haag</span>
          </div>
          
          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-[1.1] tracking-tight">
            <span className="text-slate-900 dark:text-white">Begrijp je erfpacht en </span>
            <span className="gradient-text">vergelijk scenario&apos;s</span>
          </h1>
          
          {/* Subheading */}
          <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 mb-10 leading-relaxed max-w-2xl mx-auto">
            Een simpele, transparante tool die je helpt om je erfpacht-situatie in Den Haag 
            te begrijpen. Vergelijk canonbetalingen, afkoop, en eigen grond. 🏡
          </p>
          
          {/* CTA Button */}
          <Link href="/wizard">
            <Button 
              size="lg" 
              className="text-base px-8 py-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-700 hover:via-violet-700 hover:to-purple-700 shadow-xl shadow-indigo-500/25 hover:shadow-2xl hover:shadow-indigo-500/30 transition-all duration-300 hover:-translate-y-0.5 border-0"
            >
              <Calculator className="mr-2 w-5 h-5" />
              Start berekening
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 tracking-tight text-slate-900 dark:text-white">
            Wat je moet weten over erfpacht
          </h2>
          <p className="text-center text-slate-500 dark:text-slate-400 mb-12 max-w-2xl mx-auto">
            Klik op een onderwerp voor meer informatie
          </p>
          
          <div className="grid md:grid-cols-2 gap-5">
            {FEATURES.map((feature) => (
              <FeatureCard key={feature.id} feature={feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="glass-card-strong rounded-2xl p-6 gradient-border">
            <div className="flex gap-4">
              <div className="shrink-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <Shield className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1.5">
                  Let op: indicatieve berekening
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                  Deze tool geeft indicatieve berekeningen op basis van openbare 
                  gegevens. Check altijd je erfpachtakte en het aanbod van de gemeente 
                  voor exacte bedragen.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-10 border-t border-slate-200/50 dark:border-white/5 mt-8">
        <div className="max-w-4xl mx-auto text-center text-slate-400 dark:text-slate-500 text-sm">
          <p className="flex items-center justify-center gap-2 flex-wrap">
            <span>Niet gelieerd aan gemeente Den Haag</span>
            <span className="hidden sm:inline">·</span>
            <Link 
              href="/bronnen" 
              className="inline-flex items-center gap-1 text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
            >
              Aannames & Bronnen
              <ExternalLink className="w-3 h-3" />
            </Link>
          </p>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ feature }: { feature: typeof FEATURES[0] }) {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = feature.icon;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Card className="group cursor-pointer glass-card hover-lift rounded-2xl overflow-hidden border-0">
          <CardContent className="pt-8 pb-7 px-7">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 shadow-lg ${feature.shadowColor} group-hover:scale-110 transition-transform duration-300`}>
              <span className="text-2xl">{feature.emoji}</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2.5 flex items-center gap-2">
              {feature.title}
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              {feature.shortDesc}
            </p>
          </CardContent>
        </Card>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-lg glass-card-strong rounded-2xl border-0 p-0 overflow-hidden">
        {/* Header with gradient */}
        <div className={`bg-gradient-to-r ${feature.color} p-6 pb-8`}>
          <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
            <span className="text-3xl">{feature.emoji}</span>
          </div>
          <DialogHeader>
            <DialogTitle className="text-xl text-white">{feature.fullTitle}</DialogTitle>
          </DialogHeader>
        </div>
        
        {/* Content */}
        <div className="p-6 -mt-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            {feature.fullDesc.map((paragraph, i) => (
              <p key={i} className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mt-5">
            {feature.stats.map((stat, i) => (
              <div 
                key={i} 
                className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 text-center"
              >
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{stat.label}</p>
                <p className={`text-lg font-bold bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
