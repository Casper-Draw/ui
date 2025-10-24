"use client";

import { Button } from "./ui/button";
import { StackedTickets } from "./StackedTickets";
import { CasperDrawLogo } from "./CasperDrawLogo";
import { Menu } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "./ui/sheet";

interface CasperAccount {
  public_key: string;
}

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  activeAccount: CasperAccount | null;
  onConnect: () => void;
}

export function Header({ currentPage, onNavigate, activeAccount, onConnect }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-[#101010]/98 backdrop-blur-xl border-b-2 border-neon-pink/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-2.5 md:py-5 flex items-center justify-between">
        <motion.div
          className="cursor-pointer group"
          onClick={() => handleNavigate("landing")}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <StackedTickets className="h-12 md:h-21 group-hover:brightness-125 transition-all" />
        </motion.div>

        <nav className="hidden md:flex items-center gap-4">
          <button
            onClick={() => onNavigate("landing")}
            className={
              currentPage === "landing"
                ? "text-neon-pink opacity-100 px-4 py-2 transition-all cursor-pointer text-xl font-semibold"
                : "text-neon-pink/60 opacity-60 hover:opacity-80 px-4 py-2 transition-all cursor-pointer text-xl font-semibold"
            }
          >
            Home
          </button>
          <button
            onClick={() => onNavigate("enter")}
            className={
              currentPage === "enter"
                ? "text-neon-pink opacity-100 px-4 py-2 transition-all cursor-pointer text-xl font-semibold"
                : "text-neon-pink/60 opacity-60 hover:opacity-80 px-4 py-2 transition-all cursor-pointer text-xl font-semibold"
            }
          >
            Play
          </button>
          <button
            onClick={() => onNavigate("dashboard")}
            className={
              currentPage === "dashboard"
                ? "text-neon-pink opacity-100 px-4 py-2 transition-all cursor-pointer text-xl font-semibold"
                : "text-neon-pink/60 opacity-60 hover:opacity-80 px-4 py-2 transition-all cursor-pointer text-xl font-semibold"
            }
          >
            Dashboard
          </button>
          <Button
            onClick={(e) => { e.preventDefault(); onConnect(); }}
            className="bg-neon-pink hover:bg-neon-pink/90 text-white px-6 py-5 transition-all hover:scale-105 cursor-pointer text-lg"
          >
            {activeAccount ? `${activeAccount.public_key.slice(0, 6)}...${activeAccount.public_key.slice(-4)}` : 'Connect'}
          </Button>
        </nav>

        <button
          className="md:hidden text-cyan-300 hover:text-cyan-400 cursor-pointer transition-colors p-0"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="w-9 h-9" />
        </button>
      </div>

      {/* Mobile Menu Slide-in Tray */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent
          side="right"
          className="w-[280px] bg-[#101010]/95 backdrop-blur-xl border-l-2 border-neon-pink/50 p-0 flex flex-col"
        >
          <SheetHeader className="px-6 pt-8 pb-4">
            <SheetTitle className="text-white text-left text-2xl font-semibold">
              Menu
            </SheetTitle>
            <SheetDescription className="sr-only">
              Navigation menu for Casper Draw
            </SheetDescription>
          </SheetHeader>

          <nav className="flex flex-col px-6 py-4 gap-2 flex-1">
            <button
              onClick={() => handleNavigate("landing")}
              className={
                currentPage === "landing"
                  ? "text-neon-pink opacity-100 px-4 py-3 transition-all cursor-pointer text-left text-lg font-semibold"
                  : "text-neon-pink/60 opacity-60 hover:opacity-80 px-4 py-3 transition-all cursor-pointer text-left text-lg font-semibold"
              }
            >
              Home
            </button>
            <button
              onClick={() => handleNavigate("enter")}
              className={
                currentPage === "enter"
                  ? "text-neon-pink opacity-100 px-4 py-3 transition-all cursor-pointer text-left text-lg font-semibold"
                  : "text-neon-pink/60 opacity-60 hover:opacity-80 px-4 py-3 transition-all cursor-pointer text-left text-lg font-semibold"
              }
            >
              Play
            </button>
            <button
              onClick={() => handleNavigate("dashboard")}
              className={
                currentPage === "dashboard"
                  ? "text-neon-pink opacity-100 px-4 py-3 transition-all cursor-pointer text-left text-lg font-semibold"
                  : "text-neon-pink/60 opacity-60 hover:opacity-80 px-4 py-3 transition-all cursor-pointer text-left text-lg font-semibold"
              }
            >
              Dashboard
            </button>
            <Button
              onClick={(e) => { e.preventDefault(); onConnect(); }}
              className="bg-neon-pink hover:bg-neon-pink/90 text-white px-6 py-5 transition-all hover:scale-105 cursor-pointer mt-2 text-lg"
            >
              {activeAccount ? `${activeAccount.public_key.slice(0, 6)}...${activeAccount.public_key.slice(-4)}` : 'Connect'}
            </Button>
          </nav>

          {/* Casper Draw Logo at Bottom */}
          <div className="px-6 pb-8 mt-auto">
            <CasperDrawLogo className="w-full h-auto" />
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
