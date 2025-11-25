import "./globals.css";
import "leaflet/dist/leaflet.css";
import React from "react";

export const metadata = {
  title: "Mapa — Estabelecimentos",
  description: "Mapa com avaliações — entregador style",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
