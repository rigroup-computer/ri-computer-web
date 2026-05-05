import { create } from "zustand";

type MarketplaceFilterStore = {
  query: string;
  setQuery: (value: string) => void;
};

export const useMarketplaceFilter = create<MarketplaceFilterStore>((set) => ({
  query: "",
  setQuery: (value) => set({ query: value }),
}));
