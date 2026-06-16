export function LoadingSpinner({ label = 'Processing' }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
      <span className="spinner-3d relative inline-block" />
      <span>{label}</span>
    </div>
  );
}
