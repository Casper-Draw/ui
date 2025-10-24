"use client";

import { useState, useEffect } from "react";
import { useClickRef } from "@make-software/csprclick-ui";
import { Header } from "@/components/Header";
import { LandingPage } from "@/components/LandingPage";
import { EnterLottery } from "@/components/EnterLottery";
import { Dashboard } from "@/components/Dashboard";
import { WinningFlow } from "@/components/WinningFlow";

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
}

interface WinningState {
  show: boolean;
  entry: LotteryEntry | null;
}

// Copy mockEntries array from ui/src/App.tsx
// Use a static base timestamp to avoid hydration mismatches
const BASE_TIME = new Date("2025-10-22T12:00:00.000Z").getTime();

const mockEntries: LotteryEntry[] = [
  // Pending entries (just over 1 minute old - ready to settle)
  {
    requestId: "req_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
    playId: "1847",
    roundId: 142,
    entryDate: new Date(BASE_TIME - 75 * 1000).toISOString(), // 75 seconds ago
    cost: 100,
    status: 'pending',
  },
  {
    requestId: "req_q9r8s7t6u5v4w3x2y1z0a1b2c3d4e5f6",
    playId: "1846",
    roundId: 142,
    entryDate: new Date(BASE_TIME - 90 * 1000).toISOString(), // 90 seconds ago
    cost: 100,
    status: 'pending',
  },
  {
    requestId: "req_m5n6o7p8q9r0s1t2u3v4w5x6y7z8a9b0",
    playId: "1845",
    roundId: 141,
    entryDate: new Date(BASE_TIME - 105 * 1000).toISOString(), // 105 seconds ago
    cost: 100,
    status: 'pending',
  },
  // Won jackpot
  {
    requestId: "req_g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2",
    playId: "1842",
    roundId: 140,
    entryDate: new Date(BASE_TIME - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    cost: 100,
    status: 'won-jackpot',
    prizeAmount: 125000,
    settledDate: new Date(BASE_TIME - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
  },
  // Won consolation
  {
    requestId: "req_c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8",
    playId: "1840",
    roundId: 139,
    entryDate: new Date(BASE_TIME - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    cost: 100,
    status: 'won-consolation',
    prizeAmount: 450,
    settledDate: new Date(BASE_TIME - 3 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
  },
  {
    requestId: "req_s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4",
    playId: "1838",
    roundId: 138,
    entryDate: new Date(BASE_TIME - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    cost: 100,
    status: 'won-consolation',
    prizeAmount: 275,
    settledDate: new Date(BASE_TIME - 5 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000).toISOString(),
  },
  {
    requestId: "req_i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0",
    playId: "1835",
    roundId: 137,
    entryDate: new Date(BASE_TIME - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    cost: 100,
    status: 'won-consolation',
    prizeAmount: 180,
    settledDate: new Date(BASE_TIME - 7 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString(),
  },
  // Lost
  {
    requestId: "req_y1z2a3b4c5d6e7f8g9h0i1j2k3l4m5n6",
    playId: "1844",
    roundId: 141,
    entryDate: new Date(BASE_TIME - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    cost: 100,
    status: 'lost',
    settledDate: new Date(BASE_TIME - 1 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000).toISOString(),
  },
  {
    requestId: "req_o7p8q9r0s1t2u3v4w5x6y7z8a9b0c1d2",
    playId: "1841",
    roundId: 140,
    entryDate: new Date(BASE_TIME - 3 * 24 * 60 * 60 * 1000).toISOString(),
    cost: 100,
    status: 'lost',
    settledDate: new Date(BASE_TIME - 3 * 24 * 60 * 60 * 1000 + 25 * 60 * 1000).toISOString(),
  },
  {
    requestId: "req_e3f4g5h6i7j8k9l0m1n2o3p4q5r6s7t8",
    playId: "1839",
    roundId: 139,
    entryDate: new Date(BASE_TIME - 4 * 24 * 60 * 60 * 1000).toISOString(),
    cost: 100,
    status: 'lost',
    settledDate: new Date(BASE_TIME - 4 * 24 * 60 * 60 * 1000 + 35 * 60 * 1000).toISOString(),
  },
  {
    requestId: "req_u9v0w1x2y3z4a5b6c7d8e9f0g1h2i3j4",
    playId: "1837",
    roundId: 138,
    entryDate: new Date(BASE_TIME - 6 * 24 * 60 * 60 * 1000).toISOString(),
    cost: 100,
    status: 'lost',
    settledDate: new Date(BASE_TIME - 6 * 24 * 60 * 60 * 1000 + 40 * 60 * 1000).toISOString(),
  },
  {
    requestId: "req_k5l6m7n8o9p0q1r2s3t4u5v6w7x8y9z0",
    playId: "1836",
    roundId: 137,
    entryDate: new Date(BASE_TIME - 8 * 24 * 60 * 60 * 1000).toISOString(),
    cost: 100,
    status: 'lost',
    settledDate: new Date(BASE_TIME - 8 * 24 * 60 * 60 * 1000 + 50 * 60 * 1000).toISOString(),
  },
];

export default function AppContainer() {
  const clickRef = useClickRef();
  const [activeAccount, setActiveAccount] = useState<CasperAccount | null>(null);
  const [currentPage, setCurrentPage] = useState<string>("landing");
  const [entries, setEntries] = useState<LotteryEntry[]>(mockEntries);
  const [winningState, setWinningState] = useState<WinningState>({
    show: false,
    entry: null,
  });

  // Set up wallet event listeners
  useEffect(() => {
    const inst = (clickRef ?? (typeof window !== 'undefined' ? window.csprclick : undefined)) as
      | { on: (event: string, cb: (evt?: { account: CasperAccount } | unknown) => void) => void }
      | undefined;
    inst?.on('csprclick:signed_in', (evt: unknown) => {
      const e = evt as { account: CasperAccount };
      setActiveAccount(e.account);
    });
    inst?.on('csprclick:switched_account', (evt: unknown) => {
      const e = evt as { account: CasperAccount };
      setActiveAccount(e.account);
    });
    inst?.on('csprclick:signed_out', () => setActiveAccount(null));
    inst?.on('csprclick:disconnected', () => setActiveAccount(null));
  }, [clickRef]);

  const handleEntrySubmit = (entry: LotteryEntry) => {
    setEntries([entry, ...entries]);
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleWinningCelebration = (entry: LotteryEntry) => {
    setEntries((prevEntries) =>
      prevEntries.map((e) => (e.requestId === entry.requestId ? entry : e))
    );

    setWinningState({
      show: true,
      entry,
    });
  };

  const handleCloseWinningFlow = () => {
    setWinningState({
      show: false,
      entry: null,
    });
  };

  const handleConnectWallet = () => {
    const inst = (typeof window !== 'undefined' ? window.csprclick : undefined) ||
      (clickRef as unknown as CsprClick | undefined);
    if (inst && typeof inst.signIn === 'function') {
      inst.signIn();
      return;
    }
    setTimeout(() => {
      const i2 = (typeof window !== 'undefined' ? window.csprclick : undefined) ||
        (clickRef as unknown as CsprClick | undefined);
      if (i2 && typeof i2.signIn === 'function') i2.signIn();
    }, 0);
  };

  return (
    <div className="min-h-screen">
      <Header
        currentPage={currentPage}
        onNavigate={handleNavigate}
        activeAccount={activeAccount}
        onConnect={handleConnectWallet}
      />

      {currentPage === "landing" && <LandingPage onNavigate={handleNavigate} />}

      {currentPage === "enter" && (
        <EnterLottery
          onNavigate={handleNavigate}
          onEntrySubmit={handleEntrySubmit}
          activeAccount={activeAccount}
          onConnect={handleConnectWallet}
        />
      )}

      {currentPage === "dashboard" && (
        <Dashboard
          onNavigate={handleNavigate}
          entries={entries}
          onWinningCelebration={handleWinningCelebration}
        />
      )}

      {winningState.show && winningState.entry && (
        <WinningFlow
          entry={winningState.entry}
          onClose={handleCloseWinningFlow}
        />
      )}
    </div>
  );
}
