import englishImg from '../../assets/images/english.jpg';
import mathematicsImg from '../../assets/images/mathematics.jpg';
import arabicImg from '../../assets/images/arabic.jpg';
import yorubaImg from '../../assets/images/yoruba.jpg';
import igboImg from '../../assets/images/igbo.jpg';
import chemistryImg from '../../assets/images/chemistry.jpg';
import physicsImg from '../../assets/images/physics.jpg';
import biologyImg from '../../assets/images/biology.jpg';
import governmentImg from '../../assets/images/government.jpg';
import literatureImg from '../../assets/images/literature.jpg';
import economicsImg from '../../assets/images/economics.jpg';
import musicImg from '../../assets/images/music.jpg';
import fineArtImg from '../../assets/images/fine-art.jpg';
import crkImg from '../../assets/images/crk.jpg';
import agricultureImg from '../../assets/images/agriculture.jpg';
import geographyImg from '../../assets/images/geography.jpg';
import accountingImg from '../../assets/images/accounting.jpg';
import commerceImg from '../../assets/images/commerce.jpg';
import irkImg from '../../assets/images/irk.jpg';
import computerImg from '../../assets/images/computer.jpg';
import physicalHealthImg from '../../assets/images/physicalHealth.jpg';
import hausaImg from '../../assets/images/hausa.jpg';
import historyImg from '../../assets/images/history.jpg';
import frenchImg from '../../assets/images/french.jpg';
import homeEconomicsImg from '../../assets/images/homeEconomics.jpg';
import insuranceImg from '../../assets/images/insurance.jpg';
import civicImg from '../../assets/images/civic.jpg';
import currentAffairsImg from '../../assets/images/current-affairs.jpg';

/* COMPLETE SUBJECTS */
/* export const subjectsData = [
  {
    id: "ENG001",
    icon: `<img src="${englishImg}" style="width: 100%; border-radius: 16px" />`,
    name: "English",
    totalQuestions: 2450,
    topics: [
      "Comprehension and Summary",
      "Description",
      "Narration",
      "Exposition",
      "Argumentation/Persuasion",
      "Synthesis of Ideas",
      "Synonyms",
      "Antonyms",
      "Clause and Sentence Patterns",
      "Word Classes",
      "Agreement/Concord",
      "Question Tags",
      "Mechanics",
      "Figurative Usage",
      "Idiomatic Usage",
      "Oral Forms",
      "Vowels",
      "Consonants",
      "Consonant Clusters",
      "Rhymes and Homophones",
      "Word Stress",
      "Emphatic Stress"
    ],
    category: 'all'
  },

  {
    id: "MTH001",
    icon: `<img src="${mathematicsImg}" style="width: 100%; border-radius: 16px" />`,
    name: "Mathematics",
    totalQuestions: 1890,
    topics: [
      "Algebra",
      "Geometry",
      "Trigonometry",
      "Mensuration",
      "Statistics",
      "Probability",
      "Calculus"
    ],
    category: 'science commercial'
  },

  {
    id: "CHM001",
    icon: `<img src="${chemistryImg}" style="width: 100%; border-radius: 16px" />`,
    name: "Chemistry",
    totalQuestions: 1560,
    topics: [
      "Atomic Structure",
      "Periodic Table",
      "Chemical Bonding",
      "Organic Chemistry",
      "Acids Bases and Salts",
      "Electrolysis"
    ],
    category: 'science'
  },

  {
    id: "PHY001",
    icon: `<img src="${physicsImg}" style="width: 100%; border-radius: 16px" />`,
    name: "Physics",
    totalQuestions: 1420,
    topics: [
      "Measurements",
      "Motion",
      "Newton Laws",
      "Heat Energy",
      "Electricity",
      "Waves",
      "Optics"
    ],
    category: 'science'
  },

  {
    id: "BIO001",
    icon: `<img src="${biologyImg}" style="width: 100%; border-radius: 16px" />`,
    name: "Biology",
    totalQuestions: 1680,
    topics: [
      "Cell Structure",
      "Nutrition",
      "Respiration",
      "Genetics",
      "Ecology",
      "Evolution"
    ],
    category: 'science'
  },

  {
    id: "ECO001",
    icon: `<img src="${economicsImg}" style="width: 100%; border-radius: 16px"/>`,
    name: "Economics",
    totalQuestions: 1340,
    topics: [
      "Economics as a Science",
      "Economic Systems",
      "Methods and Tools of Economic Analysis",
      "The Theory of Demand",
      "The Theory of Consumer Behaviour",
      "The Theory of Supply",
      "The Theory of Price Determination",
      "The Theory of Production",
      "Theory of Costs and Revenue",
      "Market Structures",
      "National Income",
      "Money and Inflation",
      "Financial Institutions",
      "Public Finance",
      "Economic Growth and Development",
      "Agriculture in Nigeria",
      "Industry and Industrialization",
      "Natural Resources and the Nigerian Economy",
      "Business Organizations",
      "Population",
      "International Trade",
      "International Economic Organizations",
      "Factors of Production and their Theories"
    ],
    category: 'commercial arts'
  },

  {
    id: "GOV001",
    icon: `<img src="${governmentImg}" style="width: 100%; border-radius: 16px" />`,
    name: "Government",
    totalQuestions: 1210,
    topics: [
      "Constitution",
      "Democracy",
      "Citizenship",
      "Political Parties",
      "Federalism",
      "Arms of Government"
    ],
    category: 'arts'
  },

  {
    id: "CSC001",
    icon: `<img src="${computerImg}" style="width: 100%; border-radius: 16px" />`,
    name: 'Computer Studies',
    totalQuestions: 1210,
    topics: [
      "Computer Hardware",
      "Computer Software",
      "Networking",
      "Internet",
      "Programming",
      "Cyber Security"
    ],
    category: 'science'
  },

  {
    id: "LIT001",
    icon: `<img src="${literatureImg}" style="width: 100%; border-radius: 16px" />`,
    name: "englishLit",
    totalQuestions: 980,
    topics: [
      "Drama",
      "Poetry",
      "Prose",
      "Figures of Speech",
      "African Literature"
    ],
    category: 'arts'
  },

  {
    id: "GEO001",
    icon: `<img src="${geographyImg}" style="width: 100%; border-radius: 16px" />`,
    name: "Geography",
    totalQuestions: 1120,
    topics: [
      "Map Reading",
      "Climate",
      "Vegetation",
      "Population",
      "Industry",
      "Agriculture"
    ],
    category: 'arts science'
  },

  {
    id: "CRK001",
    icon: `<img src="${crkImg}" style="width: 100%; border-radius: 16px" />`,
    name: "CRK",
    totalQuestions: 890,
    topics: [
      "Creation",
      "Leadership",
      "Prophets",
      "Miracles",
      "Christian Living"
    ],
    category: 'arts'
  },

  {
    id: "IRK001",
    icon: `<img src="${irkImg}" style="width: 100%; border-radius: 16px" />`,
    name: "IRK",
    totalQuestions: 760,
    topics: [
      "Tawhid",
      "Qur'an",
      "Hadith",
      "Sharia",
      "Islamic Morality"
    ],
    category: 'arts'
  },

  {
    id: "HIS001",
    icon: `<img src="${historyImg}" style="width: 100%; border-radius: 16px" />`,
    name: "History",
    totalQuestions: 760,
    topics: [
      "Pre Colonial Nigeria",
      "Colonial Rule",
      "Nationalism",
      "Independence",
      "Civil War"
    ],
    category: 'arts'
  },

  {
    id: "ACC001",
    icon: `<img src="${accountingImg}" style="width: 100%; border-radius: 16px" />`,
    name: "Accounting",
    totalQuestions: 1050,
    topics: [
      "Ledger",
      "Cash Book",
      "Trial Balance",
      "Final Accounts",
      "Depreciation"
    ],
    category: 'commercial'
  },

  {
    id: "COM001",
    icon: `<img src="${commerceImg}" style="width: 100%; border-radius: 16px" />`,
    name: "Commerce",
    totalQuestions: 940,
    topics: [
      "Trade",
      "Insurance",
      "Banking",
      "Advertising",
      "Transportation"
    ],
    category: 'commercial'
  },

  {
    id: "AGR001",
    icon: `<img src="${agricultureImg}" style="width: 100%; border-radius: 16px" />`,
    name: "Agriculture",
    totalQuestions: 870,
    topics: [
      "Soil Science",
      "Crop Production",
      "Animal Production",
      "Forestry",
      "Fisheries"
    ],
    category: 'science'
  },

  {
    id: "ART001",
    icon: `<img src="${fineArtImg}" style="width: 100%; border-radius: 16px" />`,
    name: "FineArt",
    totalQuestions: 620,
    topics: [
      "Elements of Art",
      "Drawing",
      "Painting",
      "Sculpture",
      "Design"
    ],
    category: 'arts'
  },

  {
    id: "MUS001",
    icon: `<img src="${musicImg}" style="width: 100%; border-radius: 16px" />`,
    name: "Music",
    totalQuestions: 540,
    topics: [
      "Rhythm",
      "Melody",
      "Harmony",
      "Instruments",
      "Music Theory"
    ],
    category: 'arts'
  },

  {
    id: "HME001",
    icon: `<img src="${homeEconomicsImg}" style="width: 100%; border-radius: 16px" />`,
    name: "HomeEconomics",
    totalQuestions: 710,
    topics: [
      "Nutrition",
      "Family Living",
      "Home Management",
      "Clothing",
      "Food Preparation"
    ],
    category: 'arts'
  },

  {
    id: "PHE001",
    icon: `<img src="${physicalHealthImg}" style="width: 100%; border-radius: 16px" />`,
    name: "PhysicalHealth",
    totalQuestions: 650,
    topics: [
      "Human Body",
      "Exercise",
      "Sports",
      "Health Education",
      "First Aid"
    ],
    category: 'all'
  },

  {
    id: "FRN001",
    icon: `<img src="${frenchImg}" style="width: 100%; border-radius: 16px" />`,
    name: "French",
    totalQuestions: 490,
    topics: [
      "Grammar",
      "Vocabulary",
      "Comprehension",
      "Translation",
      "Oral French"
    ],
    category: 'arts'
  },

  {
    id: "ARB001",
    icon: `<img src="${arabicImg}" style="width: 100%; border-radius: 16px" />`,
    name: "Arabic",
    totalQuestions: 420,
    topics: [
      "Grammar",
      "Translation",
      "Vocabulary",
      "Comprehension",
      "Essay"
    ],
    category: 'arts'
  },

  {
    id: "IGB001",
    icon: `<img src="${igboImg}" style="width: 100%; border-radius: 16px" />`,
    name: "Igbo",
    totalQuestions: 380,
    topics: [
      "Grammar",
      "Culture",
      "Comprehension",
      "Essay",
      "Proverbs"
    ],
    category: 'arts'
  },

  {
    id: "HAU001",
    icon: `<img src="${hausaImg}" style="width: 100%; border-radius: 16px" />`,
    name: "Hausa",
    totalQuestions: 380,
    topics: [
      "Grammar",
      "Culture",
      "Comprehension",
      "Essay",
      "Vocabulary"
    ],
    category: 'arts'
  },

  {
    id: "YOR001",
    icon: `<img src="${yorubaImg}" style="width: 100%; border-radius: 16px" />`,
    name: "Yoruba",
    totalQuestions: 360,
    topics: [
      "Grammar",
      "Culture",
      "Comprehension",
      "Essay",
      "Proverbs"
    ],
    category: 'arts'
  }
]; */

/* AVAILABLE SUBJECTS */
export const subjectsData = [
  {
    id: "ENG001",
    icon: `<img src="${englishImg}" style="width: 100%; border-radius: 16px" />`,
    name: "English",
    totalQuestions: 2450,
    topics: [
      "Comprehension and Summary",
      "Description",
      "Narration",
      "Exposition",
      "Argumentation/Persuasion",
      "Synthesis of Ideas",
      "Synonyms",
      "Antonyms",
      "Clause and Sentence Patterns",
      "Word Classes",
      "Agreement/Concord",
      "Question Tags",
      "Mechanics",
      "Figurative Usage",
      "Idiomatic Usage",
      "Oral Forms",
      "Vowels",
      "Consonants",
      "Consonant Clusters",
      "Rhymes and Homophones",
      "Word Stress",
      "Emphatic Stress"
    ],
    category: 'all'
  },

  {
    id: "MTH001",
    icon: `<img src="${mathematicsImg}" style="width: 100%; border-radius: 16px" />`,
    name: "Mathematics",
    totalQuestions: 1890,
    topics: [
      "Algebra",
      "Geometry",
      "Trigonometry",
      "Mensuration",
      "Statistics",
      "Probability",
      "Calculus"
    ],
    category: 'science commercial'
  },

  {
    id: "CHM001",
    icon: `<img src="${chemistryImg}" style="width: 100%; border-radius: 16px" />`,
    name: "Chemistry",
    totalQuestions: 1560,
    topics: [
      "Atomic Structure",
      "Periodic Table",
      "Chemical Bonding",
      "Organic Chemistry",
      "Acids Bases and Salts",
      "Electrolysis"
    ],
    category: 'science'
  },

  {
    id: "PHY001",
    icon: `<img src="${physicsImg}" style="width: 100%; border-radius: 16px" />`,
    name: "Physics",
    totalQuestions: 1420,
    topics: [
      "Measurements",
      "Motion",
      "Newton Laws",
      "Heat Energy",
      "Electricity",
      "Waves",
      "Optics"
    ],
    category: 'science'
  },

  {
    id: "BIO001",
    icon: `<img src="${biologyImg}" style="width: 100%; border-radius: 16px" />`,
    name: "Biology",
    totalQuestions: 1680,
    topics: [
      "Cell Structure",
      "Nutrition",
      "Respiration",
      "Genetics",
      "Ecology",
      "Evolution"
    ],
    category: 'science'
  },

  {
    id: "ECO001",
    icon: `<img src="${economicsImg}" style="width: 100%; border-radius: 16px"/>`,
    name: "Economics",
    totalQuestions: 1340,
    topics: [
      "Economics as a Science",
      "Economic Systems",
      "Methods and Tools of Economic Analysis",
      "The Theory of Demand",
      "The Theory of Consumer Behaviour",
      "The Theory of Supply",
      "The Theory of Price Determination",
      "The Theory of Production",
      "Theory of Costs and Revenue",
      "Market Structures",
      "National Income",
      "Money and Inflation",
      "Financial Institutions",
      "Public Finance",
      "Economic Growth and Development",
      "Agriculture in Nigeria",
      "Industry and Industrialization",
      "Natural Resources and the Nigerian Economy",
      "Business Organizations",
      "Population",
      "International Trade",
      "International Economic Organizations",
      "Factors of Production and their Theories"
    ],
    category: 'commercial arts'
  },

  {
    id: "GOV001",
    icon: `<img src="${governmentImg}" style="width: 100%; border-radius: 16px" />`,
    name: "Government",
    totalQuestions: 1210,
    topics: [
      "Constitution",
      "Democracy",
      "Citizenship",
      "Political Parties",
      "Federalism",
      "Arms of Government"
    ],
    category: 'arts'
  },
  
  {
    id: "LIT001",
    icon: `<img src="${literatureImg}" style="width: 100%; border-radius: 16px" />`,
    name: "Literature",
    totalQuestions: 980,
    topics: [
      "Drama",
      "Poetry",
      "Prose",
      "Figures of Speech",
      "African Literature"
    ],
    category: 'arts'
  },

  {
    id: "GEO001",
    icon: `<img src="${geographyImg}" style="width: 100%; border-radius: 16px" />`,
    name: "Geography",
    totalQuestions: 1120,
    topics: [
      "Map Reading",
      "Climate",
      "Vegetation",
      "Population",
      "Industry",
      "Agriculture"
    ],
    category: 'arts science'
  },

  {
    id: "CRK001",
    icon: `<img src="${crkImg}" style="width: 100%; border-radius: 16px" />`,
    name: "CRK",
    totalQuestions: 890,
    topics: [
      "Creation",
      "Leadership",
      "Prophets",
      "Miracles",
      "Christian Living"
    ],
    category: 'arts'
  },

  {
    id: "IRK001",
    icon: `<img src="${irkImg}" style="width: 100%; border-radius: 16px" />`,
    name: "IRK",
    totalQuestions: 760,
    topics: [
      "Tawhid",
      "Qur'an",
      "Hadith",
      "Sharia",
      "Islamic Morality"
    ],
    category: 'arts'
  },

  {
    id: "HIS001",
    icon: `<img src="${historyImg}" style="width: 100%; border-radius: 16px" />`,
    name: "History",
    totalQuestions: 760,
    topics: [
      "Pre Colonial Nigeria",
      "Colonial Rule",
      "Nationalism",
      "Independence",
      "Civil War"
    ],
    category: 'arts'
  },

  {
    id: "ACC001",
    icon: `<img src="${accountingImg}" style="width: 100%; border-radius: 16px" />`,
    name: "Accounting",
    totalQuestions: 1050,
    topics: [
      "Ledger",
      "Cash Book",
      "Trial Balance",
      "Final Accounts",
      "Depreciation"
    ],
    category: 'commercial'
  },

  {
    id: "COM001",
    icon: `<img src="${commerceImg}" style="width: 100%; border-radius: 16px" />`,
    name: "Commerce",
    totalQuestions: 940,
    topics: [
      "Trade",
      "Insurance",
      "Banking",
      "Advertising",
      "Transportation"
    ],
    category: 'commercial'
  },

  {
    id: "INS001",
    icon: `<img src="${insuranceImg}" style="width: 100%; border-radius: 16px" />`,
    name: "Insurance",
    totalQuestions: 620,
    topics: [
      "Principles of Insurance",
      "Types of Insurance",
      "Insurance Contract",
      "Risk Management",
      "Claims and Underwriting",
      "Insurance Law and Practice",
      "Reinsurance"
    ],
    category: 'commercial'
  },

  {
    id: "CIV001",
    icon: `<img src="${civicImg}" style="width: 100%; border-radius: 16px" />`,
    name: "Civic",
    totalQuestions: 850,
    topics: [
      "National Consciousness",
      "Values",
      "Rights and Responsibilities",
      "Human Rights",
      "Citizenship",
      "Democracy",
      "Rule of Law",
      "Traffic Regulations",
      "Cultism and Drug Abuse",
      "National Institutions"
    ],
    category: 'arts'
  },

  {
    id: "CUR001",
    icon: `<img src="${currentAffairsImg}" style="width: 100%; border-radius: 16px" />`,
    name: "CurrentAffairs",
    totalQuestions: 500,
    topics: [
      "National News",
      "International News",
      "Politics and Governance",
      "Economy and Business",
      "Science and Technology",
      "Sports",
      "Health",
      "Education",
      "Environment",
      "Awards and Honours"
    ],
    category: 'all'
  }
];