import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { PageContent } from "@/components/page-content";
import "./globals.css";
export const metadata: Metadata = {
  title: "Maquinal | Arriendo de maquinaria en Santiago",
  description:
    "Encuentra maquinaria para tu proyecto en Santiago y contacta directamente con sus proveedores.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-CL">
      <body>
        <SiteHeader />
        <PageContent>{children}</PageContent>
      </body>
    </html>
  );
}
