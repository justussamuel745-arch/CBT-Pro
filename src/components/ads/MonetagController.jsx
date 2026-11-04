import { useEffect } from "react";
import { useLocation } from "react-router";

import { loadMonetag } from "@lib//utils/monetag";
import { monetagConfig } from "@lib/config/ads.config";

export default function MonetagController() {
  const { pathname } = useLocation();

  const isExcluded = monetagConfig.excludedRoutes.some(
    route =>
      pathname === route ||
      pathname.startsWith(`${route}/`)
  );

  useEffect(() => {
    if (isExcluded) return;

    loadMonetag();
  }, [isExcluded]);

  return null;
}
