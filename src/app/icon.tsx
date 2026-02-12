import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

/**
 * Ascent app icon: minimal mountain peak in brand gradient (green → teal).
 * Renders sharp at all sizes for favicon, tabs, and PWA.
 */
export default function Icon() {
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
          borderRadius: 8,
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          style={{ marginBottom: 1 }}
        >
          <path
            d="M12 4L4 20h16L12 4z"
            fill="white"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="0.5"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
