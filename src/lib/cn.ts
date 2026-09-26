import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Tamanhos de texto próprios (design-system §5): sem isso o twMerge trata
// `text-body-sm` como cor e descarta `text-fg-muted` na mesma lista.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        { text: ["display-xl", "display-lg", "h1", "h2", "h3", "body-lg", "body", "body-sm", "caption", "eyebrow"] },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
