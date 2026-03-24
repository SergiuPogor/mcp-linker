export type Quote = {
  text: string;
  author?: string;
};

// Lightweight offline quotes (tech/open-source leaning). Keep list short.
export const OFFLINE_QUOTES: Quote[] = [
  {
    text: "The best way to predict the future is to invent it.",
    author: "Alan Kay",
  },
  {
    text: "Programs must be written for people to read, and only incidentally for machines to execute.",
    author: "Harold Abelson",
  },
  { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds" },
  {
    text: "Simplicity is the soul of efficiency.",
    author: "Austin Freeman",
  },
  {
    text: "First, solve the problem. Then, write the code.",
    author: "John Johnson",
  },
  {
    text: "Perfection is achieved when there is nothing left to take away.",
    author: "Antoine de Saint-Exupéry",
  },
  {
    text: "Any sufficiently advanced technology is indistinguishable from magic.",
    author: "Arthur C. Clarke",
  },
  {
    text: "Open source is about collaborating; not competing.",
    author: "Kelsey Hightower",
  },
  { text: "Move fast and make things.", author: "Unknown" },
];

export function getRandomOfflineQuote(): Quote {
  return OFFLINE_QUOTES[Math.floor(Math.random() * OFFLINE_QUOTES.length)];
}

