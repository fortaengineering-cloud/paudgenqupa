import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import AboutSection from "@/components/landing/AboutSection";
import VisionMissionSection from "@/components/landing/VisionMissionSection";
import ProgramSection from "@/components/landing/ProgramSection";
import GallerySection from "@/components/landing/GallerySection";
import ContactFooter from "@/components/landing/ContactFooter";
import FloatingWAButton from "@/components/FloatingWAButton";
import UpdateAppButton from "@/components/UpdateAppButton";

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
      <FloatingWAButton />
      <UpdateAppButton />
    </div>
  );
};

export default Index;
