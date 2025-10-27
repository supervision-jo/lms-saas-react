import { Download } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  currentLessonData: Lesson | undefined;
  onArticleComplete: (goNext: boolean) => Promise<void>;
}

const getPath = (u?: string) => {
  if (!u) return "";
  try {
    return new URL(u).pathname.toLowerCase();
  } catch {
    return u.toLowerCase(); // fallback if it's not a full URL
  }
};

const isImagePath = (p: string) =>
  /\.(png|jpe?g|gif|webp|bmp|svg|tiff?)$/i.test(p);

const isPdfPath = (p: string) => /\.pdf$/i.test(p);

export default function Material({
  currentLessonData,
  onArticleComplete,
}: Props) {
  const { t } = useTranslation("coursePlayer");
  const fileUrl = (currentLessonData as any)?.file ?? "";
  const path = getPath(fileUrl);
  const isImg = isImagePath(path);
  const isPdf = isPdfPath(path);

  const [downloading, setDownloading] = useState(false);

  const downloadMaterial = async (rawUrl?: string) => {
    if (!rawUrl) return;
    try {
      setDownloading(true);

      const u = new URL(rawUrl);
      const pathname = u.pathname;
      const base = pathname.substring(pathname.lastIndexOf("/") + 1) || "file";
      const filename = base.includes(".") ? base : `${base}.download`;

      const res = await fetch(rawUrl, { method: "GET" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (e: any) {
      console.log(e);
      window.open(rawUrl, "_blank");
    } finally {
      setDownloading(false);
    }
  };

  const safeFileName = useMemo(() => {
    if (!fileUrl) return "";
    try {
      return decodeURIComponent(
        new URL(fileUrl).pathname.split("/").pop() || ""
      );
    } catch {
      // if it's not a full URL, show the tail
      const parts = fileUrl.split("/");
      return parts[parts.length - 1] || "file";
    }
  }, [fileUrl]);

  // Common small download button (top-left)
  const DownloadPill = (
    <button
      onClick={() => downloadMaterial(fileUrl)}
      className="absolute left-3 top-3 z-20 inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/90 border border-gray-200 shadow hover:bg-white"
      title={downloading ? t("content.downloading") : t("content.download")}
    >
      <Download className="w-5 h-5 text-gray-700" />
    </button>
  );

  // Image preview
  if (isImg && fileUrl) {
    return (
      <div className="relative bg-white rounded-lg p-4 shadow-lg">
        {DownloadPill}
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-2xl font-semibold text-gray-900 text-center">
            {currentLessonData?.title}
          </h1>
          {currentLessonData?.description && (
            <p className="text-gray-600 text-center">
              {currentLessonData.description}
            </p>
          )}
          <img
            src={fileUrl}
            alt={safeFileName || "material image"}
            className="max-h-[70vh] w-auto rounded-lg border border-gray-200 object-contain"
            loading="eager"
          />
          {safeFileName && (
            <div className="text-sm text-gray-500 break-all">
              {safeFileName}
            </div>
          )}
          <div className="w-full flex justify-end">
            <button
              onClick={() => onArticleComplete(true)}
              className="inline-flex items-center px-4 mt-2 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              {t("content.markComplete")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // PDF preview
  if (isPdf && fileUrl) {
    return (
      <div className="relative bg-white rounded-lg p-4 shadow-lg">
        {DownloadPill}
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-semibold text-gray-900 text-center">
            {currentLessonData?.title}
          </h1>
          {currentLessonData?.description && (
            <p className="text-gray-600 text-center">
              {currentLessonData.description}
            </p>
          )}

          <div className="rounded-lg border border-gray-200 overflow-hidden">
            {/* Use <iframe>. If you later need better UX, swap to react-pdf */}
            <iframe
              src={fileUrl}
              className="w-full h-[70vh]"
              title={safeFileName || "PDF preview"}
            />
          </div>

          {safeFileName && (
            <div className="text-sm text-gray-500 text-center break-all">
              {safeFileName}
            </div>
          )}

          <div className="w-full flex justify-end">
            <button
              onClick={() => onArticleComplete(true)}
              className="inline-flex items-center px-4 mt-2 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              {t("content.markComplete")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Fallback: unknown type → keep current download card
  return (
    <div className="relative bg-white rounded-lg p-8 shadow-lg">
      {DownloadPill /* still show the small top-left download */}
      <div className="max-w-4xl mx-auto text-center pt-10">
        <button
          onClick={() => downloadMaterial(fileUrl)}
          className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6"
          title={downloading ? t("content.downloading") : t("content.download")}
        >
          <Download className="w-10 h-10 text-orange-600" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {currentLessonData?.title}
        </h1>
        <p className="text-gray-600 mb-8">{currentLessonData?.description}</p>
        {fileUrl && (
          <div className="text-sm text-gray-500 break-all">{safeFileName}</div>
        )}
      </div>
      <button
        onClick={() => onArticleComplete(true)}
        className="inline-flex items-center px-4 mt-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 self-end"
      >
        {t("content.markComplete")}
      </button>
    </div>
  );
}
