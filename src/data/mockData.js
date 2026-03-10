// src/data/mockData.js — sourced from real Bio-Well PDF output (Catherine The Great, 2025-06-18)
// Replace hardcoded values with invoke() calls when Tauri backend is ready.

export const CURRENT_PATIENT = {
  name: 'Catherine The Great',
  initials: 'CG',
  sessionId: 20250618,
  dob: '—',
  practitioner: 'Dr. Konstantin Korotkov',
  scanDate: '2025-06-18',
  scanTime: '17:04:01',
}

// ── ANALYSIS ─────────────────────────────────────────────────────────────────
export const ANALYSIS = {
  stress:      { value: 2.99, label: 'Optimal',  range: [2.0, 3.0] },
  energy:      { value: 53.32, label: 'Optimal', range: [40, 60] },
  organsDisbalance: { value: 7.02, side: 'L', label: 'Medium' },
  organsInDisbalance: { left: 8, right: 2 },
  avgDisbalanceEnergy: { left: 1.80, right: 1.28 },
  totalEnergyJoules: 53,
}

// ── CURRENT SCAN (for dashboard gauges) ──────────────────────────────────────
export const CURRENT_SCAN = {
  gauges: {
    energy:   { value: 53, max: 100, color: 'var(--bw-blue-hi)',  label: 'Energy',   sublabel: 'Optimal' },
    vitality: { value: 72, max: 100, color: 'var(--bw-green)',    label: 'Vitality',  sublabel: 'Normal' },
    stress:   { value: 30, max: 100, color: 'var(--bw-gold)',     label: 'Stress',    sublabel: '2.99 Optimal' },
    balance:  { value: 93, max: 100, color: 'var(--bw-violet)',   label: 'Balance',   sublabel: '7.02% Disbal.' },
  },
  overallScore: 68,
}

// ── LIFESTYLE SCORES ──────────────────────────────────────────────────────────
export const LIFESTYLE = [
  { id: 'physical',   label: 'Physical Activity',  value: 58, low: 66,  normal: 79,  ideal: 100, icon: '🏃', status: 'Low',    desc: 'Lower back, pelvis zone, lower dan tien' },
  { id: 'nutrition',  label: 'Nutrition',          value: 73, low: 69,  normal: 81,  ideal: 100, icon: '🥗', status: 'Normal', desc: 'Quality, amount, and timing of meals' },
  { id: 'environment',label: 'Environment',        value: 86, low: 78,  normal: 91,  ideal: 100, icon: '🌿', status: 'Normal', desc: 'Indoor air quality, EMF exposure' },
  { id: 'psychology', label: 'Psychology',         value: 72, low: 74,  normal: 85,  ideal: 100, icon: '🧘', status: 'Low',    desc: 'Stress, information load, nervous system' },
  { id: 'regime',     label: 'Regime of the Day',  value: 85, low: 75,  normal: 86,  ideal: 100, icon: '🌙', status: 'Normal', desc: 'Sleep cycle, screen time, circadian rhythm' },
  { id: 'hormones',   label: 'Hormonal Activity',  value: 58, low: 72,  normal: 85,  ideal: 100, icon: '⚡', status: 'Low',    desc: 'Hormonal balance, energy regulation' },
]

// ── NERVOUS CENTERS (CHAKRAS) ─────────────────────────────────────────────────
export const CHAKRA_DATA = [
  { id: 'root',   name: 'Root',       sanskrit: 'Muladhara',    center: 1, energy: 6.2, alignment: 87, color: '#ff4444', hue: 0,   val: 87, y: 0.82, element: 'Earth',  desc: 'Adrenal gland, skeleton, backbone, kidney, rectum' },
  { id: 'sacral', name: 'Sacral',     sanskrit: 'Svadhisthana', center: 2, energy: 6.0, alignment: 98, color: '#ff8833', hue: 25,  val: 98, y: 0.74, element: 'Water',  desc: 'Digestive apparatus, bowels, urogenital system' },
  { id: 'solar',  name: 'Solar Plex', sanskrit: 'Manipura',     center: 3, energy: 5.7, alignment: 79, color: '#ffdd44', hue: 50,  val: 79, y: 0.62, element: 'Fire',   desc: 'Stomach, pancreas, excretory glands, liver' },
  { id: 'heart',  name: 'Heart',      sanskrit: 'Anahata',      center: 4, energy: 5.8, alignment: 99, color: '#44ee88', hue: 140, val: 99, y: 0.50, element: 'Air',    desc: 'Cardiovascular system, lungs, thyroid gland' },
  { id: 'throat', name: 'Throat',     sanskrit: 'Vishuddha',    center: 5, energy: 6.3, alignment: 97, color: '#44ccff', hue: 200, val: 97, y: 0.38, element: 'Sound',  desc: 'Spinal cord, throat, neck, oesophagus, heart' },
  { id: 'third',  name: 'Third Eye',  sanskrit: 'Ajna',         center: 6, energy: 4.3, alignment: 95, color: '#6688ff', hue: 240, val: 95, y: 0.22, element: 'Light',  desc: 'Brain, hypophysis, hypothalamus, nervous system' },
  { id: 'crown',  name: 'Crown',      sanskrit: 'Sahasrara',    center: 7, energy: 4.8, alignment: 90, color: '#cc88ff', hue: 280, val: 90, y: 0.12, element: 'Thought', desc: 'Brain, pineal gland, skin, hormone balance' },
]

// ── DOSHAS ────────────────────────────────────────────────────────────────────
export const DOSHAS = [
  { id: 'vata',  label: 'Vata',  value: 0.41, deviation: 8.21,  color: '#44aaff', element: 'Air + Ether',  desc: 'Movement, breathing, circulation, nerve impulses' },
  { id: 'pitta', label: 'Pitta', value: 0.04, deviation: 0.88,  color: '#ff8833', element: 'Fire + Water', desc: 'Digestion, metabolism, energy production' },
  { id: 'kapha', label: 'Kapha', value: 0.56, deviation: 11.19, color: '#44ccaa', element: 'Earth + Water', desc: 'Structure and lubrication in the body' },
]

// ── YIN-YANG MERIDIANS ────────────────────────────────────────────────────────
export const MERIDIANS = [
  { id: 'lung',    name: 'Yin of Lungs',          energy: 6.52, balance: 94,  level: 'High',   element: 'Metal', color: '#aaddff' },
  { id: 'largeInt',name: 'Yang of Large Intestine',energy: 5.08, balance: 95,  level: 'Normal', element: 'Metal', color: '#aaddff' },
  { id: 'stomach', name: 'Yang of Stomach',        energy: 6.28, balance: null, level: 'High',   element: 'Earth', color: '#ffdd88' },
  { id: 'spleen',  name: 'Yin of Spleen',          energy: 5.03, balance: 90,  level: 'Normal', element: 'Earth', color: '#ffdd88' },
  { id: 'heart',   name: 'Yin of Heart',           energy: 4.14, balance: 97,  level: 'Normal', element: 'Fire',  color: '#ff8888' },
  { id: 'smallInt',name: 'Yang of Small Intestine',energy: 5.09, balance: 91,  level: 'Normal', element: 'Fire',  color: '#ff8888' },
  { id: 'bladder', name: 'Yang of Bladder',        energy: 7.52, balance: 72,  level: 'High',   element: 'Water', color: '#88ccff' },
  { id: 'kidney',  name: 'Yin of Kidneys',         energy: 5.96, balance: 84,  level: 'Normal', element: 'Water', color: '#88ccff' },
  { id: 'pericard',name: 'Yin of Pericardium',     energy: 5.39, balance: 87,  level: 'Normal', element: 'Fire',  color: '#ff8888' },
  { id: 'triple',  name: 'Yang of Triple Warmer',  energy: 5.25, balance: 95,  level: 'Normal', element: 'Fire',  color: '#ff8888' },
  { id: 'gallbld', name: 'Yang of Gallbladder',    energy: 4.67, balance: null, level: 'Normal', element: 'Wood',  color: '#88ff88' },
  { id: 'liver',   name: 'Yin of Liver',           energy: 6.05, balance: 55,  level: 'High',   element: 'Wood',  color: '#88ff88', alert: true },
]

// ── ORGAN SYSTEMS TABLE ───────────────────────────────────────────────────────
export const ORGAN_SYSTEMS = [
  { system: 'Head', organ: null,                        energy: 4.51, balance: 95.41 },
  { system: 'Head', organ: 'Eyes',                      energy: 4.02, balance: 86.85 },
  { system: 'Head', organ: 'Ears, Nose, Maxillary Sinus', energy: 4.06, balance: 84.26 },
  { system: 'Head', organ: 'Jaw, Teeth',                energy: 4.66, balance: 96.51 },
  { system: 'Head', organ: 'Cerebral Zone (Cortex)',    energy: 4.49, balance: 85.28 },
  { system: 'Head', organ: 'Cerebral Zone (Vessels)',   energy: 4.76, balance: 84.93 },
  { system: 'Head', organ: 'Hypothalamus',              energy: 4.07, balance: 87.15 },
  { system: 'Head', organ: 'Epiphysis',                 energy: 4.83, balance: 93.11 },
  { system: 'Head', organ: 'Pituitary Gland',           energy: 5.18, balance: 76.02 },
  { system: 'Cardiovascular', organ: null,              energy: 4.91, balance: 96.94 },
  { system: 'Cardiovascular', organ: 'Cardiovascular System', energy: 5.39, balance: 87.03 },
  { system: 'Cardiovascular', organ: 'Heart',           energy: 4.14, balance: 97.36 },
  { system: 'Cardiovascular', organ: 'Cerebral Zone (Vessels)', energy: 4.76, balance: 84.93 },
  { system: 'Cardiovascular', organ: 'Coronary Vessels', energy: 5.35, balance: 91.15 },
  { system: 'Respiratory', organ: null,                 energy: 6.52, balance: 93.80 },
  { system: 'Respiratory', organ: 'Throat, Larynx, Trachea', energy: 8.18, balance: 97.50 },
  { system: 'Respiratory', organ: 'Mammary Glands / Respiratory', energy: 6.35, balance: 75.26 },
  { system: 'Respiratory', organ: 'Thorax Zone',        energy: 5.02, balance: 88.75 },
  { system: 'Endocrine', organ: null,                   energy: 5.25, balance: 94.69 },
  { system: 'Endocrine', organ: 'Hypothalamus',         energy: 4.07, balance: 87.15 },
  { system: 'Endocrine', organ: 'Epiphysis',            energy: 4.83, balance: 93.11 },
  { system: 'Endocrine', organ: 'Pituitary Gland',      energy: 5.18, balance: 76.02 },
  { system: 'Endocrine', organ: 'Thyroid Gland',        energy: 6.55, balance: 94.64 },
  { system: 'Endocrine', organ: 'Pancreas',             energy: 5.37, balance: 77.05 },
  { system: 'Endocrine', organ: 'Adrenals',             energy: 6.07, balance: 72.45, alert: true },
  { system: 'Endocrine', organ: 'Spleen',               energy: 4.68, balance: 94.61 },
  { system: 'Musculoskeletal', organ: null,             energy: 6.22, balance: 98.12 },
  { system: 'Musculoskeletal', organ: 'Spine - Cervical Zone', energy: 4.66, balance: 82.12 },
  { system: 'Musculoskeletal', organ: 'Spine - Thorax Zone',  energy: 4.45, balance: 81.55 },
  { system: 'Musculoskeletal', organ: 'Spine - Lumbar Zone',  energy: 5.40, balance: 92.59 },
  { system: 'Musculoskeletal', organ: 'Sacrum',         energy: 7.51, balance: 64.17, alert: true },
  { system: 'Musculoskeletal', organ: 'Coccyx / Pelvis Minor', energy: 9.10, balance: 86.58 },
  { system: 'Digestive', organ: null,                   energy: 5.28, balance: 87.77 },
  { system: 'Digestive', organ: 'Colon - Descending',   energy: 4.47, balance: 100.00 },
  { system: 'Digestive', organ: 'Colon - Sigmoid',      energy: 4.92, balance: 100.00 },
  { system: 'Digestive', organ: 'Rectum',               energy: 6.46, balance: 100.00 },
  { system: 'Digestive', organ: 'Blind Gut',            energy: 6.51, balance: 100.00 },
  { system: 'Digestive', organ: 'Colon - Ascending',    energy: 4.61, balance: 100.00 },
  { system: 'Digestive', organ: 'Colon - Transverse',   energy: 4.23, balance: 87.56 },
  { system: 'Digestive', organ: 'Duodenum',             energy: 5.08, balance: 100.00 },
  { system: 'Digestive', organ: 'Ileum',                energy: 4.62, balance: 100.00 },
  { system: 'Digestive', organ: 'Jejunum',              energy: 5.33, balance: 100.00 },
  { system: 'Digestive', organ: 'Liver',                energy: 6.05, balance: 55.26, alert: true },
  { system: 'Digestive', organ: 'Pancreas',             energy: 5.37, balance: 77.05 },
  { system: 'Digestive', organ: 'Gallbladder',          energy: 4.67, balance: 100.00 },
  { system: 'Digestive', organ: 'Appendix',             energy: 5.18, balance: 100.00 },
  { system: 'Digestive', organ: 'Abdominal Zone',       energy: 6.28, balance: 100.00 },
  { system: 'Urogenital', organ: null,                  energy: 6.74, balance: 77.19 },
  { system: 'Urogenital', organ: 'Urogenital System',   energy: 7.52, balance: 72.08, alert: true },
  { system: 'Urogenital', organ: 'Kidneys',             energy: 5.96, balance: 83.63 },
  { system: 'Nervous', organ: null,                     energy: 4.06, balance: 65.37, alert: true },
  { system: 'Nervous', organ: 'Nervous System',         energy: 4.06, balance: 65.37, alert: true },
  { system: 'Immune', organ: null,                      energy: 4.55, balance: 70.89 },
  { system: 'Immune', organ: 'Immune System',           energy: 4.55, balance: 70.89 },
]

// ── FINGER DATA ───────────────────────────────────────────────────────────────
export const FINGER_DATA = [
  { id: 'L1', label: 'L1', name: 'L. Thumb',  hand: 'left',  seed: 2.1, energy: 72 },
  { id: 'L2', label: 'L2', name: 'L. Index',  hand: 'left',  seed: 3.7, energy: 81 },
  { id: 'L3', label: 'L3', name: 'L. Middle', hand: 'left',  seed: 5.2, energy: 68 },
  { id: 'L4', label: 'L4', name: 'L. Ring',   hand: 'left',  seed: 1.8, energy: 75 },
  { id: 'L5', label: 'L5', name: 'L. Pinky',  hand: 'left',  seed: 4.4, energy: 84 },
  { id: 'R1', label: 'R1', name: 'R. Thumb',  hand: 'right', seed: 6.1, energy: 79 },
  { id: 'R2', label: 'R2', name: 'R. Index',  hand: 'right', seed: 2.9, energy: 74 },
  { id: 'R3', label: 'R3', name: 'R. Middle', hand: 'right', seed: 7.3, energy: 88 },
  { id: 'R4', label: 'R4', name: 'R. Ring',   hand: 'right', seed: 3.1, energy: 71 },
  { id: 'R5', label: 'R5', name: 'R. Pinky',  hand: 'right', seed: 5.8, energy: 77 },
]

// ── SESSION HISTORY ───────────────────────────────────────────────────────────
export const SESSION_HISTORY = [
  { id: 1,  date: '2024-12-15', score: 55, stress: 51, vitality: 58, balance: 78, label: 'Dec 15' },
  { id: 2,  date: '2025-01-12', score: 58, stress: 47, vitality: 61, balance: 80, label: 'Jan 12' },
  { id: 3,  date: '2025-02-03', score: 60, stress: 45, vitality: 63, balance: 82, label: 'Feb 3'  },
  { id: 4,  date: '2025-02-19', score: 59, stress: 44, vitality: 62, balance: 81, label: 'Feb 19' },
  { id: 5,  date: '2025-03-07', score: 61, stress: 42, vitality: 64, balance: 84, label: 'Mar 7'  },
  { id: 6,  date: '2025-03-24', score: 64, stress: 39, vitality: 67, balance: 86, label: 'Mar 24' },
  { id: 7,  date: '2025-04-10', score: 63, stress: 37, vitality: 66, balance: 85, label: 'Apr 10' },
  { id: 8,  date: '2025-05-01', score: 67, stress: 35, vitality: 70, balance: 88, label: 'May 1'  },
  { id: 9,  date: '2025-05-18', score: 65, stress: 33, vitality: 72, balance: 87, label: 'May 18' },
  { id: 10, date: '2025-06-01', score: 69, stress: 31, vitality: 74, balance: 90, label: 'Jun 1'  },
  { id: 11, date: '2025-06-10', score: 70, stress: 30, vitality: 75, balance: 93, label: 'Jun 10' },
  { id: 12, date: '2025-06-18', score: 68, stress: 30, vitality: 72, balance: 93, label: 'Jun 18' },
]

// ── DEVICE ────────────────────────────────────────────────────────────────────
export const DEVICE_INFO = {
  model: 'Bio-Well 3.0',
  serial: 'BW3-2024-08172',
  firmware: 'v3.2.1',
  calibration: '2025-06-01',
  status: 'Connected',
  battery: 94,
  port: 'USB-C / COM3',
}

export const SCAN_RESULTS = {
  totalEnergy:  { label: 'Total Energy',  val: '53 J×10⁻²', color: 'var(--bw-blue-hi)' },
  lrBalance:    { label: 'L/R Balance',   val: '92.93%',     color: 'var(--bw-green)' },
  stressIndex:  { label: 'Stress',        val: '2.99 OPT',   color: 'var(--bw-gold)' },
  scanQuality:  { label: 'Alignment',     val: '92%',        color: 'var(--bw-cyan)' },
}

export const DATA_FEED = [
  ['17:04:01', 'L1', '287', '+2.4%'],
  ['17:04:01', 'L2', '312', '+1.1%'],
  ['17:04:01', 'R1', '298', '+3.2%'],
  ['17:04:02', 'R3', '271', '-0.8%'],
  ['17:04:02', 'L4', '334', '+4.1%'],
  ['17:04:03', 'R2', '289', '+1.7%'],
  ['17:04:03', 'L3', '305', '+2.9%'],
  ['17:04:04', 'R4', '318', '-1.2%'],
  ['17:04:04', 'L5', '292', '+0.5%'],
  ['17:04:05', 'R5', '308', '+3.6%'],
]

export const DASHBOARD_STATS = [
  { label: 'Total Energy',  value: '53',     unit: 'Joules ×10⁻²', color: 'var(--bw-blue-hi)', icon: '◉' },
  { label: 'Stress Level',  value: '2.99',   unit: 'Optimal',       color: 'var(--bw-cyan)',    icon: '◈' },
  { label: 'Alignment',     value: '92%',    unit: 'chakra avg',    color: 'var(--bw-green)',   icon: '◇' },
  { label: 'Disbalance',    value: '7.02%',  unit: 'left dominant', color: 'var(--bw-gold)',    icon: '◬' },
]

export const REPORT = {
  generatedAt: '2025-06-18T17:04:01Z',
  practitioner: 'Dr. Konstantin Korotkov',
  patient: 'Catherine The Great',
  sessionId: 20250618,
  overallScore: 68,
  summary: 'Energy field shows Optimal stress (2.99) and Optimal energy level (53.32 J). Medium left-side organ disbalance at 7.02% with 8L / 2R organs flagged. Three lifestyle spheres require attention: Physical Activity (58%), Psychology (72%), and Hormonal Activity (58%). Chakra alignment is strong at 92% overall. Liver meridian shows notable imbalance at 55% balance.',
  recommendations: [
    'Increase physical activity — daily sunrise movement, post-meal walks 30–60 mins',
    'Pranayama breathing twice daily (10 mins) for psychological balance',
    'Avoid sugar, gluten, fermented dairy to support hormonal harmony',
    'Ghee daily (1 tsp) + herbal teas (chamomile, turmeric) for liver support',
    'Align sleep cycle with circadian rhythm — early wake, reduce screen time after sunset',
    'Follow-up scan in 2–3 weeks to monitor disbalance trends',
  ],
}

// Legacy alias for OrgansPage
export const ORGAN_DATA = [
  { name: 'Nervous System',  val: 65, color: 'var(--bw-rose)',    zones: 'L1, R1', description: 'Low balance (65.37%) — highest priority zone', status: 'Needs Attention' },
  { name: 'Liver',            val: 55, color: 'var(--bw-gold)',    zones: 'L4, R4', description: 'High energy but poor balance (55.26%) — Wood element', status: 'Needs Attention' },
  { name: 'Adrenals',         val: 72, color: 'var(--bw-orange)',  zones: 'L3, R3', description: 'Adrenal balance at 72.45% — stress axis', status: 'Needs Attention' },
  { name: 'Sacrum',           val: 64, color: 'var(--bw-rose)',    zones: 'L5, R5', description: 'Very high energy (7.51) with 64.17% balance', status: 'Needs Attention' },
  { name: 'Urogenital',       val: 72, color: 'var(--bw-blue-hi)', zones: 'L2, R2', description: 'Elevated energy (7.52) with 72.08% balance', status: 'Needs Attention' },
  { name: 'Heart',            val: 97, color: 'var(--bw-green)',   zones: 'L4, R4', description: 'Excellent balance (97.36%) — Fire element strong', status: 'Optimal' },
  { name: 'Lungs',            val: 94, color: 'var(--bw-cyan)',    zones: 'L2, R2', description: 'High energy (6.52) + strong balance (93.8%)', status: 'Optimal' },
  { name: 'Thyroid',          val: 95, color: 'var(--bw-green)',   zones: 'L3, R3', description: 'Strong thyroid energy and balance (94.64%)', status: 'Optimal' },
  { name: 'Kidneys',          val: 84, color: 'var(--bw-blue-hi)', zones: 'L5, R5', description: 'Normal energy (5.96) and 83.63% balance', status: 'Balanced' },
]
