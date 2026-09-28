/**
 * Dados de exemplo do app do colecionador (lote 5a, fase A — só visual).
 *
 * Exceção temporária à regra "sem mock" (docs/briefings/app-web-lote5.md):
 * a fase B troca isto pela API v2 (mesmos campos de `CarItem`/`OwnedCar`,
 * `Serie`, `Summary`… de `backendToSave/docs/API-V2.md`) e apaga esta pasta.
 */

export type MockBrand = { id: string; name: string; state: "ativa" | "descontinuada" | "em_analise" };

export type MockAttribute = { id: string; title: string; description: string };

export type MockSerie = {
  id: string;
  title: string;
  description: string;
  isDefault: boolean;
};

export type MockCar = {
  id: string;
  title: string;
  description: string;
  brandId: string;
  brandName: string;
  serieId: string;
  serieTitle: string;
  seriePosition: string | null;
  seriePositionNum: number | null;
  collector: string;
  color: string;
  toy: string;
  year: number;
  scale: string;
  attributeIds: string[];
};

export const MOCK_BRANDS: MockBrand[] = [
  { id: "brand-hw", name: "Hot Wheels", state: "ativa" },
  { id: "brand-matchbox", name: "Matchbox", state: "ativa" },
  { id: "brand-tarmac", name: "Tarmac Works", state: "ativa" },
  { id: "brand-minigt", name: "Mini GT", state: "em_analise" },
];

export const MOCK_ATTRIBUTES: MockAttribute[] = [
  { id: "attr-th", title: "Treasure Hunt", description: "Tiragem limitada com rodas de liga e acabamento especial." },
  { id: "attr-sth", title: "Super Treasure Hunt", description: "A raridade máxima da linha: pneus de borracha e pintura Spectraflame." },
  { id: "attr-zamac", title: "Zamac", description: "Corpo em liga metálica sem pintura, acabamento cromado natural." },
  { id: "attr-chase", title: "Chase", description: "Variante rara de tiragem reduzida dentro da série." },
  { id: "attr-ff", title: "Fast & Furious", description: "Miniatura licenciada da franquia Velozes e Furiosos." },
  { id: "attr-first-ed", title: "Primeira Edição", description: "Estreia do molde naquele ano de lançamento." },
  { id: "attr-limited", title: "Edição Limitada", description: "Tiragem numerada, vendida em quantidade reduzida." },
];

export const MOCK_SERIES: MockSerie[] = [
  { id: "serie-jimports", title: "HW J-Imports", description: "Os lendários compactos e esportivos japoneses que definiram o tuning nos anos 90.", isDefault: true },
  { id: "serie-car-culture", title: "Car Culture", description: "Miniaturas premium com atenção a detalhes reais, para o colecionador exigente.", isDefault: true },
  { id: "serie-fast-furious", title: "Fast & Furious", description: "Os carros que roubaram a cena nas telonas da franquia Velozes e Furiosos.", isDefault: true },
  { id: "serie-boulevard", title: "Boulevard", description: "Clássicos americanos de rua, do jeito que saíram de fábrica.", isDefault: false },
  { id: "serie-then-now", title: "Then and Now", description: "O carro de ontem ao lado da versão moderna equivalente.", isDefault: false },
  { id: "serie-rally", title: "Rally", description: "Máquinas de terra e asfalto direto das pistas de rali.", isDefault: false },
  { id: "serie-art-cars", title: "Art Cars", description: "Pintura autoral e grafismos exclusivos sobre moldes clássicos.", isDefault: false },
  { id: "serie-baja", title: "Baja Blazers", description: "Suspensão alta e pneus off-road para enfrentar qualquer terreno.", isDefault: false },
  { id: "serie-retro", title: "Retro Racers", description: "Carros de corrida de décadas passadas, remasterizados em escala.", isDefault: false },
  { id: "serie-exotics", title: "Exotics", description: "Supercarros e hypercars dos maiores fabricantes do mundo.", isDefault: false },
];

const COLORS = [
  "Vermelho metálico",
  "Azul metálico",
  "Preto fosco",
  "Amarelo",
  "Verde militar",
  "Branco pérola",
  "Laranja",
  "Prata",
  "Roxo",
  "Grafite",
];

const DESCRIPTION_FLAVORS = [
  "Rodas de liga leve e suspensão baixa completam o visual de garagem.",
  "Um clássico revisitado, fiel ao desenho original em escala 1:64.",
  "Pintura com efeito metálico e detalhes impressos de fábrica.",
  "Molde retrabalhado com mais detalhes no interior e no motor.",
  "Direto das pistas para a sua estante, sem perder as proporções reais.",
];

type Seed = {
  title: string;
  serieIdx: number;
  brandIdx: number;
  seriePositionNum: number | null;
  seriePositionMax: number | null;
  attrIdxs?: number[];
};

const SEEDS: Seed[] = [
  { title: "'71 Datsun 510 Wagon", serieIdx: 0, brandIdx: 0, seriePositionNum: 1, seriePositionMax: 10 },
  { title: "Nissan Skyline GT-R (R34)", serieIdx: 0, brandIdx: 0, seriePositionNum: 2, seriePositionMax: 10, attrIdxs: [1] },
  { title: "Toyota AE86 Sprinter Trueno", serieIdx: 0, brandIdx: 0, seriePositionNum: 3, seriePositionMax: 10 },
  { title: "Mazda RX-7 FD", serieIdx: 0, brandIdx: 2, seriePositionNum: 4, seriePositionMax: 10, attrIdxs: [0] },
  { title: "Honda Civic EF", serieIdx: 0, brandIdx: 0, seriePositionNum: 5, seriePositionMax: 10 },
  { title: "Subaru Impreza WRX STI", serieIdx: 5, brandIdx: 0, seriePositionNum: 1, seriePositionMax: 8, attrIdxs: [5] },
  { title: "Nissan Fairlady Z (S30)", serieIdx: 0, brandIdx: 0, seriePositionNum: 6, seriePositionMax: 10 },
  { title: "Toyota Supra MK4", serieIdx: 0, brandIdx: 0, seriePositionNum: 7, seriePositionMax: 10, attrIdxs: [0] },
  { title: "Mitsubishi Lancer Evolution VI", serieIdx: 5, brandIdx: 1, seriePositionNum: 2, seriePositionMax: 8 },
  { title: "Nissan Silvia S15", serieIdx: 0, brandIdx: 0, seriePositionNum: 8, seriePositionMax: 10 },
  { title: "Toyota Corolla AE92", serieIdx: 0, brandIdx: 1, seriePositionNum: 9, seriePositionMax: 10 },
  { title: "Toyota GR Yaris", serieIdx: 5, brandIdx: 0, seriePositionNum: 3, seriePositionMax: 8, attrIdxs: [5] },

  { title: "'67 Chevrolet Camaro", serieIdx: 3, brandIdx: 0, seriePositionNum: 1, seriePositionMax: 12 },
  { title: "'70 Dodge Charger R/T", serieIdx: 3, brandIdx: 0, seriePositionNum: 2, seriePositionMax: 12, attrIdxs: [1] },
  { title: "Ford Mustang Mach 1", serieIdx: 3, brandIdx: 0, seriePositionNum: 3, seriePositionMax: 12 },
  { title: "'69 Chevrolet Chevelle SS", serieIdx: 3, brandIdx: 1, seriePositionNum: 4, seriePositionMax: 12 },
  { title: "'55 Chevy Bel Air", serieIdx: 3, brandIdx: 0, seriePositionNum: 5, seriePositionMax: 12, attrIdxs: [6] },
  { title: "Plymouth Road Runner", serieIdx: 3, brandIdx: 1, seriePositionNum: 6, seriePositionMax: 12 },
  { title: "Pontiac GTO", serieIdx: 3, brandIdx: 0, seriePositionNum: 7, seriePositionMax: 12 },
  { title: "Custom '59 Cadillac", serieIdx: 3, brandIdx: 0, seriePositionNum: 8, seriePositionMax: 12, attrIdxs: [0] },
  { title: "Chevrolet Camaro ZL1", serieIdx: 9, brandIdx: 0, seriePositionNum: 1, seriePositionMax: 10 },
  { title: "Dodge Challenger SRT Demon", serieIdx: 9, brandIdx: 0, seriePositionNum: 2, seriePositionMax: 10, attrIdxs: [1] },
  { title: "Chevrolet Corvette C8", serieIdx: 9, brandIdx: 2, seriePositionNum: 3, seriePositionMax: 10 },
  { title: "Dodge Viper GTS", serieIdx: 9, brandIdx: 0, seriePositionNum: 4, seriePositionMax: 10 },

  { title: "Porsche 911 GT3 RS", serieIdx: 1, brandIdx: 2, seriePositionNum: 1, seriePositionMax: 12, attrIdxs: [0] },
  { title: "Lamborghini Huracán", serieIdx: 9, brandIdx: 3, seriePositionNum: 5, seriePositionMax: 10, attrIdxs: [6] },
  { title: "Ferrari 458 Italia", serieIdx: 9, brandIdx: 3, seriePositionNum: 6, seriePositionMax: 10 },
  { title: "McLaren P1", serieIdx: 9, brandIdx: 2, seriePositionNum: 7, seriePositionMax: 10, attrIdxs: [1] },
  { title: "Aston Martin DB5", serieIdx: 1, brandIdx: 2, seriePositionNum: 2, seriePositionMax: 12 },
  { title: "Jaguar E-Type", serieIdx: 1, brandIdx: 1, seriePositionNum: 3, seriePositionMax: 12 },
  { title: "Mercedes-AMG GT", serieIdx: 9, brandIdx: 2, seriePositionNum: 8, seriePositionMax: 10 },
  { title: "Ford GT40", serieIdx: 8, brandIdx: 2, seriePositionNum: 1, seriePositionMax: 10, attrIdxs: [0] },

  { title: "Volkswagen Golf GTI Mk1", serieIdx: 6, brandIdx: 1, seriePositionNum: 1, seriePositionMax: 8 },
  { title: "BMW M3 E30", serieIdx: 6, brandIdx: 0, seriePositionNum: 2, seriePositionMax: 8, attrIdxs: [3] },
  { title: "Datsun 240Z", serieIdx: 6, brandIdx: 0, seriePositionNum: 3, seriePositionMax: 8 },
  { title: "Audi Quattro", serieIdx: 5, brandIdx: 1, seriePositionNum: 4, seriePositionMax: 8 },
  { title: "Lancia Delta HF Integrale", serieIdx: 5, brandIdx: 2, seriePositionNum: 5, seriePositionMax: 8, attrIdxs: [6] },
  { title: "Alfa Romeo Giulia GTA", serieIdx: 6, brandIdx: 1, seriePositionNum: 6, seriePositionMax: 8 },
  { title: "Renault 5 Turbo", serieIdx: 5, brandIdx: 1, seriePositionNum: 6, seriePositionMax: 8 },
  { title: "Peugeot 205 GTI", serieIdx: 5, brandIdx: 1, seriePositionNum: 7, seriePositionMax: 8 },

  { title: "Toyota Land Cruiser FJ40", serieIdx: 7, brandIdx: 0, seriePositionNum: 1, seriePositionMax: 10 },
  { title: "Ford Bronco '69", serieIdx: 7, brandIdx: 0, seriePositionNum: 2, seriePositionMax: 10, attrIdxs: [3] },
  { title: "Jeep Wrangler", serieIdx: 7, brandIdx: 1, seriePositionNum: 3, seriePositionMax: 10 },
  { title: "Chevrolet Silverado", serieIdx: 7, brandIdx: 0, seriePositionNum: 4, seriePositionMax: 10 },
  { title: "Datsun 620 Pickup", serieIdx: 7, brandIdx: 0, seriePositionNum: 5, seriePositionMax: 10, attrIdxs: [2] },
  { title: "Volkswagen Kombi", serieIdx: 4, brandIdx: 1, seriePositionNum: 1, seriePositionMax: 6 },

  { title: "Honda S2000", serieIdx: 4, brandIdx: 0, seriePositionNum: 2, seriePositionMax: 6, attrIdxs: [5] },
  { title: "Mazda MX-5 Miata", serieIdx: 4, brandIdx: 0, seriePositionNum: 3, seriePositionMax: 6 },
  { title: "Fiat 500", serieIdx: 4, brandIdx: 1, seriePositionNum: 4, seriePositionMax: 6 },
  { title: "Mini Cooper S", serieIdx: 4, brandIdx: 1, seriePositionNum: 5, seriePositionMax: 6, attrIdxs: [2] },
];

function makeCars(): MockCar[] {
  return SEEDS.map((seed, i) => {
    const serie = MOCK_SERIES[seed.serieIdx];
    const brand = MOCK_BRANDS[seed.brandIdx];
    const year = 2019 + (i % 7);
    const color = COLORS[i % COLORS.length];
    const collectorNum = String(i + 1).padStart(3, "0");
    const toy = `${brand.name.slice(0, 2).toUpperCase()}${(i * 7 + 13).toString(36).toUpperCase().padStart(3, "0")}`;
    const flavor = DESCRIPTION_FLAVORS[i % DESCRIPTION_FLAVORS.length];

    return {
      id: `car-${i + 1}`,
      title: seed.title,
      description: `${seed.title}, lançado em ${year} pela ${brand.name}, faz parte da série ${serie.title}. ${flavor}`,
      brandId: brand.id,
      brandName: brand.name,
      serieId: serie.id,
      serieTitle: serie.title,
      seriePosition: seed.seriePositionNum && seed.seriePositionMax ? `${seed.seriePositionNum}/${seed.seriePositionMax}` : null,
      seriePositionNum: seed.seriePositionNum,
      collector: collectorNum,
      color,
      toy,
      year,
      scale: "1:64",
      attributeIds: (seed.attrIdxs ?? []).map((idx) => MOCK_ATTRIBUTES[idx].id),
    };
  });
}

export const MOCK_CARS: MockCar[] = makeCars();

/** `carId -> quantidade` inicial da coleção de exemplo (repetidos a cada 7). */
export const MOCK_COLLECTION: Record<string, number> = Object.fromEntries(
  MOCK_CARS.filter((_, i) => i % 3 === 0).map((car, ownedIdx) => [car.id, ownedIdx % 7 === 0 ? 2 + (ownedIdx % 3) : 1])
);

export const MOCK_USER = {
  name: "Carlos Andrade",
  email: "carlos.andrade@exemplo.com",
  phone: "(11) 98765-4321",
};

export function carCountBySerie(serieId: string): number {
  return MOCK_CARS.filter((c) => c.serieId === serieId).length;
}

export function ownedCountBySerie(serieId: string, collection: Record<string, number>): number {
  return MOCK_CARS.filter((c) => c.serieId === serieId && (collection[c.id] ?? 0) > 0).length;
}
