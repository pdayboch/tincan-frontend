interface ErrorBadgeProps {
  errorMessage: string | null;
  children: React.ReactNode;
}

export default function ErrorBadge({ errorMessage, children }: ErrorBadgeProps) {
  return (
    <div className="relative group h-full w-full">
      {errorMessage && (
        <div className="absolute top-[-2rem] left-1/2 transform -translate-x-1/2 hidden group-hover:block">
          <span className="px-3 py-1 bg-red-500 text-white text-xs rounded-md shadow-md">
            {errorMessage}
          </span>
        </div>
      )}
      {children}
    </div>
  );
};