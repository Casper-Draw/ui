"use client";

import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Trophy, Shield, Zap, Users, Sparkles, Coins } from "lucide-react";
import { CasperDrawLogo } from "./CasperDrawLogo";
import { motion } from "framer-motion";
import { formatNumber } from "@/lib/formatNumber";
import { useState, useEffect } from "react";

const casperIcon = "/assets/9d94ce1715be8ece5a22234eba0aa3e300a8d738.png";
const casperLogo = "/assets/f40f97483ee0322d9cc298a55275f180f7353db4.png";
const autonomLogo = "/assets/8dbadf055c1ed133599dd7a54d506a1094e944af.png";

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

// Component for each animated symbol (dollar sign or Casper icon)
function AnimatedSymbol({ index }: { index: number }) {
  const [position, setPosition] = useState({
    x: Math.random() * 100,
    y: Math.random() * 100,
  });

  // Randomly choose between dollar sign and Casper icon
  const isDollar = Math.random() > 0.5;

  const scaleDuration = 2 + ((index * 0.1) % 2); // Consistent duration based on index
  const delay = (index * 0.15) % 2;

  useEffect(() => {
    // Change position at the END of each cycle (when opacity is back to 0)
    // This is at scaleDuration + a small buffer after the cycle starts
    const intervalDuration = scaleDuration * 1000; // Convert to milliseconds

    // Start interval after initial delay + full duration (so it fires when opacity returns to 0)
    const initialTimeout = setTimeout(() => {
      // First position change after initial cycle completes
      setPosition((prev) => ({
        x: Math.max(0, Math.min(100, prev.x + (Math.random() * 20 - 10))),
        y: Math.max(0, Math.min(100, prev.y + (Math.random() * 20 - 10))),
      }));

      // Then set up interval for subsequent changes
      const interval = setInterval(() => {
        setPosition((prev) => ({
          x: Math.max(0, Math.min(100, prev.x + (Math.random() * 20 - 10))),
          y: Math.max(0, Math.min(100, prev.y + (Math.random() * 20 - 10))),
        }));
      }, intervalDuration);

      return () => clearInterval(interval);
    }, (delay + scaleDuration) * 1000 + 100); // Initial delay + duration + 100ms buffer

    return () => clearTimeout(initialTimeout);
  }, [scaleDuration, delay]);

  return (
    <motion.div
      className="absolute"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
      }}
      animate={{
        scale: [1, 1.5, 1],
        opacity: [0, 0.5, 0],
      }}
      transition={{
        duration: scaleDuration,
        repeat: Infinity,
        delay: delay,
      }}
    >
      {isDollar ? (
        <span
          className="neon-text-green"
          style={{
            fontSize: "20px",
            fontWeight: "bold",
            color: "#22c55e",
          }}
        >
          $
        </span>
      ) : (
        <img
          src={casperIcon}
          alt="Casper"
          style={{
            width: "20px",
            height: "20px",
          }}
        />
      )}
    </motion.div>
  );
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative min-h-[880px] overflow-hidden pb-8 md:pb-12">
        {/* Animated background effects */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 10 }).map((_, i) => (
            <AnimatedSymbol key={i} index={i} />
          ))}
        </div>

        <div className="relative flex justify-center px-4 pt-16 md:pt-32">
          <div className="max-w-5xl mx-auto text-center text-white">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="mb-8">
                <div className="inline-flex items-center justify-center mb-4 md:mb-6 px-4">
                  <CasperDrawLogo className="h-16 md:h-32 lg:h-40 w-auto max-w-full" />
                </div>
                <div className="flex items-center justify-center gap-2 md:gap-3 mb-4 md:mb-6 px-6">
                  {/* <Sparkles className="w-6 h-6 text-pink-400" /> */}
                  <p className="text-[36px] md:text-[40px] lg:text-[48px] font-bold text-white text-center leading-tight break-words max-w-full">
                    Instant Wins. Autonom RNG. Casper Network.
                  </p>
                  {/* <Sparkles className="w-6 h-6 text-pink-400" /> */}
                </div>
                <p className="text-[23px] md:text-[28px] lg:text-[32px] font-semibold text-gray-300 max-w-4xl mx-auto px-6 text-center leading-snug break-words">
                  Experience true randomness with Autonom RNG. Buy a ticket,
                  settle instantly, and have a chance at winning big!
                </p>
              </div>

              <div className="flex justify-center mb-12 md:mb-12">
                <Button
                  size="lg"
                  className="casino-gradient text-sm md:text-xl py-3 md:py-6 px-5 md:px-8 neon-glow-pink hover:scale-105 transition-transform cursor-pointer text-white rounded-xl"
                  onClick={() => onNavigate("enter")}
                  style={{
                    textShadow:
                      "0 2px 8px rgba(0,0,0,0.8), 0 1px 4px rgba(0,0,0,0.9)",
                  }}
                >
                  <Sparkles
                    className="w-4 h-4 md:w-5 md:h-5 mr-2"
                    style={{
                      filter:
                        "drop-shadow(0 2px 8px rgba(0,0,0,0.8)) drop-shadow(0 1px 4px rgba(0,0,0,0.9))",
                    }}
                  />
                  Try Your Luck!
                  <Sparkles
                    className="w-4 h-4 md:w-5 md:h-5 ml-2"
                    style={{
                      filter:
                        "drop-shadow(0 2px 8px rgba(0,0,0,0.8)) drop-shadow(0 1px 4px rgba(0,0,0,0.9))",
                    }}
                  />
                </Button>
              </div>

              <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-4 md:gap-8 max-w-5xl mx-auto px-4">
                <motion.div className="md:hidden w-1/2 h-px bg-gradient-to-r from-pink-500 via-yellow-400 to-cyan-500 mx-auto shrink-0" />
                <motion.div className="hidden md:block h-12 md:h-16 w-px bg-gradient-to-b from-pink-500 via-yellow-400 to-cyan-500 shrink-0" />

                <motion.div
                  className="text-center px-2 md:px-6"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-2xl md:text-4xl text-pink-400 neon-text-pink mb-1 md:mb-2">
                    {formatNumber(20000000)}+
                  </div>
                  <div className="text-sm md:text-base text-white/90 leading-tight">
                    Total CSPR Won
                  </div>
                </motion.div>

                <motion.div className="md:hidden w-1/2 h-px bg-gradient-to-r from-pink-500 via-yellow-400 to-cyan-500 mx-auto shrink-0" />
                <motion.div className="hidden md:block h-12 md:h-16 w-px bg-gradient-to-b from-pink-500 via-yellow-400 to-cyan-500 shrink-0" />

                <motion.div
                  className="text-center px-2 md:px-6"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-2xl md:text-4xl text-pink-400 neon-text-pink mb-1 md:mb-2">
                    {formatNumber(20000)}+
                  </div>
                  <div className="text-sm md:text-base text-white/90 leading-tight">
                    Total Draws
                  </div>
                </motion.div>

                <motion.div className="md:hidden w-1/2 h-px bg-gradient-to-r from-pink-500 via-yellow-400 to-cyan-500 mx-auto shrink-0" />
                <motion.div className="hidden md:block h-12 md:h-16 w-px bg-gradient-to-b from-pink-500 via-yellow-400 to-cyan-500 shrink-0" />

                <motion.div
                  className="text-center px-2 md:px-6"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-2xl md:text-4xl text-pink-400 neon-text-pink mb-1 md:mb-2">
                    {formatNumber(12394)}
                  </div>
                  <div className="text-sm md:text-base text-white/90 leading-tight">
                    Users
                  </div>
                </motion.div>

                <motion.div className="md:hidden w-1/2 h-px bg-gradient-to-r from-pink-500 via-yellow-400 to-cyan-500 mx-auto shrink-0" />
                <motion.div className="hidden md:block h-12 md:h-16 w-px bg-gradient-to-b from-pink-500 via-yellow-400 to-cyan-500 shrink-0" />

                <motion.div
                  className="text-center px-2 md:px-6"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-2xl md:text-4xl text-pink-400 neon-text-pink mb-1 md:mb-2">
                    &lt; 1m
                  </div>
                  <div className="text-sm md:text-base text-white/90 leading-tight">
                    Settlement Time
                  </div>
                </motion.div>

                <motion.div className="md:hidden w-1/2 h-px bg-gradient-to-r from-pink-500 via-yellow-400 to-cyan-500 mx-auto shrink-0" />
                <motion.div className="hidden md:block h-12 md:h-16 w-px bg-gradient-to-b from-pink-500 via-yellow-400 to-cyan-500 shrink-0" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Current Jackpot Section */}
      <div className="pt-1.5 md:pt-[2.5px] pb-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div>
            <div className="flex items-center justify-center gap-3 md:gap-4 mb-6 md:mb-8 px-4">
              <Coins className="w-8 h-8 md:w-14 md:h-14 text-yellow-400 flex-shrink-0" />
              <h2 className="neon-text-yellow text-yellow-300 text-3xl md:text-6xl lg:text-7xl font-bold text-center">
                CURRENT JACKPOT
              </h2>
              <Coins className="w-8 h-8 md:w-14 md:h-14 text-yellow-400 flex-shrink-0" />
            </div>
            <motion.div
              className="text-yellow-300 neon-text-yellow px-4"
              animate={{
                filter: [
                  "drop-shadow(0 0 10px rgba(253, 224, 71, 0.2)) drop-shadow(0 0 20px rgba(253, 224, 71, 0.2))",
                  "drop-shadow(0 0 30px rgba(253, 224, 71, 1)) drop-shadow(0 0 60px rgba(253, 224, 71, 1))",
                  "drop-shadow(0 0 30px rgba(253, 224, 71, 1)) drop-shadow(0 0 60px rgba(253, 224, 71, 1))",
                  "drop-shadow(0 0 10px rgba(253, 224, 71, 0.2)) drop-shadow(0 0 20px rgba(253, 224, 71, 0.2))",
                ],
              }}
              transition={{
                duration: 5,
                times: [0, 0.4, 0.8, 1],
                repeat: Infinity,
              }}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-center md:gap-6 leading-none">
                <div className="text-[78px] md:text-[182px] lg:text-[234px] mb-2 md:mb-0">
                  {formatNumber(125000)}
                </div>
                <div className="text-[47px] md:text-[182px] lg:text-[234px]">
                  CSPR
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <hr className="casino-divider max-w-6xl mx-auto" />

      {/* Features Section */}
      <div className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="neon-text-cyan text-cyan-300 mb-4 text-4xl md:text-6xl">
              Why Casper Draw?
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg md:text-xl">
              True Autonom RNG randomness, instant settlement, and transparent
              Casper Network payouts
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div whileHover={{ scale: 1.05, y: -5 }}>
              <Card className="bg-black/40 border-2 border-purple-500/50 neon-glow-pink h-full">
                <CardHeader>
                  <div className="bg-purple-600/80 w-16 h-16 rounded-xl flex items-center justify-center mb-4 neon-glow-pink">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-white">100% Secure</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-400">
                    Powered by Casper Network for maximum security and
                    immutability
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05, y: -5 }}>
              <Card className="bg-black/40 border-2 border-cyan-500/50 neon-glow-cyan h-full">
                <CardHeader>
                  <div className="bg-cyan-600/80 w-16 h-16 rounded-xl flex items-center justify-center mb-4 neon-glow-cyan">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-white">Autonom RNG</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-400">
                    True randomness powered by Autonom RNG and verifiable
                    on-chain
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05, y: -5 }}>
              <Card className="bg-black/40 border-2 border-yellow-500/50 neon-glow-yellow h-full">
                <CardHeader>
                  <div className="bg-yellow-600/80 w-16 h-16 rounded-xl flex items-center justify-center mb-4 neon-glow-yellow">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-white">Instant Wins</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-400">
                    Automatic and instant prize distribution directly to your
                    wallet
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05, y: -5 }}>
              <Card className="bg-black/40 border-2 border-pink-500/50 neon-glow-pink h-full">
                <CardHeader>
                  <div className="bg-pink-600/80 w-16 h-16 rounded-xl flex items-center justify-center mb-4 neon-glow-pink">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-white">Huge Community</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-400">
                    Join thousands of players in the thriving Casper ecosystem
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      <hr className="casino-divider max-w-6xl mx-auto" />

      {/* How It Works Section */}
      <div className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="neon-text-pink text-pink-400 mb-4 text-4xl md:text-6xl">
              How It Works
            </h2>
            <p className="text-gray-400 text-lg md:text-xl">
              3 simple steps to become a winner
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            <div className="text-center px-4">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 text-3xl md:text-4xl text-white">
                1
              </div>
              <h3 className="text-white mb-2 md:mb-3 text-lg md:text-xl">
                Connect Wallet
              </h3>
              <p className="text-gray-400 text-base md:text-lg">
                Connect your Casper wallet in seconds
              </p>
            </div>

            <div className="text-center px-4">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 text-3xl md:text-4xl text-white">
                2
              </div>
              <h3 className="text-white mb-2 md:mb-3 text-lg md:text-xl">
                Buy Ticket
              </h3>
              <p className="text-gray-400 text-base md:text-lg">
                Purchase a ticket and wait for quantum randomness
              </p>
            </div>

            <div className="text-center px-4">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 text-3xl md:text-4xl text-white">
                3
              </div>
              <h3 className="text-white mb-2 md:mb-3 text-lg md:text-xl">
                Settle & Win! 🎉
              </h3>
              <p className="text-gray-400 text-base md:text-lg">
                Claim your ticket to instantly reveal your prize
              </p>
            </div>
          </div>
        </div>
      </div>

      <hr className="casino-divider max-w-6xl mx-auto" />

      {/* Sponsors Section */}
      <div className="relative py-10 px-4 overflow-hidden">
        {/* Static background sparkles */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Left side - White and Red sparkles */}
          {[
            { x: 10, y: 20, color: "text-white" },
            { x: 15, y: 60, color: "text-red-400" },
            { x: 8, y: 80, color: "text-white" },
            { x: 20, y: 35, color: "text-red-300" },
            { x: 5, y: 50, color: "text-white" },
            { x: 18, y: 15, color: "text-red-400" },
            { x: 12, y: 70, color: "text-white" },
            { x: 25, y: 45, color: "text-red-300" },
            { x: 7, y: 25, color: "text-white" },
            { x: 22, y: 85, color: "text-red-400" },
          ].map((pos, i) => (
            <div
              key={`left-${i}`}
              className="absolute"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                opacity: 0.15,
              }}
            >
              <Sparkles className={`w-6 h-6 ${pos.color}`} />
            </div>
          ))}

          {/* Right side - Orange and Teal sparkles */}
          {[
            { x: 75, y: 25, color: "text-orange-400" },
            { x: 82, y: 55, color: "text-teal-400" },
            { x: 78, y: 75, color: "text-orange-300" },
            { x: 88, y: 40, color: "text-teal-300" },
            { x: 92, y: 60, color: "text-orange-400" },
            { x: 80, y: 20, color: "text-teal-400" },
            { x: 85, y: 80, color: "text-orange-300" },
            { x: 70, y: 50, color: "text-teal-400" },
            { x: 90, y: 30, color: "text-orange-400" },
            { x: 77, y: 90, color: "text-teal-300" },
          ].map((pos, i) => (
            <div
              key={`right-${i}`}
              className="absolute"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                opacity: 0.15,
              }}
            >
              <Sparkles className={`w-6 h-6 ${pos.color}`} />
            </div>
          ))}
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div>
            <div className="flex items-center justify-center gap-3 mb-16">
              <Sparkles className="w-8 h-8 text-yellow-400" />
              <h2 className="text-yellow-300 neon-text-yellow text-6xl">
                Our Beloved Partners
              </h2>
              <Sparkles className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {/* Casper Network Card */}
            <motion.div
              whileHover={{ y: -10 }}
            >
              <a
                href="https://www.casper.network/"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <div className="relative group">
                  {/* Glow effect background */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-red-600 via-red-500 to-pink-500 rounded-3xl blur-xl opacity-50"
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />

                  {/* Card content */}
                  <div className="relative bg-white/95 backdrop-blur-sm border-4 border-white rounded-3xl p-6 md:p-10 shadow-2xl shadow-white/50 transition-all duration-300 group-hover:shadow-white/70 cursor-pointer">
                    <div>
                      <img
                        src={casperLogo}
                        alt="Casper Network"
                        className="h-24 md:h-32 w-auto mx-auto object-contain drop-shadow-2xl"
                      />
                    </div>

                    <motion.div
                      className="mt-5 flex items-center justify-center gap-2"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <div className="h-1 w-8 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
                      <Shield className="w-5 h-5 text-red-500" />
                      <div className="h-1 w-8 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
                    </motion.div>
                  </div>
                </div>
              </a>
            </motion.div>

            {/* Autonom Card */}
            <motion.div
              whileHover={{ y: -10 }}
            >
              <a
                href="https://autonom.cc/"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <div className="relative group">
                  {/* Glow effect background */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-orange-500 via-orange-600 to-rose-800 rounded-3xl blur-xl opacity-50"
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1.5,
                    }}
                  />

                  {/* Card content */}
                  <div className="relative bg-[#102937] backdrop-blur-sm border-4 border-orange-500 rounded-3xl p-6 md:p-10 shadow-2xl shadow-orange-500/50 transition-all duration-300 group-hover:border-orange-400 group-hover:shadow-orange-400/70 cursor-pointer">
                    <div>
                      <img
                        src={autonomLogo}
                        alt="Autonom"
                        className="h-24 md:h-32 w-auto mx-auto object-contain drop-shadow-2xl"
                      />
                    </div>

                    <motion.div
                      className="mt-5 flex items-center justify-center gap-2"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    >
                      <div className="h-1 w-8 bg-gradient-to-r from-transparent via-orange-400 to-transparent" />
                      <Trophy className="w-5 h-5 text-orange-400" />
                      <div className="h-1 w-8 bg-gradient-to-r from-transparent via-orange-400 to-transparent" />
                    </motion.div>
                  </div>
                </div>
              </a>
            </motion.div>
          </div>
        </div>
      </div>

      <hr className="casino-divider max-w-6xl mx-auto" />

      {/* Footer with Branding */}
      <div className="py-7 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-6">
            <CasperDrawLogo className="h-12 mx-auto mb-4" />
            <p className="text-gray-400">
              The future of instant lottery on Casper Network
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 lg:gap-8 text-base text-gray-500">
            <span>Powered by Casper Network</span>
            <span className="hidden lg:inline">•</span>
            <span>Autonom RNG</span>
            <span className="hidden lg:inline">•</span>
            <span>100% Transparent</span>
          </div>
        </div>
      </div>
    </div>
  );
}
