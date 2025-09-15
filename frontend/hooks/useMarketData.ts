"use client";
import { useEffect, useState } from "react";

import { Ocean, Island, Buy, Sell, Upload, CommodClass } from "@interfaces";
import { useLoadingContext, useNotificationContext } from "@context";
import api from "@utils/api";

const MARKET_CACHE_KEY = "marketCache";
const MAX_CACHE_ENTRIES = 10;
const CACHE_TTL = 12 * 60 * 60 * 1000; // 12 hours

type MarketEntry = {
  key: string;
  timestamp: number;
  buys: any[];
  sells: any[];
  upload: any;
};

const getCache = (): MarketEntry[] => {
  try {
    return JSON.parse(localStorage.getItem(MARKET_CACHE_KEY) || "[]");
  } catch {
    return [];
  }
};

const setCache = (cache: MarketEntry[]) => {
  localStorage.setItem(MARKET_CACHE_KEY, JSON.stringify(cache));
};

const getFromCache = (key: string): MarketEntry | null => {
  const cache = getCache();
  const entry = cache.find((entry) => entry.key === key);

  if (!entry) return null;

  const isFresh = Date.now() - entry.timestamp < CACHE_TTL;

  return isFresh ? entry : null;
};

const addToCache = (entry: MarketEntry) => {
  let cache = getCache().filter((e) => e.key !== entry.key);
  cache.push(entry);

  if (cache.length > MAX_CACHE_ENTRIES) {
    cache.sort((a, b) => a.timestamp - b.timestamp);
    cache = cache.slice(-MAX_CACHE_ENTRIES);
  }

  setCache(cache);
};

export default function useMarketData(
  ocean: Ocean,
  island: Island,
  commodclass: CommodClass
) {
  const { addAlertMessage } = useNotificationContext();
  const [buys, setBuys] = useState<Buy[] | null>(null);
  const [sells, setSells] = useState<Sell[] | null>(null);
  const [upload, setUpload] = useState<Upload | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { setIsPageLoading } = useLoadingContext();

  useEffect(() => {
    const key = `${ocean.id}_${island.islandname}_${commodclass.commodclass}`;
    const cached = getFromCache(key);

    if (cached) {
      setIsPageLoading(true);
      setBuys(cached.buys);
      setSells(cached.sells);
      setUpload(cached.upload);
      setLoading(false);

      setIsPageLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsPageLoading(true);
      setLoading(true);
      try {
        const res = await api.get(
          `/marketdata?islandname=${island.islandname}&oceanId=${ocean.id}&commodclass=${commodclass.commodclass}`
        );

        setBuys(res.data.buys);
        setSells(res.data.sells);
        setUpload(res.data.upload);
        addToCache({
          key,
          timestamp: Date.now(),
          buys: res.data.buys,
          sells: res.data.sells,
          upload: res.data.upload,
        });
      } catch (err: any) {
        setError("Failed to fetch market data");
        console.error("Failed to fetch market data", err);
        addAlertMessage({
          severity: "error",
          text: "Failed to fetch market data",
        });

        setIsPageLoading(false);
      } finally {
        setIsPageLoading(false);
        setLoading(false);
      }
    };

    fetchData();
  }, [ocean, island, commodclass]);

  return { buys, sells, upload, loading, error };
}
