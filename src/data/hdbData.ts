// Comprehensive HDB Resale Transactions & Singapore Amenities Dataset
export interface HDBTransaction {
  id: string;
  block: string;
  street: string;
  town: string;
  flat_type: '2 ROOM' | '3 ROOM' | '4 ROOM' | '5 ROOM' | 'EXECUTIVE' | 'MULTI-GENERATION';
  price: number;
  floor: string;
  floor_category: 'LOW' | 'MID' | 'HIGH' | 'SUPER_HIGH';
  floor_area_sqm: number;
  lease_remain: number; // in years
  lease_commence_date: number;
  lat: number;
  lng: number;
  postal: string;
  month: string; // e.g. "2026-03"
  model: string;
}

export type AmenityCategory = 'school' | 'mall' | 'hawker' | 'transport' | 'park' | 'healthcare';

export interface Amenity {
  id: string;
  name: string;
  category: AmenityCategory;
  lat: number;
  lng: number;
  details?: string;
  mrtLines?: string[]; // for MRT stations
}

// 60+ realistic past 6 months transactions spanning Singapore's major HDB towns
export const HDB_TRANSACTIONS_DATA: HDBTransaction[] = [
  // Bishan
  {
    id: "tx-bsh-1",
    block: "510",
    street: "BISHAN ST 13",
    town: "BISHAN",
    flat_type: "4 ROOM",
    price: 788000,
    floor: "07 TO 09",
    floor_category: "MID",
    floor_area_sqm: 104,
    lease_remain: 74,
    lease_commence_date: 2001,
    lat: 1.3491,
    lng: 103.8488,
    postal: "570510",
    month: "2026-03",
    model: "Model A"
  },
  {
    id: "tx-bsh-2",
    block: "173",
    street: "BISHAN ST 13",
    town: "BISHAN",
    flat_type: "5 ROOM",
    price: 998000,
    floor: "16 TO 18",
    floor_category: "HIGH",
    floor_area_sqm: 122,
    lease_remain: 78,
    lease_commence_date: 2005,
    lat: 1.3520,
    lng: 103.8510,
    postal: "570173",
    month: "2026-02",
    model: "Improved"
  },
  {
    id: "tx-bsh-3",
    block: "273",
    street: "BISHAN ST 24",
    town: "BISHAN",
    flat_type: "EXECUTIVE",
    price: 1180000,
    floor: "19 TO 21",
    floor_category: "HIGH",
    floor_area_sqm: 146,
    lease_remain: 82,
    lease_commence_date: 2009,
    lat: 1.3575,
    lng: 103.8440,
    postal: "570273",
    month: "2026-01",
    model: "Maisonette"
  },
  {
    id: "tx-bsh-4",
    block: "112",
    street: "BISHAN ST 12",
    town: "BISHAN",
    flat_type: "3 ROOM",
    price: 495000,
    floor: "04 TO 06",
    floor_category: "LOW",
    floor_area_sqm: 68,
    lease_remain: 64,
    lease_commence_date: 1991,
    lat: 1.3470,
    lng: 103.8475,
    postal: "570112",
    month: "2025-11",
    model: "Simplified"
  },

  // Tampines
  {
    id: "tx-tam-1",
    block: "212",
    street: "TAMPINES ST 23",
    town: "TAMPINES",
    flat_type: "5 ROOM",
    price: 855000,
    floor: "10 TO 12",
    floor_category: "MID",
    floor_area_sqm: 120,
    lease_remain: 82,
    lease_commence_date: 2009,
    lat: 1.3542,
    lng: 103.9535,
    postal: "520212",
    month: "2026-03",
    model: "Improved"
  },
  {
    id: "tx-tam-2",
    block: "491C",
    street: "TAMPINES AVE 9",
    town: "TAMPINES",
    flat_type: "4 ROOM",
    price: 670000,
    floor: "13 TO 15",
    floor_category: "HIGH",
    floor_area_sqm: 93,
    lease_remain: 91,
    lease_commence_date: 2018,
    lat: 1.3610,
    lng: 103.9585,
    postal: "522491",
    month: "2026-02",
    model: "Model A"
  },
  {
    id: "tx-tam-3",
    block: "842D",
    street: "TAMPINES ST 82",
    town: "TAMPINES",
    flat_type: "EXECUTIVE",
    price: 940000,
    floor: "04 TO 06",
    floor_category: "LOW",
    floor_area_sqm: 142,
    lease_remain: 73,
    lease_commence_date: 2000,
    lat: 1.3528,
    lng: 103.9358,
    postal: "524842",
    month: "2025-12",
    model: "Apartment"
  },
  {
    id: "tx-tam-4",
    block: "148",
    street: "TAMPINES AVE 5",
    town: "TAMPINES",
    flat_type: "3 ROOM",
    price: 430000,
    floor: "07 TO 09",
    floor_category: "MID",
    floor_area_sqm: 67,
    lease_remain: 61,
    lease_commence_date: 1988,
    lat: 1.3498,
    lng: 103.9430,
    postal: "520148",
    month: "2025-10",
    model: "Simplified"
  },

  // Jurong East
  {
    id: "tx-je-1",
    block: "105",
    street: "JURONG EAST ST 13",
    town: "JURONG EAST",
    flat_type: "3 ROOM",
    price: 468000,
    floor: "04 TO 06",
    floor_category: "LOW",
    floor_area_sqm: 67,
    lease_remain: 68,
    lease_commence_date: 1995,
    lat: 1.3385,
    lng: 103.7420,
    postal: "600105",
    month: "2026-03",
    model: "Simplified"
  },
  {
    id: "tx-je-2",
    block: "266",
    street: "TOH GUAN RD",
    town: "JURONG EAST",
    flat_type: "4 ROOM",
    price: 660000,
    floor: "10 TO 12",
    floor_category: "MID",
    floor_area_sqm: 100,
    lease_remain: 72,
    lease_commence_date: 1999,
    lat: 1.3415,
    lng: 103.7485,
    postal: "600266",
    month: "2026-01",
    model: "Model A"
  },
  {
    id: "tx-je-3",
    block: "288D",
    street: "JURONG EAST ST 21",
    town: "JURONG EAST",
    flat_type: "5 ROOM",
    price: 890000,
    floor: "19 TO 21",
    floor_category: "HIGH",
    floor_area_sqm: 112,
    lease_remain: 89,
    lease_commence_date: 2016,
    lat: 1.3435,
    lng: 103.7388,
    postal: "604288",
    month: "2025-11",
    model: "Premium Apartment"
  },

  // Bedok
  {
    id: "tx-bdk-1",
    block: "418",
    street: "BEDOK NORTH AVE 2",
    town: "BEDOK",
    flat_type: "4 ROOM",
    price: 625000,
    floor: "01 TO 03",
    floor_category: "LOW",
    floor_area_sqm: 92,
    lease_remain: 71,
    lease_commence_date: 1998,
    lat: 1.3288,
    lng: 103.9310,
    postal: "460418",
    month: "2026-02",
    model: "New Generation"
  },
  {
    id: "tx-bdk-2",
    block: "220B",
    street: "BEDOK CENTRAL",
    town: "BEDOK",
    flat_type: "5 ROOM",
    price: 920000,
    floor: "16 TO 18",
    floor_category: "HIGH",
    floor_area_sqm: 115,
    lease_remain: 87,
    lease_commence_date: 2014,
    lat: 1.3255,
    lng: 103.9332,
    postal: "462220",
    month: "2026-03",
    model: "DBSS"
  },
  {
    id: "tx-bdk-3",
    block: "33",
    street: "CHAI CHEE AVE",
    town: "BEDOK",
    flat_type: "3 ROOM",
    price: 395000,
    floor: "07 TO 09",
    floor_category: "MID",
    floor_area_sqm: 65,
    lease_remain: 59,
    lease_commence_date: 1986,
    lat: 1.3225,
    lng: 103.9220,
    postal: "460033",
    month: "2025-11",
    model: "Simplified"
  },

  // Toa Payoh
  {
    id: "tx-tpy-1",
    block: "128",
    street: "TOA PAYOH LORONG 1",
    town: "TOA PAYOH",
    flat_type: "4 ROOM",
    price: 915000,
    floor: "22 TO 24",
    floor_category: "SUPER_HIGH",
    floor_area_sqm: 95,
    lease_remain: 91,
    lease_commence_date: 2018,
    lat: 1.3320,
    lng: 103.8445,
    postal: "310128",
    month: "2026-02",
    model: "Model A"
  },
  {
    id: "tx-tpy-2",
    block: "79A",
    street: "TOA PAYOH CENTRAL",
    town: "TOA PAYOH",
    flat_type: "5 ROOM",
    price: 1150000,
    floor: "34 TO 36",
    floor_category: "SUPER_HIGH",
    floor_area_sqm: 118,
    lease_remain: 86,
    lease_commence_date: 2013,
    lat: 1.3348,
    lng: 103.8499,
    postal: "311079",
    month: "2026-03",
    model: "DBSS"
  },
  {
    id: "tx-tpy-3",
    block: "58",
    street: "LORONG 4 TOA PAYOH",
    town: "TOA PAYOH",
    flat_type: "3 ROOM",
    price: 410000,
    floor: "04 TO 06",
    floor_category: "LOW",
    floor_area_sqm: 65,
    lease_remain: 57,
    lease_commence_date: 1984,
    lat: 1.3362,
    lng: 103.8505,
    postal: "310058",
    month: "2025-12",
    model: "Improved"
  },

  // Ang Mo Kio
  {
    id: "tx-amk-1",
    block: "302",
    street: "ANG MO KIO AVE 3",
    town: "ANG MO KIO",
    flat_type: "3 ROOM",
    price: 435000,
    floor: "04 TO 06",
    floor_category: "LOW",
    floor_area_sqm: 68,
    lease_remain: 62,
    lease_commence_date: 1989,
    lat: 1.3680,
    lng: 103.8450,
    postal: "560302",
    month: "2026-01",
    model: "New Generation"
  },
  {
    id: "tx-amk-2",
    block: "590B",
    street: "ANG MO KIO ST 51",
    town: "ANG MO KIO",
    flat_type: "4 ROOM",
    price: 880000,
    floor: "25 TO 27",
    floor_category: "SUPER_HIGH",
    floor_area_sqm: 93,
    lease_remain: 92,
    lease_commence_date: 2019,
    lat: 1.3712,
    lng: 103.8540,
    postal: "562590",
    month: "2026-02",
    model: "Model A"
  },
  {
    id: "tx-amk-3",
    block: "455A",
    street: "ANG MO KIO AVE 10",
    town: "ANG MO KIO",
    flat_type: "5 ROOM",
    price: 930000,
    floor: "13 TO 15",
    floor_category: "HIGH",
    floor_area_sqm: 110,
    lease_remain: 88,
    lease_commence_date: 2015,
    lat: 1.3622,
    lng: 103.8568,
    postal: "561455",
    month: "2025-11",
    model: "Premium Apartment"
  },

  // Woodlands
  {
    id: "tx-wdl-1",
    block: "888",
    street: "WOODLANDS DRIVE 50",
    town: "WOODLANDS",
    flat_type: "5 ROOM",
    price: 698000,
    floor: "07 TO 09",
    floor_category: "MID",
    floor_area_sqm: 122,
    lease_remain: 79,
    lease_commence_date: 2006,
    lat: 1.4360,
    lng: 103.7880,
    postal: "730888",
    month: "2026-03",
    model: "Improved"
  },
  {
    id: "tx-wdl-2",
    block: "542",
    street: "WOODLANDS DRIVE 16",
    town: "WOODLANDS",
    flat_type: "4 ROOM",
    price: 540000,
    floor: "10 TO 12",
    floor_category: "MID",
    floor_area_sqm: 102,
    lease_remain: 76,
    lease_commence_date: 2003,
    lat: 1.4305,
    lng: 103.7925,
    postal: "730542",
    month: "2026-01",
    model: "Model A"
  },
  {
    id: "tx-wdl-3",
    block: "365",
    street: "WOODLANDS AVE 5",
    town: "WOODLANDS",
    flat_type: "EXECUTIVE",
    price: 810000,
    floor: "04 TO 06",
    floor_category: "LOW",
    floor_area_sqm: 145,
    lease_remain: 74,
    lease_commence_date: 2001,
    lat: 1.4335,
    lng: 103.7850,
    postal: "730365",
    month: "2025-10",
    model: "Maisonette"
  },

  // Choa Chu Kang
  {
    id: "tx-cck-1",
    block: "782",
    street: "CHOA CHU KANG NORTH 6",
    town: "CHOA CHU KANG",
    flat_type: "EXECUTIVE",
    price: 935000,
    floor: "13 TO 15",
    floor_category: "HIGH",
    floor_area_sqm: 148,
    lease_remain: 88,
    lease_commence_date: 2015,
    lat: 1.3970,
    lng: 103.7472,
    postal: "680782",
    month: "2026-03",
    model: "Apartment"
  },
  {
    id: "tx-cck-2",
    block: "515",
    street: "JELEBU ROAD",
    town: "CHOA CHU KANG",
    flat_type: "4 ROOM",
    price: 580000,
    floor: "07 TO 09",
    floor_category: "MID",
    floor_area_sqm: 100,
    lease_remain: 72,
    lease_commence_date: 1999,
    lat: 1.3855,
    lng: 103.7620,
    postal: "680515",
    month: "2026-02",
    model: "Model A"
  },

  // Queenstown & Bukit Merah
  {
    id: "tx-qtn-1",
    block: "50",
    street: "COMMONWEALTH DRIVE",
    town: "QUEENSTOWN",
    flat_type: "4 ROOM",
    price: 980000,
    floor: "25 TO 27",
    floor_category: "SUPER_HIGH",
    floor_area_sqm: 93,
    lease_remain: 89,
    lease_commence_date: 2016,
    lat: 1.3032,
    lng: 103.7995,
    postal: "142050",
    month: "2026-02",
    model: "Model A"
  },
  {
    id: "tx-qtn-2",
    block: "96A",
    street: "HENDERSON ROAD",
    town: "BUKIT MERAH",
    flat_type: "5 ROOM",
    price: 1320000,
    floor: "37 TO 39",
    floor_category: "SUPER_HIGH",
    floor_area_sqm: 113,
    lease_remain: 92,
    lease_commence_date: 2019,
    lat: 1.2850,
    lng: 103.8218,
    postal: "151096",
    month: "2026-03",
    model: "City View"
  },
  {
    id: "tx-qtn-3",
    block: "1",
    street: "CANTONMENT ROAD",
    town: "CENTRAL AREA",
    flat_type: "5 ROOM",
    price: 1460000,
    floor: "43 TO 45",
    floor_category: "SUPER_HIGH",
    floor_area_sqm: 107,
    lease_remain: 84,
    lease_commence_date: 2011,
    lat: 1.2778,
    lng: 103.8402,
    postal: "080001",
    month: "2026-03",
    model: "Type S2 (Pinnacle@Duxton)"
  },

  // Punggol
  {
    id: "tx-pgl-1",
    block: "273A",
    street: "PUNGGOL FIELD",
    town: "PUNGGOL",
    flat_type: "4 ROOM",
    price: 688000,
    floor: "13 TO 15",
    floor_category: "HIGH",
    floor_area_sqm: 93,
    lease_remain: 91,
    lease_commence_date: 2018,
    lat: 1.4022,
    lng: 103.9055,
    postal: "821273",
    month: "2026-02",
    model: "Model A"
  },
  {
    id: "tx-pgl-2",
    block: "310B",
    street: "PUNGGOL WALK",
    town: "PUNGGOL",
    flat_type: "5 ROOM",
    price: 885000,
    floor: "16 TO 18",
    floor_category: "HIGH",
    floor_area_sqm: 112,
    lease_remain: 90,
    lease_commence_date: 2017,
    lat: 1.4055,
    lng: 103.9020,
    postal: "822310",
    month: "2026-03",
    model: "Premium Apartment"
  },

  // Sengkang
  {
    id: "tx-skg-1",
    block: "413C",
    street: "FERNVALE LINK",
    town: "SENGKANG",
    flat_type: "4 ROOM",
    price: 645000,
    floor: "19 TO 21",
    floor_category: "HIGH",
    floor_area_sqm: 93,
    lease_remain: 91,
    lease_commence_date: 2018,
    lat: 1.3912,
    lng: 103.8785,
    postal: "793413",
    month: "2026-01",
    model: "Model A"
  },
  {
    id: "tx-skg-2",
    block: "216A",
    street: "COMPASSVALE DRIVE",
    town: "SENGKANG",
    flat_type: "5 ROOM",
    price: 790000,
    floor: "10 TO 12",
    floor_category: "MID",
    floor_area_sqm: 110,
    lease_remain: 87,
    lease_commence_date: 2014,
    lat: 1.3880,
    lng: 103.8925,
    postal: "541216",
    month: "2025-12",
    model: "Improved"
  },

  // Serangoon
  {
    id: "tx-srg-1",
    block: "501",
    street: "SERANGOON NORTH AVE 4",
    town: "SERANGOON",
    flat_type: "4 ROOM",
    price: 665000,
    floor: "04 TO 06",
    floor_category: "LOW",
    floor_area_sqm: 102,
    lease_remain: 73,
    lease_commence_date: 2000,
    lat: 1.3725,
    lng: 103.8730,
    postal: "550501",
    month: "2026-02",
    model: "Model A"
  },
  {
    id: "tx-srg-2",
    block: "264",
    street: "SERANGOON CENTRAL DRIVE",
    town: "SERANGOON",
    flat_type: "5 ROOM",
    price: 910000,
    floor: "10 TO 12",
    floor_category: "MID",
    floor_area_sqm: 122,
    lease_remain: 76,
    lease_commence_date: 2003,
    lat: 1.3515,
    lng: 103.8710,
    postal: "550264",
    month: "2026-03",
    model: "Improved"
  },

  // Jurong West
  {
    id: "tx-jw-1",
    block: "18",
    street: "BOON LAY DRIVE",
    town: "JURONG WEST",
    flat_type: "3 ROOM",
    price: 390000,
    floor: "01 TO 03",
    floor_category: "LOW",
    floor_area_sqm: 65,
    lease_remain: 59,
    lease_commence_date: 1986,
    lat: 1.3450,
    lng: 103.7080,
    postal: "640018",
    month: "2026-03",
    model: "Simplified"
  },
  {
    id: "tx-jw-2",
    block: "684A",
    street: "JURONG WEST ST 64",
    town: "JURONG WEST",
    flat_type: "4 ROOM",
    price: 575000,
    floor: "10 TO 12",
    floor_category: "MID",
    floor_area_sqm: 90,
    lease_remain: 80,
    lease_commence_date: 2007,
    lat: 1.3420,
    lng: 103.7045,
    postal: "641684",
    month: "2026-01",
    model: "Model A"
  }
];

// Rich Singapore Amenities Dataset
export const AMENITIES_CATALOG: Amenity[] = [
  // Primary Schools (Subject to MOE 1km & 2km priority radius balloting rules)
  {
    id: "sch-1",
    name: "Catholic High School (Primary)",
    category: "school",
    lat: 1.3547,
    lng: 103.8451,
    details: "SAP Co-ed/Boys Primary School • High Demand Phase 2C"
  },
  {
    id: "sch-2",
    name: "St. Hilda's Primary School",
    category: "school",
    lat: 1.3501,
    lng: 103.9372,
    details: "Established Government-Aided School (Tampines)"
  },
  {
    id: "sch-3",
    name: "Nan Hua Primary School",
    category: "school",
    lat: 1.3195,
    lng: 103.7620,
    details: "Top SAP Primary School (Clementi/Jurong)"
  },
  {
    id: "sch-4",
    name: "Tao Nan School",
    category: "school",
    lat: 1.3052,
    lng: 103.9100,
    details: "Premier SAP School (Marine Parade/Bedok)"
  },
  {
    id: "sch-5",
    name: "Pei Chun Public School",
    category: "school",
    lat: 1.3360,
    lng: 103.8540,
    details: "Renowned Primary School (Toa Payoh)"
  },
  {
    id: "sch-6",
    name: "Ai Tong School",
    category: "school",
    lat: 1.3606,
    lng: 103.8335,
    details: "Hokkien Huay Kuan SAP School (Bishan/Sin Ming)"
  },
  {
    id: "sch-7",
    name: "Mee Toh School",
    category: "school",
    lat: 1.3985,
    lng: 103.9095,
    details: "Top Choice Primary School in Punggol"
  },
  {
    id: "sch-8",
    name: "Rulang Primary School",
    category: "school",
    lat: 1.3475,
    lng: 103.7185,
    details: "Popular West Region Primary School (Jurong West)"
  },
  {
    id: "sch-9",
    name: "Rosyth School",
    category: "school",
    lat: 1.3732,
    lng: 103.8741,
    details: "GEP Primary Centre (Serangoon North)"
  },
  {
    id: "sch-10",
    name: "Kuo Chuan Presbyterian Primary",
    category: "school",
    lat: 1.3495,
    lng: 103.8545,
    details: "Affiliated Secondary Pathway (Bishan)"
  },

  // Major Shopping Malls
  {
    id: "mall-1",
    name: "Junction 8 Shopping Centre",
    category: "mall",
    lat: 1.3502,
    lng: 103.8488,
    details: "FairPrice Finest, Golden Village, MRT Connected"
  },
  {
    id: "mall-2",
    name: "Tampines Mall & Century Square",
    category: "mall",
    lat: 1.3525,
    lng: 103.9447,
    details: "Regional Shopping Triple-Hub (Tampines 1, Mall, Century)"
  },
  {
    id: "mall-3",
    name: "JEM / Westgate / IMM",
    category: "mall",
    lat: 1.3330,
    lng: 103.7435,
    details: "Jurong Gateway Retail & Lifestyle Hub"
  },
  {
    id: "mall-4",
    name: "Bedok Mall",
    category: "mall",
    lat: 1.3245,
    lng: 103.9300,
    details: "Integrated Bedok Interchange & FairPrice"
  },
  {
    id: "mall-5",
    name: "Toa Payoh HDB Hub & Mall",
    category: "mall",
    lat: 1.3328,
    lng: 103.8485,
    details: "HDB HQ, Retail Concourse, NTUC FairPrice"
  },
  {
    id: "mall-6",
    name: "Causeway Point",
    category: "mall",
    lat: 1.4360,
    lng: 103.7865,
    details: "Metro, Cathay Cineplex, Woodlands Integrated Hub"
  },
  {
    id: "mall-7",
    name: "NEX Serangoon",
    category: "mall",
    lat: 1.3508,
    lng: 103.8725,
    details: "One of SG's largest suburban mega malls (Circle + North East)"
  },
  {
    id: "mall-8",
    name: "Waterway Point",
    category: "mall",
    lat: 1.4065,
    lng: 103.9022,
    details: "Waterfront lifestyle mall in Punggol"
  },
  {
    id: "mall-9",
    name: "Lot One Shoppers' Mall",
    category: "mall",
    lat: 1.3850,
    lng: 103.7445,
    details: "Choa Chu Kang central transport hub"
  },

  // Hawker Centres & Food Markets
  {
    id: "hawk-1",
    name: "Kim Keat Palm Market & Food Centre",
    category: "hawker",
    lat: 1.3325,
    lng: 103.8560,
    details: "Authentic Toa Payoh Hawker Food & Wet Market"
  },
  {
    id: "hawk-2",
    name: "Old Airport Road Food Centre",
    category: "hawker",
    lat: 1.3082,
    lng: 103.8858,
    details: "Legendary Singapore Gourmet Hawker Paradise"
  },
  {
    id: "hawk-3",
    name: "Tampines Round Market & Food Centre",
    category: "hawker",
    lat: 1.3460,
    lng: 103.9450,
    details: "Famous Bak Chor Mee, Carrot Cake & Breakfast"
  },
  {
    id: "hawk-4",
    name: "Bishan 150 Hawker & Cafeteria",
    category: "hawker",
    lat: 1.3512,
    lng: 103.8510,
    details: "Local favourite coffee shops & roast meats"
  },
  {
    id: "hawk-5",
    name: "Yuhua Market & Hawker Centre",
    category: "hawker",
    lat: 1.3435,
    lng: 103.7380,
    details: "Jurong East popular neighborhood hawker hub"
  },
  {
    id: "hawk-6",
    name: "Bedok 85 Fengshan Market",
    category: "hawker",
    lat: 1.3320,
    lng: 103.9385,
    details: "Nationwide famous Bak Chor Mee & Sambal Stingray"
  },
  {
    id: "hawk-7",
    name: "Chomp Chomp Food Centre",
    category: "hawker",
    lat: 1.3642,
    lng: 103.8665,
    details: "Serangoon Gardens famous supper hotspot"
  },
  {
    id: "hawk-8",
    name: "Woodlands Center Hawker Hub",
    category: "hawker",
    lat: 1.4390,
    lng: 103.7820,
    details: "North region specialty stall varieties"
  },

  // Transport Hubs & MRT Stations
  {
    id: "mrt-1",
    name: "Bishan MRT & Bus Interchange",
    category: "transport",
    lat: 1.3508,
    lng: 103.8482,
    details: "North-South Line (NS17) & Circle Line (CC15)",
    mrtLines: ["NSL", "CCL"]
  },
  {
    id: "mrt-2",
    name: "Tampines Regional Hub & MRT",
    category: "transport",
    lat: 1.3532,
    lng: 103.9452,
    details: "East-West Line (EW2) & Downtown Line (DT32)",
    mrtLines: ["EWL", "DTL"]
  },
  {
    id: "mrt-3",
    name: "Jurong East MRT Interchange",
    category: "transport",
    lat: 1.3331,
    lng: 103.7422,
    details: "East-West Line (EW24), North-South (NS1), Future JRL",
    mrtLines: ["EWL", "NSL", "JRL"]
  },
  {
    id: "mrt-4",
    name: "Bedok MRT & Integrated Bus Interchange",
    category: "transport",
    lat: 1.3240,
    lng: 103.9302,
    details: "East-West Line (EW5)",
    mrtLines: ["EWL"]
  },
  {
    id: "mrt-5",
    name: "Toa Payoh MRT & Bus Hub",
    category: "transport",
    lat: 1.3326,
    lng: 103.8475,
    details: "North-South Line (NS19)",
    mrtLines: ["NSL"]
  },
  {
    id: "mrt-6",
    name: "Ang Mo Kio MRT & Hub",
    category: "transport",
    lat: 1.3698,
    lng: 103.8495,
    details: "North-South Line (NS16) & Future Cross Island Line (CRL)",
    mrtLines: ["NSL", "CRL"]
  },
  {
    id: "mrt-7",
    name: "Serangoon MRT Interchange",
    category: "transport",
    lat: 1.3505,
    lng: 103.8735,
    details: "North-East Line (NE12) & Circle Line (CC13)",
    mrtLines: ["NEL", "CCL"]
  },
  {
    id: "mrt-8",
    name: "Woodlands Integrated Transport Hub",
    category: "transport",
    lat: 1.4365,
    lng: 103.7860,
    details: "North-South Line (NS9) & Thomson-East Coast Line (TEL)",
    mrtLines: ["NSL", "TEL"]
  },
  {
    id: "mrt-9",
    name: "Punggol MRT & LRT Interchange",
    category: "transport",
    lat: 1.4050,
    lng: 103.9025,
    details: "North-East Line (NE17), Punggol LRT & Future CRL Extension",
    mrtLines: ["NEL", "LRT"]
  },

  // Parks & Nature
  {
    id: "prk-1",
    name: "Bishan-Ang Mo Kio Park",
    category: "park",
    lat: 1.3615,
    lng: 103.8445,
    details: "62-hectare lush park with naturalised Kallang River"
  },
  {
    id: "prk-2",
    name: "Bedok Reservoir Park",
    category: "park",
    lat: 1.3410,
    lng: 103.9310,
    details: "Scenic waterfront jogging track & water sports"
  },
  {
    id: "prk-3",
    name: "Jurong Lake Gardens",
    category: "park",
    lat: 1.3380,
    lng: 103.7290,
    details: "Singapore's third national gardens (90 hectares)"
  },
  {
    id: "prk-4",
    name: "Punggol Waterway Park",
    category: "park",
    lat: 1.4110,
    lng: 103.9060,
    details: "Scenic waterfront promenade & cycling tracks"
  }
];

// Helper: Haversine distance in meters
export function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // metres
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Helper: Format SGD currency
export function formatCurrencySGD(amount: number): string {
  return new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: 'SGD',
    maximumFractionDigits: 0
  }).format(amount);
}
