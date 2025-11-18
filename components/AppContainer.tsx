"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useClickRef } from "@make-software/csprclick-ui";
import { Header } from "@/components/Header";
import { LandingPage } from "@/components/LandingPage";
import { EnterLottery } from "@/components/EnterLottery";
import { Dashboard } from "@/components/Dashboard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import {
  fetchPlayerPlays,
  checkBackendHealth,
  fetchPlayByDeployHash,
  fetchCurrentJackpot,
  backendPlayToEntry,
} from "@/lib/api";
import { formatNumber } from "@/lib/formatNumber";
import { getAccountHash } from "@/lib/casper-utils";
import { toast } from "sonner";

// Import the mock data and types from original App.tsx
interface CasperAccount {
  public_key: string;
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
  awaitingFulfillment?: boolean; // Flag for fresh transactions awaiting randomness
  isPlaceholder?: boolean; // Optimistic UI placeholder (awaiting backend record)
  entryDeployHash?: string; // Enter lottery deploy hash from backend
  requestDeployHash?: string;
  fulfillDeployHash?: string;
  settleDeployHash?: string;
}

interface WinningState {
  show: boolean;
  entry: LotteryEntry | null;
}

// Copy mockEntries array from ui/src/App.tsx
// Use a static base timestamp to avoid hydration mismatches
const BASE_TIME = new Date("2025-10-22T12:00:00.000Z").getTime();

const jackpotGif = "/assets/69bb9862d8d20b48acde1b9ff6c23cc9a1a6af67.png";

const mockEntries: LotteryEntry[] = [
  // Pending entries (just over 1 minute old - ready to settle)
  {
    requestId: "req_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
    playId: "1847",
    roundId: 142,
    entryDate: new Date(BASE_TIME - 75 * 1000).toISOString(), // 75 seconds ago
    cost: 100,
    status: "pending",
  },
  {
    requestId: "req_q9r8s7t6u5v4w3x2y1z0a1b2c3d4e5f6",
    playId: "1846",
    roundId: 142,
    entryDate: new Date(BASE_TIME - 90 * 1000).toISOString(), // 90 seconds ago
    cost: 100,
    status: "pending",
  },
  {
    requestId: "req_m5n6o7p8q9r0s1t2u3v4w5x6y7z8a9b0",
    playId: "1845",
    roundId: 141,
    entryDate: new Date(BASE_TIME - 105 * 1000).toISOString(), // 105 seconds ago
    cost: 100,
    status: "pending",
  },
  // Won jackpot
  {
    requestId: "req_g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2",
    playId: "1842",
    roundId: 140,
    entryDate: new Date(BASE_TIME - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    cost: 100,
    status: "won-jackpot",
    prizeAmount: 125000,
    settledDate: new Date(
      BASE_TIME - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000
    ).toISOString(),
  },
  // Won consolation
  {
    requestId: "req_c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8",
    playId: "1840",
    roundId: 139,
    entryDate: new Date(BASE_TIME - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    cost: 100,
    status: "won-consolation",
    prizeAmount: 450,
    settledDate: new Date(
      BASE_TIME - 3 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000
    ).toISOString(),
  },
  {
    requestId: "req_s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4",
    playId: "1838",
    roundId: 138,
    entryDate: new Date(BASE_TIME - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    cost: 100,
    status: "won-consolation",
    prizeAmount: 275,
    settledDate: new Date(
      BASE_TIME - 5 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000
    ).toISOString(),
  },
  {
    requestId: "req_i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0",
    playId: "1835",
    roundId: 137,
    entryDate: new Date(BASE_TIME - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    cost: 100,
    status: "won-consolation",
    prizeAmount: 180,
    settledDate: new Date(
      BASE_TIME - 7 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000
    ).toISOString(),
  },
  // Lost
  {
    requestId: "req_y1z2a3b4c5d6e7f8g9h0i1j2k3l4m5n6",
    playId: "1844",
    roundId: 141,
    entryDate: new Date(BASE_TIME - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    cost: 100,
    status: "lost",
    settledDate: new Date(
      BASE_TIME - 1 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000
    ).toISOString(),
  },
  {
    requestId: "req_o7p8q9r0s1t2u3v4w5x6y7z8a9b0c1d2",
    playId: "1841",
    roundId: 140,
    entryDate: new Date(BASE_TIME - 3 * 24 * 60 * 60 * 1000).toISOString(),
    cost: 100,
    status: "lost",
    settledDate: new Date(
      BASE_TIME - 3 * 24 * 60 * 60 * 1000 + 25 * 60 * 1000
    ).toISOString(),
  },
  {
    requestId: "req_e3f4g5h6i7j8k9l0m1n2o3p4q5r6s7t8",
    playId: "1839",
    roundId: 139,
    entryDate: new Date(BASE_TIME - 4 * 24 * 60 * 60 * 1000).toISOString(),
    cost: 100,
    status: "lost",
    settledDate: new Date(
      BASE_TIME - 4 * 24 * 60 * 60 * 1000 + 35 * 60 * 1000
    ).toISOString(),
  },
  {
    requestId: "req_u9v0w1x2y3z4a5b6c7d8e9f0g1h2i3j4",
    playId: "1837",
    roundId: 138,
    entryDate: new Date(BASE_TIME - 6 * 24 * 60 * 60 * 1000).toISOString(),
    cost: 100,
    status: "lost",
    settledDate: new Date(
      BASE_TIME - 6 * 24 * 60 * 60 * 1000 + 40 * 60 * 1000
    ).toISOString(),
  },
  {
    requestId: "req_k5l6m7n8o9p0q1r2s3t4u5v6w7x8y9z0",
    playId: "1836",
    roundId: 137,
    entryDate: new Date(BASE_TIME - 8 * 24 * 60 * 60 * 1000).toISOString(),
    cost: 100,
    status: "lost",
    settledDate: new Date(
      BASE_TIME - 8 * 24 * 60 * 60 * 1000 + 50 * 60 * 1000
    ).toISOString(),
  },
];

export default function AppContainer() {
  const clickRef = useClickRef();
  const [activeAccount, setActiveAccount] = useState<CasperAccount | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState<string>("landing");
  const [entries, setEntries] = useState<LotteryEntry[]>(mockEntries);
  const [winningState, setWinningState] = useState<WinningState>({
    show: false,
    entry: null,
  });
  const [isLoadingPlays, setIsLoadingPlays] = useState(false);
  const [backendHealthy, setBackendHealthy] = useState(false);
  const [currentJackpotCspr, setCurrentJackpotCspr] = useState<number | null>(
    null
  );
  const [currentRoundId, setCurrentRoundId] = useState<number | null>(null);
  const [nextPlayIdHint, setNextPlayIdHint] = useState<string | null>(null);
  const liveRequestIdsRef = useRef<Set<string>>(new Set());
  const outcomeNotifiedRef = useRef<Set<string>>(new Set());
  const pendingSettlementPollsRef = useRef<Set<string>>(new Set());

  const setNextPlayIdFromPlayId = (playId: string | undefined) => {
    if (!playId) {
      return;
    }
    try {
      const current = playId.startsWith("0x") ? BigInt(playId) : BigInt(playId);
      setNextPlayIdHint(`0x${(current + 1n).toString(16)}`);
    } catch (error) {
      console.warn(
        "[AppContainer] Failed to compute next play id from play identifier:",
        playId,
        error
      );
    }
  };

  const winningEntry = winningState.entry;
  const isJackpotWin =
    winningState.show && winningEntry?.status === "won-jackpot";
  const isConsolationWin =
    winningState.show && winningEntry?.status === "won-consolation";
  const winningPrizeAmount = winningEntry?.prizeAmount ?? 0;
  const winningRoundId = winningEntry?.roundId ?? 1;
  const backendStatusAttr = backendHealthy ? "online" : "offline";
  const jackpotAudioRef = useRef<HTMLAudioElement | null>(null);
  const lastJackpotPlayedForRef = useRef<string | null>(null);
  const consolationAudioRef = useRef<HTMLAudioElement | null>(null);
  const lastConsolationPlayedForRef = useRef<string | null>(null);

  const loadCurrentJackpot = useCallback(async () => {
    const snapshot = await fetchCurrentJackpot();
    if (!snapshot) {
      return;
    }

    if (snapshot.jackpotCspr !== null) {
      setCurrentJackpotCspr(snapshot.jackpotCspr);
    }
    if (snapshot.roundId !== null) {
      setCurrentRoundId(snapshot.roundId);
    }
    if (snapshot.totalPlays !== null && !Number.isNaN(snapshot.totalPlays)) {
      try {
        const next = BigInt(snapshot.totalPlays) + 1n;
        setNextPlayIdHint(`0x${next.toString(16)}`);
      } catch (error) {
        console.warn(
          "[AppContainer] Failed to compute next play id from snapshot:",
          snapshot.totalPlays,
          error
        );
      }
    }
  }, []);

  // Play jackpot audio once (no loop) when jackpot modal opens; dedup by requestId
  useEffect(() => {
    const playJackpot = async () => {
      try {
        if (!jackpotAudioRef.current) {
          const audio = new Audio("/assets/win.mp3");
          audio.loop = false;
          audio.preload = "auto";
          audio.volume = 0.9;
          jackpotAudioRef.current = audio;
        }
        await jackpotAudioRef.current.play().catch(() => undefined);
      } catch {
        // Ignore playback errors
      }
    };

    const rid = winningEntry?.requestId;
    if (isJackpotWin && rid) {
      if (lastJackpotPlayedForRef.current !== rid) {
        lastJackpotPlayedForRef.current = rid;
        void playJackpot();
      }
    }
    // No cleanup needed for one-shot
  }, [isJackpotWin, winningEntry?.requestId]);

  // Play one-shot audio when consolation modal shows (once per requestId)
  useEffect(() => {
    const playConsolation = async () => {
      try {
        if (!consolationAudioRef.current) {
          const audio = new Audio("/assets/consolation.mp3");
          audio.loop = false;
          audio.preload = "auto";
          audio.volume = 0.9;
          consolationAudioRef.current = audio;
        }
        await consolationAudioRef.current.play().catch(() => undefined);
      } catch {
        // Ignore playback errors
      }
    };

    const rid = winningEntry?.requestId;
    if (isConsolationWin && rid) {
      if (lastConsolationPlayedForRef.current !== rid) {
        lastConsolationPlayedForRef.current = rid;
        void playConsolation();
      }
    }

    return () => {
      // no-op; one-shot sound will end naturally
    };
  }, [isConsolationWin, winningEntry?.requestId]);

  const integrateBackendEntries = useCallback(
    (plays: LotteryEntry[]) => {
      setEntries((prevEntries) => {
        const awaitingMap = new Map(
          prevEntries.map((entry) => [
            entry.requestId,
            entry.awaitingFulfillment,
          ])
        );
        const backendIds = new Set(plays.map((play) => play.requestId));

        const normalized = plays.map((play) => {
          const previousAwaiting = awaitingMap.get(play.requestId);
          if (play.status !== "pending") {
            liveRequestIdsRef.current.delete(play.requestId);
            if (previousAwaiting) {
              return {
                ...play,
                awaitingFulfillment: false,
              };
            }
          }
          const awaiting =
            previousAwaiting !== undefined
              ? previousAwaiting
              : liveRequestIdsRef.current.has(play.requestId);

          return {
            ...play,
            awaitingFulfillment: awaiting ?? false,
          };
        });

        const pendingLocalEntries = prevEntries.filter(
          (entry) =>
            !backendIds.has(entry.requestId) &&
            entry.awaitingFulfillment === true
        );

        const merged = [...pendingLocalEntries, ...normalized];

        const deduped = new Map<string, LotteryEntry>();
        for (const entry of merged) {
          deduped.set(entry.requestId, entry);
        }

        return Array.from(deduped.values());
      });
    },
    [setEntries]
  );

  // Check backend health on mount and get initial active account
  useEffect(() => {
    checkBackendHealth().then(setBackendHealthy);
    void loadCurrentJackpot();

    // Check if wallet is already connected
    const checkInitialAccount = async () => {
      try {
        const inst =
          (typeof window !== "undefined" ? window.csprclick : undefined) ||
          (clickRef as unknown as CsprClick | undefined);

        if (inst && typeof inst.getActivePublicKey === "function") {
          const publicKey = await inst.getActivePublicKey();
          if (publicKey) {
            console.log(
              "[AppContainer] Found initial connected account:",
              publicKey
            );
            setActiveAccount({ public_key: publicKey });
          } else {
            console.log("[AppContainer] No account connected initially");
          }
        }
      } catch (error) {
        console.log("[AppContainer] Error checking initial account:", error);
      }
    };

    checkInitialAccount();
  }, [clickRef, loadCurrentJackpot]);

  // Fetch player plays when activeAccount changes
  useEffect(() => {
    console.log(
      "[AppContainer] Active account changed:",
      activeAccount?.public_key
    );

    if (!activeAccount?.public_key) {
      // No account connected, show demo (mock) data
      console.log("[AppContainer] No account, using mock data");
      setEntries(mockEntries);
      return;
    }

    // Account connected, fetch real plays
    const loadPlays = async () => {
      console.log(
        "[AppContainer] Loading plays for public key:",
        activeAccount.public_key
      );
      setIsLoadingPlays(true);

      try {
        // Convert public key to account hash (what the contract uses)
        const accountHash = getAccountHash(activeAccount.public_key);
        console.log("[AppContainer] Account hash:", accountHash);

        const plays = await fetchPlayerPlays(accountHash);
        console.log("[AppContainer] Received plays:", plays.length);

        // Use real data from backend; if none, keep empty list
        console.log("[AppContainer] Using real data from backend");
        integrateBackendEntries(plays);
      } catch (error) {
        console.error("[AppContainer] Error loading plays:", error);
        // On error with account connected, do not show mocks
        setEntries([]);
      }

      void loadCurrentJackpot();
      setIsLoadingPlays(false);
    };

    loadPlays();
  }, [activeAccount?.public_key, integrateBackendEntries, loadCurrentJackpot]);

  // Set up wallet event listeners
  useEffect(() => {
    const inst = (clickRef ??
      (typeof window !== "undefined" ? window.csprclick : undefined)) as
      | {
          on: (
            event: string,
            cb: (evt?: { account: CasperAccount } | unknown) => void
          ) => void;
        }
      | undefined;
    inst?.on("csprclick:signed_in", (evt: unknown) => {
      const e = evt as { account: CasperAccount };
      setActiveAccount(e.account);
    });
    inst?.on("csprclick:switched_account", (evt: unknown) => {
      const e = evt as { account: CasperAccount };
      setActiveAccount(e.account);
    });
    inst?.on("csprclick:signed_out", () => setActiveAccount(null));
    inst?.on("csprclick:disconnected", () => setActiveAccount(null));
  }, [clickRef]);

  const handleEntrySubmit = async (entry: LotteryEntry) => {
    const optimisticEntry: LotteryEntry = {
      ...entry,
      roundId: entry.roundId ?? currentRoundId ?? 1,
      playId: entry.playId ?? nextPlayIdHint ?? "pending",
      isPlaceholder: true,
    };

    // Add entry immediately to show it in UI
    setEntries((prevEntries) => {
      const filtered = prevEntries.filter(
        (existing) => existing.requestId !== optimisticEntry.requestId
      );
      return [optimisticEntry, ...filtered];
    });
    liveRequestIdsRef.current.add(optimisticEntry.requestId);

    if (
      optimisticEntry.roundId &&
      (!currentRoundId || optimisticEntry.roundId > currentRoundId)
    ) {
      setCurrentRoundId(optimisticEntry.roundId);
    }

    // If entry is awaiting fulfillment, poll backend for real request_id
    if (optimisticEntry.awaitingFulfillment && optimisticEntry.requestId) {
      console.log(
        "[AppContainer] Entry awaiting fulfillment, polling for real request_id..."
      );
      console.log("[AppContainer] Deploy hash:", optimisticEntry.requestId);

      // Poll backend in background
      const play = await fetchPlayByDeployHash(optimisticEntry.requestId);

      if (play) {
        console.log("[AppContainer] Real request_id found:", play.request_id);

        const normalizedEntry = backendPlayToEntry(play, optimisticEntry.cost);
        const awaitingFlag =
          optimisticEntry.awaitingFulfillment ??
          normalizedEntry.status === "pending";

        liveRequestIdsRef.current.delete(optimisticEntry.requestId);
        if (awaitingFlag) {
          liveRequestIdsRef.current.add(play.request_id);
        }

        setEntries((prevEntries) => {
          const filtered = prevEntries.filter(
            (existing) =>
              existing.requestId !== optimisticEntry.requestId &&
              existing.requestId !== play.request_id
          );

          return [
            {
              ...normalizedEntry,
              awaitingFulfillment: awaitingFlag,
              isPlaceholder: false,
            },
            ...filtered,
          ];
        });

        if (normalizedEntry.roundId) {
          setCurrentRoundId((prev) =>
            !prev || normalizedEntry.roundId > prev
              ? normalizedEntry.roundId
              : prev
          );
        }
        setNextPlayIdFromPlayId(normalizedEntry.playId);
      } else {
        console.error(
          "[AppContainer] Failed to fetch real request_id, keeping deploy hash"
        );
      }
    }
  };

  const handleRefreshPlays = async () => {
    if (activeAccount?.public_key) {
      console.log("[AppContainer] Manual refresh triggered");
      setIsLoadingPlays(true);
      try {
        const accountHash = getAccountHash(activeAccount.public_key);
        const plays = await fetchPlayerPlays(accountHash);
        if (plays.length > 0) {
          integrateBackendEntries(plays);
        }
        void loadCurrentJackpot();
      } catch (error) {
        console.error("[AppContainer] Error refreshing plays:", error);
      }
      setIsLoadingPlays(false);
    }
  };

  const handleNavigate = (page: string) => {
    // Block dashboard access if wallet not connected
    if (page === "dashboard" && !activeAccount?.public_key) {
      console.log("[AppContainer] Dashboard access blocked - wallet not connected");
      return;
    }

    setCurrentPage(page);
    window.scrollTo(0, 0);

    // If navigating to dashboard and wallet connected, refresh plays
    if (page === "dashboard" && activeAccount?.public_key) {
      console.log("[AppContainer] Navigated to dashboard, refreshing plays");
      handleRefreshPlays();
    }
  };

  const handleWinningCelebration = useCallback((entry: LotteryEntry) => {
    // Deduplicate outcome notifications per requestId
    const rid = entry.requestId;
    if (outcomeNotifiedRef.current.has(rid)) {
      return;
    }

    if (entry.status === "lost") {
      toast.info("Uh Oh! You did not win", {
        description: "Better luck next round!",
        style: {
          background: "#202020",
          color: "#00ffff",
          border: "2px solid #00ffff",
        },
      });
      outcomeNotifiedRef.current.add(rid);
      return;
    }

    if (entry.status !== "won-jackpot" && entry.status !== "won-consolation") {
      return;
    }

    setWinningState((prev) => {
      if (prev.entry?.requestId === entry.requestId && prev.show) {
        return prev;
      }

      outcomeNotifiedRef.current.add(rid);
      return {
        show: true,
        entry,
      };
    });
  }, []);

  const awaitSettlementUpdate = useCallback(
    async (requestId: string) => {
      if (!activeAccount?.public_key) {
        return;
      }

      if (pendingSettlementPollsRef.current.has(requestId)) {
        return;
      }
      pendingSettlementPollsRef.current.add(requestId);

      try {
        const accountHash = getAccountHash(activeAccount.public_key);
        const maxAttempts = 20;

        for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
          const plays = await fetchPlayerPlays(accountHash);
          const target = plays.find((play) => play.requestId === requestId);

          if (target && target.status !== "pending") {
            integrateBackendEntries(plays);
            handleWinningCelebration(target);
            return;
          }

          const backoffMs = Math.min(3000 + attempt * 500, 6000);
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
        }

        const fallbackPlays = await fetchPlayerPlays(accountHash);
        integrateBackendEntries(fallbackPlays);
        const fallbackTarget = fallbackPlays.find(
          (p) => p.requestId === requestId
        );
        if (fallbackTarget && fallbackTarget.status !== "pending") {
          handleWinningCelebration(fallbackTarget);
        }
      } finally {
        pendingSettlementPollsRef.current.delete(requestId);
      }
    },
    [
      activeAccount?.public_key,
      integrateBackendEntries,
      handleWinningCelebration,
    ]
  );

  const handleFulfillment = useCallback(
    (requestId: string) => {
      setEntries((prevEntries) =>
        prevEntries.map((entry) =>
          entry.requestId === requestId
            ? { ...entry, awaitingFulfillment: false }
            : entry
        )
      );
      liveRequestIdsRef.current.delete(requestId);
      void awaitSettlementUpdate(requestId);
    },
    [awaitSettlementUpdate, setEntries]
  );

  const handleCloseWinningFlow = () => {
    setWinningState({
      show: false,
      entry: null,
    });
  };

  const handleConnectWallet = () => {
    const inst =
      (typeof window !== "undefined" ? window.csprclick : undefined) ||
      (clickRef as unknown as CsprClick | undefined);
    if (inst && typeof inst.signIn === "function") {
      inst.signIn();
      return;
    }
    setTimeout(() => {
      const i2 =
        (typeof window !== "undefined" ? window.csprclick : undefined) ||
        (clickRef as unknown as CsprClick | undefined);
      if (i2 && typeof i2.signIn === "function") i2.signIn();
    }, 0);
  };

  useEffect(() => {
    if (entries.length === 0) {
      return;
    }

    const latestRound = entries.reduce((max, entry) => {
      return entry.roundId > max ? entry.roundId : max;
    }, 0);

    if (latestRound > 0) {
      setCurrentRoundId((prev) =>
        !prev || latestRound > prev ? latestRound : prev
      );
    }

    for (const entry of entries) {
      if (entry.status !== "pending") {
        liveRequestIdsRef.current.delete(entry.requestId);
      }
    }

    const entriesInLatestRound = entries.filter(
      (entry) => entry.roundId === latestRound
    );

    let maxPlayId: bigint | null = null;
    for (const entry of entriesInLatestRound) {
      if (entry.status !== "pending") {
        liveRequestIdsRef.current.delete(entry.requestId);
      }
      if (!entry.playId) {
        continue;
      }
      try {
        const playValue = entry.playId.startsWith("0x")
          ? BigInt(entry.playId)
          : BigInt(entry.playId);
        if (maxPlayId === null || playValue > maxPlayId) {
          maxPlayId = playValue;
        }
      } catch {
        // Ignore malformed play identifiers
      }
    }

    if (maxPlayId !== null) {
      setNextPlayIdHint(`0x${(maxPlayId + 1n).toString(16)}`);
    }
  }, [entries]);

  return (
    <div
      className="min-h-screen"
      data-backend={backendStatusAttr}
      data-loading={isLoadingPlays ? "true" : "false"}
    >
      <Header
        currentPage={currentPage}
        onNavigate={handleNavigate}
        activeAccount={activeAccount}
        onConnect={handleConnectWallet}
      />

      {currentPage === "landing" && (
        <LandingPage
          onNavigate={handleNavigate}
          currentJackpotCspr={currentJackpotCspr ?? undefined}
        />
      )}

      {currentPage === "enter" && (
        <EnterLottery
          onNavigate={handleNavigate}
          onEntrySubmit={handleEntrySubmit}
          activeAccount={activeAccount}
          onConnect={handleConnectWallet}
          currentJackpotCspr={currentJackpotCspr ?? undefined}
          currentRoundId={currentRoundId ?? undefined}
          nextPlayIdHint={nextPlayIdHint ?? undefined}
        />
      )}

      {currentPage === "dashboard" && (
        <Dashboard
          onNavigate={handleNavigate}
          entries={entries}
          activeAccount={activeAccount}
          onWinningCelebration={handleWinningCelebration}
          onFulfillment={handleFulfillment}
          onRefresh={handleRefreshPlays}
          onAwaitSettlement={awaitSettlementUpdate}
          onTxnUpdate={(requestId, meta) => {
            setEntries((prev) =>
              prev.map((e) =>
                e.requestId === requestId
                  ? { ...e, ...meta }
                  : e
              )
            );
          }}
        />
      )}

      <Dialog
        open={isJackpotWin}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseWinningFlow();
          }
        }}
        modal
      >
        <DialogContent
          className="bg-black/95 border-4 border-yellow-500 backdrop-blur-xl rounded-3xl max-h-[95vh] overflow-y-auto modal-jackpot-size jackpot-box-glow-intense"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogTitle className="sr-only">Jackpot Winner</DialogTitle>
          <DialogDescription className="sr-only">
            Congratulations! You won the jackpot prize of{" "}
            {formatNumber(winningPrizeAmount)} CSPR.
          </DialogDescription>
          <div className="text-center py-8 md:py-6 px-4 md:px-8">
            <div className="mb-6 md:mb-4">
              <h2 className="block md:hidden text-yellow-300 leading-tight text-[36px] jackpot-text-glow-intense">
                💎 YOU WON 💎
                <br />
                THE JACKPOT!
              </h2>
              <h2 className="hidden md:block text-yellow-300 text-[64px] jackpot-text-glow-intense">
                💎 YOU WON THE JACKPOT! 💎
              </h2>
            </div>

            <div className="flex justify-center items-center gap-3 md:gap-8 mb-6 md:mb-4">
              <img
                src={jackpotGif}
                alt="Jackpot"
                className="w-16 h-16 md:w-32 lg:w-64 md:h-32 lg:h-64 object-contain jackpot-filter-glow"
              />

              <div className="flex justify-center items-center w-20 h-20 md:w-40 lg:w-64 md:h-40 lg:h-64">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 200 200"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="100"
                    cy="100"
                    r="87.5"
                    fill="url(#jackpotGradient1)"
                    stroke="#FCD34D"
                    strokeWidth="7.5"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="70"
                    fill="url(#jackpotGradient2)"
                    stroke="#FCD34D"
                    strokeWidth="5"
                  />
                  <text
                    x="100"
                    y="125"
                    textAnchor="middle"
                    fill="#FCD34D"
                    fontSize="70"
                    fontWeight="bold"
                  >
                    {winningRoundId}
                  </text>
                  <defs>
                    <linearGradient
                      id="jackpotGradient1"
                      x1="100"
                      y1="12.5"
                      x2="100"
                      y2="187.5"
                    >
                      <stop offset="0%" stopColor="#B45309" />
                      <stop offset="100%" stopColor="#78350F" />
                    </linearGradient>
                    <linearGradient
                      id="jackpotGradient2"
                      x1="100"
                      y1="30"
                      x2="100"
                      y2="170"
                    >
                      <stop offset="0%" stopColor="#92400E" />
                      <stop offset="100%" stopColor="#451A03" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <img
                src={jackpotGif}
                alt="Jackpot"
                className="w-16 h-16 md:w-32 lg:w-64 md:h-32 lg:h-64 object-contain jackpot-filter-glow"
              />
            </div>

            <p className="text-white mb-4 text-4xl md:text-[32px] font-bold">
              You won
            </p>

            <motion.div
              className="text-7xl md:text-8xl text-yellow-300 neon-text-yellow mb-6 md:mb-6"
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
              {formatNumber(winningPrizeAmount)} CSPR
            </motion.div>

            <Button
              onClick={handleCloseWinningFlow}
              className="bg-gradient-to-r from-neon-pink to-pink-600 hover:opacity-90 text-white px-6 md:px-8 py-4 md:py-6 cursor-pointer w-full md:w-auto"
            >
              Claim Prize
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isConsolationWin}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseWinningFlow();
          }
        }}
        modal
      >
        <DialogContent
          className="bg-black/95 border-4 border-yellow-500 backdrop-blur-xl rounded-3xl modal-consolation-size jackpot-box-glow-medium"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogTitle className="sr-only">
            Consolation Prize Winner
          </DialogTitle>
          <DialogDescription className="sr-only">
            Congratulations! You won a consolation prize of{" "}
            {formatNumber(winningPrizeAmount)} CSPR.
          </DialogDescription>
          <div className="text-center py-4 md:py-8 px-2 md:px-4">
            <div className="flex justify-center mb-3 md:mb-6">
              <svg
                width="60"
                height="60"
                viewBox="0 0 80 80"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="md:w-20 md:h-20"
              >
                <circle
                  cx="40"
                  cy="40"
                  r="35"
                  fill="url(#gradient1)"
                  stroke="#00FFFF"
                  strokeWidth="3"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="28"
                  fill="url(#gradient2)"
                  stroke="#00FFFF"
                  strokeWidth="2"
                />
                <text
                  x="40"
                  y="50"
                  textAnchor="middle"
                  fill="#00FFFF"
                  fontSize="28"
                  fontWeight="bold"
                >
                  {winningRoundId}
                </text>
                <defs>
                  <linearGradient id="gradient1" x1="40" y1="5" x2="40" y2="75">
                    <stop offset="0%" stopColor="#006666" />
                    <stop offset="100%" stopColor="#003333" />
                  </linearGradient>
                  <linearGradient
                    id="gradient2"
                    x1="40"
                    y1="12"
                    x2="40"
                    y2="68"
                  >
                    <stop offset="0%" stopColor="#004444" />
                    <stop offset="100%" stopColor="#002222" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <h2 className="text-cyan-300 neon-text-cyan mb-1 md:mb-2 text-3xl md:text-6xl">
              🎉 YOU WON! 🎉
            </h2>
            <p className="text-white mb-4 md:mb-6">Consolation Prize</p>

            <div className="text-yellow-300 mb-4 md:mb-8 text-5xl md:text-6xl jackpot-text-glow-intense">
              {formatNumber(winningPrizeAmount)} CSPR
            </div>

            <p className="text-white text-base md:text-xl mb-4 md:mb-8 px-2">
              Nice win! Better luck next time for the jackpot! 💰
            </p>

            <Button
              onClick={handleCloseWinningFlow}
              className="bg-gradient-to-r from-neon-pink to-pink-600 hover:opacity-90 text-white px-6 md:px-8 py-4 md:py-6 cursor-pointer w-full md:w-auto"
            >
              Claim Prize
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
