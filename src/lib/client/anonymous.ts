"use client";

const STORAGE_KEY = "ghosted_anon_id";

export function getAnonymousId(): string {
  if (typeof window === "undefined") {
    return "server-anon";
  }

  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    // Generate random UUID or secure hex string
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      id = crypto.randomUUID();
    } else {
      id = "anon_" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    }
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}

const PSEUDO_TITLES = [
  "Ghost Hunter",
  "Interview Survivor",
  "Round-5 Veteran",
  "HR Circus Victim",
  "Take-Home Martyr",
  "Offer Phantom",
  "Infinite Waiter",
  "Crickets Listener",
  "Panel Escapee",
  "Whiteboard Gladiator",
  "Algorithmic Wanderer",
  "LinkedIn Ghostbuster",
  "Zombie Candidate",
  "Friday Callback Believer",
  "Resume Blackhole Explorer",
];

export function generatePseudonym(seedString: string): string {
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = (hash << 5) - hash + seedString.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);
  const title = PSEUDO_TITLES[absHash % PSEUDO_TITLES.length];
  const number = (absHash % 899) + 100;
  return `${title} #${number}`;
}
