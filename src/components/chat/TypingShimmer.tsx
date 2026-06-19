export default function TypingShimmer() {
  return (
    <div className="flex justify-start mb-4">
      <div className="avatar-ai w-7 h-7 rounded-full text-xs shrink-0 mt-0.5 mr-2">A</div>
      <div className="bubble-ai px-4 py-3">
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="typing-dot animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
