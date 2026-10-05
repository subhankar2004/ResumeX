import { CallToAction } from "@/sections/CallToAction";
import { Features } from "@/sections/Features";
import { Footer } from "@/sections/Footer";
import { Header } from "@/sections/Header";
import { Hero } from "@/sections/Hero";
import { LogoTicker } from "@/sections/LogoTicker";
import { MeetRex } from "@/sections/MeetRex";
import { Testimonials } from "@/sections/Testimonials";

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <MeetRex />
      <LogoTicker />
      <Features />
      <Testimonials />
      <CallToAction />
      <Footer />
    </>
  );
}
