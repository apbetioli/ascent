import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

/**
 * Ascent apple-touch-icon for iOS home screen (same brand mark as icon.tsx).
 */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #16a34a 0%, #059669 50%, #0d9488 100%)",
          borderRadius: 36,
        }}
      >
        <svg
          width="100"
          height="100"
          viewBox="0 0 24 24"
          fill="none"
          style={{ marginBottom: 4 }}
        >
          <path
            d="M12 4L4 20h16L12 4z"
            fill="white"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="0.5"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
