"use client";

import { useEffect, useId, useRef, useState } from "react";
import { searchAddresses } from "@/lib/actions/geocode";
import type { AddressSuggestion } from "@/lib/geocode/nominatim";

const DEBOUNCE_MS = 400;
const MIN_QUERY_LENGTH = 3;

type AddressAutocompleteProps = {
  onSelect: (address: string) => void;
  onPickCurrentLocation?: () => void;
  locating?: boolean;
  maxLength?: number;
  inputClassName?: string;
  labelClassName?: string;
};

export function AddressAutocomplete({
  onSelect,
  onPickCurrentLocation,
  locating = false,
  maxLength = 500,
  inputClassName,
  labelClassName,
}: AddressAutocompleteProps) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef(0);
  const debounceTimerRef = useRef<number | null>(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [searchedQuery, setSearchedQuery] = useState("");

  function handleQueryChange(value: string) {
    setQuery(value);

    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    const trimmed = value.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      requestIdRef.current += 1;
      setSuggestions([]);
      setLoading(false);
      setOpen(false);
      setActiveIndex(-1);
      setSearchedQuery("");
      return;
    }

    setLoading(true);
    const requestId = ++requestIdRef.current;

    debounceTimerRef.current = window.setTimeout(() => {
      debounceTimerRef.current = null;
      void (async () => {
        try {
          const results = await searchAddresses(trimmed);
          if (requestIdRef.current !== requestId) {
            return;
          }
          setSuggestions(results);
          setOpen(results.length > 0);
          setActiveIndex(-1);
          setSearchedQuery(trimmed);
        } catch {
          if (requestIdRef.current !== requestId) {
            return;
          }
          setSuggestions([]);
          setOpen(false);
          setSearchedQuery(trimmed);
        } finally {
          if (requestIdRef.current === requestId) {
            setLoading(false);
          }
        }
      })();
    }, DEBOUNCE_MS);
  }

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  function selectSuggestion(suggestion: AddressSuggestion) {
    onSelect(suggestion.displayName.slice(0, maxLength));
    setQuery("");
    setSuggestions([]);
    setOpen(false);
    setActiveIndex(-1);
    setSearchedQuery("");
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) =>
        prev <= 0 ? suggestions.length - 1 : prev - 1,
      );
      return;
    }

    if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      const selected = suggestions[activeIndex];
      if (selected) {
        selectSuggestion(selected);
      }
      return;
    }

    if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  const showEmptyState =
    !loading &&
    searchedQuery.length >= MIN_QUERY_LENGTH &&
    query.trim() === searchedQuery &&
    suggestions.length === 0;

  return (
    <div ref={rootRef} className="relative">
      <label htmlFor="visitAddressSearch" className={labelClassName}>
        Cari Alamat
      </label>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <div className="relative min-w-0 flex-1">
          <input
            id="visitAddressSearch"
            type="search"
            value={query}
            autoComplete="off"
            role="combobox"
            aria-expanded={open}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={
              activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
            }
            placeholder="Ketik jalan, kelurahan, atau landmark terdekat"
            className={inputClassName}
            onChange={(event) => handleQueryChange(event.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) {
                setOpen(true);
              }
            }}
            onKeyDown={handleKeyDown}
          />
        </div>
        {onPickCurrentLocation ? (
          <>
            <span className="flex shrink-0 items-center justify-center px-1 text-[11px] font-medium text-slate-400 sm:self-center">
              -atau-
            </span>
            <button
              type="button"
              disabled={locating}
              onClick={onPickCurrentLocation}
              className="flex min-h-12 shrink-0 items-center justify-center rounded-sm border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 active:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-[180px] sm:max-w-[220px]"
            >
              {locating ? "Mengambil lokasi…" : "Gunakan lokasi saat ini"}
            </button>
          </>
        ) : null}
      </div>
      {loading ? (
        <p className="mt-1 text-[11px] text-slate-500">Mencari alamat…</p>
      ) : null}
      {showEmptyState ? (
        <p className="mt-1 text-[11px] text-slate-500">
          Alamat tidak ditemukan. Coba kata kunci lain atau isi manual di bawah.
        </p>
      ) : null}
      {open && suggestions.length > 0 ? (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Saran alamat"
          className="absolute z-20 mt-1 max-h-52 w-full overflow-y-auto rounded-sm border border-slate-200 bg-white py-1 shadow-lg"
        >
          {suggestions.map((suggestion, index) => (
            <li key={`${suggestion.lat}-${suggestion.lng}-${index}`} role="none">
              <button
                id={`${listboxId}-option-${index}`}
                type="button"
                role="option"
                aria-selected={activeIndex === index}
                className={`block w-full px-3 py-2.5 text-left text-xs leading-snug ${
                  activeIndex === index
                    ? "bg-primary/10 text-primary"
                    : "text-slate-700 active:bg-slate-50"
                }`}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectSuggestion(suggestion)}
              >
                {suggestion.displayName}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <p className="mt-1 text-[10px] text-slate-400">
        Peta ©{" "}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2"
        >
          OpenStreetMap
        </a>
      </p>
    </div>
  );
}
