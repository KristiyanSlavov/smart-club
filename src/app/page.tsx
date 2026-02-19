import { Suspense } from "react";
import { HomeScreen } from "./home-screen";

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-[#0d0d0d]" />}>
      <HomeScreen />
    </Suspense>
  );
}
