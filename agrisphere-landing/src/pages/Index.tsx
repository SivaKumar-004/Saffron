import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LoadingAnimation from "@/components/LoadingAnimation";
import ParticleBackground from "@/components/ParticleBackground";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import TierSection from "@/components/TierSection";
import ImpactSection from "@/components/ImpactSection";
import Footer from "@/components/Footer";

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  const handleComplete = useCallback(() => {
    setLoading(false);
    setTimeout(() => setShowContent(true), 200);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "hsl(210 50% 5%)" }}>
      {/* Content layer */}
      <AnimatePresence>
        {showContent && (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <ParticleBackground />

            {/* Cinematic top-down light sweep */}
            <motion.div
              className="fixed inset-0 pointer-events-none z-20"
              initial={{ opacity: 0.6 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
              style={{
                background:
                  "linear-gradient(180deg, hsl(145 63% 49% / 0.12) 0%, transparent 40%, transparent 60%, hsl(207 70% 53% / 0.08) 100%)",
              }}
            />

            <div className="relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 60, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <HeroSection />
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.8 }}
              >
                <AboutSection />
                <TierSection />
                <ImpactSection />
                <Footer />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loader overlay with spectacular exit */}
      <AnimatePresence>
        {loading && (
          <motion.div
            key="loader"
            className="fixed inset-0 z-50"
            exit={{
              opacity: 0,
              scale: 1.3,
              filter: "blur(20px) brightness(2)",
              y: -60,
            }}
            transition={{
              duration: 1.4,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <LoadingAnimation onComplete={handleComplete} />

            {/* Green + blue flash overlay */}
            <motion.div
              className="absolute inset-0 pointer-events-none z-[60]"
              initial={{ opacity: 0 }}
              exit={{
                opacity: [0, 0.5, 0.3, 0],
              }}
              transition={{ duration: 1.4, times: [0, 0.2, 0.5, 1] }}
              style={{
                background:
                  "radial-gradient(circle at 50% 40%, hsl(145 63% 49% / 0.5), hsl(207 70% 53% / 0.3) 40%, transparent 70%)",
              }}
            />

            {/* White flash for cinematic punch */}
            <motion.div
              className="absolute inset-0 pointer-events-none z-[61]"
              initial={{ opacity: 0 }}
              exit={{
                opacity: [0, 0.15, 0],
              }}
              transition={{ duration: 0.8, times: [0, 0.15, 1] }}
              style={{ background: "white" }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
