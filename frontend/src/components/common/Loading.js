const Loading = ({ fullScreen = false, text = 'Loading...' }) => (
  <div className={`flex flex-col items-center justify-center gap-3 ${fullScreen ? 'min-h-screen' : 'py-12'}`}>
    <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    <p className="text-gray-500 dark:text-gray-400 text-sm">{text}</p>
  </div>
);

export default Loading;
