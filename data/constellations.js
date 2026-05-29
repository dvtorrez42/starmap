// Constellation definitions
// lines: array of [HIP1, HIP2] pairs — must match HIP numbers in stars.js
// center: [RA_deg, Dec_deg] used for label placement
const CONSTELLATION_DATA = [
  {
    id: "Ori", name: "Orion",
    center: [83.8, 5.0],
    lines: [
      [26207, 27989], [26207, 25336],           // head → shoulders
      [27989, 26311], [25336, 23419],            // shoulders → belt outer
      [23419, 26311], [26311, 26727],            // belt
      [26727, 27366], [23419, 24436],            // belt → feet
      [27989, 27366], [25336, 24436],            // body sides
      [26727, 26241], [26241, 24436],            // sword
    ]
  },
  {
    id: "UMa", name: "Ursa Major",
    center: [178.0, 55.0],
    lines: [
      [54061, 53910], [53910, 58001],
      [58001, 59774], [59774, 54061],            // bowl
      [59774, 62956], [62956, 65378], [65378, 67301], // handle
      [54061, 41704], [41704, 45860],            // bear feet
    ]
  },
  {
    id: "UMi", name: "Ursa Minor",
    center: [245.0, 80.0],
    lines: [
      [11767, 82080], [82080, 79822],
    ]
  },
  {
    id: "Cas", name: "Cassiopeia",
    center: [18.0, 60.0],
    lines: [
      [746, 3179], [3179, 4427], [4427, 6686], [6686, 8886]
    ]
  },
  {
    id: "Cep", name: "Cepheus",
    center: [320.0, 64.0],
    lines: [
      [105199, 106032], [105199, 108917], [106032, 108917],
      [108917, 109427],
    ]
  },
  {
    id: "Per", name: "Perseus",
    center: [52.0, 44.0],
    lines: [
      [12387, 14576], [14576, 14838], [14838, 18246],
      [14576, 13268], [12387, 8832],
    ]
  },
  {
    id: "Aur", name: "Auriga",
    center: [84.0, 42.0],
    lines: [
      [24608, 28380], [24608, 25985], [25985, 28380],
      [24608, 23015],
    ]
  },
  {
    id: "Tau", name: "Taurus",
    center: [67.0, 19.0],
    lines: [
      [21421, 20889], [21421, 17702],
      [17702, 16369],                             // Pleiades side
      [23015, 21421],                             // tip horn
    ]
  },
  {
    id: "Gem", name: "Gemini",
    center: [112.0, 24.0],
    lines: [
      [36850, 37826],                              // Castor–Pollux
      [36850, 36046], [36046, 35550], [35550, 29655],
      [37826, 35550],
      [36850, 33277], [37826, 33277],
      [33277, 30343], [30343, 29655],
    ]
  },
  {
    id: "Cnc", name: "Cancer",
    center: [130.0, 20.0],
    lines: [
      [40526, 42806], [42806, 43103], [43103, 40843], [40843, 40526],
    ]
  },
  {
    id: "Leo", name: "Leo",
    center: [154.0, 14.0],
    lines: [
      [49669, 49583], [49583, 47908], [47908, 49669], // sickle
      [49583, 50583], [50583, 57632],                  // body/tail
      [49669, 46390],
    ]
  },
  {
    id: "Vir", name: "Virgo",
    center: [196.0, -2.0],
    lines: [
      [65474, 63608], [63608, 66249],
      [66249, 69673],                              // toward Arcturus area
    ]
  },
  {
    id: "Lib", name: "Libra",
    center: [228.0, -17.0],
    lines: [
      [72622, 74785], [72622, 77233],
    ]
  },
  {
    id: "Sco", name: "Scorpius",
    center: [251.0, -30.0],
    lines: [
      [78401, 80763], [80763, 77070], [77070, 78265],  // head/body
      [80763, 81266], [81266, 82396], [82396, 82671],  // tail
      [82671, 85927],                                   // stinger
    ]
  },
  {
    id: "Sgr", name: "Sagittarius",
    center: [283.0, -26.0],
    lines: [
      [88635, 89931], [89931, 90185],               // kaus bow
      [89931, 92041], [92041, 93506],               // teapot body
      [90185, 93506], [88635, 92041],
      [93506, 92855], [92855, 95168],               // teapot top/spout
    ]
  },
  {
    id: "Cap", name: "Capricornus",
    center: [310.0, -18.0],
    lines: [
      [100064, 100027], [100027, 102485],
      [102485, 105515], [105515, 100064],
    ]
  },
  {
    id: "Aqr", name: "Aquarius",
    center: [326.0, -8.0],
    lines: [
      [106278, 109074], [109074, 110395],
      [110395, 109427], [106278, 107354],
    ]
  },
  {
    id: "Psc", name: "Pisces",
    center: [10.0, 12.0],
    lines: [
      [586, 5742], [5742, 4906],
    ]
  },
  {
    id: "Ari", name: "Aries",
    center: [36.0, 23.0],
    lines: [
      [9884, 10064], [9884, 11795],
    ]
  },
  {
    id: "Cet", name: "Cetus",
    center: [28.0, -8.0],
    lines: [
      [3419, 12770], [12770, 14135],
    ]
  },
  {
    id: "Eri", name: "Eridanus",
    center: [42.0, -28.0],
    lines: [
      [17378, 15510], [15510, 17651], [17651, 20042],
      [20042, 23875], [23875, 7588],
      [17378, 12843], [12843, 7007],
    ]
  },
  {
    id: "Lep", name: "Lepus",
    center: [82.0, -19.0],
    lines: [
      [25985, 24305], [24305, 28103],
      [25985, 28103],
    ]
  },
  {
    id: "CMa", name: "Canis Major",
    center: [102.0, -22.0],
    lines: [
      [32349, 30324], [30324, 33856], [33856, 34444],
      [32349, 34444],
    ]
  },
  {
    id: "CMi", name: "Canis Minor",
    center: [115.0, 8.0],
    lines: [
      [37279, 36850],                              // Procyon–Gomeisa
    ]
  },
  {
    id: "Mon", name: "Monoceros",
    center: [108.0, -2.0],
    lines: [
      [30867, 37447],
    ]
  },
  {
    id: "Hya", name: "Hydra",
    center: [150.0, -16.0],
    lines: [
      [43234, 51172],
    ]
  },
  {
    id: "Crv", name: "Corvus",
    center: [186.0, -19.0],
    lines: [
      [59316, 61174], [61174, 60965], [59316, 60965],
    ]
  },
  {
    id: "Crt", name: "Crater",
    center: [166.0, -16.0],
    lines: [
      [53740, 51172],
    ]
  },
  {
    id: "Boo", name: "Boötes",
    center: [217.0, 28.0],
    lines: [
      [69673, 72105], [69673, 67927],
      [72105, 73555], [73555, 71075], [71075, 69673],
    ]
  },
  {
    id: "CrB", name: "Corona Borealis",
    center: [235.0, 28.0],
    lines: [
      [76267, 77233],
    ]
  },
  {
    id: "Ser", name: "Serpens",
    center: [240.0, 8.0],
    lines: [
      [77233, 80170], [80170, 83000],
    ]
  },
  {
    id: "Oph", name: "Ophiuchus",
    center: [263.0, 0.0],
    lines: [
      [84970, 86742], [84970, 83000],
    ]
  },
  {
    id: "Her", name: "Hercules",
    center: [257.0, 26.0],
    lines: [
      [84345, 87933], [84345, 80816],
      [80816, 87933],
    ]
  },
  {
    id: "Lyr", name: "Lyra",
    center: [284.0, 36.0],
    lines: [
      [91262, 91971], [91971, 93194], [91262, 93194],
    ]
  },
  {
    id: "Cyg", name: "Cygnus",
    center: [305.0, 42.0],
    lines: [
      [102098, 100453], [100453, 95947],          // shaft
      [100453, 104732],                            // wing
      [100453, 94779],                             // other wing
    ]
  },
  {
    id: "Aql", name: "Aquila",
    center: [296.0, 7.0],
    lines: [
      [97649, 97278], [97649, 98036],
      [97649, 96468], [96468, 99473],
    ]
  },
  {
    id: "Sge", name: "Sagitta",
    center: [296.0, 19.0],
    lines: [
      [96837, 98337],
    ]
  },
  {
    id: "Del", name: "Delphinus",
    center: [309.5, 15.0],
    lines: [
      [101421, 101769], [101421, 104858],
    ]
  },
  {
    id: "And", name: "Andromeda",
    center: [22.0, 40.0],
    lines: [
      [677, 3092], [3092, 5447],
      [3092, 9640],
    ]
  },
  {
    id: "Peg", name: "Pegasus",
    center: [334.0, 22.0],
    lines: [
      [677, 113963], [113963, 112447], [112447, 109427],  // Great Square (3 sides)
      [113963, 107354],                                     // Enif
    ]
  },
  {
    id: "Dra", name: "Draco",
    center: [260.0, 65.0],
    lines: [
      [87585, 75458], [75458, 61281],
      [87585, 61281],
    ]
  },
  {
    id: "Tri", name: "Triangulum",
    center: [30.0, 31.0],
    lines: [
      [8832, 9884], [9884, 10064], [10064, 8832],
    ]
  },
  {
    id: "Pup", name: "Puppis",
    center: [118.0, -36.0],
    lines: [
      [39429, 35264], [35264, 36377],
    ]
  },
  {
    id: "Vel", name: "Vela",
    center: [138.0, -49.0],
    lines: [
      [42913, 45941], [45941, 46651],
    ]
  },
  {
    id: "Car", name: "Carina",
    center: [148.0, -62.0],
    lines: [
      [30438, 45080], [45080, 41037], [41037, 50371],
      [50371, 52419],
    ]
  },
  {
    id: "Cru", name: "Crux",
    center: [188.0, -60.0],
    lines: [
      [61084, 62434], [57632, 62169],               // cross
    ]
  },
  {
    id: "Cen", name: "Centaurus",
    center: [204.0, -50.0],
    lines: [
      [71683, 68702],                               // α–β Cen
      [68002, 59316], [59316, 56561],
      [67472, 68002],
    ]
  },
  {
    id: "Lup", name: "Lupus",
    center: [232.0, -44.0],
    lines: [
      [75177, 76297], [76297, 71860],
    ]
  },
  {
    id: "Ara", name: "Ara",
    center: [263.0, -53.0],
    lines: [
      [85792, 82363], [82363, 83081],
    ]
  },
  {
    id: "Sco_extra", name: "",   // hide, just for CrA ref
    center: [276.0, -38.5],
    lines: []
  },
  {
    id: "CrA", name: "Corona Aust.",
    center: [277.0, -39.0],
    lines: [
      [90139, 90496],
    ]
  },
  {
    id: "Mus", name: "Musca",
    center: [191.0, -68.0],
    lines: [
      [61585, 62322],
    ]
  },
  {
    id: "TrA", name: "Triangulum Aust.",
    center: [250.0, -64.0],
    lines: [
      [77952, 71908], [77952, 80000],
    ]
  },
  {
    id: "Pav", name: "Pavo",
    center: [294.0, -58.0],
    lines: [
      [99240, 101772],
    ]
  },
  {
    id: "Gru", name: "Grus",
    center: [336.0, -47.0],
    lines: [
      [109268, 110997],
    ]
  },
  {
    id: "Phe", name: "Phoenix",
    center: [14.0, -44.0],
    lines: [
      [2081, 3419],
    ]
  },
  {
    id: "Col", name: "Columba",
    center: [87.0, -36.0],
    lines: [
      [28328, 25985],
    ]
  },
  {
    id: "Pyx", name: "Pyxis",
    center: [130.0, -28.0],
    lines: [
      [42527, 39429],
    ]
  },
  {
    id: "Vul", name: "Vulpecula",
    center: [295.0, 24.0],
    lines: [
      [96757, 96837],
    ]
  },
  {
    id: "Lac", name: "Lacerta",
    center: [336.0, 46.0],
    lines: [
      [111169, 109937],
    ]
  },
  {
    id: "Equ", name: "Equuleus",
    center: [319.0, 7.5],
    lines: [
      [104858, 101769],
    ]
  },
  {
    id: "Mic", name: "Microscopium",
    center: [318.0, -34.0],
    lines: [
      [103738, 100064],
    ]
  },
  {
    id: "Scl", name: "Sculptor",
    center: [15.0, -30.0],
    lines: [
      [4577, 2081],
    ]
  },
  {
    id: "For", name: "Fornax",
    center: [47.0, -30.0],
    lines: [
      [9007, 12770],
    ]
  },
  {
    id: "PsA", name: "Piscis Austrinus",
    center: [339.0, -28.0],
    lines: [
      [113368, 112447],
    ]
  },
];
