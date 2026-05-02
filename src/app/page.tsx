import { Hero } from "@/components/home/hero";
import { MissionPanel } from "@/components/home/mission-panel";
import { PartnersRibbon } from "@/components/home/partners-ribbon";
import { LatestNews } from "@/components/home/latest-news";
import { TopoBackground } from "@/components/home/topo-canvas";

export default function HomePage() {
  return (
    <>
      <TopoBackground />
      <Hero />
      <MissionPanel />
      <PartnersRibbon />
      <LatestNews />
    </>
  );
}
