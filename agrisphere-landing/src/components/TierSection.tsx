import { motion } from "framer-motion";
import { MessageSquare, Cpu, Building2 } from "lucide-react";
import { useState } from "react";

const tiers = [
  {
    id: 1,
    title: "Basic Climate Alerts",
    icon: MessageSquare,
    description: "Free SMS-based disaster alerts for small farmers without smartphones. Drought, flood, storm, and landslide warnings.",
    button: "Select Tier 1",
    accent: "leaf" as const,
  },
  {
    id: 2,
    title: "Smart Farm Intelligence",
    icon: Cpu,
    description: "Sensor-based crop recommendation engine with irrigation and fertilizer optimization.",
    button: "Select Tier 2",
    accent: "sky" as const,
  },
  {
    id: 3,
    title: "Urban Smart Gardening",
    icon: Building2,
    description: "Subscription-based smart plant monitoring system for urban homes and offices.",
    button: "Select Tier 3",
    accent: "leaf" as const,
  },
];

const TierSection = () => {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <section id="tiers" className="relative py-24 sm:py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Choose Your <span className="text-gradient-hero">Tier</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {tiers.map((tier, i) => {
            const isSelected = selected === tier.id;
            const glowColor = tier.accent === "sky"
              ? "hsl(207 70% 53%)"
              : "hsl(145 63% 49%)";

            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                whileHover={{ scale: 1.03, y: -5 }}
                className={`relative p-8 rounded-2xl transition-all duration-500 cursor-pointer ${isSelected ? "ring-2" : ""
                  }`}
                style={{
                  background: "linear-gradient(135deg, hsl(210 40% 14%) 0%, hsl(210 35% 18%) 100%)",
                  border: `1px solid ${isSelected ? glowColor : "hsl(210 30% 22% / 0.6)"}`,
                  boxShadow: isSelected
                    ? `0 0 40px ${glowColor}40, inset 0 0 30px ${glowColor}10`
                    : "0 8px 32px hsl(210 50% 5% / 0.5)",

                }}
                onClick={() => {
                  if (tier.id === 1) {
                    window.open(`${window.location.protocol}//${window.location.hostname}:3001`, '_blank');
                  } else if (tier.id === 2) {
                    window.open(`${window.location.protocol}//${window.location.hostname}`, '_blank');
                  } else if (tier.id === 3) {
                    window.open(`${window.location.protocol}//${window.location.hostname}:3002`, '_blank');
                  } else {
                    setSelected(tier.id);
                  }
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    (e.currentTarget as HTMLDivElement).style.borderColor = `${glowColor}80`;
                    (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 30px ${glowColor}20, inset 0 0 20px ${glowColor}08`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    (e.currentTarget as HTMLDivElement).style.borderColor = "hsl(210 30% 22% / 0.6)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 32px hsl(210 50% 5% / 0.5)";
                  }
                }}
              >
                <div className="flex flex-col items-center text-center">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                    style={{
                      background: `linear-gradient(135deg, ${glowColor}20, ${glowColor}08)`,
                      border: `1px solid ${glowColor}30`,
                    }}
                  >
                    <tier.icon className="w-8 h-8" style={{ color: glowColor }} />
                  </div>

                  <span className="text-xs font-medium tracking-widest uppercase mb-2" style={{ color: glowColor }}>
                    Tier {tier.id}
                  </span>
                  <h3 className="text-xl font-bold text-foreground mb-4">{tier.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-8">
                    {tier.description}
                  </p>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (tier.id === 1) {
                        window.open(`${window.location.protocol}//${window.location.hostname}:3001`, '_blank');
                      } else if (tier.id === 2) {
                        window.open(`${window.location.protocol}//${window.location.hostname}`, '_blank');
                      } else if (tier.id === 3) {
                        window.open(`${window.location.protocol}//${window.location.hostname}:3002`, '_blank');
                      } else {
                        setSelected(tier.id);
                      }
                    }}
                    className="w-full py-3 rounded-lg font-semibold text-sm transition-all duration-300"
                    style={{
                      background: isSelected
                        ? glowColor
                        : `${glowColor}15`,
                      color: isSelected ? "hsl(210 45% 8%)" : glowColor,
                      border: `1px solid ${glowColor}40`,
                      boxShadow: isSelected ? `0 0 20px ${glowColor}30` : "none",
                    }}
                  >
                    {isSelected ? "✓ Selected" : tier.button}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TierSection;
