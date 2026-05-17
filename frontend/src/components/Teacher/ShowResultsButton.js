import { Link } from 'react-router-dom';

const ShowResultsButton = ({ examId, resultCount = 0, hasResults = false }) => {
  if (hasResults || resultCount > 0) {
    return (
      <Link to={`/teacher/submissions/${examId}`} className="btn-secondary text-sm">
        Show Results ({resultCount})
      </Link>
    );
  }

  return (
    <span className="text-xs text-gray-400 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg" title="Results appear after students submit exams">
      No results yet
    </span>
  );
};

export default ShowResultsButton;
