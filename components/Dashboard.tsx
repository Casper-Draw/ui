"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Ticket,
  Trophy,
  DollarSign,
  TrendingUp,
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { formatNumber } from "@/lib/formatNumber";
import { useWaitForFulfillment } from "@/lib/websocket-client";
import {
  prepareSettleLotteryTransaction,
  handleTransactionStatus,
  getCsprClick,
  getExplorerUrl,
} from "@/lib/casper/lottery-contract";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { PublicKey } from "casper-js-sdk";

// Component for handling individual pending entry with WebSocket
function PendingEntryCard({
  entry,
  isSettling,
  onSettle,
  onFulfillment,
}: {
  entry: LotteryEntry;
  isSettling: boolean;
  onSettle: () => void;
  onFulfillment?: (requestId: string) => void;
}) {
  // Use WebSocket hook only if entry has awaitingFulfillment flag AND real request_id
  // Real request_ids are short hex format: "0x21" (not long deploy hashes)
  const isRealRequestId = entry.requestId?.startsWith('0x') && entry.requestId.length < 10;
  const shouldEnableWebSocket = entry.awaitingFulfillment === true && isRealRequestId;

  const { isFulfilled, isWaiting, isTimedOut } = useWaitForFulfillment(
    entry.requestId,
    shouldEnableWebSocket
  );

  const hasNotifiedRef = useRef(false);

  // Show toast when fulfilled
  useEffect(() => {
    if (isFulfilled) {
      toast.success("Ticket awaiting settlement 🎲", {
        description: "Randomness fulfilled! You can now check your results.",
        style: {
          background: "#1a0f2e",
          color: "#00ffff",
          border: "2px solid #00ffff",
        },
      });
    }
  }, [isFulfilled]);

  // Inform parent when fulfillment arrives (avoid duplicate calls)
  useEffect(() => {
    if (isFulfilled && !hasNotifiedRef.current) {
      hasNotifiedRef.current = true;
      onFulfillment?.(entry.requestId);
    }
  }, [isFulfilled, entry.requestId, onFulfillment]);

  // Fallback: if websocket times out (missed event), mark as ready to settle
  useEffect(() => {
    if (isTimedOut && entry.awaitingFulfillment && !hasNotifiedRef.current) {
      hasNotifiedRef.current = true;
      onFulfillment?.(entry.requestId);
    }
  }, [isTimedOut, entry.awaitingFulfillment, entry.requestId, onFulfillment]);

  const awaitingFulfillment = entry.awaitingFulfillment === true;
  const isButtonDisabled = isSettling || awaitingFulfillment || isWaiting;
  const statusBadgeClass = awaitingFulfillment
    ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 animate-pulse text-sm"
    : "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 text-sm";
  const tooltipMessage = (() => {
    if (isSettling) {
      return "Settlement transaction in progress...";
    }
    if (awaitingFulfillment || isWaiting) {
      return "Randomness not ready yet. Please wait for fulfillment.";
    }
    if (isTimedOut) {
      return "Connection timed out. Try checking results.";
    }
    return undefined;
  })();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-black/30 rounded-xl p-3 md:p-4 border border-cyan-500/30 hover:border-cyan-500/60 transition-colors"
    >
      <div className="flex flex-col md:flex-row items-start gap-3 md:gap-4">
        <div className="flex-1 w-full md:w-auto">
          <div className="flex items-center gap-1 md:gap-2 mb-2 flex-wrap">
            <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/50 text-sm">
              {entry.isPlaceholder ? (
                <>Play # Loading...</>
              ) : (
                <>Play #{parseInt(entry.playId, entry.playId.startsWith('0x') ? 16 : 10)}</>
              )}
            </Badge>
            <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/50 text-sm">
              {entry.isPlaceholder ? (
                <>Round # Loading...</>
              ) : (
                <>Round #{entry.roundId}</>
              )}
            </Badge>
            <Badge className={statusBadgeClass}>
              {awaitingFulfillment ? (
                <>
                  <Clock className="w-3 h-3 mr-1" />
                  Pending
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Ready to Settle
                </>
              )}
            </Badge>
            {awaitingFulfillment && (
              <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/50 animate-pulse text-sm">
                <Zap className="w-3 h-3 mr-1" />
                Awaiting Randomness
              </Badge>
            )}
          </div>
          <div className="text-sm md:text-base text-gray-400 space-y-1">
            <div className="break-all">
              Request ID:{" "}
              <span className="text-cyan-300 font-mono text-[10px] md:text-sm">
                {entry.isPlaceholder ? 'Loading...' : entry.requestId}
              </span>
            </div>
            <div className="text-sm">
              Purchased: {new Date(entry.entryDate).toLocaleString()}
            </div>
            <div>
              Cost:{" "}
              <span className="text-white">
                {formatNumber(entry.cost)} CSPR
              </span>
            </div>
          </div>
        </div>
        <div className="md:self-start w-full md:w-auto flex md:justify-end">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onSettle}
                  disabled={isButtonDisabled}
                  className="bg-neon-pink hover:bg-neon-pink/90 text-white hover:scale-105 transition-transform cursor-pointer w-full md:w-auto text-base md:text-lg whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed rounded-xl px-5 py-2"
                >
                  {isSettling ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      >
                        <Zap className="w-4 h-4 mr-2" />
                      </motion.div>
                      Settling...
                    </>
                  ) : (
                    <>Check Results</>
                  )}
                </Button>
              </TooltipTrigger>
              {tooltipMessage && (
                <TooltipContent>
                  <p>{tooltipMessage}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </motion.div>
  );
}

interface LotteryEntry {
  requestId: string;
  playId: string;
  roundId: number;
  entryDate: string;
  cost: number;
  status: "pending" | "won-jackpot" | "won-consolation" | "lost";
  prizeAmount?: number;
  settledDate?: string;
  awaitingFulfillment?: boolean;
}

interface CasperAccount {
  public_key: string;
}

interface DashboardProps {
  onNavigate: (page: string) => void;
  entries: LotteryEntry[];
  activeAccount: CasperAccount | null;
  onWinningCelebration?: (entry: LotteryEntry) => void;
  onFulfillment?: (requestId: string) => void;
  onRefresh?: () => void | Promise<void>;
  onAwaitSettlement?: (requestId: string) => void;
}

export function Dashboard({
  onNavigate,
  entries,
  activeAccount,
  onWinningCelebration,
  onFulfillment,
  onRefresh,
  onAwaitSettlement,
}: DashboardProps) {
  const [settlingRequests, setSettlingRequests] = useState<Set<string>>(
    new Set()
  );
  const hasInitializedEntriesRef = useRef(false);
  const previousStatusesRef = useRef<Map<string, LotteryEntry["status"]>>(
    new Map()
  );

  // Separate entries by status
  const pendingEntries = entries.filter((e) => e.status === "pending");
  const settledEntries = entries.filter((e) => e.status !== "pending");
  const winnings = entries.filter(
    (e) => e.status === "won-jackpot" || e.status === "won-consolation"
  );

  // Calculate stats
  const totalWon = winnings.reduce(
    (sum, entry) => sum + (entry.prizeAmount || 0),
    0
  );
  const totalSpent = entries.reduce((sum, entry) => sum + entry.cost, 0);
  const netProfit = totalWon - totalSpent;

  useEffect(() => {
    if (!hasInitializedEntriesRef.current) {
      entries.forEach((entry) => {
        previousStatusesRef.current.set(entry.requestId, entry.status);
      });
      hasInitializedEntriesRef.current = true;
      return;
    }

    entries.forEach((entry) => {
      const previousStatus = previousStatusesRef.current.get(entry.requestId);
      const statusChanged = previousStatus !== entry.status;

      if (statusChanged && entry.status !== "pending") {
        onWinningCelebration?.(entry);
      }

      previousStatusesRef.current.set(entry.requestId, entry.status);
    });
  }, [entries, onWinningCelebration]);

  const handleSettle = async (entry: LotteryEntry) => {
    if (entry.awaitingFulfillment) {
      toast.info("Still awaiting randomness", {
        description: "Please wait for the Autonom oracle to fulfill this request.",
        style: {
          background: "#1a0f2e",
          color: "#00ffff",
          border: "2px solid #00ffff",
        },
      });
      return;
    }

    if (!activeAccount?.public_key) {
      toast.error("Connect your wallet", {
        description: "You need to connect CSPR.click before settling a ticket.",
        style: {
          background: "#1a0f2e",
          color: "#ff00ff",
          border: "2px solid #ff00ff",
        },
      });
      return;
    }

    setSettlingRequests((prev) => {
      const next = new Set(prev);
      next.add(entry.requestId);
      return next;
    });

    try {
      const playerPublicKey = PublicKey.fromHex(activeAccount.public_key);
      const transaction = await prepareSettleLotteryTransaction(
        playerPublicKey,
        entry.requestId
      );

      const csprclick = getCsprClick();
      if (!csprclick) {
        throw new Error("CSPR.click wallet not available");
      }

      await csprclick.send(
        { Version1: transaction.toJSON() },
        playerPublicKey.toHex(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (status: string, data?: any) => {
          console.log("[Dashboard] Settle transaction status:", status, data);
          try {
            const result = handleTransactionStatus(status, data);
            if (!result) {
              return;
            }

            setSettlingRequests((prev) => {
              const next = new Set(prev);
              next.delete(entry.requestId);
              return next;
            });

            if (result.status === "success") {
              toast.success("Settlement deploy sent!", {
                description: "We'll refresh your ticket once the transaction is processed.",
                action: {
                  label: "View",
                  onClick: () => window.open(getExplorerUrl(result.deployHash), "_blank"),
                },
                style: {
                  background: "#1a0f2e",
                  color: "#00ffff",
                  border: "2px solid #00ffff",
                },
              });
              void onRefresh?.();
              onAwaitSettlement?.(entry.requestId);
            } else {
              const raw = result.errorMessage || "Transaction reverted on-chain.";
              const isMissedEvent = /User\s*error\s*:\s*(3|4)/i.test(raw);
              const friendly = isMissedEvent
                ? "Please contact the Casper Draw team. Unable to conclude."
                : raw;

              toast.error("Settlement failed", {
                description: friendly,
                style: {
                  background: "#1a0f2e",
                  color: "#ff00ff",
                  border: "2px solid #ff00ff",
                },
              });
            }
          } catch (statusError) {
            setSettlingRequests((prev) => {
              const next = new Set(prev);
              next.delete(entry.requestId);
              return next;
            });
            toast.error("Settlement error", {
              description:
                statusError instanceof Error
                  ? statusError.message
                  : "Transaction was cancelled.",
              style: {
                background: "#1a0f2e",
                color: "#ff00ff",
                border: "2px solid #ff00ff",
              },
            });
          }
        }
      );
    } catch (error) {
      setSettlingRequests((prev) => {
        const next = new Set(prev);
        next.delete(entry.requestId);
        return next;
      });

      toast.error("Failed to submit settlement", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred.",
        style: {
          background: "#1a0f2e",
          color: "#ff00ff",
          border: "2px solid #ff00ff",
        },
      });
    }
  };

  return (
    <div className="min-h-screen py-4 md:py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="neon-text-cyan text-cyan-300 mb-4 text-4xl md:text-[40px]">
              Dashboard
            </h1>
            <p className="text-white text-lg md:text-2xl">
              Track your draw tickets and winnings
            </p>
          </div>
          <Button
            onClick={() => onNavigate("enter")}
            className="casino-gradient neon-glow-pink hover:scale-105 transition-transform cursor-pointer text-white rounded-xl text-shadow-strong"
          >
            <Sparkles className="w-4 h-4 mr-2 icon-shadow-strong" />
            Buy New Ticket
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="h-full"
          >
            <Card className="bg-black/40 border-2 border-cyan-500/50 neon-glow-cyan stat-glow-cyan h-full flex flex-col transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base md:text-lg text-white">
                  Total Tickets
                </CardTitle>
                <Ticket className="w-5 h-5 md:w-6 md:h-6 text-cyan-400" />
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <div className="text-4xl md:text-6xl text-cyan-300 neon-text-cyan whitespace-nowrap">
                  {entries.length}
                </div>
                <p className="text-sm md:text-base text-white mt-1">All time</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="h-full"
          >
            <Card className="bg-black/40 border-2 border-yellow-500/50 neon-glow-yellow stat-glow-yellow h-full flex flex-col transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base md:text-lg text-white">
                  Total Won (CSPR)
                </CardTitle>
                <Trophy className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <div className="text-4xl md:text-6xl text-yellow-300 neon-text-yellow whitespace-nowrap">
                  {formatNumber(totalWon)}
                </div>
                <p className="text-sm md:text-base text-white mt-1">
                  {formatNumber(winnings.length)} winning tickets 🎉
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="h-full"
          >
            <Card className="bg-black/40 border-2 border-neon-pink/50 neon-glow-pink stat-glow-pink h-full flex flex-col transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base md:text-lg text-white">
                  Total Spent (CSPR)
                </CardTitle>
                <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-neon-pink" />
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <div className="text-4xl md:text-6xl text-neon-pink neon-text-pink whitespace-nowrap">
                  {formatNumber(totalSpent)}
                </div>
                <p className="text-sm md:text-base text-white mt-1">
                  On lottery tickets
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="h-full"
          >
            <Card className={`bg-black/40 border-2 border-green-500/50 neon-glow-green stat-glow-green h-full flex flex-col transition-shadow`}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base md:text-lg text-white">
                  Net Profit (CSPR)
                </CardTitle>
                <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <div className="text-4xl md:text-6xl text-green-400 neon-text-green whitespace-nowrap">
                  {netProfit > 0 ? "+" : ""}
                  {formatNumber(netProfit > 0 ? netProfit : 0)}
                </div>
                <p className="text-sm md:text-base mt-1 text-white">
                  {netProfit > 0 ? "You're winning! 🚀" : "Keep playing! 💪"}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="space-y-6">
          <div className="flex justify-center md:justify-start">
            <TabsList className="bg-black/40 border border-pink-500/20 w-full md:w-auto p-1.5">
              <TabsTrigger
                value="pending"
                className="data-[state=active]:border-neon-pink data-[state=active]:border data-[state=active]:bg-neon-pink/10 data-[state=active]:!text-neon-pink data-[state=active]:neon-text-pink !text-white/60 hover:!text-white/80 transition-all flex-1 md:flex-initial text-sm md:text-base font-semibold px-4 py-3.5 md:px-6 md:py-4"
              >
                <Clock className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                Pending ({pendingEntries.length})
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="data-[state=active]:border-neon-pink data-[state=active]:border data-[state=active]:bg-neon-pink/10 data-[state=active]:!text-neon-pink data-[state=active]:neon-text-pink !text-white/60 hover:!text-white/80 transition-all flex-1 md:flex-initial text-sm md:text-base font-semibold px-4 py-3.5 md:px-6 md:py-4"
              >
                <Ticket className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                History ({settledEntries.length})
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Pending Tickets */}
          <TabsContent value="pending" className="space-y-4">
            <Card className="bg-black/40 border-2 border-pink-500/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  Pending Tickets
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Tickets ready to settle (purchased &gt; 1 minute ago) -
                  settlement completes within 1 minute!
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingEntries.length === 0 ? (
                  <div className="text-center py-8 md:py-12">
                    <Ticket className="w-12 h-12 md:w-16 md:h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4 text-lg md:text-2xl">
                      No pending tickets
                    </p>
                    <p className="text-gray-500 mb-6 text-base md:text-lg">
                      Buy a ticket to get started!
                    </p>
                    <Button
                      onClick={() => onNavigate("enter")}
                      className="casino-gradient neon-glow-pink cursor-pointer text-white rounded-xl shadow-[0_0_12px_rgba(0,0,0,0.85)]"
                      style={{ textShadow: "0 2px 6px rgba(0, 0, 0, 1)" }}
                    >
                      <span className="flex items-center">
                        <Sparkles
                          className="w-4 h-4 mr-2"
                          style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,1))" }}
                        />
                        Buy Ticket
                      </span>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingEntries.map((entry) => (
                      <PendingEntryCard
                        key={`${entry.requestId}-${entry.playId}`}
                        entry={entry}
                        isSettling={settlingRequests.has(entry.requestId)}
                        onSettle={() => handleSettle(entry)}
                        onFulfillment={onFulfillment}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* History */}
          <TabsContent value="history" className="space-y-4">
            <Card className="bg-black/40 border-2 border-pink-500/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-neon-pink" />
                  Ticket History
                </CardTitle>
                <CardDescription className="text-gray-400">
                  All your settled lottery tickets
                </CardDescription>
              </CardHeader>
              <CardContent>
                {settledEntries.length === 0 ? (
                  <div className="text-center py-8 md:py-12">
                    <Ticket className="w-12 h-12 md:w-16 md:h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg md:text-2xl">
                      No settled tickets yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {settledEntries.map((entry) => (
                      <motion.div
                        key={`${entry.requestId}-${entry.playId}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`bg-black/30 rounded-xl p-3 md:p-4 border ${
                          entry.status === "won-jackpot"
                            ? "border-yellow-500/50 neon-glow-yellow"
                            : entry.status === "won-consolation"
                            ? "border-cyan-500/50 neon-glow-cyan"
                            : "border-gray-500/30"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 md:gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 md:gap-2 mb-2 flex-wrap">
            <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/50 text-sm">
              Play #{parseInt(entry.playId, entry.playId.startsWith('0x') ? 16 : 10)}
            </Badge>
                              <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/50 text-sm">
                                Round #{entry.roundId}
                              </Badge>
                              {entry.status === "won-jackpot" && (
                                <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/50 text-sm">
                                  <Trophy className="w-3 h-3 mr-1" />
                                  JACKPOT!
                                </Badge>
                              )}
                              {entry.status === "won-consolation" && (
                                <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/50 text-sm">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Won
                                </Badge>
                              )}
                              {entry.status === "lost" && (
                                <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/50 text-sm">
                                  <XCircle className="w-3 h-3 mr-1" />
                                  No Win
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm md:text-base text-gray-400 space-y-1">
                              <div className="text-sm">
                                Settled:{" "}
                                {entry.settledDate &&
                                  new Date(entry.settledDate).toLocaleString()}
                              </div>
                              <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                                <span>
                                  Cost:{" "}
                                  <span className="text-white">
                                    {formatNumber(entry.cost)} CSPR
                                  </span>
                                </span>
                                {entry.prizeAmount && entry.prizeAmount > 0 && (
                                  <span className="text-yellow-300 neon-text-yellow">
                                    Won: {formatNumber(entry.prizeAmount)} CSPR
                                    🎉
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            {entry.status === "won-jackpot" && (
                              <div className="text-3xl md:text-5xl">🏆</div>
                            )}
                            {entry.status === "won-consolation" && (
                              <div className="text-3xl md:text-5xl">🎉</div>
                            )}
                            {entry.status === "lost" && (
                              <div className="text-3xl md:text-5xl opacity-30">
                                😔
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

    </div>
  );
}
