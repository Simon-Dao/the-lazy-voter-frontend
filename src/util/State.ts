import { atom } from 'jotai';

// Dashboard Side Menu
export const DashboardSideMenuTabAtom = atom(0);

// SearchBar
export const peopleSearchResults = atom([]);

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

export type PoliticianBasicInfo = {
  u_id: string;
  name: string;
  latestYear: number;
  role: string;
  party: string;
  state: string;
  status: string;
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

export const IsPoliticianSelectedAtom = atom(false);

// Politicians Dashboard
export type PoliticianDetailed = {
  u_id: string;
  name: string;
  latestYear?: number;
  role?: string;
  party?: string;
  state?: string;
  status?: string;
  legislativeFocus?: string[];
  newsArticles?: NewsArticle[];
  timeline?: TimelineEvent[];
  billCategoriesByYear?: Record<string, DonationSlice[]>;
  topSponsorCategoriesByYear?: Record<string, SponsorCategory[]>;
  donationsByYear?: Record<string, DonationSlice[]>;
  ballotpedia?: string;
  photoSrc?:string;
};

export const PoliticiansDetailedAtom = atom<PoliticianDetailed[]>([]);
export const SelectedPoliticianDetailedAtom = atom<PoliticianDetailed | null>();
export type PoliticianUIDType = string | null; 
export const SelectedPoliticianUIDAtom = atom<PoliticianUIDType>(null);