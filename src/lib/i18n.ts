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
  search: string;
  searchPlaceholder: string;
  searchHint: string;
  noResults: string;
  navAlgorithms: string;
  prev: string;
  next: string;
  difficulty: Record<"easy" | "medium" | "hard", string>;
  groups: Record<Group, string>;
  practice: {
    navLabel: string;
    title: string;
    intro: string;
    practiceThisTopic: string;
    practiceAll: string;
    reviewFlagged: string;
    questionsWord: string;
    labelTrue: string;
    labelFalse: string;
    correct: string;
    incorrect: string;
    why: string;
    next: string;
    readNote: string;
    wentThrough: string;
    worthReview: string;
    practiceThese: string;
    newSet: string;
    backToNotes: string;
    allClear: string;
    noQuestions: string;
  };
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
    search: "Search",
    searchPlaceholder: "Search algorithms…",
    searchHint: "Search",
    noResults: "No matching algorithms",
    navAlgorithms: "Algorithms",
    prev: "Previous",
    next: "Next",
    difficulty: { easy: "Easy", medium: "Medium", hard: "Hard" },
    groups: {
      traversal: "Traversal",
      connectivity: "Connectivity & Ordering",
      "shortest-paths": "Shortest Paths",
      "flow-matching": "Flow & Matching",
      approximation: "Approximation & DP",
      reference: "Reference",
    },
    practice: {
      navLabel: "Practice",
      title: "Practice",
      intro:
        "Quick True/False drills on real past-exam claims. Answer, then read why — this is practice, not a graded test.",
      practiceThisTopic: "Practice this topic",
      practiceAll: "Practice all",
      reviewFlagged: "Review flagged claims",
      questionsWord: "claims",
      labelTrue: "True",
      labelFalse: "False",
      correct: "Correct",
      incorrect: "Not quite",
      why: "Why",
      next: "Next",
      readNote: "Read the note",
      wentThrough: "You went through",
      worthReview: "Worth another look",
      practiceThese: "Practice these again",
      newSet: "New set",
      backToNotes: "Back to notes",
      allClear: "Nice — nothing flagged for review.",
      noQuestions: "No practice questions yet.",
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
    search: "חיפוש",
    searchPlaceholder: "חיפוש אלגוריתמים…",
    searchHint: "חיפוש",
    noResults: "אין אלגוריתמים תואמים",
    navAlgorithms: "אלגוריתמים",
    prev: "הקודם",
    next: "הבא",
    difficulty: { easy: "קל", medium: "בינוני", hard: "מאתגר" },
    groups: {
      traversal: "סריקה",
      connectivity: "קשירוּת וסדר",
      "shortest-paths": "מסלולים קצרים ביותר",
      "flow-matching": "זרימה והתאמה",
      approximation: "קירוב ותכנון דינמי",
      reference: "עזר",
    },
    practice: {
      navLabel: "תרגול",
      title: "תרגול",
      intro:
        "תרגול נכון/לא-נכון מהיר על טענות אמיתיות ממבחנים. ענו, ואז קראו למה — זהו תרגול, לא מבחן עם ציון.",
      practiceThisTopic: "תרגול הנושא הזה",
      practiceAll: "תרגול הכול",
      reviewFlagged: "חזרה על טענות מסומנות",
      questionsWord: "טענות",
      labelTrue: "נכון",
      labelFalse: "לא נכון",
      correct: "נכון!",
      incorrect: "לא בדיוק",
      why: "למה",
      next: "הבא",
      readNote: "למעבר לדף",
      wentThrough: "עברת על",
      worthReview: "שווה מבט נוסף",
      practiceThese: "תרגול שוב",
      newSet: "סבב חדש",
      backToNotes: "חזרה לסיכומים",
      allClear: "יפה — אין טענות מסומנות לחזרה.",
      noQuestions: "אין עדיין שאלות תרגול.",
    },
  },
};

export function t(lang: Locale): Dict {
  return STRINGS[lang];
}
