// Static metadata for tracked bills. Live status/cosponsor data is layered on
// top of this at build time by fetch-bills.mjs — edit here to add/remove bills.
export const CONGRESS_NUM = 119;

export const BILLS = {
  S1748: {
    billType: "s",
    billNumber: "1748",
    title: "S.1748 — Kids Online Safety Act",
    subtitle: "Plus 3 companion bills: Youth AI Privacy Act, Children's AI Toy Safety Act, CHAT Act",
    sponsors: "Lead: Blackburn (R-TN) / Blumenthal (D-CT); Cantwell among 76 cosponsors",
    committee: "Senate Commerce, Science & Transportation",
    desc: "Requires social media platforms to enable the strongest safety settings by default for minors, gives parents and kids tools to limit addictive design features, and creates a duty of care for platforms regarding harms to minors like bullying, exploitation, and content promoting self-harm.",
    tags: ["Commerce", "Child Safety", "Tech"],
    bipartisan: true,
    link: "https://www.congress.gov/bill/119th-congress/senate-bill/1748"
  },
  S4668: {
    billType: "s",
    billNumber: "4668",
    title: "S.4668 — Protect College Sports Act of 2026",
    subtitle: "",
    sponsors: "Cantwell, Cruz (R-TX), Coons (D-DE), Schmitt (R-MO) — plus Capito (R-WV) and Welch (D-VT) added Jul 13",
    committee: "Senate Commerce, Science & Transportation",
    desc: "Creates national NIL (name, image, likeness) standards for college athletes, provides a limited NCAA antitrust exemption, protects funding for women's and Olympic sports programs, and amends the Sports Broadcasting Act to let schools pool media rights revenue.",
    tags: ["Commerce", "Bipartisan", "College Sports"],
    bipartisan: true,
    link: "https://www.congress.gov/bill/119th-congress/senate-bill/4668"
  },
  S1514: {
    billType: "s",
    billNumber: "1514",
    title: "S.1514 — Quinault Indian Nation Land Transfer Act",
    subtitle: "",
    sponsors: "Cantwell (lead)",
    committee: "Senate Committee on Indian Affairs",
    desc: "Transfers approximately 72 acres of old-growth U.S. Forest Service land into trust for the Quinault Indian Nation. Gaming is expressly prohibited on the transferred land.",
    tags: ["Indian Affairs", "WA Tribal Lands"],
    bipartisan: false,
    link: "https://www.congress.gov/bill/119th-congress/senate-bill/1514"
  },
  S4802: {
    billType: "s",
    billNumber: "4802",
    title: "S.4802 — Hurricane Hunter Aircraft Recapitalization Act",
    subtitle: "",
    sponsors: "Cantwell, Cruz (R-TX), Blunt Rochester (D-DE), Wicker (R-MS), Padilla (D-CA), Budd (R-NC)",
    committee: "Senate Commerce, Science & Transportation",
    desc: "Codifies NOAA's Hurricane Hunter aircraft mission into law and authorizes roughly $2.5 billion to acquire up to 9 new aircraft, replacing NOAA's aging fleet used for storm forecasting — including Pacific Northwest atmospheric-river events relevant to Washington state flooding.",
    tags: ["Commerce", "NOAA / Weather", "Bipartisan"],
    bipartisan: true,
    link: "https://www.congress.gov/bill/119th-congress/senate-bill/4802"
  },
  S5332: {
    billType: "s",
    billNumber: "5332",
    title: "S.5332 — Cooperative Institute Act of 2026",
    subtitle: "",
    sponsors: "Cantwell, Wicker (R-MS), Hickenlooper (D-CO), Hyde-Smith (R-MS)",
    committee: "Senate Commerce, Science & Transportation",
    desc: "Directs NOAA to formally maintain and fund its Cooperative Institute Program — university-based research partnerships that support NOAA's weather, climate, and ocean science work.",
    tags: ["Commerce", "NOAA / Weather"],
    bipartisan: true,
    link: "https://www.congress.gov/bill/119th-congress/senate-bill/5332"
  }
};
