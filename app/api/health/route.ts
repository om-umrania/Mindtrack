import packageJson from "@/package.json" assert { type: "json" };
import { getRepoCached } from "@/src/server/repo";
import { jsonOk, jsonErr } from "@/src/server/http";

export async function GET(request: Request) {
  try {
    const repo = await getRepoCached();
    return jsonOk({
      ok: true,
      backend: repo.kind,
      version: packageJson.version,
    });
  } catch (error) {
    console.error("[health] failed to resolve repository", error);
    return jsonErr("Unable to determine backend status", 500);
  }
}
