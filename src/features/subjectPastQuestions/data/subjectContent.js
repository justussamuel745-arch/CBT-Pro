/* Per-subject copy for the subject page, keyed by subject slug.
   Facts about counts, topics and years are generated from your real data in utils/subjectPage.js. */

export const SUBJECT_CONTENT = {
  english: {
    intro: [
      'Use of English is the one subject every UTME candidate writes, whatever course they are applying for. It is also the longest paper, with 60 questions, so your English score has a big effect on your total of 400.',
    ],
    tests: [
      'Comprehension and summary: understanding passages, drawing inferences and picking out main ideas.',
      'Lexis and structure: synonyms, antonyms, word classes, concord, question tags, idioms and figurative language.',
      'Oral English: vowel sounds, consonant sounds and stress.',
      'Essay writing: recognizing descriptive, narrative, expository and argumentative essays.',
    ],
    tips: [
      { title: 'Read the questions before the passage', desc: 'Skim the questions first, then read the passage looking for the answers. It saves time and keeps you focused.' },
      { title: 'Learn the rules, not just the answers', desc: 'Concord, tenses and question tags follow fixed rules. Learn each rule once and you can answer every question that tests it.' },
      { title: 'Practice oral English aloud', desc: 'Say the words out loud when you practice sounds and stress. It is much easier to hear a rhyme than to see one.' },
    ],
    samples: [
      { text: "Choose the word that is opposite in meaning to 'benevolent'.", options: ['Kind', 'Generous', 'Malicious', 'Charitable'], answer: 2, explanation: 'Benevolent means kind and well-meaning. Malicious, meaning intending to harm, is its opposite.' },
      { text: 'Choose the option that best completes the sentence: Neither the teacher nor the students ___ present at the assembly.', options: ['was', 'were', 'is', 'has been'], answer: 1, explanation: "With 'neither ... nor', the verb agrees with the subject closest to it. 'Students' is plural, so the plural verb 'were' is correct." },
      { text: "Choose the word that has the same vowel sound as the 'ea' in 'seat'.", options: ['bit', 'meet', 'set', 'bat'], answer: 1, explanation: "'Seat' and 'meet' both have the long /iː/ sound. 'Bit', 'set' and 'bat' have short vowel sounds." },
    ],
  },

  mathematics: {
    intro: [
      'Mathematics is a core subject for most science, engineering and commercial courses. JAMB Mathematics questions test how well you can apply a method under time pressure, so regular practice matters more than memorizing solutions.',
    ],
    tests: [
      'Number and algebra: number bases, fractions, indices, logarithms, surds, sets, polynomials, variation, inequalities, progressions, binary operations and matrices.',
      'Geometry and mensuration: Euclidean geometry, loci, coordinate geometry, areas and volumes.',
      'Trigonometry and calculus: trigonometric ratios, differentiation and its applications, and integration.',
      'Statistics and probability: data representation, averages and spread, permutation and combination, and probability.',
    ],
    tips: [
      { title: 'Show every step', desc: 'Work each problem out on paper. Many lost marks come from small slips in the middle of a calculation.' },
      { title: 'Memorize the key formulas', desc: 'Keep a one-page list of formulas for mensuration, trigonometry, coordinate geometry and differentiation, and test yourself on it daily.' },
      { title: 'Use the options to check', desc: 'In a multiple-choice paper you can often substitute the options back into the question to confirm your answer quickly.' },
    ],
    samples: [
      { text: 'Simplify (2³ × 2⁴) ÷ 2⁵.', options: ['2', '8', '4', '16'], answer: 2, explanation: 'Add the powers on top: 2³ × 2⁴ = 2⁷. Then subtract: 2⁷ ÷ 2⁵ = 2² = 4.' },
      { text: 'Evaluate log₂ 32 − log₂ 4.', options: ['2', '3', '4', '5'], answer: 1, explanation: 'log₂ 32 = 5 and log₂ 4 = 2, so the answer is 5 − 2 = 3.' },
      { text: 'Solve x² − 5x + 6 = 0.', options: ['x = 1 or x = 6', 'x = 2 or x = 3', 'x = −2 or x = −3', 'x = −1 or x = −6'], answer: 1, explanation: 'x² − 5x + 6 factorizes as (x − 2)(x − 3) = 0, so x = 2 or x = 3.' },
    ],
  },

  physics: {
    intro: [
      'Physics is a required UTME subject for many science and engineering courses. The paper mixes short calculations with questions on concepts and diagrams, so you need both formulas and clear understanding.',
    ],
    tests: [
      'Mechanics: measurements, vectors, motion, forces, work, energy and power, friction and simple machines.',
      'Heat and matter: temperature, thermal expansion, gas laws, quantity of heat, change of state, heat transfer, pressure and elasticity.',
      'Waves, sound and light: wave properties, sound, reflection and refraction of light.',
      "Electricity, magnetism and modern physics: electrostatics, capacitors, current electricity, magnetic fields, electromagnetic induction, Bohr's theory and basic electronics.",
    ],
    tips: [
      { title: 'Watch your units', desc: 'Many Physics questions are won or lost on units. Write them at every step and convert before you calculate.' },
      { title: 'Practice the calculations', desc: 'Formulas such as v = u + at and F = ma come up again and again. Solve them until the setup feels automatic.' },
      { title: 'Learn the diagrams', desc: 'Ray diagrams, circuit diagrams and force diagrams are common, so practice drawing and reading them.' },
    ],
    samples: [
      { text: 'Which of the following is a vector quantity?', options: ['Mass', 'Velocity', 'Speed', 'Time'], answer: 1, explanation: 'A vector has both magnitude and direction. Velocity does; mass, speed and time have magnitude only.' },
      { text: 'A force of 20 N acts on a body of mass 4 kg. Find its acceleration.', options: ['0.2 m/s²', '5 m/s²', '16 m/s²', '80 m/s²'], answer: 1, explanation: 'From F = ma, a = F ÷ m = 20 ÷ 4 = 5 m/s².' },
      { text: 'The SI unit of electric charge is the', options: ['Ampere', 'Volt', 'Coulomb', 'Ohm'], answer: 2, explanation: 'Charge is measured in coulombs. The ampere is the unit of current, the volt of potential difference and the ohm of resistance.' },
    ],
  },

  chemistry: {
    intro: [
      'Chemistry is required for courses such as medicine, pharmacy and chemical engineering. JAMB Chemistry mixes definitions, reactions and calculations, so you need to know the facts and be able to apply them.',
    ],
    tests: [
      'Physical chemistry: separation of mixtures, chemical combination, gas laws, atomic structure and bonding, energy changes, rates of reaction and equilibria.',
      'Inorganic chemistry: air, water, solubility, acids, bases and salts, and non-metals and metals and their compounds.',
      'Redox and electrolysis: oxidation and reduction, and electrolysis.',
      'Organic chemistry and industry: organic compounds, environmental pollution and chemistry in industry.',
    ],
    tips: [
      { title: 'Know the first twenty elements', desc: 'Learn their symbols, atomic numbers and groups. They appear in questions on bonding, the periodic table and reactions.' },
      { title: 'Balance equations often', desc: 'Practice writing and balancing equations until it becomes routine. It supports mole and gas-volume calculations too.' },
      { title: 'Tie theory to examples', desc: 'Acids and bases, electrolysis and organic compounds all have everyday examples. They make the facts easier to recall.' },
    ],
    samples: [
      { text: 'The number of protons in an atom is known as its', options: ['Mass number', 'Atomic number', 'Valency', 'Neutron number'], answer: 1, explanation: 'The atomic number is the number of protons in the nucleus of an atom.' },
      { text: 'What is the pH of a neutral solution at 25 °C?', options: ['0', '5', '7', '14'], answer: 2, explanation: 'A pH of 7 is neutral. Values below 7 are acidic and values above 7 are alkaline.' },
      { text: 'Which of the following is a noble gas?', options: ['Argon', 'Nitrogen', 'Chlorine', 'Oxygen'], answer: 0, explanation: 'Argon is in Group 18 of the periodic table, the noble gases. Nitrogen, chlorine and oxygen are reactive non-metals.' },
    ],
  },

  biology: {
    intro: [
      'Biology is required for courses such as medicine and nursing. JAMB Biology rewards candidates who know their key terms and can read diagrams of cells, organisms and life processes.',
    ],
    tests: [
      'Variety of organisms: characteristics of living organisms, cell structure and function, levels of organization and the major groups of organisms.',
      'Form and functions: how organisms are built and how their systems work.',
      'Ecology: how organisms interact with each other and with their environment.',
      'Heredity and variations: inheritance, genes and variation.',
    ],
    tips: [
      { title: 'Learn the diagrams', desc: 'Practice labeling cells, organs and life cycles from memory. Diagram questions are easy marks once you have done this.' },
      { title: 'Know the key terms', desc: 'Make flashcards for terms such as osmosis, diffusion and transpiration and revise them often.' },
      { title: 'Revise by the four areas', desc: 'Organize revision under variety of organisms, form and functions, ecology, and heredity and variations so nothing is left out.' },
    ],
    samples: [
      { text: 'Which cell organelle releases most of the energy a cell needs through respiration?', options: ['Nucleus', 'Mitochondrion', 'Ribosome', 'Cell wall'], answer: 1, explanation: 'Mitochondria are the main site of aerobic respiration, where energy is released from food.' },
      { text: 'Which component of blood mainly defends the body against infection?', options: ['Red blood cells', 'Platelets', 'White blood cells', 'Plasma'], answer: 2, explanation: 'White blood cells fight infection. Red blood cells carry oxygen, platelets help clotting and plasma carries dissolved substances.' },
      { text: 'In a plant cell, photosynthesis takes place in the', options: ['Mitochondria', 'Ribosomes', 'Vacuoles', 'Chloroplasts'], answer: 3, explanation: 'Chloroplasts contain chlorophyll, which traps light energy for photosynthesis.' },
    ],
  },

  economics: {
    intro: [
      'Economics is a UTME subject for courses in economics, business and the social sciences. Questions test whether you understand how markets, money and whole economies work, with plenty of Nigerian examples.',
    ],
    tests: [
      'Basic concepts and methods: economics as a science, economic systems and tools of economic analysis.',
      'Microeconomics: demand, consumer behavior, supply, price determination, production, costs, revenue and market structures.',
      'Macroeconomics: national income, money and inflation, financial institutions, public finance, and economic growth and development.',
      'The Nigerian economy and trade: agriculture, industry, natural resources, population, business organizations and international trade.',
    ],
    tips: [
      { title: 'Understand demand and supply', desc: 'Demand, supply, costs and market structures feature in many questions. Learn what makes each curve move, not just its shape.' },
      { title: 'Learn Nigerian examples', desc: 'Agriculture, industry, population and trade in Nigeria are on the syllabus, so keep a few real examples for each.' },
      { title: 'Be precise with definitions', desc: 'Many questions ask you to choose the right definition, so be exact about terms such as scarcity, opportunity cost and inflation.' },
    ],
    samples: [
      { text: 'The basic economic problem facing every society is', options: ['Inflation', 'Scarcity', 'Unemployment', 'Poverty'], answer: 1, explanation: 'Resources are limited while human wants are unlimited, so choices must be made. This is scarcity.' },
      { text: 'According to the law of demand, when the price of a good rises and other factors remain constant, the quantity demanded', options: ['Rises', 'Falls', 'Stays the same', 'Doubles'], answer: 1, explanation: 'Price and quantity demanded move in opposite directions, so a higher price lowers the quantity demanded.' },
      { text: 'Opportunity cost is best defined as', options: ['The money paid for a good', 'The next best alternative given up', 'The total cost of production', 'The price of a substitute'], answer: 1, explanation: 'When you choose one option, the opportunity cost is the value of the best alternative you give up.' },
    ],
  },

  government: {
    intro: [
      'Government is commonly taken by candidates applying for law, political science and other arts and social science courses. The paper covers both the ideas behind government and how Nigeria has been governed.',
    ],
    tests: [
      'Basic concepts and forms of government: arms of government, systems of governance, political ideologies, constitutions and democratic principles.',
      'Citizenship and participation: the electoral process, political parties, pressure groups, public opinion and the civil service.',
      'Nigerian political history: pre-colonial politics, colonial rule, decolonization, and constitutional development before and after independence.',
      "Federalism, institutions and foreign policy: Nigerian federalism, local government, the military in politics, Nigeria's foreign policy and international organizations.",
    ],
    tips: [
      { title: 'Learn Nigeria’s constitutional history in order', desc: 'Know the sequence of constitutions and what each changed. Questions often test the order of events.' },
      { title: 'Know the key terms', desc: 'Sovereignty, democracy, federalism and rule of law each have exact meanings. Be able to define them in one line.' },
      { title: 'Compare systems side by side', desc: 'Make a small table comparing unitary, federal, presidential and parliamentary systems. Many questions ask you to tell them apart.' },
    ],
    samples: [
      { text: 'A system in which power is divided between a central government and regional governments is called', options: ['Unitary', 'Federal', 'Monarchy', 'Oligarchy'], answer: 1, explanation: 'In a federal system, power is shared between the central government and regional governments such as states. Nigeria is an example.' },
      { text: 'The principle of separation of powers was popularized by', options: ['John Locke', 'Karl Marx', 'Montesquieu', 'Plato'], answer: 2, explanation: 'Montesquieu argued that dividing power among the legislature, executive and judiciary prevents abuse of power.' },
      { text: 'Which arm of government interprets the law?', options: ['Legislature', 'Executive', 'Judiciary', 'Civil service'], answer: 2, explanation: 'The judiciary, made up of the courts, interprets the law and settles disputes. The legislature makes laws and the executive carries them out.' },
    ],
  },

  literature: {
    intro: [
      'Literature in English is commonly taken by candidates applying for English, law, mass communication and other arts courses. Questions test your knowledge of literary terms and your understanding of drama, prose and poetry, including the prescribed texts.',
    ],
    tests: [
      'Drama, prose and poetry: plot, character, theme, setting and style.',
      'General literary terms and principles: figures of speech, genres and literary devices.',
      'Literary appreciation: reading unseen passages and poems and explaining tone, theme and devices.',
      'Prescribed texts: the set books for the exam year.',
    ],
    tips: [
      { title: 'Read the prescribed texts early', desc: 'Read each set text at least twice, and write a short note on plot, characters and themes after each reading.' },
      { title: 'Learn the literary terms', desc: 'Terms such as metaphor, irony and theme are asked directly and are also needed for the text-based questions.' },
      { title: 'Practice with unseen passages', desc: 'Read short poems and passages and explain the tone, theme and devices. It builds the habit tested in literary appreciation.' },
    ],
    samples: [
      { text: 'A word that imitates the sound it describes is an example of', options: ['Metaphor', 'Onomatopoeia', 'Irony', 'Simile'], answer: 1, explanation: 'Words such as buzz, hiss and bang imitate the sounds they describe. This is onomatopoeia.' },
      { text: "A comparison that uses 'like' or 'as' is called a", options: ['Metaphor', 'Personification', 'Simile', 'Hyperbole'], answer: 2, explanation: "A simile compares two things using 'like' or 'as', for example 'as brave as a lion'." },
      { text: 'A play that ends unhappily, usually with the downfall of the main character, is a', options: ['Comedy', 'Tragedy', 'Ode', 'Sonnet'], answer: 1, explanation: 'A tragedy shows the downfall of its main character. An ode and a sonnet are forms of poetry.' },
    ],
  },

  geography: {
    intro: [
      'Geography is taken by candidates applying for courses such as geography, environmental management and urban planning. The paper combines map work with physical and human geography, with a strong focus on Nigeria and West Africa.',
    ],
    tests: [
      'Map work and practical geography: maps, scale, map reading, statistical data, elementary surveying and GIS.',
      'Physical geography: the earth as a planet, its structure, volcanism and earthquakes, denudation, water bodies, weather and climate, vegetation and soil.',
      'Environment: resources, interaction, hazards and conservation.',
      'Human and economic geography: population, settlement, economic activities, Nigeria and ECOWAS.',
    ],
    tips: [
      { title: 'Practice map work often', desc: 'Scale, distance and map-reading questions are easy marks if you have done enough practice with a ruler and a map.' },
      { title: 'Learn processes with diagrams', desc: 'Sketch how volcanoes, earthquakes and weathering work. A simple diagram is easier to recall than a paragraph.' },
      { title: 'Know Nigeria and ECOWAS', desc: 'Revise the broad outline of Nigeria and the aims and members of ECOWAS. They appear in the regional questions.' },
    ],
    samples: [
      { text: 'The imaginary line at 0° latitude is called the', options: ['Prime Meridian', 'Tropic of Cancer', 'Equator', 'Tropic of Capricorn'], answer: 2, explanation: 'The Equator is the line of 0° latitude. It divides the earth into the Northern and Southern Hemispheres.' },
      { text: 'Which of the following is an igneous rock?', options: ['Sandstone', 'Granite', 'Marble', 'Limestone'], answer: 1, explanation: 'Granite forms when magma cools and hardens. Sandstone and limestone are sedimentary rocks, and marble is metamorphic.' },
      { text: 'The instrument used for measuring atmospheric pressure is the', options: ['Thermometer', 'Anemometer', 'Barometer', 'Hygrometer'], answer: 2, explanation: 'A barometer measures atmospheric pressure. A thermometer measures temperature, an anemometer wind speed and a hygrometer humidity.' },
    ],
  },

  crk: {
    intro: [
      'Christian Religious Knowledge (CRK) questions are drawn from the Bible. They test what you know about its stories, teachings and the lessons they carry for daily life.',
    ],
    tests: [
      'Old Testament themes: the sovereignty of God, the covenant, leadership, obedience and the messages of the prophets.',
      'The life and teachings of Jesus: his birth, baptism, miracles, parables, the Sermon on the Mount, and his death and resurrection.',
      'The early Church: fellowship, the Holy Spirit and mission, and opposition to the gospel.',
      'Christian living: love, justification by faith, the law and grace, and new life in Christ.',
    ],
    tips: [
      { title: 'Read the passages themselves', desc: 'Questions are based on specific passages, so read them directly instead of relying only on summaries.' },
      { title: 'Learn the lesson in each story', desc: 'Be ready to state the lesson as well as the story. Many questions ask what a passage teaches.' },
      { title: 'Know names, places and order', desc: 'Keep a short list of key people, places and the order of events for each topic and revise it regularly.' },
    ],
    samples: [
      { text: 'Who led the Israelites out of Egypt?', options: ['Abraham', 'Moses', 'Joshua', 'David'], answer: 1, explanation: 'Moses led the Israelites out of slavery in Egypt, as told in the Book of Exodus.' },
      { text: 'How many disciples did Jesus choose to follow him closely?', options: ['7', '10', '12', '70'], answer: 2, explanation: 'Jesus chose twelve disciples to follow him and carry on his work.' },
      { text: 'The first book of the New Testament is', options: ['Matthew', 'Mark', 'Luke', 'John'], answer: 0, explanation: 'The New Testament opens with the Gospel according to Matthew.' },
    ],
  },

  irk: {
    intro: [
      "Islamic Religious Knowledge (IRK) questions test your knowledge of the Qur'an, the Hadith, Islamic beliefs and practices, and Islamic history. Knowing the key terms and their meanings is essential.",
    ],
    tests: [
      "The Qur'an: revelation, preservation, importance, tafsir and tajwid.",
      'Hadith and Islamic beliefs: hadith, moral lessons, tawhid, shirk and the articles of faith.',
      'Worship and family law: ibadat, taharah, salah, zakah, sawm, hajj, marriage, divorce and inheritance.',
      'Islamic history and institutions: the life of the Prophet (SAW), the Rightly Guided Caliphs, the spread of Islam in West Africa, and the Islamic economic and political systems.',
    ],
    tips: [
      { title: 'Learn the Arabic terms', desc: 'Terms such as tawhid, shirk, zakah, sawm and hajj are tested directly. Learn each one with its meaning.' },
      { title: 'Link the Qur’an and Hadith to topics', desc: 'For each topic, note the verse or hadith that supports it. It makes answers easier to recall.' },
      { title: 'Revise history as a timeline', desc: 'Put the life of the Prophet (SAW), the Caliphs and the spread of Islam in West Africa in order on one page.' },
    ],
    samples: [
      { text: 'How many pillars of Islam are there?', options: ['Four', 'Five', 'Six', 'Seven'], answer: 1, explanation: 'There are five pillars: the declaration of faith, prayer, zakah, fasting and pilgrimage.' },
      { text: 'The first revelation of the Qur’an to Prophet Muhammad (SAW) took place in the cave of', options: ['Thawr', 'Hira', 'Uhud', 'Arafat'], answer: 1, explanation: 'The Angel Jibril (AS) brought the first verses to the Prophet (SAW) in the cave of Hira, near Makkah.' },
      { text: 'The month of compulsory fasting in Islam is', options: ['Shawwal', 'Ramadan', 'Muharram', 'Rajab'], answer: 1, explanation: 'Muslims fast during the month of Ramadan. Fasting (sawm) is one of the five pillars of Islam.' },
    ],
  },

  history: {
    intro: [
      'History questions focus on the Nigeria area, from early states and empires through colonial rule to independence and the republics, with a section on African and world history.',
    ],
    tests: [
      'Peoples and states before colonial rule: early civilizations and states such as Kanem-Borno, the Sokoto Caliphate, Yorubaland, Benin, Nupe, Igbo and Efik.',
      'Colonial rule in Nigeria: European penetration, British conquest, the amalgamation of 1914, colonial administration and the colonial economy.',
      'Nationalism and independent Nigeria: constitutional developments, independence, the First Republic, the civil war and later governments.',
      'African and world history: Islamic reform movements, the Mfecane, the Great Trek, the new imperialism and patterns of colonial rule in Africa.',
    ],
    tips: [
      { title: 'Build timelines', desc: 'Put events in order on one page for each period. Many questions ask what came first or what followed.' },
      { title: 'Know the key people and dates', desc: 'For each topic, learn the main people, the year and one sentence on why it mattered.' },
      { title: 'Connect cause and effect', desc: 'Ask why each event happened and what it led to, for example how the 1914 amalgamation shaped colonial administration.' },
    ],
    samples: [
      { text: 'Nigeria gained independence from Britain in', options: ['1957', '1960', '1963', '1966'], answer: 1, explanation: 'Nigeria became independent on 1 October 1960.' },
      { text: 'The Northern and Southern Protectorates of Nigeria were amalgamated in', options: ['1900', '1906', '1914', '1922'], answer: 2, explanation: 'Lord Lugard merged the Northern and Southern Protectorates in 1914 to form the Colony and Protectorate of Nigeria.' },
      { text: 'Who was Nigeria’s first Prime Minister?', options: ['Nnamdi Azikiwe', 'Abubakar Tafawa Balewa', 'Obafemi Awolowo', 'Ahmadu Bello'], answer: 1, explanation: 'Abubakar Tafawa Balewa was Nigeria’s first Prime Minister and led the federal government until 1966.' },
    ],
  },

  accounting: {
    intro: [
      'Accounting is taken by candidates applying for accounting, business and related courses. The paper tests the principles of double entry and the preparation of ledgers, final accounts and the accounts of different types of organizations.',
    ],
    tests: [
      'Principles: the nature of book keeping, double entry, ethics, the cash book and bank reconciliation.',
      'Final accounts and records: final accounts of a sole trader, stock valuation, control accounts, incomplete records and manufacturing accounts.',
      'Accounts of organizations: not-for-profit, departmental, branch, joint venture, partnership and company accounts.',
      'Public sector accounting and information technology in accounting.',
    ],
    tips: [
      { title: 'Practice double entry daily', desc: 'Record a few transactions every day. Once debit and credit become automatic, most other topics get easier.' },
      { title: 'Learn the format of final accounts', desc: 'Know the layout of the trading account, profit and loss account and balance sheet so you can fill them in quickly.' },
      { title: 'Check your arithmetic', desc: 'Re-add your totals. Small addition errors cost marks even when your method is right.' },
    ],
    samples: [
      { text: 'The accounting equation is', options: ['Assets = Liabilities − Capital', 'Assets = Liabilities + Capital', 'Capital = Assets + Liabilities', 'Liabilities = Assets + Capital'], answer: 1, explanation: 'What a business owns (assets) is financed by what it owes (liabilities) plus what the owner has put in (capital).' },
      { text: 'Which of the following is a current asset?', options: ['Land', 'Buildings', 'Debtors', 'Motor vehicles'], answer: 2, explanation: 'Debtors are amounts owed to the business that will be collected soon, so they are current assets. Land, buildings and motor vehicles are fixed assets.' },
      { text: 'A trial balance is prepared mainly to', options: ['Calculate the net profit', 'Check the arithmetical accuracy of the ledger accounts', 'Show the value of assets', 'Record daily transactions'], answer: 1, explanation: 'A trial balance lists all ledger balances. If total debits equal total credits, the books are arithmetically accurate, although some errors can still go unnoticed.' },
    ],
  },

  commerce: {
    intro: [
      'Commerce covers how goods and services move from producers to consumers, and the businesses, money and laws that support trade. The questions are mostly about definitions, documents and how business activities fit together.',
    ],
    tests: [
      'Foundations of commerce: commerce, occupation, production and trade.',
      'Trading in practice: purchase and sale of goods, aids to trade and business units.',
      'Money and finance: financing business, money, the stock exchange and trade associations.',
      'Business today: management, marketing, legal aspects, ICT, and the business environment and social responsibility.',
    ],
    tips: [
      { title: 'Learn the definitions', desc: 'Commerce questions often ask for the exact meaning of a term. Write short definitions and revise them.' },
      { title: 'Know the documents and their uses', desc: 'Be able to say what an invoice, receipt, quotation and delivery note are for and who sends each one.' },
      { title: 'Link topics to real businesses', desc: 'Think of a shop, a bank or a market you know for each topic. Real examples make the terms easier to remember.' },
    ],
    samples: [
      { text: 'The exchange of goods for goods without using money is called', options: ['Retail', 'Wholesale', 'Barter', 'Hire purchase'], answer: 2, explanation: 'Barter is direct exchange of goods or services without money.' },
      { text: 'The link between the manufacturer and the retailer in the chain of distribution is usually the', options: ['Consumer', 'Wholesaler', 'Banker', 'Insurer'], answer: 1, explanation: 'Wholesalers buy in bulk from manufacturers and sell smaller quantities to retailers.' },
      { text: 'Which document does a seller send to a buyer to request payment for goods supplied?', options: ['Receipt', 'Quotation', 'Invoice', 'Catalogue'], answer: 2, explanation: 'An invoice lists the goods supplied and the amount to be paid. A receipt confirms payment after it has been made.' },
    ],
  },
}

// Used only if a subject is added to the data before its copy is written here.
export const buildFallbackContent = (name) => ({
  intro: [`${name} is one of the subjects you can choose in the JAMB UTME, depending on your course.`],
  tests: [
    `Topics from the official JAMB ${name} syllabus.`,
    'Questions that test recall as well as understanding.',
  ],
  tips: [
    { title: 'Practice by topic', desc: 'Work through one topic at a time and move on once your scores are steady.' },
    { title: 'Read every explanation', desc: 'Understanding why an answer is right helps you with questions you have not seen before.' },
    { title: 'Practice against the clock', desc: 'Timed sessions build the speed you need on exam day.' },
  ],
  samples: [],
})

