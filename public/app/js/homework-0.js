
/* ═══════════════════════════════════════════════════════════════════════════
   LESSON TEACHER — FULL SYLLABUS DATA
   ═══════════════════════════════════════════════════════════════════════════
   Each entry = { board, subject_key, topics: [ {id, name, weight, bloom} ] }

   • weight = relative past-paper frequency (higher = more questions from this topic)
   • bloom  = cognitive level: recall | understand | apply | analyse | evaluate | create
   • Topic IDs are stable identifiers used by the mastery tracker.

   SOURCES used for verification:
   - WAEC: waecsyllabus.com (official 2026 SSCE syllabus)
   - NECO: syllabus.ng/neco and NECO official bulletins
   - JAMB: JAMB UTME 2025/2026 official syllabus & past-paper analysis
   - BECE: NERDC Basic Education Curriculum (JSS 1-3) + NECO-BECE papers
   - NCEE: NECO NCEE syllabus + Federal Unity College entry exam structure
   ═══════════════════════════════════════════════════════════════════════════ */

const LT_SYLLABI = {

/* ═════════════════ WAEC / WASSCE ═════════════════ */
waec: {

  mth: { // Mathematics
    name: 'Mathematics',
    sections: [
      { name: 'Number and Numeration', topics: [
        { id: 'num_bases', name: 'Number Bases', weight: 3, bloom: 'apply' },
        { id: 'modular_arith', name: 'Modular Arithmetic', weight: 2, bloom: 'apply' },
        { id: 'fractions_decimals', name: 'Fractions, Decimals & Approximations', weight: 3, bloom: 'apply' },
        { id: 'indices', name: 'Indices', weight: 4, bloom: 'apply' },
        { id: 'logarithms', name: 'Logarithms', weight: 4, bloom: 'apply' },
        { id: 'sequences_series', name: 'Sequences & Series (AP & GP)', weight: 4, bloom: 'apply' },
        { id: 'sets', name: 'Sets & Venn Diagrams', weight: 3, bloom: 'apply' },
        { id: 'logical_reasoning', name: 'Logical Reasoning', weight: 2, bloom: 'analyse' },
        { id: 'rational_nums', name: 'Positive/Negative Integers & Rational Numbers', weight: 2, bloom: 'apply' },
        { id: 'surds', name: 'Surds (Radicals)', weight: 3, bloom: 'apply' },
        { id: 'matrices', name: 'Matrices & Determinants', weight: 3, bloom: 'apply' },
        { id: 'ratio_proportion', name: 'Ratio, Proportion & Rates', weight: 3, bloom: 'apply' },
        { id: 'percentages', name: 'Percentages (incl. Interest, Discount, Hire Purchase)', weight: 4, bloom: 'apply' },
        { id: 'financial_arith', name: 'Financial Arithmetic (Depreciation, Annuities)', weight: 2, bloom: 'apply' },
        { id: 'variation', name: 'Variation (Direct, Inverse, Joint, Partial)', weight: 3, bloom: 'apply' },
      ]},
      { name: 'Algebraic Processes', topics: [
        { id: 'algebraic_expr', name: 'Algebraic Expressions', weight: 3, bloom: 'apply' },
        { id: 'expansion_factor', name: 'Expansion & Factorization', weight: 4, bloom: 'apply' },
        { id: 'linear_equations', name: 'Linear Equations (incl. Simultaneous)', weight: 4, bloom: 'apply' },
        { id: 'change_subject', name: 'Change of Subject of Formula', weight: 2, bloom: 'apply' },
        { id: 'quadratic', name: 'Quadratic Equations', weight: 5, bloom: 'apply' },
        { id: 'graphs_quad', name: 'Graphs of Linear & Quadratic Functions', weight: 3, bloom: 'analyse' },
        { id: 'linear_ineq', name: 'Linear Inequalities', weight: 3, bloom: 'apply' },
        { id: 'algebraic_frac', name: 'Algebraic Fractions', weight: 3, bloom: 'apply' },
        { id: 'functions_relations', name: 'Functions & Relations', weight: 2, bloom: 'understand' },
      ]},
      { name: 'Mensuration', topics: [
        { id: 'lengths_perimeters', name: 'Lengths & Perimeters (Pythagoras, Arcs, Lat/Long)', weight: 4, bloom: 'apply' },
        { id: 'areas', name: 'Areas (Triangles, Quadrilaterals, Circles, Surfaces)', weight: 4, bloom: 'apply' },
        { id: 'volumes', name: 'Volumes of Solids', weight: 3, bloom: 'apply' },
      ]},
      { name: 'Plane Geometry', topics: [
        { id: 'angles', name: 'Angles at a Point / Line', weight: 3, bloom: 'apply' },
        { id: 'parallel_lines', name: 'Angles & Intercepts on Parallel Lines', weight: 3, bloom: 'apply' },
        { id: 'triangles_poly', name: 'Triangles & Polygons', weight: 4, bloom: 'apply' },
        { id: 'circles', name: 'Circle Theorems', weight: 4, bloom: 'analyse' },
        { id: 'construction', name: 'Geometric Construction', weight: 2, bloom: 'apply' },
        { id: 'loci', name: 'Loci', weight: 2, bloom: 'apply' },
      ]},
      { name: 'Coordinate Geometry', topics: [
        { id: 'xy_plane', name: 'x-y Plane & Coordinates', weight: 3, bloom: 'apply' },
      ]},
      { name: 'Trigonometry', topics: [
        { id: 'sin_cos_tan', name: 'Sine, Cosine, Tangent of Angles', weight: 4, bloom: 'apply' },
        { id: 'elevation_depression', name: 'Angles of Elevation & Depression', weight: 3, bloom: 'apply' },
        { id: 'bearings', name: 'Bearings', weight: 3, bloom: 'apply' },
      ]},
      { name: 'Introductory Calculus', topics: [
        { id: 'differentiation', name: 'Differentiation of Algebraic Functions', weight: 3, bloom: 'apply' },
        { id: 'integration', name: 'Integration (Simple Algebraic)', weight: 2, bloom: 'apply' },
      ]},
      { name: 'Statistics & Probability', topics: [
        { id: 'statistics', name: 'Statistics (Mean, Median, Mode, Dispersion)', weight: 4, bloom: 'apply' },
        { id: 'probability', name: 'Probability', weight: 4, bloom: 'apply' },
      ]},
      { name: 'Vectors & Transformation', topics: [
        { id: 'vectors', name: 'Vectors in a Plane', weight: 2, bloom: 'apply' },
        { id: 'transformations', name: 'Transformations (Reflection, Rotation, Translation, Enlargement)', weight: 2, bloom: 'apply' },
      ]},
    ]
  },

  eng: { // English Language
    name: 'English Language',
    sections: [
      { name: 'Lexis (Vocabulary)', topics: [
        { id: 'everyday_vocab', name: 'Everyday Vocabulary (Home, School, Social)', weight: 3, bloom: 'recall' },
        { id: 'field_vocab_finance', name: 'Field Vocabulary: Finance, Commerce, Banking', weight: 2, bloom: 'recall' },
        { id: 'field_vocab_science', name: 'Field Vocabulary: Science & Technology', weight: 2, bloom: 'recall' },
        { id: 'field_vocab_transport', name: 'Field Vocabulary: Transport & Communication', weight: 2, bloom: 'recall' },
        { id: 'field_vocab_govt', name: 'Field Vocabulary: Government & Politics', weight: 2, bloom: 'recall' },
        { id: 'field_vocab_media', name: 'Field Vocabulary: Journalism & Advertising', weight: 2, bloom: 'recall' },
        { id: 'synonyms_antonyms', name: 'Synonyms & Antonyms', weight: 4, bloom: 'understand' },
        { id: 'idioms', name: 'Idioms & Idiomatic Expressions', weight: 4, bloom: 'understand' },
        { id: 'figurative_lang', name: 'Figurative Language (Metaphor, Simile, Personification)', weight: 3, bloom: 'analyse' },
      ]},
      { name: 'Structure (Grammar)', topics: [
        { id: 'tenses', name: 'Tenses & Sequence of Tenses', weight: 4, bloom: 'apply' },
        { id: 'concord', name: 'Subject-Verb Agreement (Concord)', weight: 4, bloom: 'apply' },
        { id: 'prepositions', name: 'Correct Use of Prepositions', weight: 4, bloom: 'apply' },
        { id: 'pronouns', name: 'Pronouns & Noun Referents', weight: 3, bloom: 'apply' },
        { id: 'articles', name: 'Articles & Determiners', weight: 3, bloom: 'apply' },
        { id: 'conjunctions', name: 'Conjunctions', weight: 3, bloom: 'apply' },
        { id: 'word_forms', name: 'Word Forms (Number, Tense, Degree)', weight: 3, bloom: 'apply' },
        { id: 'sentence_patterns', name: 'Sentence Patterns & Structures', weight: 3, bloom: 'apply' },
      ]},
      { name: 'Essay Writing', topics: [
        { id: 'essay_letter', name: 'Letter Writing (Formal, Informal, Semi-formal)', weight: 4, bloom: 'create' },
        { id: 'essay_speech', name: 'Speech Writing', weight: 3, bloom: 'create' },
        { id: 'essay_narrative', name: 'Narrative Essay', weight: 3, bloom: 'create' },
        { id: 'essay_descriptive', name: 'Descriptive Essay', weight: 3, bloom: 'create' },
        { id: 'essay_argumentative', name: 'Argumentative / Debate Essay', weight: 4, bloom: 'evaluate' },
        { id: 'essay_report', name: 'Report Writing', weight: 2, bloom: 'create' },
        { id: 'essay_article', name: 'Article Writing', weight: 3, bloom: 'create' },
        { id: 'essay_expository', name: 'Expository Essay', weight: 3, bloom: 'create' },
      ]},
      { name: 'Comprehension', topics: [
        { id: 'comp_factual', name: 'Factual Comprehension', weight: 4, bloom: 'understand' },
        { id: 'comp_inference', name: 'Inference & Implied Meaning', weight: 4, bloom: 'analyse' },
        { id: 'comp_tone', name: 'Tone, Mood & Attitude', weight: 3, bloom: 'analyse' },
        { id: 'comp_grammar', name: 'Grammatical Analysis (Phrases, Clauses, Functions)', weight: 3, bloom: 'analyse' },
        { id: 'comp_literary', name: 'Literary Terms in Passages', weight: 2, bloom: 'analyse' },
      ]},
      { name: 'Summary', topics: [
        { id: 'summary_extract', name: 'Extracting Relevant Points', weight: 4, bloom: 'analyse' },
        { id: 'summary_concise', name: 'Writing Concise Summaries', weight: 4, bloom: 'create' },
        { id: 'summary_avoid_redundancy', name: 'Avoiding Repetition & Redundancy', weight: 3, bloom: 'evaluate' },
      ]},
      { name: 'Oral English (Test of Orals)', topics: [
        { id: 'pure_vowels', name: 'Pure Vowels', weight: 4, bloom: 'recall' },
        { id: 'diphthongs', name: 'Diphthongs', weight: 4, bloom: 'recall' },
        { id: 'consonants', name: 'Single Consonants', weight: 3, bloom: 'recall' },
        { id: 'consonant_clusters', name: 'Consonant Clusters', weight: 3, bloom: 'recall' },
        { id: 'word_stress', name: 'Word Stress', weight: 4, bloom: 'apply' },
        { id: 'sentence_stress', name: 'Sentence Stress & Emphatic Stress', weight: 3, bloom: 'apply' },
        { id: 'intonation', name: 'Intonation Patterns', weight: 3, bloom: 'apply' },
        { id: 'rhymes', name: 'Rhymes', weight: 3, bloom: 'recall' },
        { id: 'phonetic_symbols', name: 'Phonetic Symbols', weight: 3, bloom: 'recall' },
      ]},
    ]
  },

  bio: { // Biology
    name: 'Biology',
    sections: [
      { name: 'Concept of Living', topics: [
        { id: 'classification', name: 'Classification of Living Things (Kingdoms)', weight: 4, bloom: 'understand' },
        { id: 'organization_of_life', name: 'Levels of Organization (Cell → Tissue → Organ → System)', weight: 3, bloom: 'understand' },
        { id: 'cell_structure', name: 'Cell Structure & Functions', weight: 5, bloom: 'understand' },
        { id: 'plant_vs_animal_cell', name: 'Plant vs Animal Cells', weight: 3, bloom: 'analyse' },
        { id: 'cell_environment', name: 'Diffusion, Osmosis, Active Transport', weight: 4, bloom: 'apply' },
        { id: 'nutrition_modes', name: 'Modes of Nutrition (Autotrophic, Heterotrophic)', weight: 3, bloom: 'understand' },
        { id: 'cellular_respiration', name: 'Cellular Respiration (Aerobic & Anaerobic)', weight: 4, bloom: 'understand' },
        { id: 'reproduction_cell', name: 'Reproduction (Asexual & Sexual)', weight: 3, bloom: 'understand' },
        { id: 'growth_movement', name: 'Growth, Development & Movement', weight: 2, bloom: 'understand' },
      ]},
      { name: 'Support, Transport & Respiration', topics: [
        { id: 'skeleton_support', name: 'Skeletons & Supporting Systems', weight: 3, bloom: 'understand' },
        { id: 'plant_support', name: 'Supporting Tissues in Plants', weight: 2, bloom: 'understand' },
        { id: 'transport_animals', name: 'Transport in Animals (Heart, Blood, Lymph)', weight: 4, bloom: 'understand' },
        { id: 'transport_plants', name: 'Transport in Plants (Xylem, Phloem, Transpiration)', weight: 4, bloom: 'understand' },
        { id: 'respiratory_system', name: 'Respiratory System (Gills, Lungs, Cutaneous)', weight: 4, bloom: 'understand' },
      ]},
      { name: 'Excretion & Coordination', topics: [
        { id: 'excretion', name: 'Excretory Systems (Kidney, Stomata, Lenticels)', weight: 3, bloom: 'understand' },
        { id: 'homeostasis', name: 'Homeostasis (Kidney, Liver, Skin)', weight: 4, bloom: 'analyse' },
        { id: 'hormonal_coord', name: 'Hormonal Coordination (Animal & Plant Hormones)', weight: 3, bloom: 'understand' },
        { id: 'nervous_system', name: 'Nervous Coordination (Brain, Spinal Cord, Neurones)', weight: 4, bloom: 'understand' },
        { id: 'reflex_actions', name: 'Reflex & Voluntary Actions', weight: 3, bloom: 'understand' },
        { id: 'sense_organs', name: 'Sense Organs (Eye, Ear)', weight: 3, bloom: 'understand' },
      ]},
      { name: 'Reproduction', topics: [
        { id: 'mammalian_reproduction', name: 'Mammalian Reproductive Systems', weight: 4, bloom: 'understand' },
        { id: 'metamorphosis', name: 'Metamorphosis (Butterfly, Cockroach)', weight: 2, bloom: 'understand' },
        { id: 'flower_reproduction', name: 'Reproduction in Flowering Plants', weight: 4, bloom: 'understand' },
        { id: 'pollination', name: 'Pollination (Types, Agents)', weight: 3, bloom: 'understand' },
        { id: 'seed_dispersal', name: 'Fruit & Seed Dispersal', weight: 2, bloom: 'understand' },
      ]},
      { name: 'Nutrition', topics: [
        { id: 'photosynthesis', name: 'Photosynthesis', weight: 5, bloom: 'understand' },
        { id: 'mineral_nutrition', name: 'Mineral Nutrition in Plants', weight: 3, bloom: 'understand' },
        { id: 'food_substances', name: 'Food Classes & Balanced Diet', weight: 4, bloom: 'understand' },
        { id: 'food_tests', name: 'Food Tests', weight: 3, bloom: 'apply' },
        { id: 'digestive_enzymes', name: 'Digestive Enzymes', weight: 3, bloom: 'understand' },
        { id: 'alimentary_system', name: 'Alimentary System & Dental Formula', weight: 3, bloom: 'understand' },
      ]},
      { name: 'Ecology', topics: [
        { id: 'ecosystem', name: 'Ecosystem Components (Biotic/Abiotic)', weight: 4, bloom: 'understand' },
        { id: 'ecological_factors', name: 'Ecological Factors (Aquatic, Terrestrial)', weight: 3, bloom: 'understand' },
        { id: 'food_webs', name: 'Food Chains, Food Webs, Trophic Levels', weight: 4, bloom: 'analyse' },
        { id: 'energy_flow', name: 'Energy Flow & Pyramids', weight: 3, bloom: 'analyse' },
        { id: 'decomposition', name: 'Decomposition & Decomposers', weight: 2, bloom: 'understand' },
        { id: 'biological_assoc', name: 'Biological Associations (Parasitism, Symbiosis, Commensalism)', weight: 3, bloom: 'understand' },
        { id: 'adaptation', name: 'Adaptation of Organisms to Habitats', weight: 3, bloom: 'analyse' },
        { id: 'pollution', name: 'Air, Water & Soil Pollution', weight: 4, bloom: 'evaluate' },
        { id: 'succession', name: 'Ecological Succession', weight: 2, bloom: 'understand' },
      ]},
      { name: 'Microorganisms & Health', topics: [
        { id: 'microorganisms', name: 'Microorganisms & Their Effects', weight: 4, bloom: 'understand' },
        { id: 'diseases', name: 'Diseases Caused by Microorganisms', weight: 4, bloom: 'recall' },
        { id: 'public_health', name: 'Public Health (Immunization, Refuse Disposal)', weight: 3, bloom: 'understand' },
      ]},
      { name: 'Conservation & Variation', topics: [
        { id: 'conservation', name: 'Conservation of Natural Resources', weight: 2, bloom: 'evaluate' },
        { id: 'variation', name: 'Morphological & Physiological Variation', weight: 2, bloom: 'understand' },
      ]},
      { name: 'Genetics & Evolution', topics: [
        { id: 'genetic_terms', name: 'Genetic Terminologies', weight: 3, bloom: 'recall' },
        { id: 'mendel_laws', name: "Mendel's Laws of Inheritance", weight: 4, bloom: 'apply' },
        { id: 'chromosomes', name: 'Chromosomes & Heredity', weight: 3, bloom: 'understand' },
        { id: 'probability_genetics', name: 'Probability in Genetics', weight: 3, bloom: 'apply' },
        { id: 'sex_linkage', name: 'Sex Determination & Sex-Linked Traits', weight: 3, bloom: 'apply' },
        { id: 'evolution', name: 'Evolution & Evidence', weight: 3, bloom: 'understand' },
      ]},
    ]
  },

  chm: { // Chemistry
    name: 'Chemistry',
    sections: [
      { name: 'Chemistry Fundamentals', topics: [
        { id: 'standards_measurement', name: 'Standards of Measurement & Calculations', weight: 2, bloom: 'apply' },
        { id: 'matter_states', name: 'States of Matter', weight: 3, bloom: 'understand' },
        { id: 'atomic_structure', name: 'Atomic Structure & Bonding', weight: 5, bloom: 'understand' },
        { id: 'periodic_table', name: 'Periodic Table & Periodicity', weight: 4, bloom: 'analyse' },
        { id: 'chem_bonding', name: 'Chemical Bonding (Ionic, Covalent, Metallic)', weight: 4, bloom: 'understand' },
        { id: 'stoichiometry', name: 'Stoichiometry & Mole Concept', weight: 5, bloom: 'apply' },
        { id: 'chem_equations', name: 'Writing & Balancing Chemical Equations', weight: 4, bloom: 'apply' },
      ]},
      { name: 'Physical Chemistry', topics: [
        { id: 'gas_laws', name: 'Gas Laws (Boyle, Charles, Ideal)', weight: 4, bloom: 'apply' },
        { id: 'solutions', name: 'Solutions, Solubility & Concentration', weight: 4, bloom: 'apply' },
        { id: 'acids_bases_salts', name: 'Acids, Bases & Salts (incl. pH)', weight: 5, bloom: 'apply' },
        { id: 'redox', name: 'Oxidation-Reduction (Redox) Reactions', weight: 4, bloom: 'apply' },
        { id: 'electrolysis', name: 'Electrolysis & Electrochemistry', weight: 4, bloom: 'apply' },
        { id: 'energy_changes', name: 'Energy Changes (Endothermic/Exothermic)', weight: 3, bloom: 'understand' },
        { id: 'rates_equilibrium', name: 'Rates of Reaction & Chemical Equilibrium', weight: 4, bloom: 'analyse' },
        { id: 'water', name: 'Water (Types, Hardness, Treatment)', weight: 3, bloom: 'understand' },
      ]},
      { name: 'Inorganic Chemistry', topics: [
        { id: 'air_gases', name: 'Air & Its Gases (O₂, N₂, CO₂, Noble Gases)', weight: 3, bloom: 'understand' },
        { id: 'hydrogen', name: 'Hydrogen & Its Compounds', weight: 3, bloom: 'understand' },
        { id: 'halogens', name: 'Halogens (Group VII)', weight: 3, bloom: 'understand' },
        { id: 'sulphur_compounds', name: 'Sulphur & Its Compounds', weight: 3, bloom: 'understand' },
        { id: 'nitrogen_compounds', name: 'Nitrogen & Its Compounds (NH₃, HNO₃)', weight: 3, bloom: 'understand' },
        { id: 'metals', name: 'Metals (Na, Mg, Al, Ca, Fe)', weight: 3, bloom: 'understand' },
        { id: 'extraction_metals', name: 'Extraction of Metals', weight: 3, bloom: 'understand' },
        { id: 'qualitative_analysis', name: 'Qualitative Analysis (Tests for Ions)', weight: 4, bloom: 'apply' },
      ]},
      { name: 'Organic Chemistry', topics: [
        { id: 'alkanes', name: 'Alkanes', weight: 4, bloom: 'apply' },
        { id: 'alkenes_alkynes', name: 'Alkenes & Alkynes', weight: 4, bloom: 'apply' },
        { id: 'alkanols', name: 'Alkanols (Alcohols)', weight: 4, bloom: 'apply' },
        { id: 'alkanoic_acids', name: 'Alkanoic Acids (Carboxylic Acids)', weight: 3, bloom: 'apply' },
        { id: 'alkyl_alkanoates', name: 'Alkyl Alkanoates (Esters)', weight: 3, bloom: 'apply' },
        { id: 'benzene', name: 'Benzene & Aromatic Compounds', weight: 2, bloom: 'understand' },
        { id: 'polymers', name: 'Polymers (Natural & Synthetic)', weight: 3, bloom: 'understand' },
        { id: 'carbohydrates', name: 'Carbohydrates, Proteins & Fats', weight: 3, bloom: 'understand' },
        { id: 'soap_detergents', name: 'Soap & Detergents', weight: 2, bloom: 'understand' },
      ]},
      { name: 'Industrial & Environmental Chemistry', topics: [
        { id: 'industrial_chem', name: 'Industrial Chemistry (Haber, Contact, Solvay)', weight: 3, bloom: 'understand' },
        { id: 'environmental_chem', name: 'Environmental Chemistry & Pollution', weight: 3, bloom: 'evaluate' },
        { id: 'petroleum', name: 'Petroleum (Refining, Fractions)', weight: 3, bloom: 'understand' },
      ]},
    ]
  },

  phy: { // Physics
    name: 'Physics',
    sections: [
      { name: 'Measurement & Mechanics', topics: [
        { id: 'phy_measurement', name: 'Measurement & Units (SI, Scalar, Vector)', weight: 4, bloom: 'apply' },
        { id: 'motion', name: 'Motion (Linear, Projectile, Circular)', weight: 5, bloom: 'apply' },
        { id: 'newton_laws', name: "Newton's Laws of Motion", weight: 5, bloom: 'apply' },
        { id: 'momentum', name: 'Momentum & Impulse', weight: 4, bloom: 'apply' },
        { id: 'equilibrium', name: 'Equilibrium of Forces (Moments, Centre of Gravity)', weight: 4, bloom: 'apply' },
        { id: 'work_energy_power', name: 'Work, Energy & Power', weight: 5, bloom: 'apply' },
        { id: 'machines', name: 'Simple Machines (Lever, Pulley, Incline)', weight: 3, bloom: 'apply' },
        { id: 'friction', name: 'Friction', weight: 3, bloom: 'apply' },
        { id: 'elasticity', name: "Elasticity & Hooke's Law", weight: 3, bloom: 'apply' },
        { id: 'density_pressure', name: 'Density & Pressure', weight: 4, bloom: 'apply' },
      ]},
      { name: 'Heat', topics: [
        { id: 'temperature', name: 'Temperature Measurement', weight: 2, bloom: 'apply' },
        { id: 'heat_transfer', name: 'Heat Transfer (Conduction, Convection, Radiation)', weight: 3, bloom: 'understand' },
        { id: 'expansion', name: 'Thermal Expansion of Solids, Liquids, Gases', weight: 3, bloom: 'apply' },
        { id: 'heat_capacity', name: 'Heat Capacity & Specific Heat', weight: 4, bloom: 'apply' },
        { id: 'latent_heat', name: 'Latent Heat & Change of State', weight: 3, bloom: 'apply' },
        { id: 'gas_laws_phy', name: 'Gas Laws (Boyle, Charles, Combined)', weight: 3, bloom: 'apply' },
      ]},
      { name: 'Waves & Sound', topics: [
        { id: 'wave_properties', name: 'Wave Properties (Reflection, Refraction, Diffraction, Interference)', weight: 4, bloom: 'understand' },
        { id: 'sound_waves', name: 'Sound Waves (Pitch, Loudness, Quality)', weight: 3, bloom: 'understand' },
        { id: 'resonance', name: 'Resonance & Vibrations in Strings/Pipes', weight: 3, bloom: 'apply' },
      ]},
      { name: 'Light', topics: [
        { id: 'light_reflection', name: 'Reflection of Light (Plane & Curved Mirrors)', weight: 4, bloom: 'apply' },
        { id: 'light_refraction', name: 'Refraction of Light (Prisms, Lenses, Total Internal Reflection)', weight: 5, bloom: 'apply' },
        { id: 'optical_instruments', name: 'Optical Instruments (Camera, Microscope, Telescope)', weight: 3, bloom: 'understand' },
        { id: 'dispersion', name: 'Dispersion of Light & Colour', weight: 2, bloom: 'understand' },
      ]},
      { name: 'Electricity & Magnetism', topics: [
        { id: 'electrostatics', name: 'Electrostatics (Charges, Fields)', weight: 3, bloom: 'understand' },
        { id: 'current_electricity', name: "Current Electricity & Ohm's Law", weight: 5, bloom: 'apply' },
        { id: 'resistance_circuits', name: 'Resistance & Circuits (Series, Parallel)', weight: 5, bloom: 'apply' },
        { id: 'electrical_energy', name: 'Electrical Energy & Power', weight: 4, bloom: 'apply' },
        { id: 'magnetism', name: 'Magnetism & Magnetic Fields', weight: 3, bloom: 'understand' },
        { id: 'electromagnetism', name: 'Electromagnetism (Motors, Generators, Transformers)', weight: 4, bloom: 'understand' },
        { id: 'electromagnetic_induction', name: 'Electromagnetic Induction', weight: 3, bloom: 'apply' },
      ]},
      { name: 'Modern Physics', topics: [
        { id: 'atomic_physics', name: 'Atomic Structure & Models', weight: 3, bloom: 'understand' },
        { id: 'radioactivity', name: 'Radioactivity (Alpha, Beta, Gamma, Half-Life)', weight: 4, bloom: 'apply' },
        { id: 'electronics_basics', name: 'Basic Electronics (Diodes, Transistors)', weight: 2, bloom: 'understand' },
        { id: 'photoelectric', name: 'Photoelectric Effect', weight: 2, bloom: 'understand' },
      ]},
    ]
  },

  eco: { // Economics
    name: 'Economics',
    sections: [
      { name: 'Basic Concepts', topics: [
        { id: 'eco_meaning', name: 'Meaning, Scope & Importance of Economics', weight: 3, bloom: 'understand' },
        { id: 'eco_basic_problems', name: 'Basic Economic Problems (Scarcity, Choice, Opportunity Cost)', weight: 4, bloom: 'understand' },
        { id: 'production_concept', name: 'Production (Factors, Types)', weight: 4, bloom: 'understand' },
      ]},
      { name: 'Demand, Supply & Price', topics: [
        { id: 'demand', name: 'Demand (Law, Determinants, Elasticity)', weight: 5, bloom: 'apply' },
        { id: 'supply', name: 'Supply (Law, Determinants, Elasticity)', weight: 5, bloom: 'apply' },
        { id: 'price_determination', name: 'Price Determination (Equilibrium)', weight: 5, bloom: 'apply' },
        { id: 'price_control', name: 'Price Control & Rationing', weight: 3, bloom: 'understand' },
      ]},
      { name: 'Money, Banking & Public Finance', topics: [
        { id: 'money', name: 'Money (Functions, Types)', weight: 3, bloom: 'understand' },
        { id: 'banking', name: 'Banking (Commercial Banks, Central Bank)', weight: 4, bloom: 'understand' },
        { id: 'inflation', name: 'Inflation & Deflation', weight: 4, bloom: 'analyse' },
        { id: 'public_finance', name: 'Public Finance (Taxation, Budget)', weight: 4, bloom: 'understand' },
        { id: 'national_income', name: 'National Income (GDP, GNP, Per Capita)', weight: 4, bloom: 'apply' },
      ]},
      { name: 'Labour & Population', topics: [
        { id: 'population_eco', name: 'Population (Size, Structure, Effects)', weight: 4, bloom: 'analyse' },
        { id: 'labour_market', name: 'Labour Market & Unemployment', weight: 4, bloom: 'analyse' },
        { id: 'wages', name: 'Wage Determination', weight: 3, bloom: 'understand' },
      ]},
      { name: 'Agriculture & Industry', topics: [
        { id: 'agriculture_nigeria', name: 'Agriculture in Nigeria (Systems, Problems)', weight: 4, bloom: 'analyse' },
        { id: 'industrialization', name: 'Industrialization (Types, Location Factors)', weight: 3, bloom: 'understand' },
        { id: 'business_org', name: 'Business Organizations (Sole, Partnership, Ltd, Public)', weight: 4, bloom: 'understand' },
      ]},
      { name: 'International Economics', topics: [
        { id: 'international_trade', name: 'International Trade (Exports, Imports, BoP)', weight: 4, bloom: 'analyse' },
        { id: 'economic_integration', name: 'Economic Integration (ECOWAS, AU)', weight: 3, bloom: 'understand' },
        { id: 'development_planning', name: 'Economic Development & Planning', weight: 3, bloom: 'analyse' },
        { id: 'foreign_exchange', name: 'Foreign Exchange & Exchange Rates', weight: 3, bloom: 'understand' },
      ]},
      { name: 'Nigerian Economy', topics: [
        { id: 'petroleum_nigeria', name: 'Petroleum & the Nigerian Economy', weight: 3, bloom: 'analyse' },
        { id: 'economic_policies', name: 'Economic Policies (SAP, NEEDS, ERGP)', weight: 3, bloom: 'analyse' },
      ]},
    ]
  },

  gov: { // Government
    name: 'Government',
    sections: [
      { name: 'Basic Concepts', topics: [
        { id: 'gov_meaning', name: 'Meaning & Scope of Government', weight: 3, bloom: 'understand' },
        { id: 'state_nation', name: 'State, Nation, Society & Sovereignty', weight: 4, bloom: 'understand' },
        { id: 'power_authority', name: 'Power, Authority & Legitimacy', weight: 4, bloom: 'understand' },
        { id: 'political_culture', name: 'Political Culture & Socialization', weight: 3, bloom: 'understand' },
      ]},
      { name: 'Political Ideologies & Systems', topics: [
        { id: 'democracy', name: 'Democracy (Types, Features)', weight: 5, bloom: 'analyse' },
        { id: 'totalitarianism', name: 'Totalitarianism, Fascism, Communism', weight: 3, bloom: 'analyse' },
        { id: 'capitalism_socialism', name: 'Capitalism & Socialism', weight: 3, bloom: 'analyse' },
        { id: 'feudalism', name: 'Feudalism', weight: 2, bloom: 'understand' },
      ]},
      { name: 'Systems of Government', topics: [
        { id: 'unitary_federal', name: 'Unitary & Federal Systems', weight: 4, bloom: 'analyse' },
        { id: 'confederation', name: 'Confederation', weight: 2, bloom: 'understand' },
        { id: 'presidential_parliamentary', name: 'Presidential & Parliamentary Systems', weight: 5, bloom: 'analyse' },
        { id: 'monarchy', name: 'Monarchy (Absolute, Constitutional)', weight: 2, bloom: 'understand' },
      ]},
      { name: 'Organs of Government', topics: [
        { id: 'legislature', name: 'The Legislature (Structure, Functions)', weight: 5, bloom: 'understand' },
        { id: 'executive', name: 'The Executive (Structure, Functions)', weight: 5, bloom: 'understand' },
        { id: 'judiciary', name: 'The Judiciary (Courts, Functions)', weight: 5, bloom: 'understand' },
        { id: 'separation_powers', name: 'Separation of Powers & Checks and Balances', weight: 4, bloom: 'analyse' },
        { id: 'civil_service', name: 'The Civil Service', weight: 3, bloom: 'understand' },
      ]},
      { name: 'Rights & Constitutions', topics: [
        { id: 'fundamental_rights', name: 'Fundamental Human Rights', weight: 4, bloom: 'understand' },
        { id: 'constitution_types', name: 'Types of Constitution (Written, Unwritten, Rigid, Flexible)', weight: 4, bloom: 'analyse' },
        { id: 'rule_of_law', name: 'Rule of Law', weight: 4, bloom: 'understand' },
        { id: 'citizenship', name: 'Citizenship (Acquisition & Loss)', weight: 3, bloom: 'understand' },
      ]},
      { name: 'Elections & Political Parties', topics: [
        { id: 'elections', name: 'Elections & Electoral Systems', weight: 5, bloom: 'analyse' },
        { id: 'political_parties', name: 'Political Parties (Types, Functions)', weight: 4, bloom: 'understand' },
        { id: 'pressure_groups', name: 'Pressure Groups', weight: 3, bloom: 'understand' },
        { id: 'public_opinion', name: 'Public Opinion & Mass Media', weight: 3, bloom: 'analyse' },
      ]},
      { name: 'Nigerian Government & Politics', topics: [
        { id: 'precolonial_nigeria', name: 'Pre-Colonial Nigerian Political Systems (Hausa-Fulani, Yoruba, Igbo)', weight: 4, bloom: 'understand' },
        { id: 'colonial_nigeria', name: 'Colonial Administration in Nigeria (Indirect Rule, Constitutions)', weight: 5, bloom: 'analyse' },
        { id: 'independence_movement', name: 'Nationalism & Independence', weight: 4, bloom: 'understand' },
        { id: 'first_republic', name: 'First Republic (1960-1966)', weight: 4, bloom: 'understand' },
        { id: 'military_rule', name: 'Military Rule in Nigeria', weight: 4, bloom: 'analyse' },
        { id: 'second_republic', name: 'Second Republic (1979-1983)', weight: 3, bloom: 'understand' },
        { id: 'fourth_republic', name: 'Fourth Republic (1999-present)', weight: 4, bloom: 'analyse' },
        { id: 'federalism_nigeria', name: 'Federalism in Nigeria', weight: 4, bloom: 'analyse' },
        { id: 'local_government', name: 'Local Government in Nigeria', weight: 3, bloom: 'understand' },
      ]},
      { name: 'International Relations', topics: [
        { id: 'foreign_policy', name: "Nigeria's Foreign Policy", weight: 3, bloom: 'analyse' },
        { id: 'un_au_ecowas', name: 'UN, AU, ECOWAS, Commonwealth', weight: 4, bloom: 'understand' },
      ]},
    ]
  },

  lit: { // Literature in English
    name: 'Literature in English',
    sections: [
      { name: 'Literary Terms & Devices', topics: [
        { id: 'lit_devices', name: 'Literary Devices (Metaphor, Simile, Irony, etc.)', weight: 5, bloom: 'analyse' },
        { id: 'figures_speech', name: 'Figures of Speech', weight: 4, bloom: 'analyse' },
        { id: 'lit_genres', name: 'Literary Genres (Drama, Prose, Poetry)', weight: 3, bloom: 'understand' },
        { id: 'themes_subject', name: 'Themes & Subject Matter', weight: 4, bloom: 'analyse' },
      ]},
      { name: 'Drama', topics: [
        { id: 'drama_types', name: 'Types of Drama (Tragedy, Comedy, Tragicomedy)', weight: 3, bloom: 'understand' },
        { id: 'drama_elements', name: 'Elements of Drama (Plot, Character, Setting)', weight: 4, bloom: 'analyse' },
        { id: 'african_drama', name: 'Prescribed African Drama Text', weight: 5, bloom: 'analyse' },
        { id: 'non_african_drama', name: 'Prescribed Non-African Drama Text', weight: 5, bloom: 'analyse' },
        { id: 'shakespeare', name: 'Shakespearean Drama', weight: 4, bloom: 'analyse' },
      ]},
      { name: 'Prose', topics: [
        { id: 'prose_types', name: 'Types of Prose (Novel, Novella, Short Story)', weight: 3, bloom: 'understand' },
        { id: 'prose_elements', name: 'Elements of Prose (Plot, Character, Narrative Technique)', weight: 4, bloom: 'analyse' },
        { id: 'african_prose', name: 'Prescribed African Prose Text', weight: 5, bloom: 'analyse' },
        { id: 'non_african_prose', name: 'Prescribed Non-African Prose Text', weight: 5, bloom: 'analyse' },
      ]},
      { name: 'Poetry', topics: [
        { id: 'poetry_elements', name: 'Elements of Poetry (Rhyme, Meter, Form)', weight: 4, bloom: 'analyse' },
        { id: 'african_poetry', name: 'Prescribed African Poetry', weight: 5, bloom: 'analyse' },
        { id: 'non_african_poetry', name: 'Prescribed Non-African Poetry', weight: 5, bloom: 'analyse' },
        { id: 'sonnet', name: 'The Sonnet', weight: 2, bloom: 'analyse' },
      ]},
      { name: 'Unseen Passages', topics: [
        { id: 'unseen_prose', name: 'Unseen Prose Analysis', weight: 3, bloom: 'analyse' },
        { id: 'unseen_poetry', name: 'Unseen Poetry Analysis', weight: 3, bloom: 'analyse' },
      ]},
    ]
  },

  agr: { // Agricultural Science
    name: 'Agricultural Science',
    sections: [
      { name: 'Introduction to Agriculture', topics: [
        { id: 'agr_meaning', name: 'Meaning, Scope & Importance of Agriculture', weight: 3, bloom: 'understand' },
        { id: 'agr_branches', name: 'Branches of Agriculture', weight: 3, bloom: 'understand' },
        { id: 'agr_systems', name: 'Agricultural Systems (Subsistence, Commercial, Mixed)', weight: 4, bloom: 'analyse' },
        { id: 'agr_problems_nigeria', name: 'Problems of Agriculture in Nigeria', weight: 4, bloom: 'evaluate' },
      ]},
      { name: 'Agricultural Ecology', topics: [
        { id: 'land_types', name: 'Land, Soil & Water', weight: 4, bloom: 'understand' },
        { id: 'soil_formation', name: 'Soil Formation, Composition & Types', weight: 5, bloom: 'understand' },
        { id: 'soil_fertility', name: 'Soil Fertility & Management', weight: 5, bloom: 'apply' },
        { id: 'soil_conservation', name: 'Soil Conservation', weight: 3, bloom: 'evaluate' },
        { id: 'climate_agr', name: 'Climate & Weather in Agriculture', weight: 3, bloom: 'analyse' },
      ]},
      { name: 'Crop Production', topics: [
        { id: 'crop_classification', name: 'Classification of Crops', weight: 3, bloom: 'understand' },
        { id: 'crop_husbandry', name: 'Crop Husbandry (Land Prep, Planting, Cultural Practices)', weight: 5, bloom: 'apply' },
        { id: 'weed_control', name: 'Weed Control', weight: 3, bloom: 'apply' },
        { id: 'pest_disease', name: 'Crop Pests & Diseases', weight: 4, bloom: 'apply' },
        { id: 'harvesting_storage', name: 'Harvesting, Processing & Storage', weight: 3, bloom: 'apply' },
      ]},
      { name: 'Animal Production', topics: [
        { id: 'farm_animals', name: 'Classification & Characteristics of Farm Animals', weight: 4, bloom: 'understand' },
        { id: 'animal_nutrition', name: 'Animal Nutrition & Feeds', weight: 4, bloom: 'apply' },
        { id: 'animal_reproduction', name: 'Animal Reproduction', weight: 3, bloom: 'understand' },
        { id: 'animal_diseases', name: 'Animal Diseases & Parasites', weight: 4, bloom: 'apply' },
        { id: 'livestock_mgmt', name: 'Livestock Management (Poultry, Cattle, Small Ruminants)', weight: 4, bloom: 'apply' },
      ]},
      { name: 'Agricultural Economics & Extension', topics: [
        { id: 'farm_records', name: 'Farm Records & Accounts', weight: 3, bloom: 'apply' },
        { id: 'agr_marketing', name: 'Agricultural Marketing', weight: 3, bloom: 'understand' },
        { id: 'agr_finance', name: 'Sources of Farm Finance', weight: 3, bloom: 'understand' },
        { id: 'agr_extension', name: 'Agricultural Extension', weight: 3, bloom: 'understand' },
        { id: 'land_tenure', name: 'Land Tenure Systems in Nigeria', weight: 3, bloom: 'analyse' },
        { id: 'cooperatives', name: 'Agricultural Cooperatives', weight: 2, bloom: 'understand' },
      ]},
      { name: 'Forestry & Fisheries', topics: [
        { id: 'forestry', name: 'Forestry & Wildlife', weight: 2, bloom: 'understand' },
        { id: 'fisheries', name: 'Fisheries & Aquaculture', weight: 3, bloom: 'understand' },
      ]},
    ]
  },

  crs: { // Christian Religious Studies
    name: 'Christian Religious Studies',
    sections: [
      { name: 'Old Testament', topics: [
        { id: 'creation_fall', name: 'Creation & the Fall', weight: 3, bloom: 'understand' },
        { id: 'patriarchs', name: 'The Patriarchs (Abraham, Isaac, Jacob, Joseph)', weight: 4, bloom: 'understand' },
        { id: 'moses_exodus', name: 'Moses & the Exodus', weight: 4, bloom: 'understand' },
        { id: 'ten_commandments', name: 'The Ten Commandments & Covenant', weight: 4, bloom: 'analyse' },
        { id: 'judges', name: 'The Judges of Israel', weight: 2, bloom: 'understand' },
        { id: 'samuel_saul_david', name: 'Samuel, Saul & David', weight: 3, bloom: 'understand' },
        { id: 'solomon', name: 'King Solomon', weight: 3, bloom: 'understand' },
        { id: 'divided_kingdom', name: 'Divided Kingdom (Israel & Judah)', weight: 2, bloom: 'understand' },
        { id: 'prophets_major', name: 'Major Prophets (Isaiah, Jeremiah, Ezekiel, Daniel)', weight: 4, bloom: 'analyse' },
        { id: 'prophets_minor', name: 'Minor Prophets (Amos, Hosea, etc.)', weight: 3, bloom: 'analyse' },
      ]},
      { name: 'New Testament: Gospels', topics: [
        { id: 'jesus_birth', name: 'Birth & Early Life of Jesus', weight: 3, bloom: 'understand' },
        { id: 'jesus_ministry', name: 'Ministry of Jesus (Teachings, Parables)', weight: 5, bloom: 'analyse' },
        { id: 'jesus_miracles', name: 'Miracles of Jesus', weight: 4, bloom: 'analyse' },
        { id: 'sermon_mount', name: 'Sermon on the Mount', weight: 4, bloom: 'analyse' },
        { id: 'passion_crucifixion', name: 'Passion, Crucifixion & Resurrection', weight: 5, bloom: 'analyse' },
      ]},
      { name: 'Early Church (Acts)', topics: [
        { id: 'pentecost', name: 'Day of Pentecost & Early Church', weight: 4, bloom: 'understand' },
        { id: 'peter_ministry', name: "Peter's Ministry", weight: 3, bloom: 'understand' },
        { id: 'paul_conversion', name: "Paul's Conversion & Missionary Journeys", weight: 4, bloom: 'analyse' },
        { id: 'jerusalem_council', name: 'The Council of Jerusalem', weight: 2, bloom: 'understand' },
      ]},
      { name: 'Epistles', topics: [
        { id: 'pauline_epistles', name: 'Pauline Epistles (Romans, Corinthians, Galatians)', weight: 4, bloom: 'analyse' },
        { id: 'pastoral_epistles', name: 'Pastoral & General Epistles', weight: 3, bloom: 'analyse' },
      ]},
      { name: 'Christian Living', topics: [
        { id: 'love_faith_hope', name: 'Love, Faith & Hope', weight: 3, bloom: 'evaluate' },
        { id: 'christian_ethics', name: 'Christian Ethics & Morality', weight: 4, bloom: 'evaluate' },
        { id: 'forgiveness_reconciliation', name: 'Forgiveness & Reconciliation', weight: 3, bloom: 'evaluate' },
        { id: 'stewardship', name: 'Stewardship', weight: 3, bloom: 'evaluate' },
        { id: 'marriage_family', name: 'Marriage & Family Life', weight: 3, bloom: 'evaluate' },
      ]},
    ]
  },

  his: { // History
    name: 'History',
    sections: [
      { name: 'Pre-Colonial Nigeria', topics: [
        { id: 'peoples_origins', name: 'Origins of Nigerian Peoples', weight: 4, bloom: 'understand' },
        { id: 'hausa_states', name: 'The Hausa States & Kanem-Bornu', weight: 4, bloom: 'analyse' },
        { id: 'yoruba_kingdoms', name: 'Yoruba Kingdoms (Oyo, Ife, Benin)', weight: 4, bloom: 'analyse' },
        { id: 'igbo_society', name: 'Igbo Society & Political Organization', weight: 4, bloom: 'analyse' },
        { id: 'sokoto_caliphate', name: 'The Sokoto Caliphate (Jihad of Usman dan Fodio)', weight: 4, bloom: 'analyse' },
        { id: 'trans_saharan_trade', name: 'Trans-Saharan Trade', weight: 3, bloom: 'analyse' },
        { id: 'trans_atlantic_slave', name: 'Trans-Atlantic Slave Trade', weight: 4, bloom: 'evaluate' },
      ]},
      { name: 'Colonial Nigeria', topics: [
        { id: 'european_contact', name: 'European Contact with West Africa', weight: 3, bloom: 'understand' },
        { id: 'british_conquest', name: 'British Conquest & Colonization', weight: 4, bloom: 'analyse' },
        { id: 'indirect_rule', name: 'Indirect Rule in Nigeria', weight: 5, bloom: 'analyse' },
        { id: 'amalgamation_1914', name: 'Amalgamation of 1914', weight: 4, bloom: 'analyse' },
        { id: 'colonial_economy', name: 'Colonial Economic Policies', weight: 3, bloom: 'evaluate' },
        { id: 'colonial_education', name: 'Colonial Education & Missionaries', weight: 3, bloom: 'analyse' },
        { id: 'nationalism_nigeria', name: 'Rise of Nationalism', weight: 4, bloom: 'analyse' },
        { id: 'colonial_constitutions', name: 'Colonial Constitutions (Clifford, Richards, Macpherson, Lyttleton)', weight: 4, bloom: 'analyse' },
      ]},
      { name: 'Post-Independence Nigeria', topics: [
        { id: 'independence', name: 'Independence (1960)', weight: 3, bloom: 'understand' },
        { id: 'first_republic_his', name: 'First Republic (1960-1966)', weight: 4, bloom: 'analyse' },
        { id: 'civil_war', name: 'The Nigerian Civil War (1967-1970)', weight: 5, bloom: 'evaluate' },
        { id: 'military_regimes', name: 'Military Regimes', weight: 4, bloom: 'analyse' },
        { id: 'second_republic_his', name: 'Second Republic (1979-1983)', weight: 3, bloom: 'understand' },
      ]},
      { name: 'West African History', topics: [
        { id: 'ghana_empire', name: 'Ancient Ghana Empire', weight: 3, bloom: 'analyse' },
        { id: 'mali_empire', name: 'Mali Empire (Sundiata, Mansa Musa)', weight: 3, bloom: 'analyse' },
        { id: 'songhai', name: 'Songhai Empire', weight: 3, bloom: 'analyse' },
        { id: 'asante', name: 'The Asante Kingdom', weight: 3, bloom: 'analyse' },
      ]},
    ]
  },

  geo: { // Geography
    name: 'Geography',
    sections: [
      { name: 'Physical Geography', topics: [
        { id: 'earth_solar', name: 'Earth & Solar System', weight: 3, bloom: 'understand' },
        { id: 'rotation_revolution', name: "Earth's Rotation & Revolution", weight: 3, bloom: 'apply' },
        { id: 'latitude_longitude', name: 'Latitude, Longitude & Time', weight: 4, bloom: 'apply' },
        { id: 'rocks', name: 'Rocks (Igneous, Sedimentary, Metamorphic)', weight: 4, bloom: 'understand' },
        { id: 'weathering', name: 'Weathering', weight: 3, bloom: 'understand' },
        { id: 'landforms', name: 'Landforms (Mountains, Plains, Plateaus)', weight: 4, bloom: 'analyse' },
        { id: 'drainage', name: 'Drainage Systems & Rivers', weight: 4, bloom: 'analyse' },
        { id: 'coastal_features', name: 'Coastal Features', weight: 3, bloom: 'understand' },
        { id: 'climate', name: 'Climate Elements & Types', weight: 5, bloom: 'analyse' },
        { id: 'vegetation', name: 'Vegetation Belts', weight: 4, bloom: 'understand' },
      ]},
      { name: 'Map Reading', topics: [
        { id: 'map_scale', name: 'Map Scale & Distances', weight: 4, bloom: 'apply' },
        { id: 'map_reading_general', name: 'Map Reading & Interpretation', weight: 5, bloom: 'apply' },
        { id: 'contours', name: 'Contours & Relief', weight: 4, bloom: 'analyse' },
        { id: 'gis', name: 'GIS & Remote Sensing', weight: 2, bloom: 'understand' },
      ]},
      { name: 'Human & Economic Geography', topics: [
        { id: 'population_geo', name: 'Population Distribution & Migration', weight: 4, bloom: 'analyse' },
        { id: 'settlement', name: 'Settlement (Rural, Urban)', weight: 3, bloom: 'analyse' },
        { id: 'agriculture_geo', name: 'Agricultural Geography (Systems, Products)', weight: 4, bloom: 'analyse' },
        { id: 'industry_geo', name: 'Industrial Location & Activities', weight: 3, bloom: 'analyse' },
        { id: 'transport_geo', name: 'Transport & Communication', weight: 3, bloom: 'analyse' },
        { id: 'tourism', name: 'Tourism', weight: 2, bloom: 'understand' },
      ]},
      { name: 'Regional Geography: Nigeria', topics: [
        { id: 'nigeria_location', name: 'Nigeria: Location, Size, Position', weight: 3, bloom: 'recall' },
        { id: 'nigeria_relief', name: 'Nigeria: Relief, Drainage, Climate', weight: 4, bloom: 'analyse' },
        { id: 'nigeria_vegetation', name: 'Nigeria: Vegetation Zones', weight: 4, bloom: 'understand' },
        { id: 'nigeria_resources', name: 'Nigeria: Mineral Resources', weight: 4, bloom: 'analyse' },
        { id: 'nigeria_population', name: 'Nigeria: Population & Peoples', weight: 3, bloom: 'analyse' },
      ]},
      { name: 'Environmental Issues', topics: [
        { id: 'env_pollution', name: 'Environmental Pollution', weight: 3, bloom: 'evaluate' },
        { id: 'desertification', name: 'Desertification & Drought', weight: 3, bloom: 'evaluate' },
        { id: 'flooding_erosion', name: 'Flooding & Soil Erosion', weight: 3, bloom: 'evaluate' },
        { id: 'conservation_geo', name: 'Environmental Conservation', weight: 2, bloom: 'evaluate' },
      ]},
    ]
  },

  acc: { // Financial Accounting
    name: 'Financial Accounting',
    sections: [
      { name: 'Introduction', topics: [
        { id: 'acc_meaning', name: 'Meaning, Objectives & Branches of Accounting', weight: 3, bloom: 'understand' },
        { id: 'acc_users', name: 'Users of Accounting Information', weight: 2, bloom: 'understand' },
        { id: 'acc_principles', name: 'Accounting Principles & Conventions', weight: 4, bloom: 'understand' },
      ]},
      { name: 'Double Entry & Books of Account', topics: [
        { id: 'double_entry', name: 'Double Entry System', weight: 5, bloom: 'apply' },
        { id: 'journals', name: 'Journals (Purchases, Sales, Returns, General)', weight: 5, bloom: 'apply' },
        { id: 'ledger', name: 'The Ledger', weight: 5, bloom: 'apply' },
        { id: 'trial_balance', name: 'Trial Balance', weight: 5, bloom: 'apply' },
        { id: 'cash_book', name: 'Cash Book (Single, Two-Column, Three-Column, Petty Cash)', weight: 5, bloom: 'apply' },
      ]},
      { name: 'Final Accounts', topics: [
        { id: 'trading_pl', name: 'Trading, Profit & Loss Account', weight: 5, bloom: 'apply' },
        { id: 'balance_sheet', name: 'Balance Sheet', weight: 5, bloom: 'apply' },
        { id: 'adjustments', name: 'Year-End Adjustments (Prepayments, Accruals, Depreciation, Bad Debts)', weight: 5, bloom: 'apply' },
        { id: 'incomplete_records', name: 'Incomplete Records', weight: 3, bloom: 'apply' },
        { id: 'single_entry', name: 'Single Entry System', weight: 3, bloom: 'apply' },
      ]},
      { name: 'Specialized Accounts', topics: [
        { id: 'nonprofit_accounts', name: 'Non-Profit-Making Organization Accounts', weight: 3, bloom: 'apply' },
        { id: 'partnership_accounts', name: 'Partnership Accounts', weight: 4, bloom: 'apply' },
        { id: 'company_accounts', name: 'Company Accounts', weight: 4, bloom: 'apply' },
        { id: 'manufacturing_accounts', name: 'Manufacturing Accounts', weight: 3, bloom: 'apply' },
        { id: 'departmental_branch', name: 'Departmental & Branch Accounts', weight: 2, bloom: 'apply' },
      ]},
      { name: 'Control & Analysis', topics: [
        { id: 'bank_reconciliation', name: 'Bank Reconciliation Statement', weight: 4, bloom: 'apply' },
        { id: 'control_accounts', name: 'Control Accounts', weight: 3, bloom: 'apply' },
        { id: 'errors_correction', name: 'Errors & Their Correction', weight: 3, bloom: 'apply' },
        { id: 'ratio_analysis', name: 'Ratio Analysis & Interpretation', weight: 3, bloom: 'analyse' },
        { id: 'depreciation', name: 'Depreciation (Methods & Calculations)', weight: 4, bloom: 'apply' },
      ]},
      { name: 'Public Sector & IT', topics: [
        { id: 'public_sector_acc', name: 'Public Sector Accounting', weight: 2, bloom: 'understand' },
        { id: 'computerized_acc', name: 'Computerized Accounting', weight: 2, bloom: 'understand' },
      ]},
    ]
  },

  com: { // Commerce
    name: 'Commerce',
    sections: [
      { name: 'Introduction to Commerce', topics: [
        { id: 'commerce_meaning', name: 'Meaning, Scope & Branches of Commerce', weight: 3, bloom: 'understand' },
        { id: 'occupations', name: 'Occupations (Industrial, Commercial, Service)', weight: 3, bloom: 'understand' },
        { id: 'production_commerce', name: 'Production in Commerce', weight: 3, bloom: 'understand' },
      ]},
      { name: 'Trade', topics: [
        { id: 'trade_types', name: 'Types of Trade (Home & Foreign)', weight: 4, bloom: 'understand' },
        { id: 'wholesale', name: 'Wholesale Trade', weight: 4, bloom: 'understand' },
        { id: 'retail', name: 'Retail Trade', weight: 4, bloom: 'understand' },
        { id: 'foreign_trade', name: 'Foreign Trade (Exports, Imports, Entrepôt)', weight: 4, bloom: 'analyse' },
        { id: 'documents_trade', name: 'Documents Used in Home & Foreign Trade', weight: 4, bloom: 'apply' },
      ]},
      { name: 'Aids to Trade', topics: [
        { id: 'transport_commerce', name: 'Transportation in Commerce', weight: 4, bloom: 'analyse' },
        { id: 'communication', name: 'Communication in Commerce', weight: 3, bloom: 'understand' },
        { id: 'warehousing', name: 'Warehousing & Storage', weight: 3, bloom: 'understand' },
        { id: 'advertising', name: 'Advertising', weight: 4, bloom: 'analyse' },
        { id: 'insurance_commerce', name: 'Insurance', weight: 4, bloom: 'understand' },
        { id: 'banking_commerce', name: 'Banking (Commercial, Central, Specialised)', weight: 4, bloom: 'understand' },
      ]},
      { name: 'Business Organizations', topics: [
        { id: 'sole_proprietor', name: 'Sole Proprietorship', weight: 4, bloom: 'analyse' },
        { id: 'partnership', name: 'Partnership', weight: 4, bloom: 'analyse' },
        { id: 'companies', name: 'Joint Stock Companies (Private & Public)', weight: 4, bloom: 'analyse' },
        { id: 'cooperatives_commerce', name: 'Cooperative Societies', weight: 3, bloom: 'understand' },
        { id: 'public_enterprises', name: 'Public Enterprises', weight: 3, bloom: 'understand' },
        { id: 'multinational', name: 'Multinational Corporations', weight: 2, bloom: 'analyse' },
      ]},
      { name: 'Finance & Stock Exchange', topics: [
        { id: 'business_finance', name: 'Sources of Business Finance', weight: 4, bloom: 'understand' },
        { id: 'stock_exchange', name: 'The Stock Exchange', weight: 3, bloom: 'understand' },
        { id: 'money_capital_markets', name: 'Money Market & Capital Market', weight: 3, bloom: 'analyse' },
      ]},
      { name: 'Consumer Protection & ICT', topics: [
        { id: 'consumer_protection', name: 'Consumer Protection', weight: 3, bloom: 'evaluate' },
        { id: 'ict_commerce', name: 'ICT in Commerce (E-commerce)', weight: 3, bloom: 'understand' },
      ]},
    ]
  },

  fmth: { // Further Mathematics
    name: 'Further Mathematics',
    sections: [
      { name: 'Pure Mathematics', topics: [
        { id: 'fmth_sets', name: 'Sets & Binary Operations', weight: 4, bloom: 'apply' },
        { id: 'fmth_surds', name: 'Surds & Logarithms', weight: 3, bloom: 'apply' },
        { id: 'fmth_polynomials', name: 'Polynomials (Factor & Remainder Theorem)', weight: 5, bloom: 'apply' },
        { id: 'fmth_rational', name: 'Rational Functions & Partial Fractions', weight: 4, bloom: 'apply' },
        { id: 'fmth_sequences', name: 'Sequences & Series (AP, GP, Σ Notation)', weight: 4, bloom: 'apply' },
        { id: 'fmth_binomial', name: 'Binomial Theorem', weight: 4, bloom: 'apply' },
        { id: 'fmth_matrices', name: 'Matrices (incl. 3x3, Inverse)', weight: 4, bloom: 'apply' },
        { id: 'fmth_complex', name: 'Complex Numbers', weight: 3, bloom: 'apply' },
        { id: 'fmth_trig', name: 'Trigonometry (Compound, Multiple Angles)', weight: 5, bloom: 'apply' },
        { id: 'fmth_coord_geometry', name: 'Coordinate Geometry (Lines, Circles, Loci)', weight: 4, bloom: 'apply' },
        { id: 'fmth_calculus', name: 'Differentiation & Integration', weight: 5, bloom: 'apply' },
        { id: 'fmth_applications_calc', name: 'Applications of Calculus (Max/Min, Area under curve)', weight: 5, bloom: 'apply' },
      ]},
      { name: 'Statistics & Probability', topics: [
        { id: 'fmth_perm_comb', name: 'Permutations & Combinations', weight: 5, bloom: 'apply' },
        { id: 'fmth_probability', name: 'Probability (incl. Conditional)', weight: 5, bloom: 'apply' },
        { id: 'fmth_statistics', name: 'Statistics (Grouped Data, Dispersion, Correlation)', weight: 4, bloom: 'apply' },
        { id: 'fmth_distributions', name: 'Probability Distributions (Binomial)', weight: 3, bloom: 'apply' },
      ]},
      { name: 'Mechanics', topics: [
        { id: 'fmth_vectors', name: 'Vectors (2D & 3D, Dot Product)', weight: 4, bloom: 'apply' },
        { id: 'fmth_kinematics', name: 'Kinematics (Motion, Projectiles)', weight: 4, bloom: 'apply' },
        { id: 'fmth_statics', name: 'Statics (Forces, Equilibrium, Moments)', weight: 3, bloom: 'apply' },
        { id: 'fmth_dynamics', name: 'Dynamics (Newton Laws, Momentum)', weight: 3, bloom: 'apply' },
      ]},
    ]
  },

  cmp: { // Computer Studies
    name: 'Computer Studies',
    sections: [
      { name: 'Introduction to Computers', topics: [
        { id: 'computer_history', name: 'History & Generations of Computers', weight: 3, bloom: 'recall' },
        { id: 'computer_classification', name: 'Classification of Computers', weight: 3, bloom: 'understand' },
        { id: 'computer_uses', name: 'Uses of Computers in Society', weight: 3, bloom: 'understand' },
      ]},
      { name: 'Hardware', topics: [
        { id: 'hardware_components', name: 'Hardware Components (CPU, Memory, I/O)', weight: 5, bloom: 'understand' },
        { id: 'input_devices', name: 'Input Devices', weight: 4, bloom: 'recall' },
        { id: 'output_devices', name: 'Output Devices', weight: 4, bloom: 'recall' },
        { id: 'storage_devices', name: 'Storage Devices & Media', weight: 4, bloom: 'understand' },
      ]},
      { name: 'Software', topics: [
        { id: 'software_types', name: 'Types of Software (System, Application)', weight: 4, bloom: 'understand' },
        { id: 'operating_systems', name: 'Operating Systems', weight: 4, bloom: 'understand' },
        { id: 'application_software', name: 'Application Software (Word, Excel, Presentation)', weight: 4, bloom: 'apply' },
      ]},
      { name: 'Data & Information', topics: [
        { id: 'number_systems', name: 'Number Systems (Binary, Octal, Hexadecimal)', weight: 4, bloom: 'apply' },
        { id: 'data_processing', name: 'Data Processing Cycle', weight: 3, bloom: 'understand' },
        { id: 'file_organization', name: 'File Organization', weight: 3, bloom: 'understand' },
        { id: 'databases', name: 'Database Concepts', weight: 3, bloom: 'understand' },
      ]},
      { name: 'Programming', topics: [
        { id: 'programming_concepts', name: 'Programming Concepts (Algorithm, Flowchart)', weight: 4, bloom: 'apply' },
        { id: 'basic_programming', name: 'BASIC Programming Language', weight: 4, bloom: 'apply' },
        { id: 'pseudocode', name: 'Pseudocode', weight: 3, bloom: 'apply' },
      ]},
      { name: 'Internet & Safety', topics: [
        { id: 'internet', name: 'Internet & World Wide Web', weight: 4, bloom: 'understand' },
        { id: 'computer_networks', name: 'Computer Networks (LAN, WAN)', weight: 3, bloom: 'understand' },
        { id: 'cybersecurity', name: 'Cybersecurity & Ethics', weight: 3, bloom: 'evaluate' },
      ]},
    ]
  },

  civ: { // Civic Education
    name: 'Civic Education',
    sections: [
      { name: 'Citizenship & Values', topics: [
        { id: 'civ_citizenship', name: 'Meaning & Types of Citizenship', weight: 4, bloom: 'understand' },
        { id: 'civ_values', name: 'National Values (Honesty, Integrity, Courage)', weight: 4, bloom: 'evaluate' },
        { id: 'civ_rights_duties', name: 'Rights, Duties & Obligations', weight: 5, bloom: 'evaluate' },
      ]},
      { name: 'Governance & Democracy', topics: [
        { id: 'civ_democracy', name: 'Democracy & Democratic Processes', weight: 5, bloom: 'analyse' },
        { id: 'civ_elections', name: 'Elections & Voter Education', weight: 4, bloom: 'understand' },
        { id: 'civ_federal_system', name: 'Federal System of Government', weight: 3, bloom: 'understand' },
        { id: 'civ_rule_of_law', name: 'Rule of Law', weight: 4, bloom: 'understand' },
      ]},
      { name: 'Social Issues', topics: [
        { id: 'civ_cultism', name: 'Cultism & Its Consequences', weight: 4, bloom: 'evaluate' },
        { id: 'civ_drug_abuse', name: 'Drug Abuse & Trafficking', weight: 4, bloom: 'evaluate' },
        { id: 'civ_human_trafficking', name: 'Human Trafficking', weight: 3, bloom: 'evaluate' },
        { id: 'civ_hiv_aids', name: 'HIV/AIDS Awareness', weight: 3, bloom: 'understand' },
        { id: 'civ_corruption', name: 'Corruption & Its Effects', weight: 4, bloom: 'evaluate' },
      ]},
      { name: 'Nation Building', topics: [
        { id: 'civ_national_unity', name: 'National Unity & Integration', weight: 4, bloom: 'evaluate' },
        { id: 'civ_nationalism', name: 'Nationalism & Patriotism', weight: 3, bloom: 'understand' },
        { id: 'civ_leadership', name: 'Leadership & Followership', weight: 4, bloom: 'analyse' },
        { id: 'civ_constitution', name: 'The Nigerian Constitution', weight: 4, bloom: 'understand' },
      ]},
      { name: 'Institutions', topics: [
        { id: 'civ_pop_orgs', name: 'Popular Organizations (NLC, NBA, NUJ)', weight: 3, bloom: 'understand' },
        { id: 'civ_civil_society', name: 'Civil Society Organizations', weight: 3, bloom: 'understand' },
        { id: 'civ_ict_society', name: 'ICT & Society', weight: 3, bloom: 'analyse' },
      ]},
    ]
  },
},

/* ═════════════════ NECO / SSCE ═════════════════ */
// NECO syllabus is ~95% aligned with WAEC (both use NERDC-based senior syllabus),
// with Nigerian-localized emphasis. We reuse the WAEC topic tree for shared
// subjects (marked via _inherit) and add NECO-specific overrides where needed.
// This is declared at build-time by the engine, not here; see buildSyllabusIndex().
neco: {
  _inherit_from: 'waec',
  _overrides: {
    // NECO uses 5 options and is Nigeria-only — style differs but topic list
    // matches the WAEC senior syllabus for all core subjects.
    // Subject-specific NECO emphasis can be added here when it diverges.
  }
},

/* ═════════════════ JAMB / UTME ═════════════════ */
jamb: {

  mth: { // Mathematics
    name: 'Mathematics',
    sections: [
      { name: 'Number & Numeration', topics: [
        { id: 'jmth_number_bases', name: 'Number Bases', weight: 3, bloom: 'apply' },
        { id: 'jmth_fractions', name: 'Fractions, Decimals, Approximations & Percentages', weight: 4, bloom: 'apply' },
        { id: 'jmth_indices', name: 'Indices, Logarithms & Surds', weight: 5, bloom: 'apply' },
        { id: 'jmth_sets', name: 'Sets', weight: 3, bloom: 'apply' },
      ]},
      { name: 'Algebra', topics: [
        { id: 'jmth_polynomials', name: 'Polynomials (incl. Factor & Remainder)', weight: 4, bloom: 'apply' },
        { id: 'jmth_variation', name: 'Variation', weight: 3, bloom: 'apply' },
        { id: 'jmth_inequalities', name: 'Inequalities', weight: 3, bloom: 'apply' },
        { id: 'jmth_progressions', name: 'Progressions (AP & GP)', weight: 4, bloom: 'apply' },
        { id: 'jmth_binary_ops', name: 'Binary Operations', weight: 3, bloom: 'apply' },
        { id: 'jmth_matrices', name: 'Matrices & Determinants', weight: 4, bloom: 'apply' },
        { id: 'jmth_quadratic', name: 'Quadratic Equations', weight: 5, bloom: 'apply' },
      ]},
      { name: 'Geometry & Trigonometry', topics: [
        { id: 'jmth_plane_geometry', name: 'Plane Geometry (Angles, Triangles, Polygons)', weight: 4, bloom: 'apply' },
        { id: 'jmth_mensuration', name: 'Mensuration (Areas & Volumes)', weight: 5, bloom: 'apply' },
        { id: 'jmth_loci', name: 'Loci & Construction', weight: 2, bloom: 'apply' },
        { id: 'jmth_coord_geo', name: 'Coordinate Geometry', weight: 4, bloom: 'apply' },
        { id: 'jmth_trig', name: 'Trigonometry (Ratios, Identities, Sin/Cos Rules)', weight: 5, bloom: 'apply' },
      ]},
      { name: 'Calculus', topics: [
        { id: 'jmth_differentiation', name: 'Differentiation', weight: 5, bloom: 'apply' },
        { id: 'jmth_integration', name: 'Integration', weight: 4, bloom: 'apply' },
        { id: 'jmth_applications', name: 'Applications (Rates of Change, Max/Min)', weight: 4, bloom: 'apply' },
      ]},
      { name: 'Statistics', topics: [
        { id: 'jmth_statistics', name: 'Statistics (Central Tendency, Dispersion)', weight: 4, bloom: 'apply' },
        { id: 'jmth_probability', name: 'Probability', weight: 5, bloom: 'apply' },
        { id: 'jmth_perm_comb', name: 'Permutations & Combinations', weight: 4, bloom: 'apply' },
      ]},
    ]
  },

  eng: { // Use of English
    name: 'Use of English',
    sections: [
      { name: 'Comprehension', topics: [
        { id: 'jeng_comp_passages', name: 'Comprehension Passages (Short Narratives)', weight: 5, bloom: 'analyse' },
        { id: 'jeng_comp_factual', name: 'Factual Comprehension Questions', weight: 4, bloom: 'understand' },
        { id: 'jeng_comp_inference', name: 'Inference Questions', weight: 4, bloom: 'analyse' },
        { id: 'jeng_context_meaning', name: 'Words in Context', weight: 4, bloom: 'understand' },
      ]},
      { name: 'Lexis & Structure', topics: [
        { id: 'jeng_synonyms', name: 'Synonyms (Nearest in Meaning)', weight: 5, bloom: 'recall' },
        { id: 'jeng_antonyms', name: 'Antonyms (Opposite in Meaning)', weight: 5, bloom: 'recall' },
        { id: 'jeng_fill_gap', name: 'Fill in the Gap (Sentence Completion)', weight: 5, bloom: 'apply' },
        { id: 'jeng_sentence_interp', name: 'Sentence Interpretation', weight: 4, bloom: 'analyse' },
        { id: 'jeng_concord', name: 'Concord / Subject-Verb Agreement', weight: 4, bloom: 'apply' },
        { id: 'jeng_tenses', name: 'Tenses', weight: 4, bloom: 'apply' },
        { id: 'jeng_prepositions', name: 'Prepositions', weight: 4, bloom: 'apply' },
        { id: 'jeng_pronouns', name: 'Pronouns', weight: 3, bloom: 'apply' },
        { id: 'jeng_punctuation', name: 'Punctuation', weight: 2, bloom: 'apply' },
        { id: 'jeng_idioms', name: 'Idioms & Phrasal Verbs', weight: 4, bloom: 'understand' },
      ]},
      { name: 'Oral / Phonetics', topics: [
        { id: 'jeng_vowels', name: 'Vowel Sounds (Pure, Diphthongs)', weight: 4, bloom: 'recall' },
        { id: 'jeng_consonants', name: 'Consonant Sounds & Clusters', weight: 3, bloom: 'recall' },
        { id: 'jeng_stress', name: 'Word & Sentence Stress', weight: 4, bloom: 'apply' },
        { id: 'jeng_rhymes', name: 'Rhymes', weight: 2, bloom: 'recall' },
        { id: 'jeng_emphatic_stress', name: 'Emphatic Stress', weight: 3, bloom: 'apply' },
      ]},
    ]
  },

  bio: { _inherit_from: ['waec','bio'], _style_note: 'JAMB emphasizes recall and single-concept application — not multi-step theory.' },
  chm: { _inherit_from: ['waec','chm'], _style_note: 'JAMB favours stoichiometry, atomic structure, periodic table, and single-reaction organic questions.' },
  phy: { _inherit_from: ['waec','phy'], _style_note: 'JAMB favours calculation-light, concept-heavy mechanics, electricity, and waves questions.' },
  eco: { _inherit_from: ['waec','eco'], _style_note: 'JAMB Economics tests definitions, graphs (D&S), and Nigerian policy facts.' },
  gov: { _inherit_from: ['waec','gov'], _style_note: 'JAMB Government emphasizes Nigerian constitutional history, political theory, and current institutions.' },
  lit: { _inherit_from: ['waec','lit'], _style_note: 'JAMB Lit uses prescribed texts for the year — questions test plot recall and character identification, not deep analysis.' },
  crs: { _inherit_from: ['waec','crs'], _style_note: 'JAMB CRS tests recall of biblical events, people, and teachings.' },
  his: { _inherit_from: ['waec','his'], _style_note: 'JAMB History emphasises Nigerian and West African history with date/people recall.' },
  geo: { _inherit_from: ['waec','geo'], _style_note: 'JAMB Geography focuses on map reading, Nigerian geography, and physical geography facts.' },
  agr: { _inherit_from: ['waec','agr'], _style_note: 'JAMB Agric emphasises practical Nigerian agriculture, farm systems, and animal husbandry.' },
  acc: { _inherit_from: ['waec','acc'], _style_note: 'JAMB Accounting tests concepts, single-journal problems, and quick ratio/interpretation items — not full final accounts.' },
  com: { _inherit_from: ['waec','com'], _style_note: 'JAMB Commerce tests business organization types, trade documents, and Nigerian commercial institutions.' },
  fmth: { _inherit_from: ['waec','fmth'], _style_note: 'JAMB Further Maths is calculation-heavy with emphasis on matrices, complex numbers, and calculus.' },
  cmp: { _inherit_from: ['waec','cmp'], _style_note: 'JAMB uses "Computer Science" (computer-focused concepts, basic programming, number systems).' },
},

/* ═════════════════ BECE / Junior WAEC ═════════════════ */
// JSS3 level, NERDC Basic Education Curriculum
bece: {
  eng: { // English Studies
    name: 'English Studies',
    sections: [
      { name: 'Listening & Speaking', topics: [
        { id: 'beng_listening', name: 'Listening Comprehension', weight: 3, bloom: 'understand' },
        { id: 'beng_speech_sounds', name: 'Speech Sounds (Vowels, Consonants)', weight: 3, bloom: 'recall' },
        { id: 'beng_stress', name: 'Stress & Intonation', weight: 3, bloom: 'apply' },
      ]},
      { name: 'Reading & Comprehension', topics: [
        { id: 'beng_comp_factual', name: 'Factual Comprehension', weight: 5, bloom: 'understand' },
        { id: 'beng_comp_inference', name: 'Inferential Comprehension', weight: 3, bloom: 'analyse' },
        { id: 'beng_vocab_context', name: 'Vocabulary in Context', weight: 4, bloom: 'understand' },
      ]},
      { name: 'Grammar', topics: [
        { id: 'beng_parts_speech', name: 'Parts of Speech', weight: 5, bloom: 'recall' },
        { id: 'beng_tenses', name: 'Tenses (Simple, Continuous, Perfect)', weight: 5, bloom: 'apply' },
        { id: 'beng_concord', name: 'Subject-Verb Agreement', weight: 4, bloom: 'apply' },
        { id: 'beng_sentences', name: 'Sentence Types & Structure', weight: 4, bloom: 'apply' },
        { id: 'beng_punctuation', name: 'Punctuation', weight: 3, bloom: 'apply' },
        { id: 'beng_direct_indirect', name: 'Direct & Indirect Speech', weight: 3, bloom: 'apply' },
        { id: 'beng_active_passive', name: 'Active & Passive Voice', weight: 3, bloom: 'apply' },
      ]},
      { name: 'Vocabulary', topics: [
        { id: 'beng_synonyms', name: 'Synonyms', weight: 3, bloom: 'recall' },
        { id: 'beng_antonyms', name: 'Antonyms', weight: 3, bloom: 'recall' },
        { id: 'beng_homophones', name: 'Homophones & Homonyms', weight: 2, bloom: 'recall' },
        { id: 'beng_idioms', name: 'Idioms (Simple)', weight: 3, bloom: 'understand' },
      ]},
      { name: 'Writing', topics: [
        { id: 'beng_letter', name: 'Letter Writing (Informal & Formal)', weight: 4, bloom: 'create' },
        { id: 'beng_narrative', name: 'Narrative Composition', weight: 3, bloom: 'create' },
        { id: 'beng_descriptive', name: 'Descriptive Composition', weight: 3, bloom: 'create' },
        { id: 'beng_report_simple', name: 'Simple Report Writing', weight: 2, bloom: 'create' },
      ]},
    ]
  },

  mth: { // Mathematics (JSS3)
    name: 'Mathematics',
    sections: [
      { name: 'Number & Numeration', topics: [
        { id: 'bmth_whole_nums', name: 'Whole Numbers & Place Value', weight: 3, bloom: 'apply' },
        { id: 'bmth_lcm_hcf', name: 'LCM, HCF & Factors', weight: 4, bloom: 'apply' },
        { id: 'bmth_fractions', name: 'Fractions & Decimals', weight: 5, bloom: 'apply' },
        { id: 'bmth_percentages', name: 'Percentages', weight: 5, bloom: 'apply' },
        { id: 'bmth_ratio', name: 'Ratio & Proportion', weight: 4, bloom: 'apply' },
        { id: 'bmth_number_bases', name: 'Number Bases (Binary)', weight: 3, bloom: 'apply' },
        { id: 'bmth_approximation', name: 'Approximation & Significant Figures', weight: 3, bloom: 'apply' },
      ]},
      { name: 'Algebra', topics: [
        { id: 'bmth_algebraic_expr', name: 'Algebraic Expressions', weight: 5, bloom: 'apply' },
        { id: 'bmth_simple_eqns', name: 'Simple Equations', weight: 5, bloom: 'apply' },
        { id: 'bmth_simultaneous', name: 'Simultaneous Equations (Linear)', weight: 4, bloom: 'apply' },
        { id: 'bmth_inequalities', name: 'Simple Inequalities', weight: 3, bloom: 'apply' },
        { id: 'bmth_factorization', name: 'Factorization', weight: 4, bloom: 'apply' },
      ]},
      { name: 'Geometry', topics: [
        { id: 'bmth_angles_lines', name: 'Angles on Lines & Parallel Lines', weight: 4, bloom: 'apply' },
        { id: 'bmth_triangles', name: 'Triangles & Polygons', weight: 4, bloom: 'apply' },
        { id: 'bmth_circles', name: 'Circles (Basic)', weight: 3, bloom: 'apply' },
        { id: 'bmth_construction', name: 'Construction', weight: 3, bloom: 'apply' },
      ]},
      { name: 'Mensuration', topics: [
        { id: 'bmth_perimeter_area', name: 'Perimeter & Area of Plane Shapes', weight: 5, bloom: 'apply' },
        { id: 'bmth_volumes', name: 'Volumes of Prisms, Cylinders & Cubes', weight: 4, bloom: 'apply' },
        { id: 'bmth_pythagoras', name: 'Pythagoras Theorem', weight: 4, bloom: 'apply' },
      ]},
      { name: 'Statistics & Probability', topics: [
        { id: 'bmth_statistics', name: 'Data Collection & Mean/Median/Mode', weight: 4, bloom: 'apply' },
        { id: 'bmth_charts', name: 'Pie Charts, Bar Charts, Histograms', weight: 4, bloom: 'apply' },
        { id: 'bmth_probability_simple', name: 'Probability (Simple)', weight: 3, bloom: 'apply' },
      ]},
      { name: 'Money & Commerce', topics: [
        { id: 'bmth_simple_interest', name: 'Simple Interest', weight: 3, bloom: 'apply' },
        { id: 'bmth_profit_loss', name: 'Profit & Loss', weight: 3, bloom: 'apply' },
        { id: 'bmth_discount_commission', name: 'Discount & Commission', weight: 2, bloom: 'apply' },
      ]},
    ]
  },

  bst: { // Basic Science & Technology
    name: 'Basic Science & Technology',
    sections: [
      { name: 'Living & Non-living Things', topics: [
        { id: 'bbst_living', name: 'Characteristics of Living Things', weight: 3, bloom: 'recall' },
        { id: 'bbst_cell', name: 'The Cell (Plant & Animal)', weight: 4, bloom: 'understand' },
        { id: 'bbst_classification_bst', name: 'Classification of Living Things', weight: 3, bloom: 'understand' },
        { id: 'bbst_human_body', name: 'Human Body Systems', weight: 4, bloom: 'understand' },
        { id: 'bbst_reproduction', name: 'Reproduction in Plants & Animals', weight: 3, bloom: 'understand' },
      ]},
      { name: 'Matter & Energy', topics: [
        { id: 'bbst_matter_states', name: 'States & Properties of Matter', weight: 4, bloom: 'understand' },
        { id: 'bbst_mixtures', name: 'Mixtures & Separation Techniques', weight: 4, bloom: 'apply' },
        { id: 'bbst_elements_compounds', name: 'Elements, Compounds & Symbols', weight: 3, bloom: 'understand' },
        { id: 'bbst_energy_forms', name: 'Forms of Energy', weight: 4, bloom: 'understand' },
        { id: 'bbst_heat_light', name: 'Heat & Light', weight: 3, bloom: 'understand' },
        { id: 'bbst_electricity_basic', name: 'Electricity (Basic Circuits)', weight: 3, bloom: 'apply' },
        { id: 'bbst_magnetism', name: 'Magnetism', weight: 2, bloom: 'understand' },
      ]},
      { name: 'Environment & Health', topics: [
        { id: 'bbst_environment', name: 'Environmental Health & Sanitation', weight: 3, bloom: 'evaluate' },
        { id: 'bbst_diseases', name: 'Communicable Diseases & Prevention', weight: 4, bloom: 'understand' },
        { id: 'bbst_first_aid', name: 'First Aid & Safety', weight: 2, bloom: 'apply' },
        { id: 'bbst_drug_abuse', name: 'Drug Abuse', weight: 3, bloom: 'evaluate' },
      ]},
      { name: 'Technology', topics: [
        { id: 'bbst_simple_machines', name: 'Simple Machines', weight: 3, bloom: 'apply' },
        { id: 'bbst_tools', name: 'Tools & Their Uses', weight: 3, bloom: 'recall' },
        { id: 'bbst_materials', name: 'Materials (Wood, Metal, Plastic)', weight: 2, bloom: 'understand' },
        { id: 'bbst_measurement', name: 'Measurement & Measuring Instruments', weight: 3, bloom: 'apply' },
      ]},
      { name: 'ICT', topics: [
        { id: 'bbst_computer_parts', name: 'Computer Parts & Functions', weight: 4, bloom: 'understand' },
        { id: 'bbst_internet_basic', name: 'Internet & Communication', weight: 3, bloom: 'understand' },
        { id: 'bbst_ict_safety', name: 'ICT Safety & Ethics', weight: 2, bloom: 'evaluate' },
      ]},
      { name: 'PHE', topics: [
        { id: 'bbst_sports', name: 'Sports & Games', weight: 2, bloom: 'understand' },
        { id: 'bbst_fitness', name: 'Physical Fitness & Nutrition', weight: 2, bloom: 'evaluate' },
      ]},
    ]
  },

  nve: { // National Values Education (Civic + Social Studies + Security)
    name: 'National Values Education',
    sections: [
      { name: 'Civic Education', topics: [
        { id: 'bnve_citizenship', name: 'Citizenship & Nationality', weight: 4, bloom: 'understand' },
        { id: 'bnve_rights', name: 'Fundamental Human Rights', weight: 4, bloom: 'understand' },
        { id: 'bnve_duties', name: 'Duties of a Citizen', weight: 4, bloom: 'evaluate' },
        { id: 'bnve_constitution', name: 'Nigerian Constitution', weight: 3, bloom: 'understand' },
        { id: 'bnve_democracy', name: 'Democracy & Elections', weight: 3, bloom: 'understand' },
      ]},
      { name: 'Social Studies', topics: [
        { id: 'bnve_family', name: 'Family Life & Roles', weight: 3, bloom: 'understand' },
        { id: 'bnve_culture', name: 'Nigerian Cultures & Heritage', weight: 4, bloom: 'understand' },
        { id: 'bnve_national_unity', name: 'National Unity & Integration', weight: 4, bloom: 'evaluate' },
        { id: 'bnve_marriage', name: 'Types of Marriage in Nigeria', weight: 3, bloom: 'understand' },
        { id: 'bnve_govt_structure', name: 'Structure of Nigerian Government', weight: 3, bloom: 'understand' },
      ]},
      { name: 'Security Education', topics: [
        { id: 'bnve_security_agencies', name: 'Nigerian Security Agencies', weight: 3, bloom: 'recall' },
        { id: 'bnve_terrorism', name: 'Terrorism & Its Effects', weight: 3, bloom: 'evaluate' },
        { id: 'bnve_crime', name: 'Crime Prevention & Reporting', weight: 3, bloom: 'apply' },
        { id: 'bnve_traffic', name: 'Traffic Rules & Road Safety', weight: 3, bloom: 'apply' },
      ]},
      { name: 'Moral & Values', topics: [
        { id: 'bnve_honesty', name: 'Honesty, Integrity & Discipline', weight: 3, bloom: 'evaluate' },
        { id: 'bnve_respect', name: 'Respect & Tolerance', weight: 3, bloom: 'evaluate' },
        { id: 'bnve_corruption', name: 'Corruption & Its Effects', weight: 4, bloom: 'evaluate' },
        { id: 'bnve_drug_abuse', name: 'Drug Abuse & Trafficking', weight: 3, bloom: 'evaluate' },
      ]},
    ]
  },

  bsn: { // Business Studies
    name: 'Business Studies',
    sections: [
      { name: 'Office Procedures', topics: [
        { id: 'bbsn_office', name: 'Office & Its Functions', weight: 3, bloom: 'understand' },
        { id: 'bbsn_office_docs', name: 'Office Documents', weight: 4, bloom: 'apply' },
        { id: 'bbsn_filing', name: 'Filing & Records Management', weight: 3, bloom: 'apply' },
        { id: 'bbsn_communication', name: 'Business Communication', weight: 3, bloom: 'understand' },
      ]},
      { name: 'Bookkeeping Basics', topics: [
        { id: 'bbsn_bookkeeping', name: 'Introduction to Bookkeeping', weight: 4, bloom: 'understand' },
        { id: 'bbsn_cash_book', name: 'Cash Book (Simple)', weight: 4, bloom: 'apply' },
        { id: 'bbsn_ledger_simple', name: 'Simple Ledger Entries', weight: 3, bloom: 'apply' },
      ]},
      { name: 'Commerce & Trade', topics: [
        { id: 'bbsn_trade_types', name: 'Trade (Home, Foreign)', weight: 3, bloom: 'understand' },
        { id: 'bbsn_retail_wholesale', name: 'Retail & Wholesale', weight: 3, bloom: 'understand' },
        { id: 'bbsn_business_orgs', name: 'Types of Business Organizations', weight: 4, bloom: 'understand' },
        { id: 'bbsn_consumer_protection', name: 'Consumer Protection', weight: 3, bloom: 'understand' },
      ]},
      { name: 'Keyboarding/Shorthand', topics: [
        { id: 'bbsn_keyboarding', name: 'Keyboarding Skills & Typing', weight: 3, bloom: 'apply' },
        { id: 'bbsn_shorthand', name: 'Shorthand Basics', weight: 2, bloom: 'apply' },
      ]},
    ]
  },

  cca: { // Cultural & Creative Arts
    name: 'Cultural & Creative Arts',
    sections: [
      { name: 'Visual Arts', topics: [
        { id: 'bcca_drawing', name: 'Drawing (Still Life, Nature)', weight: 4, bloom: 'create' },
        { id: 'bcca_painting', name: 'Painting & Colour Theory', weight: 3, bloom: 'apply' },
        { id: 'bcca_sculpture', name: 'Sculpture & Modelling', weight: 3, bloom: 'create' },
        { id: 'bcca_crafts', name: 'Traditional Crafts (Weaving, Pottery)', weight: 3, bloom: 'understand' },
      ]},
      { name: 'Performing Arts', topics: [
        { id: 'bcca_music_theory', name: 'Basic Music Theory', weight: 3, bloom: 'understand' },
        { id: 'bcca_nigerian_music', name: 'Nigerian Music & Instruments', weight: 3, bloom: 'recall' },
        { id: 'bcca_drama', name: 'Drama & Performance', weight: 3, bloom: 'create' },
        { id: 'bcca_dance', name: 'Traditional Dance', weight: 2, bloom: 'understand' },
      ]},
      { name: 'Cultural Heritage', topics: [
        { id: 'bcca_culture', name: 'Nigerian Cultural Heritage', weight: 3, bloom: 'understand' },
        { id: 'bcca_festivals', name: 'Festivals & Ceremonies', weight: 2, bloom: 'recall' },
      ]},
    ]
  },

  pvs: { // Pre-Vocational Studies (Agriculture + Home Economics)
    name: 'Pre-Vocational Studies',
    sections: [
      { name: 'Agriculture', topics: [
        { id: 'bpvs_agr_intro', name: 'Introduction to Agriculture', weight: 4, bloom: 'understand' },
        { id: 'bpvs_farm_tools', name: 'Farm Tools', weight: 3, bloom: 'recall' },
        { id: 'bpvs_crops', name: 'Crop Production (Basic)', weight: 4, bloom: 'apply' },
        { id: 'bpvs_animals', name: 'Animal Production (Basic)', weight: 4, bloom: 'apply' },
        { id: 'bpvs_soil', name: 'Soil & Its Properties', weight: 3, bloom: 'understand' },
        { id: 'bpvs_pest_disease', name: 'Pests & Diseases of Crops/Animals', weight: 3, bloom: 'understand' },
      ]},
      { name: 'Home Economics', topics: [
        { id: 'bpvs_food_nutrition', name: 'Food & Nutrition', weight: 4, bloom: 'understand' },
        { id: 'bpvs_clothing', name: 'Clothing & Textiles', weight: 3, bloom: 'understand' },
        { id: 'bpvs_home_mgmt', name: 'Home Management', weight: 3, bloom: 'apply' },
        { id: 'bpvs_family_health', name: 'Family Health', weight: 3, bloom: 'evaluate' },
      ]},
    ]
  },

  crs: { // CRS (JSS level)
    name: 'Christian Religious Studies',
    sections: [
      { name: 'Old Testament Stories', topics: [
        { id: 'bcrs_creation', name: 'Creation & the Fall', weight: 4, bloom: 'recall' },
        { id: 'bcrs_noah', name: 'Noah & the Flood', weight: 3, bloom: 'recall' },
        { id: 'bcrs_abraham', name: 'Abraham & His Journey', weight: 4, bloom: 'understand' },
        { id: 'bcrs_moses', name: 'Moses & the Exodus', weight: 4, bloom: 'understand' },
        { id: 'bcrs_david', name: 'David & Goliath', weight: 3, bloom: 'recall' },
      ]},
      { name: 'New Testament Stories', topics: [
        { id: 'bcrs_birth_jesus', name: 'Birth of Jesus', weight: 3, bloom: 'recall' },
        { id: 'bcrs_miracles', name: 'Miracles of Jesus', weight: 4, bloom: 'understand' },
        { id: 'bcrs_parables', name: 'Parables of Jesus', weight: 4, bloom: 'analyse' },
        { id: 'bcrs_death_resurrection', name: 'Death & Resurrection of Jesus', weight: 4, bloom: 'understand' },
      ]},
      { name: 'Christian Living', topics: [
        { id: 'bcrs_prayer', name: 'Prayer & Worship', weight: 3, bloom: 'understand' },
        { id: 'bcrs_love', name: 'Love of God & Neighbour', weight: 3, bloom: 'evaluate' },
        { id: 'bcrs_honesty_cre', name: 'Honesty & Integrity', weight: 3, bloom: 'evaluate' },
      ]},
    ]
  },

  fre: { // French
    name: 'French',
    sections: [
      { name: 'Listening & Speaking', topics: [
        { id: 'bfre_greetings', name: 'Greetings & Introductions', weight: 4, bloom: 'apply' },
        { id: 'bfre_numbers', name: 'Numbers & Counting', weight: 3, bloom: 'recall' },
        { id: 'bfre_pronunciation', name: 'French Pronunciation', weight: 3, bloom: 'apply' },
      ]},
      { name: 'Vocabulary', topics: [
        { id: 'bfre_family', name: 'Family Vocabulary', weight: 4, bloom: 'recall' },
        { id: 'bfre_school', name: 'School Vocabulary', weight: 4, bloom: 'recall' },
        { id: 'bfre_daily_activities', name: 'Daily Activities', weight: 4, bloom: 'recall' },
        { id: 'bfre_food', name: 'Food & Drinks', weight: 3, bloom: 'recall' },
      ]},
      { name: 'Grammar', topics: [
        { id: 'bfre_articles', name: 'Articles (le, la, les, un, une)', weight: 5, bloom: 'apply' },
        { id: 'bfre_verbs', name: 'Verb Conjugation (Present Tense)', weight: 5, bloom: 'apply' },
        { id: 'bfre_adjectives', name: 'Adjectives & Agreement', weight: 4, bloom: 'apply' },
        { id: 'bfre_negation', name: 'Negation (ne...pas)', weight: 3, bloom: 'apply' },
      ]},
    ]
  },

  nlg: { // Nigerian Language (generic — subject metadata only)
    name: 'Nigerian Language',
    sections: [
      { name: 'Language Skills', topics: [
        { id: 'bnlg_greetings', name: 'Greetings & Courtesy', weight: 4, bloom: 'recall' },
        { id: 'bnlg_numbers', name: 'Numbers', weight: 3, bloom: 'recall' },
        { id: 'bnlg_family', name: 'Family Terms', weight: 3, bloom: 'recall' },
        { id: 'bnlg_proverbs', name: 'Proverbs & Wise Sayings', weight: 4, bloom: 'understand' },
        { id: 'bnlg_grammar', name: 'Basic Grammar', weight: 4, bloom: 'apply' },
        { id: 'bnlg_comprehension', name: 'Reading Comprehension', weight: 3, bloom: 'understand' },
        { id: 'bnlg_culture', name: 'Cultural Context', weight: 3, bloom: 'understand' },
      ]}
    ]
  },

  his: { // History (JSS)
    name: 'History',
    sections: [
      { name: 'Pre-Colonial Nigeria', topics: [
        { id: 'bhis_peoples', name: 'Major Nigerian Peoples', weight: 4, bloom: 'understand' },
        { id: 'bhis_kingdoms', name: 'Pre-Colonial Kingdoms', weight: 4, bloom: 'understand' },
      ]},
      { name: 'Colonial Nigeria', topics: [
        { id: 'bhis_colonial', name: 'British Colonial Rule', weight: 3, bloom: 'understand' },
        { id: 'bhis_amalgamation', name: 'Amalgamation of 1914', weight: 3, bloom: 'understand' },
      ]},
      { name: 'Independence & Modern Nigeria', topics: [
        { id: 'bhis_independence', name: 'Nigerian Independence', weight: 3, bloom: 'recall' },
        { id: 'bhis_heroes', name: 'Nigerian National Heroes', weight: 3, bloom: 'recall' },
      ]},
    ]
  },
},

/* ═════════════════ NCEE / Common Entrance ═════════════════ */
// Primary 6 level, for Federal Unity Colleges
ce: {
  eng: { // English Studies
    name: 'English Studies',
    sections: [
      { name: 'Reading Comprehension', topics: [
        { id: 'ceng_comp_short', name: 'Short Passage Comprehension', weight: 5, bloom: 'understand' },
        { id: 'ceng_vocab', name: 'Vocabulary & Word Meaning', weight: 5, bloom: 'understand' },
      ]},
      { name: 'Grammar', topics: [
        { id: 'ceng_parts_speech', name: 'Parts of Speech', weight: 5, bloom: 'recall' },
        { id: 'ceng_tenses', name: 'Simple Tenses', weight: 4, bloom: 'apply' },
        { id: 'ceng_sentences', name: 'Sentence Construction', weight: 4, bloom: 'apply' },
        { id: 'ceng_punctuation', name: 'Punctuation', weight: 3, bloom: 'apply' },
      ]},
      { name: 'Vocabulary Skills', topics: [
        { id: 'ceng_synonyms', name: 'Synonyms', weight: 4, bloom: 'recall' },
        { id: 'ceng_antonyms', name: 'Antonyms', weight: 4, bloom: 'recall' },
        { id: 'ceng_spelling', name: 'Spelling', weight: 3, bloom: 'recall' },
      ]},
    ]
  },

  mth: { // Mathematics (Primary 6)
    name: 'Mathematics',
    sections: [
      { name: 'Number & Arithmetic', topics: [
        { id: 'cmth_whole_nums', name: 'Whole Numbers (up to millions)', weight: 5, bloom: 'apply' },
        { id: 'cmth_fractions', name: 'Fractions (Add, Subtract, Multiply, Divide)', weight: 5, bloom: 'apply' },
        { id: 'cmth_decimals', name: 'Decimals', weight: 5, bloom: 'apply' },
        { id: 'cmth_percentages', name: 'Percentages', weight: 4, bloom: 'apply' },
        { id: 'cmth_ratio', name: 'Ratio & Proportion (Basic)', weight: 4, bloom: 'apply' },
        { id: 'cmth_lcm_hcf', name: 'LCM, HCF & Factors', weight: 3, bloom: 'apply' },
        { id: 'cmth_money', name: 'Money (Profit, Loss, Simple Interest)', weight: 4, bloom: 'apply' },
      ]},
      { name: 'Measurement', topics: [
        { id: 'cmth_length', name: 'Length & Distance', weight: 3, bloom: 'apply' },
        { id: 'cmth_weight', name: 'Weight & Capacity', weight: 3, bloom: 'apply' },
        { id: 'cmth_time', name: 'Time (Hours, Minutes, 24-hour)', weight: 3, bloom: 'apply' },
        { id: 'cmth_perimeter_area', name: 'Perimeter & Area', weight: 4, bloom: 'apply' },
      ]},
      { name: 'Geometry', topics: [
        { id: 'cmth_shapes_2d', name: '2D Shapes (Properties)', weight: 3, bloom: 'understand' },
        { id: 'cmth_shapes_3d', name: '3D Shapes (Properties)', weight: 3, bloom: 'understand' },
        { id: 'cmth_angles', name: 'Angles', weight: 3, bloom: 'apply' },
      ]},
      { name: 'Algebra (Simple)', topics: [
        { id: 'cmth_simple_eqns', name: 'Simple Equations', weight: 3, bloom: 'apply' },
        { id: 'cmth_patterns', name: 'Number Patterns', weight: 3, bloom: 'analyse' },
      ]},
      { name: 'Data & Statistics', topics: [
        { id: 'cmth_charts', name: 'Reading Charts & Tables', weight: 3, bloom: 'analyse' },
        { id: 'cmth_mean_simple', name: 'Average (Mean)', weight: 2, bloom: 'apply' },
      ]},
    ]
  },

  bst: { // Basic Science & Technology
    name: 'Basic Science & Technology',
    sections: [
      { name: 'Living Things', topics: [
        { id: 'cbst_living', name: 'Living & Non-Living Things', weight: 4, bloom: 'recall' },
        { id: 'cbst_plants', name: 'Parts of a Plant & Their Functions', weight: 4, bloom: 'understand' },
        { id: 'cbst_animals', name: 'Animals & Their Habitats', weight: 3, bloom: 'understand' },
        { id: 'cbst_human_body', name: 'Human Body (Organs & Systems)', weight: 4, bloom: 'understand' },
        { id: 'cbst_health', name: 'Personal Hygiene & Health', weight: 3, bloom: 'evaluate' },
      ]},
      { name: 'Matter & Energy', topics: [
        { id: 'cbst_matter', name: 'States of Matter', weight: 4, bloom: 'understand' },
        { id: 'cbst_energy', name: 'Forms of Energy', weight: 3, bloom: 'understand' },
        { id: 'cbst_electricity', name: 'Basic Electricity', weight: 3, bloom: 'apply' },
        { id: 'cbst_weather', name: 'Weather & Climate', weight: 3, bloom: 'understand' },
      ]},
      { name: 'Technology', topics: [
        { id: 'cbst_simple_machines', name: 'Simple Machines', weight: 3, bloom: 'understand' },
        { id: 'cbst_ict', name: 'Computer Basics', weight: 3, bloom: 'understand' },
      ]},
    ]
  },

  nve: { // National Values Education
    name: 'National Values Education',
    sections: [
      { name: 'Civic Education', topics: [
        { id: 'cnve_citizen', name: 'Being a Good Citizen', weight: 4, bloom: 'understand' },
        { id: 'cnve_rights', name: 'Rights of the Child', weight: 4, bloom: 'understand' },
        { id: 'cnve_symbols', name: 'Nigerian National Symbols (Flag, Anthem, Coat of Arms)', weight: 4, bloom: 'recall' },
      ]},
      { name: 'Social Studies', topics: [
        { id: 'cnve_family', name: 'Family & Community', weight: 3, bloom: 'understand' },
        { id: 'cnve_culture', name: 'Nigerian Cultures', weight: 3, bloom: 'recall' },
        { id: 'cnve_geography', name: 'Basic Geography of Nigeria', weight: 3, bloom: 'recall' },
      ]},
      { name: 'Moral Values', topics: [
        { id: 'cnve_honesty', name: 'Honesty & Obedience', weight: 3, bloom: 'evaluate' },
        { id: 'cnve_respect', name: 'Respect for Elders & Others', weight: 3, bloom: 'evaluate' },
      ]},
    ]
  },

  qva: { // Quantitative & Vocational Aptitude (NCEE Paper II Part A)
    name: 'Quantitative & Vocational Aptitude',
    sections: [
      { name: 'Quantitative Aptitude', topics: [
        { id: 'cqva_number_patterns', name: 'Number Patterns & Sequences', weight: 5, bloom: 'analyse' },
        { id: 'cqva_odd_out', name: 'Odd-One-Out Problems', weight: 4, bloom: 'analyse' },
        { id: 'cqva_codes', name: 'Simple Codes & Ciphers', weight: 4, bloom: 'analyse' },
        { id: 'cqva_picture_logic', name: 'Picture-Based Logic', weight: 4, bloom: 'analyse' },
        { id: 'cqva_word_problems', name: 'Word Problems', weight: 4, bloom: 'apply' },
      ]},
      { name: 'Vocational Aptitude', topics: [
        { id: 'cqva_tools', name: 'Tools & Their Uses', weight: 3, bloom: 'recall' },
        { id: 'cqva_trades', name: 'Trades & Professions', weight: 3, bloom: 'recall' },
        { id: 'cqva_safety', name: 'Safety Practices', weight: 3, bloom: 'understand' },
      ]},
    ]
  },

  vrb: { // Verbal Aptitude (NCEE Paper II Part B)
    name: 'Verbal Aptitude',
    sections: [
      { name: 'Word Relationships', topics: [
        { id: 'cvrb_analogies', name: 'Word Analogies', weight: 5, bloom: 'analyse' },
        { id: 'cvrb_classification', name: 'Word Classification', weight: 4, bloom: 'analyse' },
      ]},
      { name: 'Vocabulary', topics: [
        { id: 'cvrb_synonyms', name: 'Synonyms', weight: 5, bloom: 'recall' },
        { id: 'cvrb_antonyms', name: 'Antonyms', weight: 5, bloom: 'recall' },
        { id: 'cvrb_meanings', name: 'Word Meanings in Context', weight: 4, bloom: 'understand' },
      ]},
      { name: 'Sentence Logic', topics: [
        { id: 'cvrb_completion', name: 'Sentence Completion', weight: 4, bloom: 'apply' },
        { id: 'cvrb_ordering', name: 'Sentence Ordering', weight: 3, bloom: 'analyse' },
      ]},
    ]
  },
},

};

/* ═══════════════════════════════════════════════════════════════════════════
   SYLLABUS INDEX BUILDER
   Resolves inheritance (_inherit_from) so getSyllabus(board, subj) returns
   a flat sections array — even if that board's subject inherits from another.
   ═══════════════════════════════════════════════════════════════════════════ */
function getSyllabus(boardKey, subjKey){
  var board = LT_SYLLABI[boardKey];
  if (!board) return null;

  // Board-level inheritance (e.g. neco inherits from waec)
  if (board._inherit_from && !board[subjKey]) {
    var parent = LT_SYLLABI[board._inherit_from];
    if (parent && parent[subjKey]) return parent[subjKey];
    return null;
  }

  var subj = board[subjKey];
  if (!subj) {
    // fallback: try inheriting from WAEC if this board lacks the subject
    if (boardKey !== 'waec' && LT_SYLLABI.waec && LT_SYLLABI.waec[subjKey]) {
      return LT_SYLLABI.waec[subjKey];
    }
    return null;
  }

  // Subject-level inheritance (e.g. jamb.bio inherits from ['waec','bio'])
  if (subj._inherit_from) {
    var parentBoard = subj._inherit_from[0];
    var parentSubj = subj._inherit_from[1];
    var inherited = LT_SYLLABI[parentBoard] && LT_SYLLABI[parentBoard][parentSubj];
    if (inherited) {
      // merge: keep parent sections/topics, but respect the child's style_note
      return Object.assign({}, inherited, { _style_note: subj._style_note });
    }
  }

  return subj;
}

// Return a flat list of all topics for a subject-board
function getAllTopics(boardKey, subjKey){
  var s = getSyllabus(boardKey, subjKey);
  if (!s || !s.sections) return [];
  var all = [];
  s.sections.forEach(function(sec){
    sec.topics.forEach(function(t){
      all.push(Object.assign({}, t, { section: sec.name }));
    });
  });
  return all;
}

// Expose globally for use in the classroom/exam engine
if (typeof window !== 'undefined'){
  window.LT_SYLLABI = LT_SYLLABI;
  window.getSyllabus = getSyllabus;
  window.getAllTopics = getAllTopics;
}
/* ═══════════════════════════════════════════════════════════════════════════
   LESSON TEACHER — GROWTH ENGINE
   ═══════════════════════════════════════════════════════════════════════════
   Purpose: replace the generic "give me 25 questions" prompt with a
   student-adaptive, syllabus-faithful generator.

   Components:
   1. Mastery tracker — persists per-(student, board, subject, topic) state
   2. Adaptive sampler — picks which topics to test this session based on
      mastery scores, Bloom level, and coverage gaps
   3. Prompt builder — assembles board-specific, topic-specific prompts
      that actually tell the AI WHAT topics to draw from

   Storage model (uses window.storage, auto-synced across sessions):
     mastery:{board}:{subject}  →  {
       tid: {
         attempts: n,
         correct: n,
         lastSeen: timestamp,
         rollingAcc: 0.0-1.0,    // EWMA of recent accuracy
         bloomHits: { recall: n, apply: n, ... },
         mastery: 0.0-1.0        // composite score
       },
       ...
     }
   ═══════════════════════════════════════════════════════════════════════════ */

(function(){

// ─────────────────────────────────────────────────────────────
// Storage helpers (graceful fallback if window.storage unavailable)
// ─────────────────────────────────────────────────────────────
async function storageGet(key){
  try {
    if (typeof window !== 'undefined' && window.storage && window.storage.get){
      var r = await window.storage.get(key);
      return r ? r.value : null;
    }
  } catch(e){}
  // Fallback: in-memory
  window._ltFallbackStore = window._ltFallbackStore || {};
  return window._ltFallbackStore[key] || null;
}
async function storageSet(key, value){
  try {
    if (typeof window !== 'undefined' && window.storage && window.storage.set){
      await window.storage.set(key, value);
      return true;
    }
  } catch(e){}
  window._ltFallbackStore = window._ltFallbackStore || {};
  window._ltFallbackStore[key] = value;
  return true;
}

// ─────────────────────────────────────────────────────────────
// Mastery tracker
// ─────────────────────────────────────────────────────────────
var MasteryTracker = {
  _cache: {},   // key -> mastery object

  _key: function(board, subj){
    return 'mastery:' + board + ':' + subj;
  },

  // Load mastery for this board/subject (cached)
  load: async function(board, subj){
    var key = this._key(board, subj);
    if (this._cache[key]) return this._cache[key];
    var raw = await storageGet(key);
    var parsed = {};
    if (raw){
      try { parsed = JSON.parse(raw); } catch(e){ parsed = {}; }
    }
    this._cache[key] = parsed;
    return parsed;
  },

  // Persist mastery back to storage
  save: async function(board, subj){
    var key = this._key(board, subj);
    var data = this._cache[key] || {};
    await storageSet(key, JSON.stringify(data));
  },

  // Record a single question outcome
  record: async function(board, subj, topicId, bloom, correct){
    var m = await this.load(board, subj);
    var t = m[topicId] || {
      attempts: 0, correct: 0,
      lastSeen: 0, rollingAcc: 0.5,
      bloomHits: {}, mastery: 0.0
    };
    t.attempts += 1;
    if (correct) t.correct += 1;
    t.lastSeen = Date.now();
    // Exponential weighted moving average: weight recent more heavily
    var alpha = 0.3;
    t.rollingAcc = alpha * (correct ? 1 : 0) + (1 - alpha) * (t.rollingAcc || 0.5);
    // Bloom-level tracking
    if (bloom){
      t.bloomHits[bloom] = t.bloomHits[bloom] || { attempts: 0, correct: 0 };
      t.bloomHits[bloom].attempts += 1;
      if (correct) t.bloomHits[bloom].correct += 1;
    }
    // Composite mastery: rolling accuracy, but require enough attempts to count
    var confidence = Math.min(t.attempts / 5, 1); // need 5 attempts for full confidence
    t.mastery = t.rollingAcc * confidence + 0.5 * (1 - confidence); // unseen → neutral 0.5
    m[topicId] = t;
    this._cache[this._key(board, subj)] = m;
    // Debounced save (don't thrash storage)
    this._scheduleSave(board, subj);
  },

  _scheduleSave: function(board, subj){
    var self = this;
    clearTimeout(this._saveTimer);
    this._saveTimer = setTimeout(function(){ self.save(board, subj); }, 1500);
  },

  // Get mastery score for a specific topic (0.5 = unseen, 1.0 = mastered, 0.0 = struggling)
  scoreFor: async function(board, subj, topicId){
    var m = await this.load(board, subj);
    return (m[topicId] && typeof m[topicId].mastery === 'number') ? m[topicId].mastery : 0.5;
  },

  // Get days since topic was last seen
  daysSince: async function(board, subj, topicId){
    var m = await this.load(board, subj);
    if (!m[topicId] || !m[topicId].lastSeen) return 9999;
    return (Date.now() - m[topicId].lastSeen) / (1000 * 60 * 60 * 24);
  },

  // Summary stats for display
  summary: async function(board, subj){
    var m = await this.load(board, subj);
    var topicIds = Object.keys(m);
    if (!topicIds.length) return { seen: 0, mastered: 0, struggling: 0, avg: 0.5 };
    var mastered = 0, struggling = 0, sum = 0;
    topicIds.forEach(function(id){
      var t = m[id];
      sum += t.mastery;
      if (t.attempts >= 3 && t.mastery >= 0.8) mastered++;
      if (t.attempts >= 3 && t.mastery < 0.5) struggling++;
    });
    return {
      seen: topicIds.length,
      mastered: mastered,
      struggling: struggling,
      avg: sum / topicIds.length
    };
  }
};

// ─────────────────────────────────────────────────────────────
// Adaptive topic sampler
// ─────────────────────────────────────────────────────────────
// Given a set of topics (with syllabus weights), picks N topics for this
// session with a mix of: strengthen-weak, maintain-strong, and introduce-new.
// ─────────────────────────────────────────────────────────────
async function sampleTopics(board, subj, n){
  var allTopics = (typeof getAllTopics === 'function') ? getAllTopics(board, subj) : [];
  if (!allTopics.length) return [];

  var mastery = await MasteryTracker.load(board, subj);

  // Score each candidate topic
  // Higher priority_score = more likely to be picked
  var scored = allTopics.map(function(t){
    var m = mastery[t.id] || { attempts: 0, mastery: 0.5, lastSeen: 0 };
    var daysSince = m.lastSeen ? (Date.now() - m.lastSeen) / (1000*60*60*24) : 9999;

    // Priority factors:
    //   1. Syllabus weight (exam importance)
    //   2. Weakness bonus (lower mastery = higher priority)
    //   3. Novelty bonus (not seen → should be seen)
    //   4. Spaced repetition: seen recently AND mastered → lower priority
    //   5. Spaced repetition: seen recently AND struggling → MUCH higher priority
    var syllabusWeight = t.weight || 2;
    var weaknessBonus = (0.5 - m.mastery) * 4; // range: -2 (fully mastered) to +2 (fully struggling)
    var noveltyBonus = (m.attempts === 0) ? 1.5 : 0;
    var recencyPenalty = daysSince < 1 && m.mastery >= 0.75 ? -3 : 0; // skip recently-mastered
    var strugglingBoost = daysSince < 3 && m.mastery < 0.5 && m.attempts >= 2 ? 2 : 0;

    var score = syllabusWeight + weaknessBonus + noveltyBonus + recencyPenalty + strugglingBoost;
    // Add small randomness so we don't always pick the exact same order
    score += Math.random() * 0.8;

    return { topic: t, score: score, mastery: m.mastery, seen: m.attempts > 0 };
  });

  scored.sort(function(a, b){ return b.score - a.score; });

  // Balanced selection: ensure coverage across sections and Bloom levels
  var picked = [];
  var sectionsSeen = {};
  var bloomsSeen = {};
  var bloomBalance = { recall: 0.20, understand: 0.25, apply: 0.35, analyse: 0.12, evaluate: 0.05, create: 0.03 };
  var targetBlooms = {};
  Object.keys(bloomBalance).forEach(function(b){
    targetBlooms[b] = Math.max(0, Math.round(n * bloomBalance[b]));
  });

  // First pass: take top-scored, respecting Bloom balance
  scored.forEach(function(s){
    if (picked.length >= n) return;
    var b = s.topic.bloom || 'apply';
    var used = bloomsSeen[b] || 0;
    var target = targetBlooms[b] || 0;
    // Allow picking if we haven't filled this bloom bucket yet
    if (used < target + 1){
      picked.push(s.topic);
      bloomsSeen[b] = used + 1;
      sectionsSeen[s.topic.section] = (sectionsSeen[s.topic.section] || 0) + 1;
    }
  });

  // Second pass: fill remaining slots with highest-priority leftover
  if (picked.length < n){
    scored.forEach(function(s){
      if (picked.length >= n) return;
      if (picked.indexOf(s.topic) === -1){
        picked.push(s.topic);
      }
    });
  }

  return picked.slice(0, n);
}

// ─────────────────────────────────────────────────────────────
// Growth-aware prompt builder
// Returns a prompt string that tells the AI exactly which topics,
// at which Bloom levels, and in which quantities.
// ─────────────────────────────────────────────────────────────
async function buildAdaptivePrompt(board, subj, subjName, numQuestions, examYear, boardCfg){
  var topics = await sampleTopics(board, subj, numQuestions);
  if (!topics.length){
    return null; // fall back to generic prompt
  }

  // Group picked topics by how many questions each should generate
  // Higher-weighted topics get more questions; but cap each at 3 per session
  var weightSum = topics.reduce(function(s,t){ return s + (t.weight||2); }, 0);
  var assignments = topics.map(function(t){
    var rawN = (t.weight || 2) / weightSum * numQuestions;
    return { topic: t, count: Math.max(1, Math.round(rawN)) };
  });
  // Trim total to numQuestions
  var totalN = assignments.reduce(function(s,a){ return s + a.count; }, 0);
  while (totalN > numQuestions){
    // Reduce the largest
    var maxIdx = 0;
    assignments.forEach(function(a, i){ if (a.count > assignments[maxIdx].count) maxIdx = i; });
    assignments[maxIdx].count -= 1;
    if (assignments[maxIdx].count === 0) assignments.splice(maxIdx, 1);
    totalN -= 1;
  }
  while (totalN < numQuestions && assignments.length){
    assignments[0].count += 1;
    totalN += 1;
  }

  // Build the topic-breakdown block for the prompt
  var topicLines = assignments.map(function(a){
    var bloomLabel = ({
      recall: 'recall (state, name, identify)',
      understand: 'understanding (explain, describe)',
      apply: 'application (calculate, solve, use)',
      analyse: 'analysis (compare, break down, examine)',
      evaluate: 'evaluation (judge, justify, critique)',
      create: 'creation (design, compose, construct)'
    })[a.topic.bloom] || 'application';
    var line = '  • ' + a.count + ' question(s) on "' + a.topic.name + '"';
    line += ' (section: ' + a.topic.section + ')';
    line += ' — test at ' + bloomLabel + ' level';
    if (a.topic.id){ line += ' [tag: "' + a.topic.id + '"]'; }
    return line;
  });

  // Student context (mastery-aware guidance for the AI)
  var masterySummary = await MasteryTracker.summary(board, subj);
  var contextLine = '';
  if (masterySummary.seen > 0){
    contextLine = 'STUDENT CONTEXT: This student has practiced ' + masterySummary.seen +
      ' topic(s) in this subject so far. Overall mastery ~' + Math.round(masterySummary.avg * 100) + '%. ';
    if (masterySummary.struggling > 0){
      contextLine += 'They are currently struggling with ' + masterySummary.struggling + ' topic(s) — today\'s session targets their weak areas.';
    }
  }

  // Board-specific option block
  var optLetters = boardCfg.options.join(', ');
  var optJoined = boardCfg.options.join('');
  var exampleOpts = boardCfg.options.map(function(L, i){
    return '"'+L+'":"option " + "' + i + '"';
  }).join(',').replace(/"option " \+ "(\d)"/g, '"option $1 text"');
  var exampleAns = boardCfg.options[1];

  // Build the full prompt
  var yearLabel = examYear ? 'Target year: ' + examYear + '.' : 'Mix years 2016-2024.';

  var prompt = ''
    + 'Generate exactly ' + numQuestions + ' ' + boardCfg.short + ' ' + subjName + ' multiple-choice questions.\n\n'
    + '=== EXAM BOARD: ' + boardCfg.longName + ' (' + boardCfg.short + ') ===\n'
    + yearLabel + '\n'
    + (contextLine ? contextLine + '\n\n' : '\n')
    + '=== TOPIC DISTRIBUTION FOR THIS SESSION ===\n'
    + 'You MUST generate questions according to this exact topic breakdown. Do not\n'
    + 'substitute, skip, or combine topics. Each topic gets the specified number of\n'
    + 'questions at the specified Bloom\'s level:\n\n'
    + topicLines.join('\n') + '\n\n'
    + '=== ' + boardCfg.short + '-SPECIFIC RULES ===\n'
    + boardCfg.styleNotes.map(function(s, i){ return (i+1) + '. ' + s; }).join('\n') + '\n\n'
    + '=== STRICT FORMAT RULES ===\n'
    + '1. Match REAL ' + boardCfg.short + ' past-paper difficulty, style and register — not a generic "Nigerian exam feel".\n'
    + '2. Every question MUST have EXACTLY ' + boardCfg.options.length + ' options: ' + optLetters + '. All distractors plausible.\n'
    + '   — Do NOT use ' + (boardCfg.options.length===4?'5':'4') + ' options. ' + boardCfg.short + ' uses ' + boardCfg.options.length + '.\n'
    + '3. "ans" is exactly ONE letter from: ' + optLetters + '.\n'
    + '4. Include "tid" field on each question = the topic tag from the distribution above.\n'
    + '5. Return ONLY a raw JSON array — no markdown fences, no text outside the array.\n\n'
    + '=== OUTPUT FORMAT ===\n'
    + '[{"yr":2022,"topic":"topic name","tid":"topic_id_tag","q":"Question text","opts":{'
    + boardCfg.options.map(function(L){return '"'+L+'":"…"';}).join(',')
    + '},"ans":"' + exampleAns + '","exp":"Why ' + exampleAns + ' is correct. Why other options are wrong.","diff":"medium"}]\n';

  return {
    prompt: prompt,
    topicMap: assignments, // used by the caller to enrich questions post-generation
    picked: topics
  };
}

// ─────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────
if (typeof window !== 'undefined'){
  window.MasteryTracker = MasteryTracker;
  window.ltSampleTopics = sampleTopics;
  window.ltBuildAdaptivePrompt = buildAdaptivePrompt;
}

})();

