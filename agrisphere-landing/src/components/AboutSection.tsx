import { motion } from "framer-motion";
import { Wifi, Brain, AlertTriangle, TrendingUp } from "lucide-react";

const cards = [
  { icon: Wifi, title: "Smart Sensors", desc: "IoT-powered soil and weather monitoring for real-time data." },
  { icon: Brain, title: "AI Crop Engine", desc: "Machine learning recommendations for optimal yield." },
  { icon: AlertTriangle, title: "Disaster Alerts", desc: "SMS-based early warnings for climate disasters." },
  { icon: TrendingUp, title: "Sustainable Revenue", desc: "Urban subscriptions fund rural farming tech." },
];

const AboutSection = () => {
  return (
    <section id="about" className="relative py-24 sm:py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
            Why <span className="text-gradient-hero">AgriSphere</span>?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            Small farmers face crop loss due to climate unpredictability and inefficient
            irrigation. Urban youth want to grow sustainably but lack guidance. AgriSphere
            bridges both worlds using IoT, AI, and SMS-based climate alerts.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative group p-6 rounded-xl bg-card glow-border glow-border-hover transition-all duration-500 cursor-default"
            >
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <card.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{card.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
