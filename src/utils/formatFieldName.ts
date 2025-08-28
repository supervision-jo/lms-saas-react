const formatFieldName = (field: string | undefined): string => {
  if (!field) return "";
  return field
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default formatFieldName;
