export default function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-32 bg-slate-800/40 rounded-2xl"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-40 bg-slate-800/40 rounded-2xl"></div>
        <div className="h-40 bg-slate-800/40 rounded-2xl"></div>
        <div className="h-40 bg-slate-800/40 rounded-2xl"></div>
      </div>
    </div>
  )
}