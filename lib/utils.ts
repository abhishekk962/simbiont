"use client";

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const mergeTags = (existing: any[], incoming: any[]) => [
  ...existing,
  ...incoming.filter(
    (i) =>
      !existing.some((e) => e.parameter === i.parameter && e.value === i.value),
  ),
];

export function toTitleCase(str: string): string {
  // 1. Convert the entire string to lowercase for consistency
  str = str.toLowerCase();

  // 2. Split the string into an array of words
  const words = str.split(" ");

  // 3. Map over the array, capitalizing the first letter of each word
  const titleCasedWords = words.map((word) => {
    if (word.length === 0) return "";
    return word.charAt(0).toUpperCase() + word.slice(1);
  });

  // 4. Join the words back together into a single string
  return titleCasedWords.join(" ");
}

import { useState, useEffect } from "react";

export function useMousePosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return position;
}

export function speakText(text: string) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  } else {
    alert('Text-to-speech not supported in this browser.');
  }
}
