import React, { useState, useEffect } from "react";
import { ChevronDown, Trash2, Check, Copy, Download, Plus, X } from "lucide-react";

export const PREDEFINED_EMIRATE_FACILITIES: Record<string, string[]> = {
  "ajman": [
    "Al Hamidiyah Health Center",
    "Public Health Center",
    "Dental Health Center",
    "Mushairif Health Center",
    "Maple Clinic",
    "Ajman Medical Store",
    "Ajman DTC",
    "Al Rashidiya Clinic"
  ],
  "dubai": [
    "Al Kuwait Hospital (Dubai)",
    "Hor Al Anz Health Center",
    "Smart Salem Medical Fitness Centre",
    "DTC Rashidiya",
    "ENOC Salem",
    "Erada Center",
    "Silicon Oasis Health Center",
    "Family Health Promotion Center",
    "Blood Transfusion Center"
  ],
  "sharjah": [
    "Al Kuwait Hospital (Sharjah)",
    "Khorfakkan Hospital",
    "Malaria Unit"
  ],
  "umm al quwain": [
    "Umm Al Quwain Hospital",
    "Al Khazan Health Center",
    "Falaj Al Mualla Health Center",
    "Al Rafa Health Center"
  ],
  "ras al khaimah": [
    "Abdullah Bin Omran Hospital",
    "Saqr Hospital",
    "Shaam Hospital"
  ],
  "fujairah": [
    "Fujairah Hospital",
    "Fujairah Medical Store"
  ],
  "al dhaid": [
    "Al Kuwait Hospital (Sharjah)",
    "Khorfakkan Hospital"
  ]
};

interface QuickLinkClinicProps {
  onSelectClinic: (clinicName: string) => void;
  selectedClinicName?: string;
}

export default function QuickLinkClinic({ onSelectClinic, selectedClinicName }: QuickLinkClinicProps) {
  const [showCustomClinicInput, setShowCustomClinicInput] = useState(false);
  const [newClinicName, setNewClinicName] = useState("");
  const [newClinicEmirate, setNewClinicEmirate] = useState("Dubai");
  const [quickLinkEmirateFilter, setQuickLinkEmirateFilter] = useState("All");
  const [isQuickLinkOpen, setIsQuickLinkOpen] = useState(false);
  const [deletedFacilities, setDeletedFacilities] = useState<string[]>(() => {
    try {
      const cache = localStorage.getItem("ALW_DELETED_FACILITIES");
      return cache ? JSON.parse(cache) : [];
    } catch (e) { return []; }
  });

  useEffect(() => {
    localStorage.setItem("ALW_DELETED_FACILITIES", JSON.stringify(deletedFacilities));
  }, [deletedFacilities]);

  const handleDeleteFacility = (e: React.MouseEvent, facName: string) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${facName}" from the list?`)) {
      setDeletedFacilities(prev => [...prev, facName]);
    }
  };

  return (
    <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 text-slate-100 font-sans space-y-4">
      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
        <div className="flex justify-between items-center mb-2 gap-2">
          <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">
            Quick Link Clinic:
          </span>
          <button
            type="button"
            onClick={() => setShowCustomClinicInput(!showCustomClinicInput)}
            className="text-[9px] font-black text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-2 py-1 rounded cursor-pointer border border-emerald-500/20 flex items-center gap-1"
          >
            ＋ ADD NEW
          </button>
        </div>

        <div className="mb-2">
          <select
            value={quickLinkEmirateFilter}
            onChange={(e) => setQuickLinkEmirateFilter(e.target.value)}
            className="w-full text-xs font-bold px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 cursor-pointer focus:outline-none focus:border-emerald-500"
          >
            <option value="All">All Emirates</option>
            {["Dubai", "Sharjah", "Ajman", "Umm Al Quwain", "Ras Al Khaimah", "Fujairah", "Abu Dhabi"].map(em => (
              <option key={em} value={em}>{em}</option>
            ))}
          </select>
        </div>

        {showCustomClinicInput && (
          <div className="mb-3 p-2 bg-slate-905 border border-slate-850 rounded-lg space-y-2">
            <input
              type="text"
              placeholder="Clinic name..."
              className="w-full text-xs font-bold px-2 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-emerald-400"
              value={newClinicName}
              onChange={(e) => setNewClinicName(e.target.value)}
            />
            <div className="flex gap-2">
              <select
                className="flex-1 text-xs font-bold px-2 py-1.5 bg-slate-950 border border-slate-700 rounded text-slate-200 cursor-pointer"
                value={newClinicEmirate}
                onChange={(e) => setNewClinicEmirate(e.target.value)}
              >
                {["Dubai", "Sharjah", "Ajman", "Umm Al Quwain", "Ras Al Khaimah", "Fujairah", "Abu Dhabi"].map(em => (
                  <option key={em} value={em}>{em}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  if (!newClinicName.trim()) return;
                  try {
                    const cached = localStorage.getItem("ALW_CUSTOM_EMIRATE_FACILITIES");
                    const parsed = cached ? JSON.parse(cached) : {};
                    const emLower = newClinicEmirate.toLowerCase();
                    if (!parsed[emLower]) parsed[emLower] = [];
                    if (!parsed[emLower].includes(newClinicName.trim())) {
                      parsed[emLower].push(newClinicName.trim());
                      localStorage.setItem("ALW_CUSTOM_EMIRATE_FACILITIES", JSON.stringify(parsed));
                    }
                    onSelectClinic(newClinicName.trim());
                    setNewClinicName("");
                    setShowCustomClinicInput(false);
                  } catch (e) {}
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-3 py-1.5 rounded"
              >
                SAVE
              </button>
            </div>
          </div>
        )}

        <div className="relative mt-1">
          <button
            type="button"
            onClick={() => setIsQuickLinkOpen(!isQuickLinkOpen)}
            className="w-full flex justify-between items-center text-xs font-bold px-2.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 cursor-pointer"
          >
            <span className="truncate">
              {selectedClinicName || "-- Select Predefined --"}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isQuickLinkOpen && (
            <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
              <div className="p-1.5 space-y-1.5">
                {(() => {
                  const grouped: Record<string, string[]> = {};
                  const addFacility = (state: string, name: string) => {
                    if (!name) return;
                    if (deletedFacilities.includes(name.trim())) return;
                    const normalizedState = state.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
                    if (!grouped[normalizedState]) grouped[normalizedState] = [];
                    if (!grouped[normalizedState].includes(name)) grouped[normalizedState].push(name);
                  };

                  Object.entries(PREDEFINED_EMIRATE_FACILITIES).forEach(([em, facilities]) => {
                    facilities.forEach(fac => addFacility(em, fac));
                  });

                  try {
                    const customCache = localStorage.getItem("ALW_CUSTOM_EMIRATE_FACILITIES");
                    if (customCache) {
                      const parsed = JSON.parse(customCache);
                      Object.entries(parsed).forEach(([em, facilities]) => {
                        if (Array.isArray(facilities)) {
                          facilities.forEach(fac => addFacility(em, fac));
                        }
                      });
                    }
                  } catch (e) {}

                  let groups = Object.keys(grouped).sort();
                  if (quickLinkEmirateFilter !== "All") {
                    groups = groups.filter(g => g.toLowerCase() === quickLinkEmirateFilter.toLowerCase());
                  }

                  return groups.map(state => (
                    <div key={state} className="space-y-0.5">
                      <div className="px-2 py-1 text-[9px] font-black text-slate-400 bg-slate-800/40 rounded uppercase font-mono">
                        {state}
                      </div>
                      {grouped[state].map(fac => (
                        <div
                          key={fac}
                          className="group flex justify-between items-center px-2 py-1.5 text-xs font-bold text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-400 cursor-pointer rounded-lg"
                          onClick={() => {
                            onSelectClinic(fac);
                            setIsQuickLinkOpen(false);
                          }}
                        >
                          <span className="truncate pr-2">{fac}</span>
                        </div>
                      ))}
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}