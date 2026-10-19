import { handleForm } from "@/lib/forms";
export const dynamic = "force-dynamic";
export async function POST(req: Request) { return handleForm(req, true, "records_offer"); }
