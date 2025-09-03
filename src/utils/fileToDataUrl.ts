export const fileToDataUrl = (
  file?: File | null
): Promise<string | undefined> =>
  new Promise((resolve, reject) => {
    if (!file) return resolve(undefined);
    const reader = new FileReader();
    reader.onload = () =>
      resolve(typeof reader.result === "string" ? reader.result : undefined);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
