import { getChatGPTUser, platformSignOutPath, safeRelativeReturnPath } from "@/app/chatgpt-auth";

export async function GET(request: Request) {
  const requested = new URL(request.url).searchParams.get("return_to") || "/";
  const returnTo = safeRelativeReturnPath(requested);
  if (!(await getChatGPTUser())) return Response.redirect(new URL(returnTo, request.url), 307);
  return Response.redirect(new URL(platformSignOutPath(returnTo), request.url), 307);
}
