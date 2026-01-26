import React, { useState, useEffect, useMemo } from "react";
import { getAllCrimeReports } from "../controllers/CrimeReports.controller";
import {
  Search,
  Calendar,
  Siren,
  ExternalLink,
  Filter,
  AlertTriangle,
  ShieldAlert,
} from "lucide-react";

const getCrimeCategory = (text) => {
  const lower = (text || "").toLowerCase();
  if (lower.includes("murder") || lower.includes("kill") || lower.includes("dead"))
    return { label: "Homicide", color: "bg-red-600", icon: <ShieldAlert className="w-3 h-3" /> };
  if (lower.includes("theft") || lower.includes("rob") || lower.includes("steal"))
    return { label: "Theft", color: "bg-orange-500", icon: <AlertTriangle className="w-3 h-3" /> };
  if (lower.includes("assault") || lower.includes("attack"))
    return { label: "Assault", color: "bg-red-500", icon: <Siren className="w-3 h-3" /> };
  if (lower.includes("fraud") || lower.includes("scam"))
    return { label: "Fraud", color: "bg-yellow-600", icon: <AlertTriangle className="w-3 h-3" /> };
  return { label: "General News", color: "bg-emerald-600", icon: <Siren className="w-3 h-3" /> };
};

export default function CrimeReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // single combined input for keywords + area
  const [query, setQuery] = useState("");

  // date range: both blank by default (user chooses)
  const [dateFrom, setDateFrom] = useState(""); // user may pick
  const [dateTo, setDateTo] = useState(""); // optional

  const [categoryFilter, setCategoryFilter] = useState("All");

  // today string for runtime use only
  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getAllCrimeReports();

        // Defensive normalization
        let raw = [];
        if (Array.isArray(res?.data?.crimes)) raw = res.data.crimes;
        else if (Array.isArray(res?.data?.data)) raw = res.data.data;
        else if (Array.isArray(res?.data)) raw = res.data;
        else if (Array.isArray(res?.data?.data?.reports)) raw = res.data.data.reports;
        else {
          const maybe = Object.values(res?.data || {}).find(Array.isArray);
          if (Array.isArray(maybe)) raw = maybe;
        }

        // Normalize shape and keep original order
        const normalized = raw.map((r) => ({
          _id: r._id || r.id || String(Math.random()),
          title: r.title || (r.summary ? r.summary.slice(0, 80) : "Untitled"),
          summary: r.summary || "",
          link: r.link || r.source || "",
          publishedAt: r.publishedAt || r.createdAt || r.updatedAt || null,
          source: r.source || "",
          location: r.location || r.locationId || null,
          locationName: r.locationName || r.area || "",
          raw: r,
        }));

        if (!mounted) return;
        setReports(normalized);
      } catch (err) {
        console.error("getAllCrimeReports error:", err);
        if (!mounted) return;
        setReports([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      mounted = false;
    };
  }, []);

  // Filtered logic with: (a) first 100 base, (b) combined query field, (c) date-range logic per your requirement
  const filteredReports = useMemo(() => {
  if (!Array.isArray(reports)) return [];

  // 1️⃣ Take first 100 (latest-first from backend)
  const base = reports.slice(0, 100);

  // 2️⃣ Combined search
  const combined = (query || "").trim().toLowerCase();
  const terms = combined ? combined.split(/\s+/).filter(Boolean) : [];

  // 3️⃣ Date logic
  const usingDateFilter = Boolean(dateFrom || dateTo);

  let fromStr = null;
  let toStr = null;

  if (usingDateFilter) {
    if (dateFrom && !dateTo) {
      fromStr = dateFrom;
      toStr = todayStr;
    } else if (!dateFrom && dateTo) {
      fromStr = dateTo;
      toStr = dateTo;
    } else {
      fromStr = dateFrom;
      toStr = dateTo;
    }
  }

  let fromTs = fromStr ? new Date(fromStr + "T00:00:00").getTime() : null;
  let toTs   = toStr   ? new Date(toStr   + "T23:59:59.999").getTime() : null;

  if (fromTs !== null && toTs !== null && fromTs > toTs) {
    [fromTs, toTs] = [toTs, fromTs];
  }

  // 4️⃣ Filter
  let result = base.filter((report) => {
    const content = `${report.title || ""} ${report.summary || ""}`.toLowerCase();
    const derivedCategory = getCrimeCategory(content).label;
    if (categoryFilter !== "All" && derivedCategory !== categoryFilter) return false;

    const locText = `${report.locationName || ""} ${report.location || ""}`.toLowerCase();
    const hay = `${content} ${report.source || ""} ${locText}`;

    if (terms.length && !terms.every((t) => hay.includes(t))) return false;

    if (usingDateFilter) {
      const published = report.publishedAt ? new Date(report.publishedAt) : null;
      if (!published || isNaN(published)) return false;
      const ts = published.getTime();
      if ((fromTs && ts < fromTs) || (toTs && ts > toTs)) return false;
    }

    return true;
  });

  // 5️⃣ 🔁 REVERSE ONLY WHEN DATE FILTER IS USED
  if (usingDateFilter) {
    result = [...result].reverse();
  }

  return result;
}, [reports, query, dateFrom, dateTo, categoryFilter, todayStr]);

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <ShieldAlert className="text-red-500 w-8 h-8" />
          Crime Monitor
        </h1>
        <p className="text-white/60 mt-2">Real-time alerts and news reports from your city.</p>
      </div>

      <div className="max-w-6xl mx-auto mb-8 sticky top-4 z-20">
        <div className="bg-slate-800/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
            <input
              type="text"
              placeholder="Search keywords or area (e.g. 'teacher Malad')..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all"
            />
          </div>

          <div className="w-full md:w-40 relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white appearance-none focus:outline-none focus:border-emerald-500/50 cursor-pointer"
            >
              <option value="All">All Types</option>
              <option value="Homicide">Homicide</option>
              <option value="Theft">Theft</option>
              <option value="Assault">Assault</option>
              <option value="Fraud">Fraud</option>
              <option value="General News">Other</option>
            </select>
          </div>

          <div className="flex gap-2 w-full md:w-auto items-center">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-emerald-500/50"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <div>
            <button
              onClick={() => {
                setQuery("");
                setDateFrom("");
                setDateTo("");
                setCategoryFilter("All");
              }}
              className="text-emerald-400 hover:text-emerald-300 text-sm font-medium"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-4">
        {loading ? (
          <div className="text-center py-20 text-white/50">Loading crime data...</div>
        ) : filteredReports.length === 0 ? (
          <div className="p-8 rounded-3xl bg-slate-800/30 border border-white/5 text-center">
            <p className="text-white/60">No reports found matching your filters.</p>
            <button
              onClick={() => {
                setQuery("");
                setDateFrom("");
                setDateTo("");
                setCategoryFilter("All");
              }}
              className="mt-4 text-emerald-400 hover:text-emerald-300 text-sm font-medium"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredReports.map((report) => {
              const category = getCrimeCategory(`${report.title} ${report.summary}`);
              return (
                <div key={report._id} className="group relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-emerald-900/20 transition-all duration-300 hover:-translate-y-1 flex flex-col">
                  <div className={`absolute top-0 left-0 w-1 h-full ${category.color} opacity-80`} />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                  <div className="p-6 flex flex-col h-full relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2 text-xs text-white/50">
                        <Calendar className="w-3 h-3" />
                        <span>{report.publishedAt ? new Date(report.publishedAt).toLocaleDateString() : "-"}</span>
                        <span className="w-1 h-1 rounded-full bg-white/20" />
                        <span>{report.publishedAt ? new Date(report.publishedAt).toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"}) : "-"}</span>
                      </div>
                      <span className={`${category.color} text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full flex items-center gap-1`}>
                        {category.icon}{category.label}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-white mb-3 leading-snug group-hover:text-emerald-300 transition-colors">
                      {report.title}
                    </h2>

                    <p className="text-white/70 text-sm leading-relaxed mb-6 flex-grow line-clamp-3">
                      {report.summary}
                      
                    </p>

                    <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
                      <a href={report.link} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors">
                        Read Full Report <ExternalLink className="w-4 h-4" />
                      </a>
                      <button className="text-white/40 hover:text-white transition-colors"><Siren className="w-5 h-5" /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
