"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Atualiza os dados da página (menu, pratos do dia, épocas) em segundo plano,
 * sem recarregar o browser nem perder a posição do scroll — para que quem já
 * tem o site aberto veja as alterações dos donos (ex.: prato esgotado) sem
 * precisar de dar F5.
 */
export default function AutoRefresh({ intervalSeconds = 45 }: { intervalSeconds?: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    }, intervalSeconds * 1000);
    return () => clearInterval(id);
  }, [router, intervalSeconds]);

  return null;
}
