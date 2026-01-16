"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ExternalLink, Info } from "lucide-react";
import {
  AB1986_CANON_RATES,
  AB2024_CANON_RATES,
  BLOOT_EIGENDOM_KOOPPRIJS_STAFFEL,
  DEFAULTS,
} from "@/data/denhaag-canonpercentages";
import { ThemeToggle } from "@/components/theme-toggle";

export default function BronnenPage() {
  return (
    <main className="min-h-screen gradient-bg-light">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Terug naar home</span>
          </Link>
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Aannames & Bronnen</h1>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 pb-12">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Intro */}
          <Card className="glass-card-strong border-0 shadow-md">
            <CardContent className="pt-6">
              <p className="text-slate-600 dark:text-slate-300">
                Deze pagina beschrijft de aannames en bronnen die gebruikt worden in de 
                Erfpacht Calculator. De berekeningen zijn <strong>indicatief</strong> en 
                bedoeld om je een beeld te geven van de verschillende scenario&apos;s.
              </p>
            </CardContent>
          </Card>

          {/* Canonpercentages */}
          <Card className="glass-card-strong border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Canonpercentages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-3 text-slate-800 dark:text-slate-200">AB1986 percentages</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  Onder AB1986 wordt het canonpercentage jaarlijks vastgesteld op basis van 
                  het gemiddelde van de BNG-lening rente en de hypotheekrente.
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(AB1986_CANON_RATES).map(([year, rate]) => (
                    <div key={year} className="bg-blue-50 dark:bg-blue-950/50 p-3 rounded-lg text-center">
                      <div className="text-sm text-slate-500 dark:text-slate-400">{year}</div>
                      <div className="text-lg font-semibold text-blue-700 dark:text-blue-400">
                        {(rate * 100).toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="dark:bg-slate-700" />

              <div>
                <h4 className="font-medium mb-3 text-slate-800 dark:text-slate-200">AB2024 percentages (tienjaarsgemiddelde)</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  De AB2024 hanteert een tienjaarsgemiddelde van de rente, wat voor meer 
                  stabiliteit zorgt en schokken dempt.
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(AB2024_CANON_RATES).map(([year, rate]) => (
                    <div key={year} className="bg-green-50 dark:bg-green-950/50 p-3 rounded-lg text-center">
                      <div className="text-sm text-slate-500 dark:text-slate-400">{year}</div>
                      <div className="text-lg font-semibold text-green-700 dark:text-green-400">
                        {(rate * 100).toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AB vergelijking */}
          <Card className="glass-card-strong border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">AB1986 vs AB2024</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-medium shrink-0">
                    1
                  </span>
                  <div className="text-slate-700 dark:text-slate-300">
                    <strong>AB1986:</strong> Het canonpercentage kan jaarlijks sterk variëren, 
                    afhankelijk van de actuele rentestand. Dit kan leiden tot grote schommelingen 
                    in je jaarlijkse canon.
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 flex items-center justify-center text-sm font-medium shrink-0">
                    2
                  </span>
                  <div className="text-slate-700 dark:text-slate-300">
                    <strong>AB2024:</strong> Door het tienjaarsgemiddelde is het percentage 
                    stabieler. Dit geeft meer voorspelbaarheid voor je maandelijkse lasten.
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 flex items-center justify-center text-sm font-medium shrink-0">
                    3
                  </span>
                  <div className="text-slate-700 dark:text-slate-300">
                    <strong>Overstappen:</strong> Vrijwillig overstappen van AB1986 naar AB2024 
                    is mogelijk. De gemeente kan voorwaarden stellen. Check het actuele beleid.
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Bloot eigendom */}
          <Card className="glass-card-strong border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Bloot eigendom (eigen grond)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2 text-slate-800 dark:text-slate-200">Wat is bloot eigendom?</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  Bij bloot eigendom koopt u de erfpachtgrond van de gemeente en wordt u 
                  volledig eigenaar. Het erfpachtrecht eindigt dan. Voorwaarde is dat uw 
                  canonverplichting eerst is afgekocht.
                </p>
              </div>
              
              <Separator className="dark:bg-slate-700" />
              
              <div>
                <h4 className="font-medium mb-2 text-slate-800 dark:text-slate-200">Koopprijs (WOZ-staffel)</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  De koopprijs wordt bepaald door een vaste staffel op basis van de WOZ-waarde:
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="text-left py-2 font-medium text-slate-700 dark:text-slate-300">WOZ-waarde</th>
                        <th className="text-right py-2 font-medium text-slate-700 dark:text-slate-300">Koopprijs</th>
                      </tr>
                    </thead>
                    <tbody>
                      {BLOOT_EIGENDOM_KOOPPRIJS_STAFFEL.map((item, index) => (
                        <tr key={index} className="border-b border-slate-100 dark:border-slate-800">
                          <td className="py-2 text-slate-600 dark:text-slate-400">
                            €{item.min.toLocaleString("nl-NL")} – 
                            {item.max === Infinity 
                              ? " en hoger" 
                              : ` €${item.max.toLocaleString("nl-NL")}`}
                          </td>
                          <td className="text-right py-2 font-medium text-slate-900 dark:text-white">
                            €{item.bedrag.toLocaleString("nl-NL")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="bg-amber-50 dark:bg-amber-950/50 p-4 rounded-lg">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Let op:</strong> De gemeente kan extra bedragen rekenen als het 
                  bestemmingsplan uitbreiding van bebouwing of andere functies toelaat. 
                  Dit vereist een taxatie.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Afkoop canon */}
          <Card className="glass-card-strong border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Afkoop canonbetaling</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Bij afkoop van de canon betaalt u eenmalig de grondwaarde en hoeft u geen 
                jaarlijkse canon meer te betalen.
              </p>
              <div>
                <h4 className="font-medium mb-2 text-slate-800 dark:text-slate-200">Kosten</h4>
                <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                  <li>• <strong>Afkoopsom:</strong> de grondwaarde van uw erfpachtrecht</li>
                  <li>• <strong>Afkoop beheerkosten:</strong> €{DEFAULTS.managementFeeAfkoop} (eenmalig)</li>
                  <li>• <strong>Notariskosten:</strong> voor uw rekening</li>
                </ul>
              </div>
              <div className="bg-green-50 dark:bg-green-950/50 p-4 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-300">
                  <strong>Tip:</strong> Als u het afkoopbedrag meefinanciert in uw hypotheek, 
                  is de rente over dat bedrag aftrekbaar in uw belastingaangifte.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tarieven */}
          <Card className="glass-card-strong border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Tarieven 2026</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="py-2 text-slate-600 dark:text-slate-400">Beheerkosten (administratiekosten) per jaar</td>
                      <td className="text-right py-2 font-medium text-slate-900 dark:text-white">€{DEFAULTS.managementFee}</td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="py-2 text-slate-600 dark:text-slate-400">Afkoopsom beheerkosten</td>
                      <td className="text-right py-2 font-medium text-slate-900 dark:text-white">€{DEFAULTS.managementFeeAfkoop}</td>
                    </tr>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <td className="py-2 text-slate-600 dark:text-slate-400">Splitsingskosten per appartementsrecht</td>
                      <td className="text-right py-2 font-medium text-slate-900 dark:text-white">€191</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-3">
                Bron: Collegebesluit Vaststelling canonpercentage 2026 (RIS324183)
              </p>
            </CardContent>
          </Card>

          {/* Fiscale regels */}
          <Card className="glass-card-strong border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Fiscale regels (vereenvoudigd)</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex gap-3 items-start">
                  <span className="text-green-600 dark:text-green-400 text-lg">✓</span>
                  <div className="text-slate-700 dark:text-slate-300">
                    <strong>Periodieke canon:</strong> Aftrekbaar als je de woning als eigen 
                    woning hebt (box 1).
                  </div>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="text-red-600 dark:text-red-400 text-lg">✗</span>
                  <div className="text-slate-700 dark:text-slate-300">
                    <strong>Afkoopsom:</strong> De afkoopsom zelf is niet aftrekbaar.
                  </div>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="text-green-600 dark:text-green-400 text-lg">✓</span>
                  <div className="text-slate-700 dark:text-slate-300">
                    <strong>Rente op lening:</strong> Als je de afkoop of aankoop financiert 
                    met een lening, is de rente vaak aftrekbaar (onder voorwaarden).
                  </div>
                </li>
              </ul>
              <Card className="bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 mt-4">
                <CardContent className="pt-4">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    Dit is een versimpelde weergave. Fiscale regels kunnen complex zijn en 
                    veranderen. Raadpleeg altijd de Belastingdienst of een fiscaal adviseur 
                    voor je persoonlijke situatie.
                  </p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          {/* Bronnen */}
          <Card className="glass-card-strong border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">Bronnen</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li>
                  <a
                    href="https://www.denhaag.nl/nl/wonen-en-bouwen/erfpacht.htm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <ExternalLink className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-blue-600 dark:text-blue-400">
                        Gemeente Den Haag - Erfpacht
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        Officiële informatie over erfpacht in Den Haag, inclusief 
                        canonpercentages en algemene bepalingen.
                      </div>
                    </div>
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/woning/eigen_woning/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <ExternalLink className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-blue-600 dark:text-blue-400">
                        Belastingdienst - Eigen woning
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        Informatie over aftrekbare kosten voor de eigen woning, 
                        waaronder erfpachtcanon.
                      </div>
                    </div>
                  </a>
                </li>
                <li>
                  <a
                    href="https://denhaag.raadsinformatie.nl/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <ExternalLink className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-blue-600 dark:text-blue-400">
                        Den Haag RIS - Raadsinformatie
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        Raadsstukken en beleidsdocumenten over erfpacht in Den Haag.
                      </div>
                    </div>
                  </a>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Card className="bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <Info className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" />
                <div>
                  <h4 className="font-semibold text-amber-900 dark:text-amber-200 mb-2">Disclaimer</h4>
                  <p className="text-sm text-amber-800 dark:text-amber-300 mb-3">
                    Deze tool is niet gelieerd aan de gemeente Den Haag en geeft 
                    <strong> indicatieve berekeningen</strong>. De daadwerkelijke kosten, 
                    afkoopbedragen en voorwaarden kunnen afwijken.
                  </p>
                  <p className="text-sm text-amber-800 dark:text-amber-300">
                    Raadpleeg altijd je erfpachtakte, het aanbod van de gemeente, en bij 
                    twijfel een notaris of financieel adviseur.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Back button */}
          <div className="flex justify-center pt-4">
            <Link href="/">
              <Button variant="outline" className="gap-2 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                <ArrowLeft className="w-4 h-4" />
                Terug naar home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
