import { cn } from "@/lib/utils";

/**
 * Ascent app icon: same mark as the favicon (mountain peak on brand gradient).
 * Use this everywhere you need the app logo so icons and favicon stay identical.
 */
export function AscentIcon({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center",
        className
      )}
      style={{
        background:
          "linear-gradient(135deg, #16a34a 0%, #059669 50%, #0d9488 100%)",
        borderRadius: "22%",
      }}
    >
      <svg
        width="56%"
        height="56%"
        viewBox="0 0 24 24"
        fill="none"
        className="mb-[2%]"
        aria-hidden
      >
        <path
          d="M12 4L4 20h16L12 4z"
          fill="white"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="0.5"
        />
      </svg>
    </span>
  );
}
