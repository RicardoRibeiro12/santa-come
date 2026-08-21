"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Atualiza os dados da página (menu, pratos do dia, épocas) em segundo plano,
 * sem recarregar o browser nem perder a posição do scroll — para que quem já
 * tem o site aberto veja as alterações dos donos (ex.: prato esgotado) sem
 * precisar de dar F5.
 *
 * Corre sempre a cada `intervalSeconds`, e ainda por cima assim que a aba
 * volta a ficar visível (ex.: o telemóvel acordou do ecrã apagado) — para não
 * ficar "presa" à espera do próximo intervalo depois de voltar a olhar para
 * o site.
 */
export default function AutoRefresh({ intervalSeconds = 45 }: { intervalSeconds?: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => {
      router.refresh();
    }, intervalSeconds * 1000);

    function onVisible() {
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    }
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [router, intervalSeconds]);

  return null;
}
