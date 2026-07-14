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
    totalQuestions: 3150,
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
      "Number bases",
      "Fractions, Decimals, Approximations and Percentages",
      "Indices, Logarithms and Surds",
      "Polynomials",
      "Variation",
      "Inequalities",
      "Progression",
      "Binary Operations",
      "Matrices and Determinants",
      "Euclidean Geometry",
      "Mensuration",
      "Loci",
      "Coordinate Geometry",
      "Trigonometry",
      "Differentiation",
      "Integration",
      "Representation of data",
      "Measures of Location",
      "Measures of Dispersion",
      "Permutation and Combination",
      "Probability"
    ],
    category: 'science commercial'
  },

  {
    id: "CHM001",
    icon: `<img src="${chemistryImg}" style="width: 100%; border-radius: 16px" />`,
    name: "Chemistry",
    totalQuestions: 1560,
    topics: [
      "Separation of Mixtures and Purification of Chemical Substances",
      "Chemical Combination",
      "Kinetic Theory of Matter and Gas Laws",
      "Atomic Structure and Bonding",
      "Air",
      "Water",
      "Solubility",
      "Environmental Pollution",
      "Acids, Bases and Salts",
      "Oxidation and Reduction - Redox",
      "Electrolysis",
      "Energy Changes",
      "Rates of Chemical Reaction",
      "Chemical Equilibria",
      "Non-metals and Their Compounds",
      "Metals and their compounds",
      "Organic Compounds",
      "Chemistry and Industry"
    ],
    category: 'science'
  },

  {
    id: "PHY001",
    icon: `<img src="${physicsImg}" style="width: 100%; border-radius: 16px" />`,
    name: "Physics",
    totalQuestions: 1420,
    topics: [
      "Measurements and Units",
      "Scalars and Vectors",
      "Motion",
      "Equilibrium of Forces",
      "Work, Energy and Power",
      "Energy and society",
      "Friction",
      "Simple Machines",
      "Elasticity: Hooke's Law and Young's Modulus",
      "Pressure",
      "Liquids At Rest",
      "Temperature and Its Measurement",
      "Thermal Expansion",
      "Gas Laws",
      "Quantity of Heat",
      "Change of State",
      "Vapours",
      "Structure of Matter and Kinetic Theory",
      "Heat Transfer",
      "Waves",
      "Propagation of Sound Waves",
      "Characteristics of Sound Waves",
      "Light Energy",
      "Reflection of Light at Plane and Curved Surfaces",
      "Refraction of Light Through at Plane and Curved Surfaces",
      "Electrostatics",
      "Capacitors",
      "Electric Cells",
      "Current Electricity",
      "Electrical Energy and Power",
      "Magnets and Magnetic Fields",
      "Force on a Current-Carrying Conductor in a Magnetic Field",
      "Electromagnetic Induction",
      "Electrolysis",
      "Elementary Modern Physics-Bohr's Theory",
      "Introductory Electronics"
    ],
    category: 'science'
  },

  {
    id: "BIO001",
    icon: `<img src="${biologyImg}" style="width: 100%; border-radius: 16px" />`,
    name: "Biology",
    totalQuestions: 1680,
    topics: [
      "Variety of Organisms - Characteristics of Living Organisms",
      "Variety of Organisms - Cell Structure and Functions",
      "Variety of Organisms - Levels of Organization",
      "Variety of Organisms - Evolution among Monera",
      "Variety of Organisms - Evolution among Protista",
      "Variety of Organisms - Evolution among Fungi",
      "Variety of Organisms - Evolution among Plantae (Thallophyta, Bryophyta)",
      "Variety of Organisms - Evolution among Invertebrates",
      "Variety of Organisms - Evolution among Vertebrates",
      "Variety of Organisms - Structural/Functional and Behavioural Adaptations",
      "Form and Functions - Internal Structure of Plants",
      "Form and Functions - Internal Structure of Mammals",
      "Form and Functions - Nutrition (Modes of Nutrition)",
      "Form and Functions - Nutrition (Plant Nutrition - Photosynthesis)",
      "Form and Functions - Nutrition (Plant Nutrition - Mineral Requirements)",
      "Form and Functions - Nutrition (Animal Nutrition - Classes of Food)",
      "Form and Functions - Nutrition (Animal Nutrition - Food Tests)",
      "Form and Functions - Nutrition (Mammalian Tooth)",
      "Form and Functions - Nutrition (Mammalian Alimentary Canal)",
      "Form and Functions - Nutrition (Nutrition Process)",
      "Form and Functions - Transport (Need and Materials)",
      "Form and Functions - Transport (Mammalian Circulatory System)",
      "Form and Functions - Transport (Plant Vascular System)",
      "Form and Functions - Transport (Media and Mechanisms)",
      "Form and Functions - Respiration (Respiratory Organs and Surfaces)",
      "Form and Functions - Respiration (Mechanism of Gaseous Exchange)",
      "Form and Functions - Respiration (Aerobic and Anaerobic Respiration)",
      "Form and Functions - Excretion (Excretory Structures)",
      "Form and Functions - Excretion (Excretory Mechanisms - Kidney, Lungs, Skin)",
      "Form and Functions - Excretion (Excretory Products of Plants)",
      "Form and Functions - Support and Movement (Plant Movements)",
      "Form and Functions - Support and Movement (Supporting Tissues in Animals)",
      "Form and Functions - Support and Movement (Types and Functions of Skeleton)",
      "Form and Functions - Reproduction (Asexual Reproduction)",
      "Form and Functions - Reproduction (Sexual Reproduction in Flowering Plants)",
      "Form and Functions - Reproduction (Reproduction in Mammals)",
      "Form and Functions - Growth (Meaning and Germination)",
      "Form and Functions - Co-ordination and Control (Nervous Coordination)",
      "Form and Functions - Co-ordination and Control (Sense Organs)",
      "Form and Functions - Co-ordination and Control (Hormonal Control)",
      "Form and Functions - Co-ordination and Control (Homeostasis)",
      "Ecology - Factors Affecting Distribution of Organisms",
      "Ecology - Symbiotic Interactions",
      "Ecology - Energy Flow in the Ecosystem",
      "Ecology - Nutrient Cycling (Carbon, Water, Nitrogen Cycles)",
      "Ecology - Local (Nigerian) Biomes",
      "Ecology - Ecology of Populations",
      "Ecology - Soil (Characteristics and Components)",
      "Ecology - Soil Fertility",
      "Ecology - Humans and Environment (Diseases)",
      "Ecology - Humans and Environment (Pollution and Control)",
      "Ecology - Humans and Environment (Conservation of Natural Resources)",
      "Ecology - Humans and Environment (Game Reserves and National Parks)",
      "Heredity and Variations - Variation in Population",
      "Heredity and Variations - Heredity (Inheritance of Characters)",
      "Heredity and Variations - Heredity (Chromosomes as Basis of Heredity)",
      "Heredity and Variations - Heredity (Probability and Sex Determination)",
      "Heredity and Variations - Heredity (Application in Agriculture and Medicine)",
      "Heredity and Variations - Heredity (Sex-linked Characters)",
      "Heredity and Variations - Theories of Evolution",
      "Heredity and Variations - Evidence of Evolution"
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
    totalQuestions: 1438,
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
    totalQuestions: 1358,
    topics: [
      "Nature and Significance of Book keeping and Accounting - Development of Accounting (including branches of Accounting)",
      "Nature and Significance of Book keeping and Accounting - Objectives of Book Keeping and Accounting",
      "Nature and Significance of Book keeping and Accounting - Users and characteristics of Accounting information",
      "Nature and Significance of Book keeping and Accounting - Principles, concepts and conventions of Accounting (nature, significance and application)",
      "Nature and Significance of Book keeping and Accounting - Role of Accounting records and information",
      "Principles of Double Entry - Source documents",
      "Principles of Double Entry - Books of original entry",
      "Principles of Double Entry - Accounting equation",
      "Principles of Double Entry - Ledger and its classifications",
      "Principles of Double Entry - Trial balance",
      "Principles of Double Entry - Types and correction of errors",
      "Principles of Double Entry - Suspense Account",
      "Ethics in Accounting - Objectives",
      "Ethics in Accounting - Qualities of an Accountant",
      "Cash Book - Columnar Cash Books: single column, double column, three column",
      "Cash Book - Discounts",
      "Cash Book - Petty Cash Book and imprest system",
      "Bank Transactions and Reconciliation Statements - Instrument of bank transactions",
      "Bank Transactions and Reconciliation Statements - e-banking system",
      "Bank Transactions and Reconciliation Statements - Causes of discrepancies between cash book and bank statement",
      "Bank Transactions and Reconciliation Statements - Bank reconciliation statement",
      "Final Accounts of a Sole Trader - Income statement (Trading and profit and loss account)",
      "Final Accounts of a Sole Trader - Statement of financial position (Balance sheet)",
      "Final Accounts of a Sole Trader - Adjustments: provision for bad and doubtful debt, provision for discounts, provision for depreciation using straightline and reducing balance methods, accruals and prepayment",
      "Stock Valuation - Methods of stock valuation e.g FIFO, LIFO and simple average",
      "Stock Valuation - Advantages and disadvantages of the methods",
      "Stock Valuation - The importance of stock valuation",
      "Control Accounts and Self balancing ledger - Meaning and uses of control accounts",
      "Control Accounts and Self balancing ledger - Purchases ledger control account",
      "Control Accounts and Self balancing ledger - Sales ledger control account",
      "Incomplete Records and Single Entry - Determination of missing figures",
      "Incomplete Records and Single Entry - Preparation of final accounts from incomplete records",
      "Incomplete Records and Single Entry - Conversion of single entry to double entry",
      "Manufacturing Accounts - Cost classification",
      "Manufacturing Accounts - Cost apportionment",
      "Manufacturing Accounts - Preparation of manufacturing account",
      "Accounts of Not-For-Profit-Making Organizations - Objectives",
      "Accounts of Not-For-Profit-Making Organizations - Receipts and payments account",
      "Accounts of Not-For-Profit-Making Organizations - Income and expenditure account",
      "Accounts of Not-For-Profit-Making Organizations - Statement of financial position",
      "Departmental Accounts - Objectives",
      "Departmental Accounts - Apportionment of expenses",
      "Branch Accounts - Objectives",
      "Branch Accounts - Branch account in the head office books",
      "Branch Accounts - Head office account",
      "Branch Accounts - Reconciliation of branch and head office books",
      "Joint Venture Accounts - Objectives and features",
      "Joint Venture Accounts - Personnel account of venturers",
      "Joint Venture Accounts - Memorandum joint venture accounts",
      "Partnership Accounts - Formation of partnership",
      "Partnership Accounts - Profit or loss account",
      "Partnership Accounts - Appropriation account",
      "Partnership Accounts - Partners current and capital accounts",
      "Partnership Accounts - Treatment of goodwill",
      "Partnership Accounts - Admission/retirement of a partner",
      "Partnership Accounts - Dissolution of partnership",
      "Partnership Accounts - Conversion of a partnership to a company",
      "Introduction to Company Accounts - Formation and classification of companies",
      "Introduction to Company Accounts - Issue of shares and debentures",
      "Introduction to Company Accounts - Final accounts of companies",
      "Introduction to Company Accounts - Accounting ratios",
      "Introduction to Company Accounts - Distinction between capital and revenue reserves",
      "Public Sector Accounting - Comparison of cash and accrual basis of Accounting",
      "Public Sector Accounting - Sources of government revenue",
      "Public Sector Accounting - Capital and recurrent expenditure",
      "Public Sector Accounting - Consolidated Revenue Fund",
      "Public Sector Accounting - Statement of assets and liabilities",
      "Public Sector Accounting - Responsibilities and powers of: The Accountant General, The Auditor General, The Minister of Finance, The Treasurer of Local Government",
      "Public Sector Accounting - Instruments of financial regulation",
      "Information Technology in Accounting - Manual and computerized Accounting processing system",
      "Information Technology in Accounting - Procedures involved in data processing",
      "Information Technology in Accounting - Computer hardware and software",
      "Information Technology in Accounting - Advantages and disadvantages of manual and computerized Accounting processing system"
    ],
    category: 'commercial'
  },

  {
    id: "COM001",
    icon: `<img src="${commerceImg}" style="width: 100%; border-radius: 16px" />`,
    name: "Commerce",
    totalQuestions: 1281,
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
    totalQuestions: 1456,
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
    totalQuestions: 1345,
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
    totalQuestions: 1123,
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