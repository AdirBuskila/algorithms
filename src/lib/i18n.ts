import type { Group, Locale } from "./content";
import type { DefinitionCategory } from "./definitions";
import type { PatternCategory } from "./patterns";

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
  definitions: {
    navLabel: string;
    title: string;
    intro: string;
    searchPlaceholder: string;
    noResults: string;
    linkTitle: string;
    categories: Record<DefinitionCategory, string>;
  };
  decision: {
    startHere: string;
    title: string;
    intro: string;
    back: string;
    reset: string;
    searchLabel: string;
  };
  patterns: {
    navLabel: string;
    title: string;
    intro: string;
    searchPlaceholder: string;
    noResults: string;
    trigger: string;
    uses: string;
    appearsIn: string;
    categories: Record<PatternCategory, string>;
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
    definitions: {
      navLabel: "Definitions",
      title: "Definitions",
      intro:
        "The core graph terms that recur on the exams, grouped by topic. Type to filter, and follow a term to its algorithm page where one exists.",
      searchPlaceholder: "Filter definitions…",
      noResults: "No matching definitions",
      linkTitle: "Open the related algorithm page",
      categories: {
        "graph-basics": "Graph basics",
        connectivity: "Connectivity",
        trees: "Trees & forests",
        distances: "Distances",
        "special-graphs": "Special graphs",
        ordering: "Ordering & closure",
        flow: "Flow & cuts",
        matching: "Matching & cover",
      },
    },
    decision: {
      startHere: "Start here",
      title: "Which algorithm does the question want?",
      intro:
        "Answer one question at a time and follow it to the tool — the same triage you should do in the first minute of every exam question.",
      back: "Back",
      reset: "Start over",
      searchLabel: "Decision map — which algorithm?",
    },
    patterns: {
      navLabel: "Patterns",
      title: "Reduction & technique patterns",
      intro:
        "Cross-algorithm tricks that belong to no single algorithm: how to recognize them, the move itself, and which tools they run on. These are what Question 2 (algorithm design) is built from.",
      searchPlaceholder: "Filter patterns…",
      noResults: "No matching patterns",
      trigger: "When you see",
      uses: "Uses",
      appearsIn: "Appears in patterns",
      categories: {
        reduction: "Reductions to flow & known tools",
        "scc-toolkit": "SCC toolkit",
        transform: "Graph transforms",
        tree: "Trees",
      },
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
    definitions: {
      navLabel: "הגדרות",
      title: "הגדרות",
      intro:
        "מונחי הגרפים המרכזיים שחוזרים במבחנים, מקובצים לפי נושא. הקלידו לסינון, ולחצו על מונח כדי לעבור לדף האלגוריתם כשקיים כזה.",
      searchPlaceholder: "סינון הגדרות…",
      noResults: "אין הגדרות תואמות",
      linkTitle: "פתיחת דף האלגוריתם הקשור",
      categories: {
        "graph-basics": "יסודות הגרף",
        connectivity: "קשירוּת",
        trees: "עצים ויערות",
        distances: "מרחקים",
        "special-graphs": "גרפים מיוחדים",
        ordering: "סדר וסגור",
        flow: "זרימה וחתכים",
        matching: "זיווג וכיסוי",
      },
    },
    decision: {
      startHere: "מתחילים כאן",
      title: "איזה אלגוריתם השאלה מבקשת?",
      intro:
        "עונים על שאלה אחת בכל פעם ועוקבים עד הכלי — אותו סיווג בדיוק שכדאי לעשות בדקה הראשונה של כל שאלה במבחן.",
      back: "חזרה",
      reset: "להתחיל מחדש",
      searchLabel: "מפת החלטה — איזה אלגוריתם?",
    },
    patterns: {
      navLabel: "תבניות",
      title: "תבניות רדוקציה וטכניקות",
      intro:
        "טריקים חוצי-אלגוריתמים שאינם שייכים לאלגוריתם בודד: איך לזהות אותם, המהלך עצמו, ועל אילו כלים הם רצים. מאלה בנויה שאלה 2 (תכנון אלגוריתם).",
      searchPlaceholder: "סינון תבניות…",
      noResults: "אין תבניות תואמות",
      trigger: "כשרואים",
      uses: "משתמש ב-",
      appearsIn: "מופיע בתבניות",
      categories: {
        reduction: "רדוקציות לזרימה וכלים מוכרים",
        "scc-toolkit": "ארגז כלים ל-SCC",
        transform: "טרנספורמציות גרף",
        tree: "עצים",
      },
    },
  },
};

export function t(lang: Locale): Dict {
  return STRINGS[lang];
}
