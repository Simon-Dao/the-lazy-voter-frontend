import { atom } from 'jotai';

// Dashboard Side Menu
export const DashboardSideMenuTabAtom = atom(0);

// SearchBar
export const peopleSearchResults = atom([]);

// Summary
export type DonationSlice = {
  id: number;
  name: string;
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

export type BillCategory = {
  name: string;
  value: number;
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
  topSponsorCategoriesByYear?: Record<string, BillCategory[]>;
  donationsByYear?: Record<string, DonationSlice[]>;
  ballotpedia?: string;
  photoSrc?:string;
};

export const PoliticiansDetailedAtom = atom<PoliticianDetailed[]>([]);
export const SelectedPoliticianDetailedAtom = atom<PoliticianDetailed | null>();
export type PoliticianUIDType = string | null; 
export const SelectedPoliticianUIDAtom = atom<PoliticianUIDType>(null);

export const STATE_MAP: Map<string, string> = new Map([
  ["AL", "Alabama"],
  ["AK", "Alaska"],
  ["AZ", "Arizona"],
  ["AR", "Arkansas"],
  ["CA", "California"],
  ["CO", "Colorado"],
  ["CT", "Connecticut"],
  ["DE", "Delaware"],
  ["FL", "Florida"],
  ["GA", "Georgia"],
  ["HI", "Hawaii"],
  ["ID", "Idaho"],
  ["IL", "Illinois"],
  ["IN", "Indiana"],
  ["IA", "Iowa"],
  ["KS", "Kansas"],
  ["KY", "Kentucky"],
  ["LA", "Louisiana"],
  ["ME", "Maine"],
  ["MD", "Maryland"],
  ["MA", "Massachusetts"],
  ["MI", "Michigan"],
  ["MN", "Minnesota"],
  ["MS", "Mississippi"],
  ["MO", "Missouri"],
  ["MT", "Montana"],
  ["NE", "Nebraska"],
  ["NV", "Nevada"],
  ["NH", "New Hampshire"],
  ["NJ", "New Jersey"],
  ["NM", "New Mexico"],
  ["NY", "New York"],
  ["NC", "North Carolina"],
  ["ND", "North Dakota"],
  ["OH", "Ohio"],
  ["OK", "Oklahoma"],
  ["OR", "Oregon"],
  ["PA", "Pennsylvania"],
  ["RI", "Rhode Island"],
  ["SC", "South Carolina"],
  ["SD", "South Dakota"],
  ["TN", "Tennessee"],
  ["TX", "Texas"],
  ["UT", "Utah"],
  ["VT", "Vermont"],
  ["VA", "Virginia"],
  ["WA", "Washington"],
  ["WV", "West Virginia"],
  ["WI", "Wisconsin"],
  ["WY", "Wyoming"],
]);