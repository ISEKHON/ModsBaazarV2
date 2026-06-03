type LoadingSize = "sm" | "md";

type LoadingIndicatorProps = {
  label?: string;
  size?: LoadingSize;
  className?: string;
};

export default function LoadingIndicator({
  label = "Loading",
  size = "md",
  className = "",
}: LoadingIndicatorProps) {
  const spinnerClass = size === "sm" ? "spinner spinner-sm" : "spinner";

  return (
    <div className={`loading-indicator ${className}`}>
      <span className={spinnerClass} aria-hidden="true" />
      <span className="mono text-xs text-[var(--color-muted-foreground)]">{label}</span>
    </div>
  );
}
