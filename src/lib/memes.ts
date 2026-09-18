export interface MemeReaction {
  id: string;
  title: string;
  dialogue: string;
  hindiQuote?: string;
  character: string;
  emoji: string;
  bgGradient: string;
  badge: string;
  audioPunch?: string;
}

export const MEME_REACTIONS: Record<string, MemeReaction> = {
  "Ghosting": {
    id: "meme-ghosting",
    title: "गायब! Gone in 60 Seconds",
    dialogue: "Humko toh apno ne loota, gairon mein kahan dum tha... HR ne toh message dekha bhi nahi!",
    hindiQuote: "हम तो समझे थे पक्की नौकरी है, यहाँ तो चैट ही डिलीट हो गई 👻",
    character: "Vanishing Ghost Candidate",
    emoji: "👻",
    bgGradient: "from-purple-950/95 via-zinc-950 to-purple-900/90",
    badge: "GHOSTED 404",
  },
  "Layoff Shock": {
    id: "meme-layoff",
    title: "सबका कटेगा! Layoff Special",
    dialogue: "न्यायेन राज्यं लवण्डेन भुज्यते! कल तक 'You are family', आज Slack access revoked!",
    hindiQuote: "CEO: 'Tough decisions had to be made'... aur tumhara laptop courier ho gaya 📦",
    character: "Mass Layoff Casualty",
    emoji: "🪓",
    bgGradient: "from-red-950/95 via-zinc-950 to-orange-950/90",
    badge: "SLACK DEACTIVATED 🪓",
  },
  "Rejected": {
    id: "meme-rejected",
    title: "हम भी पेले गए थे, तुम भी पेले जाओगे",
    dialogue: "‘After careful consideration with other exceptionally qualified candidates’... copypaste maar diya!",
    hindiQuote: "Auto-rejection mail 0.2 seconds me aa gaya, ATS ne resume dekha bhi nahi! 🚫",
    character: "ATS Victim",
    emoji: "🚫",
    bgGradient: "from-amber-950/95 via-zinc-950 to-rose-950/90",
    badge: "AUTOMATED REJECTION 💀",
  },
  "Zombie Interview": {
    id: "meme-zombie",
    title: "Round 9: Final Final Final Round",
    dialogue: "Arey bhai kitne rounds loge? Ab toh lag raha hai CEO ke sath kundli match karni padegi!",
    hindiQuote: "6 Coding + 3 System Design + 2 Culture Fit... aur fir bolte hain budget freeze ho gaya 🧟",
    character: "Infinite Interviewee",
    emoji: "🧟",
    bgGradient: "from-emerald-950/95 via-zinc-950 to-cyan-950/90",
    badge: "ROUND 9 INCOMPLETE 🧟",
  },
  "Infinite Waiting": {
    id: "meme-waiting",
    title: "तारीख पे तारीख, तारीख पे तारीख!",
    dialogue: "Recruiter: 'Will revert back by EOD'. Year 2040 aa gaya, EOD abhi tak nahi aaya!",
    hindiQuote: "HR ne bola tha 'Hold tight', ab haath hi jam gaye hain ⏳",
    character: "Sunny Deol Courtroom Mode",
    emoji: "⏳",
    bgGradient: "from-yellow-950/95 via-zinc-950 to-stone-950/90",
    badge: "STILL UNDER CONSIDERATION ⏳",
  },
  "Unpaid Assignment": {
    id: "meme-assignment",
    title: "Free Consulting Disguised as 'Take-Home'",
    dialogue: "Mera poora product roadmap bana ke feature release bhi kar diya, interview feedback zero!",
    hindiQuote: "Assignment me full-stack app banwaya, fir bola 'Looking for senior profile' 💀",
    character: "Free Labor Intern",
    emoji: "💀",
    bgGradient: "from-zinc-950 via-slate-900 to-zinc-900",
    badge: "FREE WORK EXPLOITATION 💀",
  },
  "Red Flag": {
    id: "meme-redflag",
    title: "Bhaag Milkha Bhaag! Red Flag",
    dialogue: "'We are a fast-paced family with high ownership' matlab Saturday Sunday dono me call aayegi!",
    hindiQuote: "Glassdoor review padha hota toh ye din na dekhna padta 🚩",
    character: "Overworked SDE",
    emoji: "🚩",
    bgGradient: "from-rose-950/95 via-zinc-950 to-red-950/90",
    badge: "RUN FOR YOUR LIFE 🚩",
  },
};

export const GLOBAL_MEME_QUOTES = [
  "‘We are like a family here’ — Ha, wahi family jo property ke batwaare me baat nahi karti! 🚩",
  "HR: 'We offer great work-life balance'. Reality: Work in office, life in dreams 😴",
  "Sabka katne wala hai — 2040 tak AI will interview AI and ghost AI 🤖",
  "Recruiter was active on LinkedIn 2 mins ago, but my follow-up email has been pending since Diwali 🪔",
  "Status: 'Under Consideration'. Brother, Gandhi Ji got freedom faster than your HR reply! ⏳",
  "Interview cleared, salary discussed, and then recruiter entered witness protection program 🥷",
  "‘We regret to inform you’ — Pehle regret ka spell check kar lete bhai, 3 month baad bheja hai 🤡",
  "Laid off over a 45-second Zoom call with camera turned off. Corporate empathy at peak! 🪓",
  "ATS parsed my 5-year experience as 'Kindergarten Volunteer'. Respect the algorithms 🦾",
  "न्यायेन राज्यं लवण्डेन भुज्यते — Job market in 2026 summed up in 5 words! 📜",
];
