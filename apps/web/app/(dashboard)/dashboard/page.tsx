"use client";

import { useState } from "react";
import {
  Zap,
  Code2,
  Users,
  Crown,
  Brain,
  Eye,
  Lock,
  ArrowRight,
  X,
} from "lucide-react";

type CardStatus = "active" | "locked";

type MatchCard = {
  id: string;
  title: string;
  description: string;
  status: CardStatus;
  icon: React.ReactNode;
  action: "matchmaking" | "navigate" | "friend-card" | "none";
  accentColor: string;
  tag?: string;
};

/* ────────────────────────────────────────────────────────────
   Card Data
   ──────────────────────────────────────────────────────────── */

const MATCH_CARDS: MatchCard[] = [
  {
    id: "quick-match",
    title: "Quick Match",
    description: "Instant 1v1 coding battle against a random opponent",
    status: "active",
    icon: <Zap className="h-6 w-6" />,
    action: "matchmaking",
    accentColor: "text-accent",
    tag: "vs Random",
  },
  {
    id: "practice-solo",
    title: "Practice Solo",
    description: "Sharpen your skills with curated problems at your own pace",
    status: "active",
    icon: <Code2 className="h-6 w-6" />,
    action: "navigate",
    accentColor: "text-success",
  },
  {
    id: "friend-duel",
    title: "Friend Duel",
    description: "Challenge your buddy to a private coding battle",
    status: "active",
    icon: <Users className="h-6 w-6" />,
    action: "friend-card",
    accentColor: "text-warning",
    tag: "vs Friend",
  },
  {
    id: "custom-lobby",
    title: "Custom Lobby",
    description: "Create private contests with custom rules and settings",
    status: "locked",
    icon: <Crown className="h-6 w-6" />,
    action: "none",
    accentColor: "text-muted",
  },
  {
    id: "algorithm-duels",
    title: "Algorithm Duels",
    description: "Test your algorithmic thinking in specialized challenges",
    status: "locked",
    icon: <Brain className="h-6 w-6" />,
    action: "none",
    accentColor: "text-muted",
  },
  {
    id: "spectate-mode",
    title: "Spectate Mode",
    description: "Watch live coding battles and learn from the best",
    status: "locked",
    icon: <Eye className="h-6 w-6" />,
    action: "none",
    accentColor: "text-muted",
  },
];

/* ────────────────────────────────────────────────────────────
   Friend Card Overlay (floating)
   ──────────────────────────────────────────────────────────── */

type FriendCardProps = {
  isOpen: boolean;
  onClose: () => void;
};

const FriendCard = ({ isOpen, onClose }: FriendCardProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Invite a friend"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close friend invite"
          tabIndex={0}
          className="absolute right-4 top-4 rounded-lg p-1 text-muted transition-colors hover:bg-card-hover hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/15">
            <Users className="h-5 w-5 text-warning" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Friend Duel</h3>
            <p className="text-xs text-muted">Invite a friend to battle</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label
              htmlFor="friend-username"
              className="mb-1.5 block text-xs font-medium text-muted"
            >
              Friend&apos;s Username
            </label>
            <input
              id="friend-username"
              type="text"
              placeholder="Enter username..."
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder-muted outline-none transition-colors focus:border-accent"
            />
          </div>

          <div className="text-center text-xs text-muted">or</div>

          <div>
            <label
              htmlFor="room-code"
              className="mb-1.5 block text-xs font-medium text-muted"
            >
              Room Code
            </label>
            <input
              id="room-code"
              type="text"
              placeholder="Enter room code..."
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder-muted outline-none transition-colors focus:border-accent"
            />
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            aria-label="Create room"
            tabIndex={0}
            className="flex-1 rounded-xl bg-warning px-4 py-2.5 text-sm font-medium text-black transition-colors hover:bg-warning-hover"
          >
            Create Room
          </button>
          <button
            type="button"
            aria-label="Join room"
            tabIndex={0}
            className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-card-hover"
          >
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────────────────────
   Dashboard Page
   ──────────────────────────────────────────────────────────── */

const DashboardPage = () => {
  const [isFriendCardOpen, setIsFriendCardOpen] = useState(false);

  const handleCardClick = (card: MatchCard) => {
    if (card.status === "locked") return;

    switch (card.action) {
      case "matchmaking":
        // Future: starts matchmaking
        break;
      case "navigate":
        // Future: navigates to /code
        break;
      case "friend-card":
        setIsFriendCardOpen(true);
        break;
      default:
        break;
    }
  };

  const handleCardKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>,
    card: MatchCard
  ) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick(card);
    }
  };

  const handleCloseFriendCard = () => {
    setIsFriendCardOpen(false);
  };

  return (
    <>
      <FriendCard isOpen={isFriendCardOpen} onClose={handleCloseFriendCard} />

      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* ── Header ── */}
        <div className="mb-10">
          <div className="mb-2 flex items-center gap-2">
            <div className="h-1 w-6 rounded-full bg-accent" />
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">
              Arena
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Online Duels
          </h1>
          <p className="mt-2 text-base text-muted">
            Challenge your friends and coders around the globe
          </p>
        </div>

        {/* ── Card Grid ── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MATCH_CARDS.map((card) => {
            const isLocked = card.status === "locked";

            return (
              <div
                key={card.id}
                role="button"
                tabIndex={isLocked ? -1 : 0}
                aria-label={`${card.title}${isLocked ? " — Upcoming" : ""}`}
                aria-disabled={isLocked}
                onClick={() => handleCardClick(card)}
                onKeyDown={(e) => handleCardKeyDown(e, card)}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-6 transition-all duration-200 ${
                  isLocked
                    ? "cursor-not-allowed border-border/50 bg-card/50 opacity-60"
                    : "cursor-pointer border-border bg-card hover:border-border hover:bg-card-hover hover:shadow-lg hover:shadow-black/20"
                }`}
              >
                {/* Locked overlay badge */}
                {isLocked && (
                  <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-muted/10 px-2.5 py-1">
                    <Lock className="h-3 w-3 text-muted" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                      Upcoming
                    </span>
                  </div>
                )}

                {/* Tag badge for active cards */}
                {!isLocked && card.tag && (
                  <div className="absolute right-4 top-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                        card.id === "quick-match"
                          ? "bg-accent/10 text-accent"
                          : "bg-warning/10 text-warning"
                      }`}
                    >
                      {card.tag}
                    </span>
                  </div>
                )}

                {/* Icon */}
                <div className="mb-5">
                  <div
                    className={`inline-flex rounded-xl p-3 ${
                      isLocked ? "bg-muted/5" : "bg-surface"
                    }`}
                  >
                    <span className={isLocked ? "text-muted/50" : card.accentColor}>
                      {card.icon}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col">
                  <h3 className="mb-1 text-lg font-semibold">{card.title}</h3>
                  <p className="mb-5 text-sm leading-relaxed text-muted">
                    {card.description}
                  </p>
                </div>

                {/* Footer action */}
                {!isLocked && (
                  <div className="flex items-center gap-1 text-sm font-medium text-accent opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <span>
                      {card.action === "matchmaking" && "Start Battle"}
                      {card.action === "navigate" && "Start Practice"}
                      {card.action === "friend-card" && "Invite Friend"}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Stats Bar ── */}
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: "Online Players", value: "1,247", dot: "bg-success" },
            { label: "Active Matches", value: "89", dot: "bg-accent" },
            { label: "Your Wins", value: "0", dot: "bg-warning" },
            { label: "Win Rate", value: "0%", dot: "bg-danger" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
            >
              <span className={`h-2 w-2 rounded-full ${stat.dot}`} />
              <div>
                <p className="text-xs text-muted">{stat.label}</p>
                <p className="text-lg font-bold">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
