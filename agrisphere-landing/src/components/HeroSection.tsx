import { motion } from "framer-motion";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
      {/* Radial glow behind hero */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, hsl(145 63% 49% / 0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-4xl text-center">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight"
        >
          <span className="text-foreground">Resilient Farming.</span>
          <br />
          <span className="text-gradient-hero">Intelligent Water.</span>
          <br />
          <span className="text-foreground">Sustainable Future.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
        >
          AgriSphere is a 3-tier Smart Agricultural Intelligence System that empowers
          farmers with sensor-driven crop intelligence and disaster alerts — sustainably
          funded by urban smart gardening subscriptions.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-10 flex gap-4 justify-center"
        >
          <button
            onClick={() => {
              document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="px-8 py-4 rounded-lg font-semibold text-foreground bg-secondary hover:bg-secondary/80 transition-all duration-300 text-base"
          >
            Explore the Ecosystem
          </button>
          <button
            onClick={() => {
              document.getElementById("tiers")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="px-8 py-4 rounded-lg font-semibold text-primary-foreground bg-primary hover:bg-leaf-glow transition-all duration-300 text-base"
            style={{
              boxShadow: "0 0 30px hsl(145 63% 49% / 0.3)",
            }}
          >
            View Tiers
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
