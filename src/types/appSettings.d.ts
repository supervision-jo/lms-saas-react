type LanguageEntry = { code: string; name: string };

interface AppSettings {
  is_review_enabled: boolean;
  is_price_enabled: boolean;
  is_registration_enabled: boolean;
  is_courses_filter_enabled: boolean;
  is_Q_and_A_enabled: boolean;
  is_chat_group_enabled: boolean;
  is_lesson_notes_enabled: boolean;
  index_page: "home" | "login";
  languages: LanguageEntry[];
  default_language: LanguageEntry;
  version?: string;
}

const BOOLEAN_FLAGS = [
  "is_review_enabled",
  "is_price_enabled",
  "is_registration_enabled",
  "is_courses_filter_enabled",
  "is_Q_and_A_enabled",
  "is_chat_group_enabled",
  "is_lesson_notes_enabled",
  "index_page",
] as const;

type BooleanFlagKey = (typeof BOOLEAN_FLAGS)[number];
