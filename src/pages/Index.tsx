import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import AboutSection from "@/components/landing/AboutSection";
import VisionMissionSection from "@/components/landing/VisionMissionSection";
import ProgramSection from "@/components/landing/ProgramSection";
import GallerySection from "@/components/landing/GallerySection";
import ContactFooter from "@/components/landing/ContactFooter";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <VisionMissionSection />
        <ProgramSection />
        <GallerySection />
        <ContactFooter />
      </main>
    </div>
  );
};

export default Index;
