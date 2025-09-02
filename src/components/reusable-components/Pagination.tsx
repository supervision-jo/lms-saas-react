type PaginationProps = {
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  boundaryCount?: number;
};

const DOTS = "…";

function getRange(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

function buildPagination(
  totalPages: number,
  page: number,
  siblingCount = 1,
  boundaryCount = 1
): Array<number | typeof DOTS> {
  if (totalPages <= 1) return [1];

  const startPages = getRange(1, Math.min(boundaryCount, totalPages));
  const endPages = getRange(
    Math.max(totalPages - boundaryCount + 1, boundaryCount + 1),
    totalPages
  );

  const leftSibling = Math.max(page - siblingCount, boundaryCount + 1);
  const rightSibling = Math.min(
    page + siblingCount,
    totalPages - boundaryCount
  );

  const showLeftDots = leftSibling > boundaryCount + 2;
  const showRightDots = rightSibling < totalPages - boundaryCount - 1;

  const middlePages = getRange(
    Math.max(leftSibling, boundaryCount + 1),
    Math.min(rightSibling, totalPages - boundaryCount)
  );

  const pages: Array<number | typeof DOTS> = [];

  pages.push(...startPages);

  if (showLeftDots) pages.push(DOTS);

  const middle = middlePages.filter(
    (p) => !startPages.includes(p) && !endPages.includes(p)
  );
  pages.push(...middle);

  if (showRightDots) pages.push(DOTS);

  endPages.forEach((p) => {
    if (!pages.includes(p)) pages.push(p);
  });

  return pages;
}

export default function Pagination({
  total,
  page,
  pageSize,
  onPageChange,
  siblingCount = 1,
  boundaryCount = 1,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / Math.max(1, pageSize)));
  const current = Math.min(Math.max(1, page), totalPages);

  const items = buildPagination(
    totalPages,
    current,
    siblingCount,
    boundaryCount
  );

  if (totalPages <= 1) return null;

  return (
    <div className="mt-12 flex items-center justify-center">
      <nav className="flex items-center space-x-2" aria-label="Pagination">
        {/* Prev */}
        <button
          type="button"
          className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg disabled:opacity-50"
          onClick={() => onPageChange(current - 1)}
          disabled={current <= 1}
        >
          Previous
        </button>

        {/* Page items */}
        {items.map((p, idx) =>
          p === DOTS ? (
            <span
              key={`dots-${idx}`}
              className="px-4 py-2 text-gray-500 select-none"
            >
              {DOTS}
            </span>
          ) : (
            <button
              type="button"
              key={p}
              onClick={() => onPageChange(p as number)}
              aria-current={p === current ? "page" : undefined}
              className={`px-4 py-2 rounded-lg ${
                p === current
                  ? "bg-purple-600 text-white"
                  : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              {p}
            </button>
          )
        )}

        {/* Next */}
        <button
          type="button"
          className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg disabled:opacity-50"
          onClick={() => {
            onPageChange(current + 1);
          }}
          disabled={current >= totalPages}
        >
          Next
        </button>
      </nav>
    </div>
  );
}
