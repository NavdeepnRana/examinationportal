const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, totalPages, hasPrev, hasNext } = pagination;

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={!hasPrev}
        className="btn-secondary text-sm disabled:opacity-40"
      >
        Previous
      </button>
      <span className="text-sm text-gray-600 dark:text-gray-400 px-3">
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={!hasNext}
        className="btn-secondary text-sm disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
