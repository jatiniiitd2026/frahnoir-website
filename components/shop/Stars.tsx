/** Read-only 5-star rating display in gold. */
export default function Stars({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) {
  return (
    <span className={`inline-flex gap-0.5 text-sm ${className}`} aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={i <= value ? "text-velvet-gold" : "text-velvet-cream/20"}
        >
          ★
        </span>
      ))}
    </span>
  );
}
