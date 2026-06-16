type AdSlotProps = {
  label: string;
  size: '728x90' | '300x250';
  className?: string;
};

const dimensions = {
  '728x90': 'h-[90px] w-full max-w-[728px]',
  '300x250': 'h-[250px] w-full max-w-[300px]'
};

export function AdSlot({ label, size, className = '' }: AdSlotProps) {
  return (
    <div className={`ad-slot mx-auto flex ${dimensions[size]} items-center justify-center rounded-3xl text-center text-xs font-semibold uppercase tracking-[0.28em] ${className}`}>
      {label} · {size}
    </div>
  );
}
