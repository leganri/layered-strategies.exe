"use client";
import dynamic from "next/dynamic";

/* Client-only: the session uses random ids, today's date and localStorage,
   so server-rendering it would only produce hydration mismatches. */
const DiscoveryApp = dynamic(() => import("./discovery/DiscoveryApp"), { ssr: false });

export default function Page() {
  return <DiscoveryApp />;
}
