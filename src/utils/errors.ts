import {
  FieldName,
  ServerErr,
} from "@/pages/dashboard/admin/libraries/AddLibraryPage";

export function applyServerErrors(
  server: ServerErr | undefined,
  setError: (n: FieldName, e: { type: string; message?: string }) => void,
  setFocus?: (n: FieldName) => void
) {
  if (!server) return false;

  const knownFields = new Set<FieldName>([
    "name",
    "email",
    "password",
    "mobile_number",
    "about_me",
    "image",
    "is_active",
  ]);

  let focused = false;

  Object.entries(server).forEach(([k, v]) => {
    if (!knownFields.has(k as FieldName)) return;

    const msg = Array.isArray(v) ? v[0] : String(v ?? "");
    setError(k as FieldName, {
      type: "server",
      message: msg || "قيمة غير مقبولة",
    });

    if (!focused && setFocus) {
      setFocus(k as FieldName);
      focused = true;
    }
  });

  return focused;
}
