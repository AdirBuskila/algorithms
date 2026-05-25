import type { Group, Locale } from "./content";

export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  he: "עברית",
};

export function dir(lang: Locale): "ltr" | "rtl" {
  return lang === "he" ? "rtl" : "ltr";
}

interface Dict {
  htmlTitle: string;
  brand: string;
  brandSuffix: string;
  heroTitle: string;
  heroSubtitle: string;
  algorithmsLabel: string;
  frequencyLabel: string;
  frequencyIntro: string;
  visualization: string;
  complexity: string;
  onExam: string;
  runningTime: string;
  space: string;
  footer: string;
  exams: string;
  tableAlgorithm: string;
  tableAppears: string;
  tableDifficulty: string;
  difficulty: Record<"easy" | "medium" | "hard", string>;
  groups: Record<Group, string>;
}

export const STRINGS: Record<Locale, Dict> = {
  en: {
    htmlTitle: "Algo 2 — Interactive Notes",
    brand: "Algo 2",
    brandSuffix: "Interactive Notes",
    heroTitle: "Algorithms 2 — Graph Algorithms",
    heroSubtitle:
      "Interactive, exam-focused notes for the Algorithms 2 course. Every algorithm has a plain-English explanation, its running and space complexity, and exactly how it shows up on the exam.",
    algorithmsLabel: "The algorithms",
    frequencyLabel: "By exam frequency",
    frequencyIntro:
      "How often each topic has appeared across the 19 past exams (2022–2025). Network flow is in every single one.",
    visualization: "Visualization",
    complexity: "Complexity",
    onExam: "On the exam",
    runningTime: "Running time",
    space: "Space",
    footer:
      "Algorithms 2 (HIT 73106) · interactive course notes · open in any modern browser.",
    exams: "exams",
    tableAlgorithm: "Algorithm",
    tableAppears: "Appears in",
    tableDifficulty: "Difficulty",
    difficulty: { easy: "Easy", medium: "Medium", hard: "Hard" },
    groups: {
      traversal: "Traversal",
      connectivity: "Connectivity & Ordering",
      "shortest-paths": "Shortest Paths",
      "flow-matching": "Flow & Matching",
      approximation: "Approximation & DP",
      reference: "Reference",
    },
  },
  he: {
    htmlTitle: "אלגו 2 — מחברת אינטראקטיבית",
    brand: "אלגו 2",
    brandSuffix: "מחברת אינטראקטיבית",
    heroTitle: "אלגוריתמים 2 — אלגוריתמים על גרפים",
    heroSubtitle:
      "מחברת לימוד אינטראקטיבית וממוקדת-מבחן לקורס אלגוריתמים 2. לכל אלגוריתם יש הסבר בהיר, סיבוכיות זמן ומקום, ובדיוק איך הוא מופיע במבחן.",
    algorithmsLabel: "האלגוריתמים",
    frequencyLabel: "לפי שכיחות במבחן",
    frequencyIntro:
      "כמה פעמים כל נושא הופיע ב-19 המבחנים האחרונים (2022–2025). זרימה ברשתות מופיעה בכל אחד מהם.",
    visualization: "ויזואליזציה",
    complexity: "סיבוכיות",
    onExam: "במבחן",
    runningTime: "זמן ריצה",
    space: "מקום (זיכרון)",
    footer:
      "אלגוריתמים 2 (HIT 73106) · מחברת קורס אינטראקטיבית · נפתח בכל דפדפן מודרני.",
    exams: "מבחנים",
    tableAlgorithm: "אלגוריתם",
    tableAppears: "מופיע ב-",
    tableDifficulty: "רמת קושי",
    difficulty: { easy: "קל", medium: "בינוני", hard: "מאתגר" },
    groups: {
      traversal: "סריקה",
      connectivity: "קשירוּת וסדר",
      "shortest-paths": "מסלולים קצרים ביותר",
      "flow-matching": "זרימה והתאמה",
      approximation: "קירוב ותכנון דינמי",
      reference: "עזר",
    },
  },
};

export function t(lang: Locale): Dict {
  return STRINGS[lang];
}
