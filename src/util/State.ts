import { atom } from 'jotai';

// Tab State for Dashboard Side Menu
export const DashboardSideMenuTabAtom = atom(0);

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

export type PoliticianBasicInfoAtom = PoliticianBasicInfo | null;

export const selectedPoliticianAtom = atom<PoliticianBasicInfoAtom>(null);
export const selectedPoliticiansAtom = atom([]);
export const isPoliticianSelectedAtom = atom(false);

// SearchBar
export const peopleSearchResults = atom([]);

//Dashboard

export type PoliticianDetailed = {
  u_id: string;
  name: string;
  latestYear: number;
  role: string;
  party: string;
  state: string;
  legislativeFocus: string[];
};

export type SelectedPoliticians = {

};