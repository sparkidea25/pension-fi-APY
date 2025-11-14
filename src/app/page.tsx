"use client";

import { useEffect, useState } from "react";

interface PlanSummary {
  totalPlans: number;
  activePlans: number;
  totalTVL: number;
  activeTVL: number;
  avgAPY: number;
}

export default function Home() {
  const [summary, setSummary] = useState<PlanSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch("/api/hello");
        const data = await res.json();
        if (data.error) {
          setError(data.error);
        } else {
          setSummary(data.summary);
        }
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <h1 className="text-4xl font-bold text-black dark:text-zinc-50 mb-8">
          Pensionfi Plans Summary
        </h1>

        {loading && <p className="text-lg text-zinc-600 dark:text-zinc-400">Loading...</p>}

        {error && (
          <div className="w-full p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            Error: {error}
          </div>
        )}

        {summary && (
          <div className="w-full space-y-6">
            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Total Plans</p>
              <p className="text-3xl font-bold text-black dark:text-zinc-50">{summary.totalPlans}</p>
            </div>

            <div className="p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Active Plans</p>
              <p className="text-3xl font-bold text-black dark:text-zinc-50">{summary.activePlans}</p>
            </div>

            <div className="p-6 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Total TVL (USDC)</p>
              <p className="text-3xl font-bold text-black dark:text-zinc-50">
                ${summary.totalTVL.toLocaleString()}
              </p>
            </div>

            <div className="p-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Active TVL (USDC)</p>
              <p className="text-3xl font-bold text-black dark:text-zinc-50">
                ${summary.activeTVL.toLocaleString()}
              </p>
            </div>

            <div className="p-6 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Average APY</p>
              <p className="text-3xl font-bold text-black dark:text-zinc-50">{summary.avgAPY}%</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}