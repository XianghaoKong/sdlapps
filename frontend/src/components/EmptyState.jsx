// src/components/EmptyState.jsx
const EmptyState = ({ title, subtitle, actionText, onAction }) => {
  return (
    <div className="w-full rounded-lg border border-dashed p-8 text-center bg-white">
      <div className="mx-auto mb-2 h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
        <span className="text-blue-600 text-xl">ℹ️</span>
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
