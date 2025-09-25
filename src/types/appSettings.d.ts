type LanguageEntry = { code: string; name: string };

interface AppSettings {
  is_review_enabled: boolean;
  is_price_enabled: boolean;
  is_registration_enabled: boolean;
  is_courses_filter_enabled: boolean;
  languages: LanguageEntry[];
  default_language: LanguageEntry;
  version?: string;
}

const BOOLEAN_FLAGS = [
  "is_review_enabled",
  "is_price_enabled",
  "is_registration_enabled",
  "is_courses_filter_enabled",
] as const;

type BooleanFlagKey = (typeof BOOLEAN_FLAGS)[number];
