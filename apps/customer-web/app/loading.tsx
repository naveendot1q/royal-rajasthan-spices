export default function Loading() {
  return (
    <div className="min-h-screen bg-palace-ivory flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="text-5xl animate-float">🌶</div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-royal-gold-500 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
        <p className="text-sm text-gray-400">Loading the flavours…</p>
      </div>
    </div>
  );
}
