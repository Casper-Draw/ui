"use client";

import { useState } from "react";
import { PublicKey } from "casper-js-sdk";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Ticket,
  Wallet,
  Zap,
  Sparkles,
  TrendingUp,
  Trophy,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { formatNumber } from "@/lib/formatNumber";
import { config } from "@/lib/config";
import {
  prepareEnterLotteryTransaction,
  handleTransactionStatus,
  getCsprClick,
  getExplorerUrl,
} from "@/lib/casper/lottery-contract";

interface CasperAccount {
  public_key: string;
}

interface EnterLotteryProps {
  onNavigate: (page: string) => void;
  onEntrySubmit: (entry: {
    requestId: string;
    playId: string;
    roundId: number;
    entryDate: string;
    cost: number;
    status: "pending";
    entryDeployHash?: string;
    awaitingFulfillment?: boolean;
  }) => void;
  activeAccount: CasperAccount | null;
  onConnect: () => void;
  currentJackpotCspr?: number;
  currentRoundId?: number | null;
  nextPlayIdHint?: string | null;
}

export function EnterLottery({
  onNavigate,
  onEntrySubmit,
  activeAccount,
  onConnect,
  currentJackpotCspr,
  currentRoundId,
  nextPlayIdHint,
}: EnterLotteryProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentDeployHash, setCurrentDeployHash] = useState<string | null>(
    null
  );

  // Contract configuration from environment variables
  const ticketPrice = config.ticketPriceCspr;
  const lotteryFee = config.lotteryFeeCspr;
  const prizePool = currentJackpotCspr ?? 0;
  const prizePoolDisplay =
    currentJackpotCspr === null || currentJackpotCspr === undefined
      ? "--"
      : formatNumber(prizePool);
  const jackpotProbability = 0.5; // TODO: Query from contract
  const consolationProbability = 20; // TODO: Query from contract
  const maxConsolationPrize = 40; // TODO: Query from contract
  const currentRound = currentRoundId ?? 1;
  const currentPlayId = nextPlayIdHint ?? "0x??";

  const handleBuyTicket = async () => {
    if (!activeAccount) {
      toast.error("Please connect your wallet first", {
        style: {
          background: "#202020",
          color: "#ff00ff",
          border: "2px solid #ff00ff",
        },
      });
      return;
    }

    setIsProcessing(true);
    setCurrentDeployHash(null);

    try {
      // Parse player's public key
      const playerPublicKey = PublicKey.fromHex(activeAccount.public_key);

      // Prepare the enter_lottery transaction
      const transaction = await prepareEnterLotteryTransaction(playerPublicKey);

      // Get CSPR.click instance
      const csprclick = getCsprClick();
      if (!csprclick) {
        throw new Error("CSPR.click not initialized");
      }

      // Send transaction via wallet
      await csprclick.send(
        { Version1: transaction.toJSON() },
        playerPublicKey.toHex(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (status: string, data?: any) => {
          console.log("Transaction status:", status, data);

          try {
            const result = handleTransactionStatus(status, data);

            if (result) {
              // Transaction completed
              setIsProcessing(false);

              if (result.status === "success") {
                setCurrentDeployHash(result.deployHash);

                // Create entry for UI
                const entry = {
                  requestId: result.deployHash,
                  playId: `${currentPlayId}`,
                  roundId: currentRound,
                  entryDate: new Date().toISOString(),
                  cost: ticketPrice,
                  status: "pending" as const,
                  entryDeployHash: result.deployHash,
                  awaitingFulfillment: true, // Mark as fresh transaction
                };

                onEntrySubmit(entry);

                // Success toast with link to explorer
                toast.success("Ticket purchased successfully!", {
                  description: "Transaction confirmed on Casper Network",
                  duration: 5000,
                  action: {
                    label: "View on Explorer",
                    onClick: () => {
                      window.open(getExplorerUrl(result.deployHash), "_blank");
                    },
                  },
                  style: {
                    background: "#202020",
                    color: "#ffd700",
                    border: "2px solid #ffd700",
                  },
                });

                // Navigate to dashboard after short delay
                setTimeout(() => {
                  onNavigate("dashboard");
                }, 2000);
              } else {
                // Transaction failed
                toast.error("Transaction failed", {
                  description: result.errorMessage || "Please try again",
                  style: {
                    background: "#202020",
                    color: "#ff00ff",
                    border: "2px solid #ff00ff",
                  },
                });
              }
            }
          } catch (statusError) {
            setIsProcessing(false);
            toast.error("Transaction error", {
              description:
                statusError instanceof Error
                  ? statusError.message
                  : "Unknown error",
              style: {
                background: "#202020",
                color: "#ff00ff",
                border: "2px solid #ff00ff",
              },
            });
          }
        }
      );
    } catch (error) {
      setIsProcessing(false);
      console.error("Error buying ticket:", error);

      toast.error("Failed to purchase ticket", {
        description:
          error instanceof Error ? error.message : "Please try again",
        style: {
          background: "#202020",
          color: "#ff00ff",
          border: "2px solid #ff00ff",
        },
      });
    }
  };

  return (
    <div className="min-h-screen py-4 md:py-8 px-3 md:px-4">
      <div className="max-w-5xl mx-auto w-full">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="neon-text-pink text-neon-pink mb-4 text-4xl md:text-[40px]">
            Let&apos;s Play!
          </h1>
          <p className="text-white text-lg md:text-2xl mb-2">
            Instant lottery with quantum-backed randomness
          </p>
          <p className="text-gray-400 text-base md:text-lg">
            Buy ticket → Wait for Autonom RNG → Settle & win!
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 lg:items-start">
          {/* Main Buy Ticket Card */}
          <div className="lg:col-span-2 h-full">
            <Card className="bg-black/40 border-2 border-pink-500/50 neon-glow-pink h-full flex flex-col">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-neon-pink" />
                  Buy Your Draw Ticket
                  <Sparkles className="w-5 h-5 text-neon-pink" />
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Get your ticket in the Casper Draw and let Autonom RNG decide
                  your prize!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 flex-1 flex flex-col justify-between">
                {/* How It Works */}
                <div className="bg-black/30 rounded-xl p-4 md:p-6 border border-cyan-500/30">
                  <h3 className="text-white text-base md:text-lg mb-3 md:mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4 md:w-5 md:h-5 text-cyan-400" />
                    How It Works
                  </h3>
                  <div className="space-y-2 md:space-y-3">
                    <div className="flex items-start gap-2 md:gap-3">
                      <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-neon-pink flex items-center justify-center flex-shrink-0 text-sm md:text-lg">
                        1
                      </div>
                      <div>
                        <p className="text-white text-base md:text-lg">
                          Buy Ticket
                        </p>
                        <p className="text-sm md:text-base text-gray-400">
                          Pay {formatNumber(ticketPrice)} CSPR to enter Casper
                          Draw
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 md:gap-3">
                      <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-neon-pink flex items-center justify-center flex-shrink-0 text-sm md:text-lg">
                        2
                      </div>
                      <div>
                        <p className="text-white text-base md:text-lg">
                          Wait for Randomness
                        </p>
                        <p className="text-sm md:text-base text-gray-400">
                          Autonom RNG generates your result
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 md:gap-3">
                      <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-neon-pink flex items-center justify-center flex-shrink-0 text-sm md:text-lg">
                        3
                      </div>
                      <div>
                        <p className="text-white text-base md:text-lg">
                          Settle & Win
                        </p>
                        <p className="text-sm md:text-base text-gray-400">
                          Claim your ticket to reveal your prize
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Win Probabilities */}
                <div className="bg-black/30 rounded-xl p-4 md:p-6 border border-neon-pink/30">
                  <h3 className="text-white text-base md:text-lg mb-3 md:mb-4 flex items-center gap-2">
                    <Trophy className="w-4 h-4 md:w-5 md:h-5 text-neon-pink" />
                    Win Probabilities
                  </h3>
                  <div className="space-y-2 md:space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-400 neon-glow-yellow flex-shrink-0"></div>
                        <span className="text-white text-base md:text-lg">
                          Jackpot
                        </span>
                      </div>
                      <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/50 text-sm md:text-base w-32 flex items-center justify-center">
                        {jackpotProbability}% chance
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-cyan-400 neon-glow-cyan flex-shrink-0"></div>
                        <span className="text-white text-base md:text-lg">
                          Consolation Prize
                        </span>
                      </div>
                      <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/50 text-sm md:text-base w-32 flex items-center justify-center">
                        {consolationProbability}% chance
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-400 flex-shrink-0"></div>
                        <span className="text-white text-base md:text-lg">
                          No Win
                        </span>
                      </div>
                      <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/50 text-sm md:text-base w-32 flex items-center justify-center">
                        {100 - jackpotProbability - consolationProbability}%
                        chance
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {!activeAccount ? (
                  <Button
                    onClick={onConnect}
                    className="w-full casino-gradient neon-glow-pink hover:scale-105 transition-transform h-14 cursor-pointer text-white rounded-xl text-shadow-strong"
                  >
                    <Wallet className="w-5 h-5 mr-2 icon-shadow-strong" />
                    Connect Casper Wallet
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <Button
                      onClick={handleBuyTicket}
                      disabled={isProcessing}
                      className="w-full casino-gradient neon-glow-yellow hover:scale-105 transition-transform h-14 cursor-pointer text-white rounded-xl text-shadow-strong disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                          >
                            <Zap className="w-5 h-5 mr-2 icon-shadow-strong" />
                          </motion.div>
                          Processing Transaction...
                        </>
                      ) : (
                        <>
                          <Ticket className="w-5 h-5 mr-2 icon-shadow-strong" />
                          Buy Ticket for {formatNumber(ticketPrice)} CSPR
                          <ArrowRight className="w-5 h-5 ml-2 icon-shadow-strong" />
                        </>
                      )}
                    </Button>

                    {/* Show transaction hash if available */}
                    {currentDeployHash && (
                      <div className="bg-black/30 rounded-xl p-3 border border-cyan-500/30">
                        <p className="text-sm text-gray-400 mb-1">
                          Transaction Hash:
                        </p>
                        <div className="flex items-center gap-2 min-w-0">
                          <p className="text-cyan-300 font-mono text-xs flex-1 min-w-0 truncate">
                            {currentDeployHash}
                          </p>
                          <button
                            onClick={() =>
                              window.open(
                                getExplorerUrl(currentDeployHash),
                                "_blank"
                              )
                            }
                            className="flex-shrink-0 text-cyan-300 hover:text-cyan-400"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1 self-start">
            <Card className="sticky top-4 bg-black/40 border-2 border-cyan-500/50 neon-glow-cyan flex flex-col">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Prize Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 flex-1 flex flex-col justify-between">
                {/* Current Jackpot */}
                <div className="bg-black/30 rounded-xl p-3 md:p-4 border border-yellow-500/30">
                  <div className="text-center">
                    <p className="text-white text-sm md:text-base mb-2 font-extra-bold">
                      Current Jackpot
                    </p>
                    <motion.div
                      className="text-3xl md:text-4xl text-yellow-300 neon-text-yellow mb-1"
                      animate={{
                        filter: [
                          "drop-shadow(0 0 30px rgba(253, 224, 71, 1)) drop-shadow(0 0 60px rgba(253, 224, 71, 0.8)) drop-shadow(0 0 90px rgba(253, 224, 71, 0.6))",
                          "drop-shadow(0 0 50px rgba(253, 224, 71, 1)) drop-shadow(0 0 100px rgba(253, 224, 71, 1)) drop-shadow(0 0 150px rgba(253, 224, 71, 0.8))",
                          "drop-shadow(0 0 50px rgba(253, 224, 71, 1)) drop-shadow(0 0 100px rgba(253, 224, 71, 1)) drop-shadow(0 0 150px rgba(253, 224, 71, 0.8))",
                          "drop-shadow(0 0 30px rgba(253, 224, 71, 1)) drop-shadow(0 0 60px rgba(253, 224, 71, 0.8)) drop-shadow(0 0 90px rgba(253, 224, 71, 0.6))",
                        ],
                      }}
                      transition={{
                        duration: 2.5,
                        times: [0, 0.4, 0.6, 1],
                        repeat: Infinity,
                      }}
                    >
                      {prizePoolDisplay} CSPR
                    </motion.div>
                    <p className="text-[10px] md:text-sm text-white font-extra-bold">
                      Win 100% of prize pool!
                    </p>
                  </div>
                </div>

                {/* Consolation Prize Range */}
                <div className="bg-black/30 rounded-xl p-3 md:p-4 border border-cyan-500/30">
                  <div className="text-center">
                    <p className="text-gray-400 text-sm md:text-base mb-2">
                      Consolation Prize
                    </p>
                    <div className="text-xl md:text-2xl text-cyan-300 neon-text-cyan mb-1">
                      Up to {formatNumber(maxConsolationPrize)} CSPR
                    </div>
                    <p className="text-[10px] md:text-sm text-white/70">
                      Variable amount
                    </p>
                  </div>
                </div>

                {/* Ticket Breakdown */}
                <div className="space-y-2 md:space-y-3 bg-black/30 rounded-xl p-3 md:p-4 border border-pink-500/30">
                  <div className="flex justify-between text-gray-400 text-sm md:text-base">
                    <span>Ticket Price</span>
                    <span className="text-white">
                      {formatNumber(ticketPrice)} CSPR
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-400 text-sm md:text-base">
                    <span>Lottery Fee</span>
                    <span className="text-white">
                      {formatNumber(lotteryFee)} CSPR
                    </span>
                  </div>
                  <div className="border-t border-purple-500/30 pt-2 flex justify-between text-sm md:text-base">
                    <span className="text-cyan-500">To Prize Pool</span>
                    <span className="text-cyan-300">
                      {formatNumber(ticketPrice - lotteryFee)} CSPR
                    </span>
                  </div>
                </div>

                {/* Round Info */}
                <div className="bg-black/30 rounded-xl p-3 md:p-4 border border-pink-500/30">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm md:text-base">
                      Current Round
                    </span>
                    <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/50 text-sm md:text-base">
                      #{currentRound}
                    </Badge>
                  </div>
                </div>

                {/* View Dashboard */}
                <Button
                  onClick={() => onNavigate("dashboard")}
                  variant="outline"
                  className="w-full border-2 border-cyan-400 text-cyan-400 bg-cyan-400/10 hover:bg-cyan-400/20 hover:text-cyan-400 neon-glow-cyan cursor-pointer"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View My Tickets
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
