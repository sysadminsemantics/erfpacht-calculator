"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowLeft, ArrowRight, HelpCircle, Home, FileText, Euro, Calculator } from "lucide-react";
import { WizardData, DEFAULT_WIZARD_DATA, ContractType, LooptijdType } from "@/types/wizard";
import { getCanonRate, getAvailableYears, AB1986_CANON_RATES, AB2024_CANON_RATES } from "@/data/denhaag-canonpercentages";
import { ThemeToggle } from "@/components/theme-toggle";

const STEPS = [
  { id: "contract", title: "Contract", icon: FileText, description: "Welk erfpachtrecht heb je?" },
  { id: "waarden", title: "Waarden", icon: Home, description: "Grond- en WOZ-waarde" },
  { id: "betaling", title: "Betaling", icon: Euro, description: "Huidige canon en kosten" },
  { id: "belasting", title: "Belasting", icon: Calculator, description: "Fiscale situatie" },
];

const STORAGE_KEY = "erfpacht-wizard-data";

export default function WizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<WizardData>(DEFAULT_WIZARD_DATA);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setData({ ...DEFAULT_WIZARD_DATA, ...parsed });
      } catch {
        // Ignore parse errors
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data, isLoaded]);

  const updateData = <K extends keyof WizardData>(key: K, value: WizardData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Contract
        return data.contractType !== "unknown" || data.contractType === "unknown";
      case 1: // Waarden
        return data.grondwaarde > 0;
      case 2: // Betaling
        return true; // Optional fields
      case 3: // Belasting
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Navigeer naar resultaten
      router.push("/resultaten");
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  if (!isLoaded) {
    return (
      <main className="min-h-screen gradient-bg-light flex items-center justify-center">
        <p className="text-slate-400 dark:text-slate-500">Laden...</p>
      </main>
    );
  }

  return (
    <TooltipProvider>
      <main className="min-h-screen gradient-bg-light">
        {/* Header */}
        <header className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Terug naar home</span>
            </Link>
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">Erfpacht Calculator</h1>
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Progress */}
        <div className="container mx-auto px-4 mb-8">
          <div className="max-w-2xl mx-auto">
            <Progress value={progress} className="h-1.5 mb-6 bg-slate-100" />
            <div className="flex justify-between">
              {STEPS.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => index <= currentStep && setCurrentStep(index)}
                  className={`flex flex-col items-center gap-2 ${
                    index <= currentStep ? "cursor-pointer" : "cursor-not-allowed opacity-40"
                  }`}
                  disabled={index > currentStep}
                >
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      index === currentStep
                        ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25"
                        : index < currentStep
                        ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-xs font-medium hidden sm:block transition-colors ${
                      index === currentStep ? "text-blue-600" : index < currentStep ? "text-emerald-600" : "text-slate-400"
                    }`}
                  >
                    {step.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="container mx-auto px-4 pb-12">
          <div className="max-w-2xl mx-auto">
            <Card className="glass-card-strong rounded-2xl overflow-hidden border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl tracking-tight text-slate-900 dark:text-white">{STEPS[currentStep].title}</CardTitle>
                <CardDescription className="text-slate-400 dark:text-slate-500">{STEPS[currentStep].description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {currentStep === 0 && (
                  <StepContract data={data} updateData={updateData} />
                )}
                {currentStep === 1 && (
                  <StepWaarden data={data} updateData={updateData} />
                )}
                {currentStep === 2 && (
                  <StepBetaling data={data} updateData={updateData} />
                )}
                {currentStep === 3 && (
                  <StepBelasting data={data} updateData={updateData} />
                )}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
                className="gap-2 rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Vorige
              </Button>
              <Button 
                onClick={handleNext} 
                disabled={!canProceed()} 
                className="gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-700 hover:via-violet-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 border-0"
              >
                {currentStep === STEPS.length - 1 ? "Bekijk resultaten" : "Volgende"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </TooltipProvider>
  );
}

// Step Components
interface StepProps {
  data: WizardData;
  updateData: <K extends keyof WizardData>(key: K, value: WizardData[K]) => void;
}

function StepContract({ data, updateData }: StepProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-6">
      {/* Contract type */}
      <div className="space-y-3">
        <Label className="text-base font-medium text-slate-900 dark:text-white">Mijn erfpachtrecht valt onder:</Label>
        <div className="grid gap-3">
          {[
            {
              value: "AB1986" as ContractType,
              label: "AB 1986",
              desc: "Algemene Bepalingen 1986 (of ouder contract)",
            },
            {
              value: "AB2024" as ContractType,
              label: "AB 2024",
              desc: "Nieuwe uitgiftes vanaf 24 december 2024",
            },
            {
              value: "unknown" as ContractType,
              label: "Weet ik niet",
              desc: "Check je erfpachtakte",
            },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => updateData("contractType", option.value)}
              className={`p-4 rounded-lg border-2 text-left transition-colors ${
                data.contractType === option.value
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-950/50 dark:border-blue-500"
                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
              }`}
            >
              <div className="font-medium text-slate-900 dark:text-white">{option.label}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">{option.desc}</div>
            </button>
          ))}
        </div>
        {data.contractType === "unknown" && (
          <Card className="bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800">
            <CardContent className="pt-4">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Tip:</strong> Je kunt je contracttype vinden in je erfpachtakte. 
                Zoek naar &quot;Algemene Bepalingen&quot; en het bijbehorende jaartal.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Jaar selectie */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Label className="text-base font-medium text-slate-900 dark:text-white">Berekeningsjaar</Label>
          <Tooltip>
            <TooltipTrigger>
              <HelpCircle className="w-4 h-4 text-slate-400" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">
                Het jaar waarvoor je de canon wilt berekenen. 
                Canonpercentages verschillen per jaar.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Select
          value={data.selectedYear.toString()}
          onValueChange={(v) => updateData("selectedYear", parseInt(v))}
        >
          <SelectTrigger className="dark:border-slate-700 dark:bg-slate-800 dark:text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="dark:border-slate-700 dark:bg-slate-800">
            {years.map((year) => {
              const ab1986Rate = AB1986_CANON_RATES[year];
              const ab2024Rate = AB2024_CANON_RATES[year];
              return (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                  {ab1986Rate && ` (AB1986: ${(ab1986Rate * 100).toFixed(1)}%)`}
                  {ab2024Rate && ` (AB2024: ${(ab2024Rate * 100).toFixed(1)}%)`}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        {!getCanonRate(data.contractType === "unknown" ? "AB1986" : data.contractType, data.selectedYear) && (
          <div className="space-y-2">
            <p className="text-sm text-amber-600 dark:text-amber-400">
              Geen officieel percentage bekend voor {data.selectedYear}. Voer handmatig in:
            </p>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                step="0.1"
                placeholder="bijv. 3.3"
                value={data.customCanonRate ? (data.customCanonRate * 100).toFixed(1) : ""}
                onChange={(e) => updateData("customCanonRate", parseFloat(e.target.value) / 100)}
                className="w-32 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <span className="text-slate-500 dark:text-slate-400">%</span>
            </div>
          </div>
        )}
      </div>

      {/* Looptijd */}
      <div className="space-y-3">
        <Label className="text-base font-medium text-slate-900 dark:text-white">Looptijd erfpacht</Label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: "eeuwigdurend" as LooptijdType, label: "Eeuwigdurend" },
            { value: "aflopend" as LooptijdType, label: "Aflopend" },
            { value: "unknown" as LooptijdType, label: "Onbekend" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => updateData("looptijd", option.value)}
              className={`p-3 rounded-lg border-2 text-center transition-colors ${
                data.looptijd === option.value
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-950/50 dark:border-blue-500"
                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
              }`}
            >
              <div className="font-medium text-slate-900 dark:text-white text-sm">{option.label}</div>
            </button>
          ))}
        </div>
        {data.looptijd === "aflopend" && (
          <div className="space-y-2">
            <Label className="text-slate-700 dark:text-slate-300">Einddatum erfpacht</Label>
            <Input
              type="number"
              placeholder="bijv. 2050"
              value={data.einddatum || ""}
              onChange={(e) => updateData("einddatum", parseInt(e.target.value))}
              className="dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        )}
      </div>
    </div>
  );
}

function StepWaarden({ data, updateData }: StepProps) {
  return (
    <div className="space-y-6">
      {/* Grondwaarde */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Label className="text-base font-medium text-slate-900 dark:text-white">Grondwaarde</Label>
          <Tooltip>
            <TooltipTrigger>
              <HelpCircle className="w-4 h-4 text-slate-400" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">
                De grondwaarde staat in je erfpachtakte of in een recente taxatie. 
                Dit is de basis voor de canonberekening.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-500 dark:text-slate-400">€</span>
          <Input
            type="number"
            placeholder="bijv. 150000"
            value={data.grondwaarde || ""}
            onChange={(e) => updateData("grondwaarde", parseFloat(e.target.value) || 0)}
            className="dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          De grondwaarde vind je in je erfpachtakte of taxatierapport.
        </p>
      </div>

      {/* WOZ-waarde */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Label className="text-base font-medium text-slate-900 dark:text-white">WOZ-waarde (optioneel)</Label>
          <Tooltip>
            <TooltipTrigger>
              <HelpCircle className="w-4 h-4 text-slate-400" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">
                De WOZ-waarde is nodig voor het &quot;eigen grond&quot; scenario 
                (bloot eigendom). Je vindt deze op je WOZ-beschikking.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-500 dark:text-slate-400">€</span>
          <Input
            type="number"
            placeholder="bijv. 350000"
            value={data.wozWaarde || ""}
            onChange={(e) => updateData("wozWaarde", parseFloat(e.target.value) || undefined)}
            className="dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Nodig voor berekening bloot eigendom (kopen eigen grond).
        </p>
      </div>

      {/* Uitgiftejaar */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Label className="text-base font-medium text-slate-900 dark:text-white">Jaar van uitgifte (optioneel)</Label>
          <Tooltip>
            <TooltipTrigger>
              <HelpCircle className="w-4 h-4 text-slate-400" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">
                Het jaar waarin de erfpacht is uitgegeven of heruitgegeven. 
                Voor context, niet verplicht.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Input
          type="number"
          placeholder="bijv. 1995"
          value={data.uitgiftejaar || ""}
          onChange={(e) => updateData("uitgiftejaar", parseInt(e.target.value) || undefined)}
          className="dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
      </div>
    </div>
  );
}

function StepBetaling({ data, updateData }: StepProps) {
  return (
    <div className="space-y-6">
      {/* Huidige canon */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Label className="text-base font-medium text-slate-900 dark:text-white">Huidige jaarlijkse canon (optioneel)</Label>
          <Tooltip>
            <TooltipTrigger>
              <HelpCircle className="w-4 h-4 text-slate-400" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">
                Als je dit invult, kunnen we controleren of onze berekening 
                in de buurt komt van wat je nu betaalt.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-500 dark:text-slate-400">€</span>
          <Input
            type="number"
            placeholder="bijv. 4500"
            value={data.huidigeCanon || ""}
            onChange={(e) => updateData("huidigeCanon", parseFloat(e.target.value) || undefined)}
            className="dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          <span className="text-slate-500 dark:text-slate-400">per jaar</span>
        </div>
      </div>

      {/* Beheerkosten */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Label className="text-base font-medium text-slate-900 dark:text-white">Beheerkosten per jaar</Label>
          <Tooltip>
            <TooltipTrigger>
              <HelpCircle className="w-4 h-4 text-slate-400" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">
                Administratiekosten die de gemeente in rekening brengt 
                bovenop de canon. Vaak een klein bedrag.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-500 dark:text-slate-400">€</span>
          <Input
            type="number"
            placeholder="bijv. 50"
            value={data.beheerkosten}
            onChange={(e) => updateData("beheerkosten", parseFloat(e.target.value) || 0)}
            className="dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          <span className="text-slate-500 dark:text-slate-400">per jaar</span>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Schatting: €50 per jaar (check je nota voor het exacte bedrag)
        </p>
      </div>
    </div>
  );
}

function StepBelasting({ data, updateData }: StepProps) {
  return (
    <div className="space-y-6">
      {/* Eigen woning */}
      <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800/50">
        <div className="space-y-1">
          <Label className="text-base font-medium text-slate-900 dark:text-white">Dit is mijn eigen woning (box 1)</Label>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Periodieke canon is dan aftrekbaar van de belasting
          </p>
        </div>
        <Switch
          checked={data.isEigenWoning}
          onCheckedChange={(checked) => updateData("isEigenWoning", checked)}
        />
      </div>

      {/* Inkomensschijf */}
      {data.isEigenWoning && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Label className="text-base font-medium text-slate-900 dark:text-white">Huishoudinkomen (bruto)</Label>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="w-4 h-4 text-slate-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Bepaalt je marginale belastingtarief en daarmee 
                  hoeveel je terugkrijgt via hypotheekrenteaftrek.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => updateData("marginaleTariefgroep", 0.3697)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                data.marginaleTariefgroep < 0.40
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950/50 dark:border-blue-400"
                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
              }`}
            >
              <p className="font-medium text-slate-900 dark:text-white">{"< €76.817"}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Tarief: 36,97%</p>
            </button>
            <button
              type="button"
              onClick={() => updateData("marginaleTariefgroep", 0.495)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                data.marginaleTariefgroep >= 0.40
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950/50 dark:border-blue-400"
                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
              }`}
            >
              <p className="font-medium text-slate-900 dark:text-white">{"≥ €76.817"}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Tarief: 49,50%</p>
            </button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Let op: hypotheekrenteaftrek is gemaximeerd op 36,97% (2026)
          </p>
        </div>
      )}

      {/* Financieren met lening */}
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800/50">
          <div className="space-y-1">
            <Label className="text-base font-medium text-slate-900 dark:text-white">Afkoop/koop financieren met lening?</Label>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Rente op lening is vaak aftrekbaar bij eigen woning
            </p>
          </div>
          <Switch
            checked={data.financierenMetLening}
            onCheckedChange={(checked) => updateData("financierenMetLening", checked)}
          />
        </div>

        {data.financierenMetLening && (
          <div className="grid sm:grid-cols-2 gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-slate-300">Rente percentage</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.1"
                  placeholder="4.5"
                  value={data.leningRente ? (data.leningRente * 100).toFixed(1) : ""}
                  onChange={(e) => updateData("leningRente", parseFloat(e.target.value) / 100)}
                  className="dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <span className="text-slate-500 dark:text-slate-400">%</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-slate-300">Looptijd</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="30"
                  value={data.leningLooptijd || ""}
                  onChange={(e) => updateData("leningLooptijd", parseInt(e.target.value))}
                  className="dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <span className="text-slate-500 dark:text-slate-400">jaar</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info card */}
      <Card className="bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-4">
          <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Fiscale informatie</h4>
          <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
            <li>✓ Periodieke canonbetalingen zijn aftrekbaar (box 1)</li>
            <li>✗ Afkoopsom zelf is niet aftrekbaar</li>
            <li>✓ Rente op lening voor afkoop/koop is vaak aftrekbaar</li>
          </ul>
          <p className="text-xs text-blue-700 dark:text-blue-400 mt-3">
            Dit is een versimpeling. Voor exact advies: raadpleeg de Belastingdienst of een adviseur.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
