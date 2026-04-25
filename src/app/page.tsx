import { Hero } from "@/components/home/hero";
import { MissionPanel } from "@/components/home/mission-panel";
import { TopoBackground } from "@/components/home/topo-canvas";

export default function HomePage() {
  return (
    <>
      <TopoBackground />
      <Hero />
      <MissionPanel />
    </>
  );
}
