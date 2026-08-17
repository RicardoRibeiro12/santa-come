const KEYWORDS: [RegExp, string][] = [
  [/peixe|dourada|salm|robalo|bacalhau|lulas|choco|polvo|marisco/i, "fish"],
  [/carne|vazia|picanha|bife|bitoque|costelet|entremeada|febra|hamburg|vitela|frango|porco|grelhad/i, "meat"],
  [/sopa|caldo/i, "soup"],
  [/sobremesa|doce|pudim|gelado/i, "dessert"],
  [/bebida|vinho|água|agua|sumo|imperial|café|cafe/i, "drink"],
  [/massa|crepe|salada/i, "bowl"],
];

function detectIcon(category: string): string {
  for (const [pattern, icon] of KEYWORDS) {
    if (pattern.test(category)) return icon;
  }
  return "plate";
}

const ICON_PATHS: Record<string, React.ReactNode> = {
  fish: (
    <path d="M3 12c3-4 8-6 13-4-1 2-1 6 0 8-5 2-10 0-13-4Zm13-4 4-2v12l-4-2M7 10l-2-2M7 14l-2 2" />
  ),
  meat: <path d="M8 15a5 5 0 1 0-3.5-3.5L2 14l2 2 2.5-2.5A5 5 0 0 0 8 15Zm5.5-5.5L19 4M15 6l3 3M12 9l3 3" />,
  soup: <path d="M3 11h18a8 8 0 0 1-16 0Zm2-1c0-2 1-4 2-5m5 5c0-2 1-4 2-5" />,
  dessert: <path d="M6 11c0-4 2.5-7 6-7s6 3 6 7M4 11h16l-1.5 9h-13L4 11Zm4 4h8" />,
  drink: <path d="M6 3h12l-2 9a4 4 0 0 1-8 0L6 3ZM8 21h8M12 12v9" />,
  bowl: <path d="M3 11h18a9 9 0 0 1-18 0Zm2-1c1-3 4-5 7-5s6 2 7 5" />,
  plate: <circle cx="12" cy="12" r="8" />,
};

export default function CategoryIcon({ category, className }: { category: string; className?: string }) {
  const icon = detectIcon(category);
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {ICON_PATHS[icon]}
    </svg>
  );
}
