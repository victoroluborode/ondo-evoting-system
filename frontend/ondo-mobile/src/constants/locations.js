// Single source of truth for Ondo State's electoral geography.
// Each Federal Constituency contains multiple LGAs. Screens that need
// to capture or display location should import from here, not hardcode.

export const ONDO_CONSTITUENCIES = [
  {
    name: "Akoko",
    lgas: [
      "Akoko North-East",
      "Akoko North-West",
      "Akoko South-East",
      "Akoko South-West",
    ],
  },
  {
    name: "Akure",
    lgas: ["Akure North", "Akure South"],
  },
  {
    name: "Idanre/Ifedore",
    lgas: ["Idanre", "Ifedore"],
  },
  {
    name: "Ilaje/Ese-Odo",
    lgas: ["Ilaje", "Ese-Odo"],
  },
  {
    name: "Irele/Okitipupa",
    lgas: ["Irele", "Okitipupa"],
  },
  {
    name: "Odigbo/Ile-Oluji/Okeigbo",
    lgas: ["Odigbo", "Ile-Oluji/Okeigbo"],
  },
  {
    name: "Ondo East/Ondo West",
    lgas: ["Ondo East", "Ondo West"],
  },
  {
    name: "Ose/Owo",
    lgas: ["Ose", "Owo"],
  },
];

// Flat helper if a screen genuinely only needs the LGA list, regardless of constituency
export const ALL_ONDO_LGAS = ONDO_CONSTITUENCIES.flatMap((c) => c.lgas);

// Lookup: given an LGA name, return its constituency
export function getConstituencyForLGA(lgaName) {
  const match = ONDO_CONSTITUENCIES.find((c) => c.lgas.includes(lgaName));
  return match ? match.name : null;
}
