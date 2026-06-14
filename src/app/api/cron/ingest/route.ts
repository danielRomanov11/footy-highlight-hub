import { NextRequest, NextResponse } from "next/server";
import { verifyIngestSecret } from "@/lib/ingest/auth";
import { runIngestion } from "@/lib/ingest/pipeline";

export async function GET(request: NextRequest) {
  const authError = verifyIngestSecret(request);
  if (authError) return authError;

  try {
    const result = await runIngestion();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ingestion failed" },
      { status: 500 },
    );
  }
}
