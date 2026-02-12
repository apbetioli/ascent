import { ImageResponse } from "next/og";

const SIZES = [192, 512] as const;

/**
 * PWA icons at 192x192 and 512x512 (same brand mark as app icon).
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ size: string }> }
) {
  const { size } = await context.params;
  const num = Number.parseInt(size, 10);
  if (!SIZES.includes(num as (typeof SIZES)[number])) {
    return new Response("Not found", { status: 404 });
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #16a34a 0%, #059669 50%, #0d9488 100%)",
          borderRadius: num === 512 ? 96 : 36,
        }}
      >
        <svg
          width={num * 0.55}
          height={num * 0.55}
          viewBox="0 0 24 24"
          fill="none"
          style={{ marginBottom: num * 0.02 }}
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
    {
      width: num,
      height: num,
    }
  );
}
