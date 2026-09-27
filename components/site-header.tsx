import { getChatGPTUser, chatGPTSignInPath } from "@/app/chatgpt-auth";
import { SiteHeaderClient } from "@/components/site-header-client";

export async function SiteHeader() {
  const user = await getChatGPTUser();
  return (
    <SiteHeaderClient authenticated={Boolean(user)} signInHref={chatGPTSignInPath("/cuenta")} />
  );
}
