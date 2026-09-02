import type { Location } from "./types.ts";

/**
 * Location lookup table.
 *
 * These IDs are the frontend's documented mapping while
 * `docs/INTEGRATION_CONTRACT.md` is the source of truth.
 * Do not invent additional IDs in UI code — add them here first.
 */
export const LOCATIONS: Location[] = [
  {
    id: 1n,
    name: "Jakarta",
    region: "Indonesia",
    hazard: "Flood",
    basePremiumBps: 420,
    description: "Coastal megacity on a sinking alluvial plain.",
  },
  {
    id: 2n,
    name: "New Orleans",
    region: "United States",
    hazard: "Flood",
    basePremiumBps: 380,
    description: "Below-sea-level basin behind a levee system.",
  },
  {
    id: 3n,
    name: "Venice",
    region: "Italy",
    hazard: "Flood",
    basePremiumBps: 310,
    description: "Lagoon city with recurrent acqua alta.",
  },
  {
    id: 4n,
    name: "Dhaka",
    region: "Bangladesh",
    hazard: "Flood",
    basePremiumBps: 460,
    description: "Delta capital on the Buriganga floodplain.",
  },
  {
    id: 5n,
    name: "Miami",
    region: "United States",
    hazard: "Flood",
    basePremiumBps: 350,
    description: "Low-lying Atlantic shelf, king-tide exposure.",
  },
  {
    id: 6n,
    name: "Bangkok",
    region: "Thailand",
    hazard: "Flood",
    basePremiumBps: 340,
    description: "Chao Phraya basin with seasonal monsoon surge.",
  },
  {
    id: 7n,
    name: "Assam",
    region: "India",
    hazard: "Flood",
    basePremiumBps: 450,
    description: "Brahmaputra river valley with severe monsoon flooding.",
  },
  {
    id: 8n,
    name: "Gujarat",
    region: "India",
    hazard: "Flood",
    basePremiumBps: 400,
    description: "Coastal and riverine regions prone to cyclonic storm surges.",
  },
];

export function getLocation(id: bigint): Location | undefined {
  return LOCATIONS.find((l) => l.id === id);
}

export function locationLabel(id: bigint): string {
  const loc = getLocation(id);
  return loc ? `${loc.name}, ${loc.region}` : `Location #${id.toString()}`;
}

export function padLocationId(id: bigint): string {
  return id.toString().padStart(2, "0");
}
