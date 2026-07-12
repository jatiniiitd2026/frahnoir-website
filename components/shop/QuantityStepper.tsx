"use client";

export default function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="inline-flex items-center rounded-full border border-velvet-gold/30">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="flex h-9 w-9 items-center justify-center text-velvet-cream/80 transition-colors hover:text-velvet-gold"
      >
        −
      </button>
      <span className="w-8 text-center text-sm tabular-nums text-velvet-cream">
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="flex h-9 w-9 items-center justify-center text-velvet-cream/80 transition-colors hover:text-velvet-gold"
      >
        +
      </button>
    </div>
  );
}
