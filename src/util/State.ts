import { atom } from 'jotai';

// Tab State for Dashboard Side Menu
export const tabAtom = atom("Summary")

// Congress Dashboard


// Summary
export type DonationSlice = {
  id: number;
  label: string;
  value: number;
};

export type TimelineEvent = {
  year: string;
  label: string;
  type: "term" | "campaign";
};

export type NewsArticle = {
  title: string;
  source: string;
  date: string;
  href: string;
};

export type SponsorCategory = {
  name: string;
  amount: string;
};

export const personAtom = atom()