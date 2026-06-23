import { useState, useEffect } from "react";
import html2pdf from "html2pdf.js";
import { 
  Search, 
  MapPin, 
  ClipboardCopy, 
  Check, 
  AlertCircle, 
  FileSpreadsheet, 
  Maximize2, 
  Trash2, 
  PlusSquare, 
  Sparkles, 
  Info,
  Calendar,
  Layers,
  CheckCircle,
  HelpCircle,
  X,
  PlusCircle,
  Eye,
  Activity,
  User,
  FlaskConical,
  CreditCard,
  Download,
  FileCheck
} from "lucide-react";
import { ReportItem, STANDARD_FACILITIES } from "../types";
import { getStoreValue, saveStoreValue } from "../firestoreService";

const EMIRATE_MAPPING_FACILITIES: Record<string, string[]> = {
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

const formatFacilityType = (type: string, lang: "en" | "ar" | "bn") => {
  if (!type) return "";
  if (type === "Completed") {
    return lang === "bn" ? "কমপ্লিট" : "Completed";
  }
  if (type === "Partially Completed" || type === "In Progress") {
    return lang === "bn" ? "অর্ধেক করা হয়েছে" : "Partially Completed";
  }
  if (type === "Incomplete" || type === "Not Started") {
    return lang === "bn" ? "কমপ্লিট হয়নি" : "Incomplete";
  }
  return type;
};

interface ClientDirectoryProps {
  onSelectClientToPrefill: (client: any) => void;
  language: "en" | "ar" | "bn";
  reports: ReportItem[];
  onUpdateReports: (newReports: ReportItem[]) => void;
}


export const generateReportHTML = (report: any, language: string) => {
    const slNo = report.id.split('-')[1] || "0229";

    const serviceCategories = ["Basic", "Follow Up", "Call Back", "Replenishing", "Free", "Sample"];
    const treatmentScopes = ["GPC", "FICP", "RCP", "TCP", "BCP", "SCP"];
    const appMethods = ["Spraying", "Trapping", "Dusting", "Baiting", "Repellents", "IGR's"];
    const treatMethods = ["Space Treatment", "Spot Treatment", "Cracks/Crevices", "Band Treatment"];
    const efficacyRatings = ["Residual Treatment", "Knockdown Treatment"];

    const isFreeBilling = !report.billing?.amount || 
                         report.billing?.amount === 0 || 
                         String(report.billing?.amount).toLowerCase().trim() === "no charge" ||
                         String(report.billing?.amount).trim() === "" ||
                         String(report.billing?.amount).trim() === "No";

    let facilityNameStr = "Service Report";
    if (report.facilityName) {
        if (typeof report.facilityName === 'object') {
            facilityNameStr = report.facilityName.name || report.facilityName.facilityName || report.facilityName.label || "Service Report";
        } else {
            facilityNameStr = report.facilityName;
        }
    }

    const htmlContent = `<!DOCTYPE html>
<html lang="${language}">
<head>
    <meta charset="UTF-8">
    <title>${facilityNameStr}</title>
    <style>
        * { box-sizing: border-box; }
        @media print {
            @page { size: portrait; margin: 0; }
            * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            body { margin: 0 !important; padding: 0 !important; background: transparent !important; }
            .report-wrapper {
                margin: 0 !important;
                padding: 30px !important;
                width: 100% !important;
                max-width: 100% !important;
                box-shadow: none !important;
                border: none !important;
            }
        }
        .report-wrapper {
            font-family: Arial, sans-serif;
            color: #0f172a;
            background-color: #FFFDF3;
            line-height: 1.4;
            font-size: 11px;
            width: 816px;
            min-height: 1344px;
            position: relative;
            margin: 0 auto;
            border: 1px solid black;
            box-shadow: 0 10px 30px rgba(0,0,0,0.8);
            padding: 30px; 
        }
        @media print {
            @page { size: a4 portrait; margin: 0 5mm; }
            .report-wrapper {
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                background: #FFFDF3; 
                -webkit-print-color-adjust: exact; 
                print-color-adjust: exact; 
                box-shadow: none;
                border: none;
            }
        }
        .header-box {
            border: 1px solid #0f172a;
            padding: 12px;
            margin-bottom: 12px;
            background-color: #ffffff;
        }
        .header-grid {
            display: table;
            width: 100%;
        }
        .header-col {
            display: table-cell;
            vertical-align: middle;
        }
        .star-block {
            text-align: center;
        }
        .star-symbol {
            color: #ed1c24;
            font-size: 32px;
            font-weight: bold;
            display: inline-block;
            vertical-align: middle;
            margin-right: 8px;
        }
        .brand-text {
            display: inline-block;
            vertical-align: middle;
            text-align: left;
        }
        .brand-arabic {
            font-size: 14px;
            font-weight: 950;
            margin: 0;
            color: #020617;
        }
        .brand-en {
            font-size: 13px;
            font-weight: 950;
            color: #ed1c24;
            margin: 2px 0 0 0;
        }
        .brand-sub {
            font-size: 10px;
            font-weight: bold;
            color: #ed1c24;
            margin: 0;
        }
        .badge-div {
            margin-top: 4px;
            background-color: #0f172a;
            color: #fbbf24;
            display: inline-block;
            padding: 2px 8px;
            font-size: 8px;
            font-weight: bold;
            border-radius: 9999px;
            text-transform: uppercase;
        }
        .sl-no-box {
            font-family: monospace;
            padding: 2px 6px;
            background-color: #fef9c3;
            border: 1px solid #fca5a5;
            color: #dc2626;
            font-weight: bold;
            font-size: 11px;
            border-radius: 4px;
            display: inline-block;
        }
        .title-banner {
            background-color: #0f172a;
            color: #ffffff;
            text-align: center;
            font-size: 12px;
            font-weight: 900;
            letter-spacing: 1px;
            padding: 6px 10px;
            margin-top: 10px;
        }
        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
            border: 1px solid #0f172a;
        }
        .info-table td {
            border: 1px solid #0f172a;
            padding: 8px;
            vertical-align: top;
            width: 50%;
        }
        .field-row {
            margin-bottom: 6px;
            display: flex;
        }
        .field-label {
            font-weight: bold;
            color: #475569;
            text-transform: uppercase;
            width: 120px;
            flex-shrink: 0;
            font-size: 9.5px;
        }
        .field-value {
            font-weight: 900;
            color: #020617;
            text-transform: uppercase;
            font-size: 11px;
        }
        .section-box {
            border: 1px solid #1e293b;
            margin-top: 12px;
            background-color: #ffffff;
            padding: 12px;
            page-break-inside: avoid;
            break-inside: avoid;
        }
        .section-header {
            color: #0f172a;
            font-size: 10px;
            font-weight: 900;
            padding: 0 0 4px 0;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 1px dashed #cbd5e1;
        }
        .section-body {
            padding: 0;
        }
        .checkbox-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 6px;
        }
        .checkbox-item {
            display: flex;
            align-items: center;
            font-size: 10px;
            font-weight: bold;
            color: #1e293b;
        }
        .checkbox-box {
            width: 14px;
            height: 14px;
            border: 1px solid #0f172a;
            border-radius: 2px;
            margin-right: 6px;
            display: inline-block;
            text-align: center;
            line-height: 12px;
            font-weight: bold;
            font-size: 11px;
            background: #ffffff;
            flex-shrink: 0;
        }
        .text-area-box {
            border: 1px solid #cbd5e1;
            border-radius: 4px;
            padding: 10px;
            font-family: inherit;
            font-size: 10px;
            font-weight: bold;
            white-space: pre-wrap;
            color: #1e293b;
            min-height: 50px;
            line-height: 1.4;
            background: #ffffff;
        }
        .grid-three {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 0;
            margin-top: 12px;
            border: 1px solid #1e293b;
        }
        .grid-three > div {
            border-right: 1px solid #1e293b;
            padding: 12px;
            margin-top: 0 !important;
            border-top: none;
            border-bottom: none;
            border-left: none;
        }
        .grid-three > div:last-child {
            border-right: none;
            border-radius: 0;
        }
        .pest-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
        }
        .pest-table th, .pest-table td {
            border: 1px solid #1e293b;
            padding: 6px 8px;
        }
        .pest-table th {
            background-color: #0f172a;
            color: #ffffff;
            font-size: 8.5px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .chemical-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
            page-break-inside: avoid;
            break-inside: avoid;
        }
        .chemical-table tr {
            page-break-inside: avoid;
            break-inside: avoid;
        }
        .chemical-table th, .chemical-table td {
            border: 1px solid #1e293b;
            padding: 6px 8px;
        }
        .chemical-table th {
            background-color: #0f172a;
            color: #ffffff;
            font-size: 8.5px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .billing-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
        }
        .billing-item {
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            padding: 8px;
            border-radius: 4px;
        }
        .billing-label {
            font-size: 8px;
            color: #64748b;
            font-weight: bold;
            text-transform: uppercase;
        }
        .billing-value {
            font-size: 11px;
            font-weight: bold;
            color: #1e293b;
            font-family: monospace;
            margin-top: 3px;
        }
        .signature-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-top: 12px;
        }
        .sig-container {
            border: 1px dashed #cbd5e1;
            padding: 8px;
            text-align: center;
            border-radius: 6px;
            background: #ffffff;
        }
        .sig-img {
            max-height: 50px;
            object-fit: contain;
            display: inline-block;
        }
        .sig-placeholder {
            height: 50px;
            line-height: 50px;
            color: #94a3b8;
            font-style: italic;
            font-size: 9px;
        }
        .letterhead-footer {
            border-top: 1px solid #cbd5e1;
            margin-top: 20px;
            padding-top: 10px;
            text-align: center;
            font-size: 8.5px;
            font-family: serif;
            font-weight: bold;
            color: #64748b;
            line-height: 1.4;
        }
        .condition-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 6px 0;
            border-bottom: 1px dashed #e2e8f0;
        }
        .condition-row:last-child {
            border-bottom: none;
        }
        @media print {
            @page { size: a4 portrait; margin: 0 5mm; }
            html, body {
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                background: #FFFDF3; 
                -webkit-print-color-adjust: exact; 
                print-color-adjust: exact; 
            }
            .container { 
                margin: 0 !important; 
                padding: 15px !important; 
                border: 2px solid #000 !important;
                box-shadow: none !important; 
                width: 100% !important; 
                max-width: 100% !important;
                min-height: auto !important;
                box-decoration-break: clone;
                -webkit-box-decoration-break: clone;
                box-sizing: border-box !important;
            }
        }
    </style>
</head>
<body>
    <div class="report-wrapper">
        <table style="width: 100%; border: none; padding: 0; margin: 0; border-spacing: 0;">
            <thead style="display: table-header-group;">
                <tr>
                    <td style="padding: 0; border: none;">
                        <!-- HEADER BLOCK -->
                        <div class="header-box">
                            <div class="header-grid">
                                <div class="header-col" style="width: 30%; text-align: left;">
                                    <div style="font-size: 9.5px; font-weight: bold; color: #475569;">
                                        SL. No: <div class="sl-no-box">${slNo}</div>
                                    </div>
                                    <div style="font-size: 9.5px; font-weight: bold; color: #475569; margin-top: 6px;">
                                        Date: <span style="font-family: monospace; font-weight: bold; color: #020617;">${report.dateOfOperation}</span>
                                    </div>
                                    <div style="font-size: 9.5px; font-weight: bold; color: #475569; margin-top: 3px;">
                                        Contract: <span style="font-weight: bold; color: #020617;">${report.contractNo || 'Optional'}</span>
                                    </div>
                                </div>
                                
                                <div class="header-col star-block" style="width: 50%;">
                                    <span class="star-symbol">★</span>
                                    <div class="brand-text">
                                        <h4 class="brand-arabic">نجمة الوفاء</h4>
                                        <h3 class="brand-en">AL WAFA STAR</h3>
                                        <p class="brand-sub">Pest Control Services</p>
                                        <div class="badge-div">Pest Control Division</div>
                                    </div>
                                </div>
                                
                                <div class="header-col" style="width: 20%;"></div>
                            </div>
                            
                            <div class="title-banner">TREATMENT REPORT</div>
                        </div>
                    </td>
                </tr>
            </thead>
            <tbody style="display: table-row-group;">
                <tr>
                    <td style="padding: 0; border: none;">
                        <!-- CLIENT & DETAILS BLOCK -->
                        <div class="grid-three" style="grid-template-columns: 1fr 1fr; margin-top: 12px; margin-bottom: 12px;">
            <div class="section-box">
                <div class="field-row">
                    <span class="field-label">Client Name:</span>
                    <span class="field-value">${facilityNameStr}</span>
                </div>
                <div class="field-row">
                    <span class="field-label">Contact No:</span>
                    <span class="field-value">${report.mobile || 'Optional'}</span>
                </div>
                <div class="field-row">
                    <span class="field-label">Time Start:</span>
                    <span class="field-value">${report.startTime || 'N/A'}</span>
                </div>
            </div>
            <div class="section-box">
                <div class="field-row">
                    <span class="field-label">Address:</span>
                    <span class="field-value">${report.address || report.emirate || 'N/A'}</span>
                </div>
                <div class="field-row">
                    <span class="field-label">Email (Opt):</span>
                    <span class="field-value" style="text-transform: none;">${report.email || 'Optional'}</span>
                </div>
                <div class="field-row">
                    <span class="field-label">Time End:</span>
                    <span class="field-value">${report.endTime || 'N/A'}</span>
                </div>
            </div>
        </div>

        <!-- CHECKLISTS & SCOPE GRID -->
        <div class="grid-three" style="grid-template-columns: 1fr 1fr; margin-top: 12px;">
            <!-- Service Checklists -->
            <div class="section-box">
                <div class="section-header">Service Checklists:</div>
                <div class="section-body">
                    <div class="checkbox-grid" style="grid-template-columns: repeat(2, 1fr);">
                        ${serviceCategories.map(item => {
                            const isChecked = report.categories?.some(c => c && typeof c === "string" && c.toLowerCase() === item.toLowerCase()) || 
                                              report.methods?.some(m => m && typeof m === "string" && m.toLowerCase() === item.toLowerCase());
                            return `<div class="checkbox-item">
                                <span class="checkbox-box">${isChecked ? '✔' : ''}</span>
                                <span>${item}</span>
                            </div>`;
                        }).join('')}
                    </div>
                </div>
            </div>

            <!-- Treatment Scope -->
            <div class="section-box">
                <div class="section-header">Treatment Scope (ABBR):</div>
                <div class="section-body">
                    <div class="checkbox-grid" style="grid-template-columns: repeat(2, 1fr);">
                        ${treatmentScopes.map(item => {
                            const isChecked = report.categories?.some(c => {
                              if (!c || typeof c !== "string") return false;
                              const lc = c.toLowerCase();
                              return lc === item.toLowerCase() || lc === `${item.toLowerCase()} treatment` || lc.startsWith(item.toLowerCase() + " ");
                            });
                            return `<div class="checkbox-item">
                                <span class="checkbox-box">${isChecked ? '✔' : ''}</span>
                                <span>${item}</span>
                            </div>`;
                        }).join('')}
                    </div>
                </div>
            </div>
        </div>

        <!-- COVERED AREAS -->
        <div class="section-box">
            <div class="section-header">Covered Area Details & Findings:</div>
            <div class="section-body">
                <div class="text-area-box">${report.areas && report.areas.length > 0 ? report.areas.join('\n') : (language === "bn" ? "কোন বিবরণ নেই" : "No details recorded")}</div>
            </div>
        </div>

        <!-- GRID OF METHOD OF APPLICATION, TREATMENT, EFFICACY -->
        <div class="grid-three">
            <!-- Application Method -->
            <div class="section-box">
                <div class="section-header">Method of Application:</div>
                <div class="section-body">
                    <div style="font-size: 8.5px; line-height: 1.6;">
                        ${appMethods.map(item => {
                            const isChecked = report.methods?.some(m => m && typeof m === "string" && m.toLowerCase() === item.toLowerCase());
                            return `<div style="display:flex; align-items:center; margin-bottom: 2px;">
                                <span class="checkbox-box" style="width:11px; height:11px; line-height:9px; font-size:8px; margin-right:3px;">${isChecked ? '✔' : ''}</span>
                                <span style="font-weight:bold;">${item}</span>
                            </div>`;
                        }).join('')}
                    </div>
                </div>
            </div>

            <!-- Treatment Method -->
            <div class="section-box">
                <div class="section-header">Method of Treatment:</div>
                <div class="section-body">
                    <div style="font-size: 8.5px; line-height: 1.6;">
                        ${treatMethods.map(item => {
                            const isChecked = report.methods?.some(m => m && typeof m === "string" && m.toLowerCase() === item.toLowerCase());
                            return `<div style="display:flex; align-items:center; margin-bottom: 2px;">
                                <span class="checkbox-box" style="width:11px; height:11px; line-height:9px; font-size:8px; margin-right:3px;">${isChecked ? '✔' : ''}</span>
                                <span style="font-weight:bold;">${item}</span>
                            </div>`;
                        }).join('')}
                    </div>
                </div>
            </div>

            <!-- Efficacy Rating -->
            <div class="section-box">
                <div class="section-header">Effectiveness / Efficacy:</div>
                <div class="section-body">
                    <div style="font-size: 8.5px; line-height: 1.8;">
                        ${efficacyRatings.map(item => {
                            const isChecked = report.methods?.some(m => m && typeof m === "string" && m.toLowerCase() === item.toLowerCase());
                            return `<div style="display:flex; align-items:center; margin-bottom:4px;">
                                <span class="checkbox-box" style="width:11px; height:11px; line-height:9px; font-size:8px; margin-right:3px;">${isChecked ? '✔' : ''}</span>
                                <span style="font-weight:bold;">${item}</span>
                            </div>`;
                        }).join('')}
                    </div>
                </div>
            </div>
        </div>

        <!-- INFESTATION MONITORING TABLE -->
        <div class="section-box" style="page-break-inside: avoid; break-inside: avoid;">
            <div class="section-header">4. Infestation Monitoring Table / Detailed Incidence Matrix:</div>
            <div class="section-body">
                <table class="pest-table">
                    <thead>
                        <tr>
                            <th style="width: 35%; text-align: left;">Pest Type / Species</th>
                            <th style="width: 10%; text-align: center;">None</th>
                            <th style="width: 10%; text-align: center;">Low</th>
                            <th style="width: 10%; text-align: center;">Medium</th>
                            <th style="width: 10%; text-align: center;">High</th>
                            <th style="width: 25%; text-align: left;">Findings Location</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.keys(report.infestation || {}).length > 0 ? Object.entries(report.infestation).map(([key, level]) => {
                            const match = key.match(/^([^(]+)(?:\s*\(([^)]+)\))?/);
                            const pestName = match ? match[1].trim() : key;
                            const findingsLocation = (match && match[2]) ? match[2].trim() : "N/A";
                            const currentLevel = (String(level || "None")).trim().toLowerCase();
                            return `<tr>
                                <td style="font-weight: bold; font-size: 9px; text-transform: uppercase;">${pestName}</td>
                                <td style="text-align: center; font-weight: bold; color: #1e3a8a;">${currentLevel === 'none' ? '✔' : ''}</td>
                                <td style="text-align: center; font-weight: bold; color: #1e3a8a;">${currentLevel === 'low' ? '✔' : ''}</td>
                                <td style="text-align: center; font-weight: bold; color: #1e3a8a;">${currentLevel === 'medium' ? '✔' : ''}</td>
                                <td style="text-align: center; font-weight: bold; color: #1e3a8a;">${currentLevel === 'high' ? '✔' : ''}</td>
                                <td style="font-size: 8.5px; text-transform: uppercase;">${findingsLocation}</td>
                            </tr>`;
                        }).join('') : `
                            <tr>
                                <td colspan="6" style="text-align: center; font-style: italic; color: #64748b; padding: 10px;">
                                    ${language === "bn" ? "কোন উপদ্রব রিপোর্ট নেই" : "No infestation metrics recorded"}
                                </td>
                            </tr>
                        `}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- CHEMICAL DOSAGES TABLE -->
        <div class="section-box" style="page-break-inside: avoid; break-inside: avoid;">
            <div class="section-header">5. Chemical Dosages & Dilution Doses Registered:</div>
            <div class="section-body" style="padding: 0;">
                <table class="chemical-table">
                    <thead>
                        <tr>
                            <th style="text-align: left; width: 35%;">Chemical Name</th>
                            <th style="text-align: left; width: 20%;">Dilution Rate</th>
                            <th style="text-align: left; width: 15%;">Qty Spec</th>
                            <th style="text-align: left; width: 15%;">Batch Number</th>
                            <th style="text-align: left; width: 15%;">Expiry Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${report.chemicals && report.chemicals.length > 0 ? report.chemicals.map(chem => `
                            <tr>
                                <td style="font-weight: bold; text-transform: uppercase; font-size: 9px;">${chem.name}</td>
                                <td>${chem.dilution || 'N/A'}</td>
                                <td style="font-weight: bold;">${chem.used || '0'}</td>
                                <td>${chem.batch || 'N/A'}</td>
                                <td>${chem.expiry || 'N/A'}</td>
                            </tr>
                        `).join('') : `
                            <tr>
                                <td colspan="5" style="text-align: center; font-style: italic; color: #64748b; padding: 10px;">
                                    ${language === "bn" ? "কোন রাসায়নিক ব্যবহার করা হয়নি" : "No chemical material usage logs"}
                                </td>
                            </tr>
                        `}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- SANITARY RATINGS & CREW -->
        <div class="grid-three" style="grid-template-columns: 1fr 1fr; margin-top: 12px; margin-bottom: 12px;">
            <div class="section-box">
                <div class="section-header">Sanitation Conditions:</div>
                <div class="section-body">
                    <div class="condition-row">
                        <span style="font-weight: bold;">Sanitation Rating:</span>
                        <span style="font-weight:900; color: #10b981; text-transform: uppercase;">${report.sanitation || 'Good'}</span>
                    </div>
                    <div style="font-size: 8.5px; color: #475569; margin-top: 4px; font-family: monospace;">
                        Remarks: <b>${report.sanitationRemarks || 'None'}</b>
                    </div>
                </div>
            </div>

            <div class="section-box">
                <div class="section-header">Proofing Conditions:</div>
                <div class="section-body">
                    <div class="condition-row">
                        <span style="font-weight: bold;">Proofing Rating:</span>
                        <span style="font-weight:900; color: #10b981; text-transform: uppercase;">${report.proofing || 'Good'}</span>
                    </div>
                    <div style="font-size: 8.5px; color: #475569; margin-top: 4px; font-family: monospace;">
                        Remarks: <b>${report.proofingRemarks || 'None'}</b>
                    </div>
                </div>
            </div>
        </div>

        <!-- RECOMMENDATIONS -->
        <div class="section-box">
            <div class="section-header">6. Operational Compliance Advisories / Recommendations:</div>
            <div class="section-body">
                <ol style="margin: 0; padding-left: 14px; font-weight: bold; line-height: 1.4; color: #334155;">
                    ${report.recommendations && report.recommendations.length > 0 ? report.recommendations.map(rec => `
                        <li style="margin-bottom: 2px;">${rec}</li>
                    `).join('') : `
                        <li>Keep environmental water inlets airtight and sanitization channels active.</li>
                    `}
                </ol>
            </div>
        </div>

        <!-- BILLING INVOICE (IF APPLICABLE) -->
        ${!isFreeBilling ? `
        <div class="section-box">
            <div class="section-header">7. Billing Invoice Summary:</div>
            <div class="section-body">
                <div class="billing-grid">
                    <div class="billing-item">
                        <div class="billing-label">Invoice Serial</div>
                        <div class="billing-value">${report.billing?.invoiceNo || `PC-${report.id}`}</div>
                    </div>
                    <div class="billing-item">
                        <div class="billing-label">Subtotal</div>
                        <div class="billing-value">${report.billing?.amount || 0} AED</div>
                    </div>
                    <div class="billing-item">
                        <div class="billing-label">VAT (5%)</div>
                        <div class="billing-value">${report.billing?.vat || 0} AED</div>
                    </div>
                    <div class="billing-item" style="background:#f0fdf4; border-color:#bbf7d0;">
                        <div class="billing-label" style="color:#15803d; font-weight:900;">Total Amount</div>
                        <div class="billing-value" style="color:#166534; font-weight:900;">${report.billing?.total || 0} AED</div>
                    </div>
                </div>
            </div>
        </div>
        ` : ''}

        <!-- SIGNATURE BLOCK -->
        <div class="section-box" style="border: none;">
            <div class="signature-grid">
                <div class="sig-container">
                    <span style="font-size: 7.5px; font-weight: bold; color: #64748b; text-transform: uppercase;">Client Seal / Signature</span>
                    <div style="margin-top: 4px;">
                        ${report.signatures?.client ? `
                            <img class="sig-img" src="${report.signatures.client}" alt="Client signature"/>
                        ` : `
                            <div class="sig-placeholder">[ Clinician Representative ]</div>
                        `}
                    </div>
                    <div style="font-size: 8.5px; font-weight: bold; color: #1e293b; border-top: 1px solid #cbd5e1; margin-top: 4px; padding-top: 2px;">
                        ${report.contactPerson || 'Representative'}
                    </div>
                </div>
                
                <div class="sig-container">
                    <span style="font-size: 7.5px; font-weight: bold; color: #64748b; text-transform: uppercase;">Engineer & Technician Signature</span>
                    <div style="margin-top: 4px;">
                        ${report.signatures?.technician || report.signatures?.supervisor ? `
                            <img class="sig-img" src="${report.signatures.technician || report.signatures.supervisor}" alt="Operator signature"/>
                        ` : `
                            <div class="sig-placeholder" style="color:#0369a1; font-weight:bold;">CERTIFIED SECURITY OPERATOR</div>
                        `}
                    </div>
                    <div style="font-size: 8.5px; font-weight: bold; color: #1e293b; border-top: 1px solid #cbd5e1; margin-top: 4px; padding-top: 2px;">
                        AL WAFA Specialist
                    </div>
                </div>
            </div>
        </div>

        <!-- FOOTER LETTERHEAD -->
        <div class="letterhead-footer">
            <p style="margin: 0;">Tel: 04-2959731, Fax: 04-2959732, P.O Box: 181244, Deira, Dubai - United Arab Emirates</p>
            <p style="margin: 2px 0 0 0;">E-mail: pestcontrol@alwafagroupuae.com, wafastaruae@yahoo.com | Website: www.alwafagroupuae.com</p>
        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    </div>
</body>
</html>`;


    return htmlContent;
};



export const generateEngineeringHTML = (report: any, language: string) => {
    const amountLabel = report.serviceType || "Routine Visit";
    
    let clientNameStr = "Engineering Report";
    if (report.clientName) {
        if (typeof report.clientName === 'object') {
            clientNameStr = report.clientName.name || report.clientName.clientName || report.clientName.label || "Engineering Report";
        } else {
            clientNameStr = report.clientName;
        }
    }

    const chunkArray = <T,>(arr: T[], size: number): T[][] => {
      const result: T[][] = [];
      if (!arr) return result;
      for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
      }
      return result;
    };
    
    const isBengali = language === "bn";
    const tLang = (en: string, bn: string) => isBengali ? bn : en;

    const allReportPhotos = (report.photos || []) as { url: string; caption: string; zone?: string; videoUrl?: string; }[];
    const zonesInReport = Array.from(new Set(allReportPhotos.map(p => (p.zone || "Other") as string)));

    // Grouping photos by dynamic zones
    const photosByZone: Record<string, { url: string; caption: string; zone?: string; videoUrl?: string; }[]> = {};
    allReportPhotos.forEach(p => {
      const z = p.zone || "Other";
      if (!photosByZone[z]) photosByZone[z] = [];
      photosByZone[z].push(p);
    });

    const titleLabel = "AL WAFA STAR PEST CONTROL & FACILITY MANAGEMENT";
    const docTitle = report.reportTitle || (isBengali ? "ইঞ্জিনিয়ারিং পরিদর্শন রিপোর্ট" : "ENGINEERING INSPECTION REPORT");

    let photosHTML = "";
    zonesInReport.forEach(zone => {
      const pList = photosByZone[zone] || [];
      const chunks = chunkArray(pList, 2);
      chunks.forEach((chunk, chunkIdx) => {
        photosHTML += `
          <div class="pdf-page">
            <div class="watermark">
               <svg viewBox="0 0 100 100"><polygon points="50,5 64,36 98,36 71,57 81,91 50,70 19,91 29,57 2,36 36,36" fill="#ED1C24" /></svg>
            </div>
            <div class="header" style="background-color: #0f172a; color: #ffffff; padding: 15px 10px; text-align: center; border-bottom: 4px solid #ef1c24; border-radius: 6px; margin-bottom: 20px;">
               <h1 style="font-size: 15px; margin: 0; font-weight: 900; color: #ffffff; text-align: center; letter-spacing: 1px;">${report?.companyName?.toUpperCase() || titleLabel}</h1>
               <p style="font-size: 8px; color: #10b981; margin: 4px 0 0 0; text-align: center; text-transform: uppercase; font-weight: bold; letter-spacing: 1px;">Dubai Civil Defense Approved • Special Operations Division</p>
            </div>
            <div class="section-title">${zone.toUpperCase()} &mdash; PHOTOS (Page ${chunkIdx + 1})</div>
            <div class="photo-grid">
              ${chunk.map(photo => `
                <div class="photo-card" style="page-break-inside: avoid; break-inside: avoid;">
                  ${photo.videoUrl ? `<a href="${photo.videoUrl}" download="inspection-video.webm" target="_blank" style="text-decoration: none; color: inherit; display: block;" title="Click to view/download video">` : ''}
                  <div class="photo-wrapper" style="position: relative;">
                    <img src="${photo.url}" alt="${photo.caption || 'Inspection photo'}">
                    ${photo.videoUrl ? `<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:24px;background:rgba(0,0,0,0.6);color:white;border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;border:2px solid rgba(255,255,255,0.3);">▶</div><div style="position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,0.7);color:white;font-size:8px;padding:4px;text-align:center;">VIDEO (CLICK TO OPEN)</div>` : ''}
                  </div>
                  <div class="photo-caption">${photo.caption || 'Observation view'}${photo.videoUrl ? ' [VIDEO ATTACHED]' : ''}</div>
                  ${photo.videoUrl ? `</a>` : ''}
                </div>
              `).join("")}
            </div>
          </div>
        `;
      });
    });

    // Handle recommendations if photos exist
    const recommendationPhotos = (report.recommendationPhotos || []) as { url: string; caption: string; zone?: string; videoUrl?: string; }[];
    const recZonesInReport = Array.from(new Set(recommendationPhotos.map(p => (p.zone || "Other") as string)));
    const recPhotosByZone: Record<string, { url: string; caption: string; zone?: string; videoUrl?: string; }[]> = {};
    recommendationPhotos.forEach(p => {
      const z = p.zone || "Other";
      if (!recPhotosByZone[z]) recPhotosByZone[z] = [];
      recPhotosByZone[z].push(p);
    });

    let recPhotosHTML = "";
    recZonesInReport.forEach(zone => {
      const pList = recPhotosByZone[zone] || [];
      const chunks = chunkArray(pList, 2);
      chunks.forEach((chunk, chunkIdx) => {
        recPhotosHTML += `
          <div class="pdf-page">
            <div class="watermark">
               <svg viewBox="0 0 100 100"><polygon points="50,5 64,36 98,36 71,57 81,91 50,70 19,91 29,57 2,36 36,36" fill="#ED1C24" /></svg>
            </div>
            <div class="header" style="background-color: #0f172a; color: #ffffff; padding: 15px 10px; text-align: center; border-bottom: 4px solid #ef1c24; border-radius: 6px; margin-bottom: 20px;">
               <h1 style="font-size: 15px; margin: 0; font-weight: 900; color: #ffffff; text-align: center; letter-spacing: 1px;">${report?.companyName?.toUpperCase() || titleLabel}</h1>
               <p style="font-size: 8px; color: #10b981; margin: 4px 0 0 0; text-align: center; text-transform: uppercase; font-weight: bold; letter-spacing: 1px;">Dubai Civil Defense Approved • Special Operations Division</p>
            </div>
            <div class="section-title">${isBengali ? "সংশোধন চিত্র" : "REFORMATION VISUALS"} &mdash; ${zone.toUpperCase()} (Page ${chunkIdx + 1})</div>
            <div class="photo-grid">
              ${chunk.map(photo => `
                <div class="photo-card" style="page-break-inside: avoid; break-inside: avoid;">
                  ${photo.videoUrl ? `<a href="${photo.videoUrl}" download="inspection-video.webm" target="_blank" style="text-decoration: none; color: inherit; display: block;" title="Click to view/download video">` : ''}
                  <div class="photo-wrapper" style="position: relative;">
                    <img src="${photo.url}" alt="${photo.caption || 'Reform photo'}">
                    ${photo.videoUrl ? `<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:24px;background:rgba(0,0,0,0.6);color:white;border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;border:2px solid rgba(255,255,255,0.35);">▶</div><div style="position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,0.7);color:white;font-size:8px;padding:4px;text-align:center;">VIDEO (CLICK TO OPEN)</div>` : ''}
                  </div>
                  <div class="photo-caption">${photo.caption || 'Proposed reformation view'}${photo.videoUrl ? ' [VIDEO ATTACHED]' : ''}</div>
                  ${photo.videoUrl ? `</a>` : ''}
                </div>
              `).join("")}
            </div>
          </div>
        `;
      });
    });

    const htmlContent = `<!DOCTYPE html>
<html lang="${language}">
<head>
    <meta charset="UTF-8">
    <title>${clientNameStr}</title>
    <style>
        * {
            box-sizing: border-box;
        }
        .engineering-report-wrapper {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #1e293b;
            background-color: transparent;
            line-height: 1.5;
            margin: 0;
            padding: 0;
        }
        .pdf-page {
            box-sizing: border-box;
            width: 794px; /* exact A4 width at 96 DPI */
            height: 1122px; /* exact A4 height at 96 DPI */
            padding: 40px;
            background: #ffffff;
            position: relative;
            margin: 0 auto 30px auto;
            border: 1px solid #1f1f1f;
            box-shadow: 0 10px 30px rgba(0,0,0,0.8);
            page-break-after: always;
            break-after: page;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }
        .pdf-page-flow {
            box-sizing: border-box;
            width: 794px; /* exact A4 width at 96 DPI */
            min-height: 1122px; /* standard A4 minimum height but free to expand dynamic text contents */
            padding: 40px;
            background: #ffffff;
            position: relative;
            margin: 0 auto 30px auto;
            border: 1px solid #1f1f1f;
            box-shadow: 0 10px 30px rgba(0,0,0,0.8);
            border-bottom: 1px dashed #cbd5e1;
            page-break-after: always;
            break-after: page;
        }
        /* Prevent extra blank trailing page at the end of the PDF */
        .pdf-page:last-of-type,
        .pdf-page-flow:last-of-type,
        .pdf-page:last-child,
        .pdf-page-flow:last-child,
        body > *:last-child {
            margin-bottom: 0 !important;
            border-bottom: none !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
        }
        .text-area-box {
            font-size: 11px;
            color: #334155;
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 10px;
            margin-bottom: 12px;
            white-space: pre-wrap;
            line-height: 1.6;
        }
        @media print {
            @page { size: a4 portrait; margin: 0; }
            .engineering-report-wrapper {
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                background: transparent !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            .pdf-page, .pdf-page-flow {
                margin: 0 !important;
                border: none !important;
                box-shadow: none !important;
                width: 100% !important;
                max-width: 100% !important;
            }
        }
    </style>
</head>
<body>
    <div class="engineering-report-wrapper">
        <!-- MAIN EXECUTIVE REPORT DIRECTORY FLOW -->
    <div class="pdf-page-flow">
        <div class="watermark">
            <svg viewBox="0 0 100 100">
               <polygon points="50,5 64,36 98,36 71,57 81,91 50,70 19,91 29,57 2,36 36,36" fill="#ED1C24" />
            </svg>
        </div>
        <div class="header" style="display: flex; flex-direction: column; align-items: center; justify-content: center; margin-bottom: 25px; padding-bottom: 12px; border-bottom: none;">
            <div style="display: flex; align-items: center; width: 100%; gap: 15px;">
                <div style="flex-shrink: 0; line-height: 0;">
                    <svg viewBox="0 0 100 100" style="width: 58px; height: 58px; display: block;">
                        <polygon points="50,5 64,36 98,36 71,57 81,91 50,70 19,91 29,57 2,36 36,36" fill="#ED1C24" stroke="#000000" stroke-width="4.5" />
                    </svg>
                </div>
                <div style="flex-grow: 1; display: flex; flex-direction: column; justify-content: center;">
                    <div style="font-size: 21px; font-weight: 800; color: #000000; font-family: Georgia, 'Times New Roman', serif; text-align: left; line-height: 1.2;">نجمة الوفاء لخدمات التنظيف والحراسة</div>
                    <div style="display: flex; align-items: baseline; gap: 8px; margin-top: 4px; line-height: 1;">
                        <span style="font-size: 22px; font-weight: 950; color: #000000; font-family: Arial, sans-serif; letter-spacing: -0.5px;">AL WAFA STAR</span>
                        <span style="font-size: 13px; font-weight: bold; color: #000000; font-family: Arial, sans-serif;">Cleaning & Security Services</span>
                    </div>
                </div>
            </div>
            <div style="width: 100%; margin-top: 8px; line-height: 0;">
                <div style="height: 2px; background-color: #000000; width: 100%;"></div>
                <div style="height: 1.5px; background-color: #ffffff; width: 100%;"></div>
                <div style="height: 1.5px; background-color: #ED1C24; width: 100%;"></div>
            </div>
        </div>
        <div class="content">
            <h2 class="main-title">${docTitle}</h2>
            
            <div class="section-title">ADMINISTRATIVE SUMMARY OF INSPECTION DIRECTORY</div>
            <div class="grid-two">
                <div class="info-block">
                    <div class="label">${tLang("REPORT NO", "রিপোর্ট নাম্বার")}</div>
                    <div class="value" style="color: #ef1c24;">${report.reportNo}</div>
                </div>
                <div class="info-block">
                    <div class="label">${tLang("DATE", "তারিখ")}</div>
                    <div class="value">${report.date}</div>
                </div>
                <div class="info-block" style="grid-column: span 2;">
                    <div class="label">${tLang("CLIENT NAME", "গ্রাহকের নাম")}</div>
                    <div class="value" style="font-size: 12px; text-transform: uppercase;">${clientNameStr}</div>
                </div>
                <div class="info-block">
                    <div class="label">${tLang("EMIRATE / LOCATION", "আমিরাত স্থান")}</div>
                    <div class="value">${report.emirate}</div>
                </div>
                <div class="info-block">
                    <div class="label">${tLang("INSPECTING ENGINEER", "প্রকৌশলী নাম")}</div>
                    <div class="value" style="text-transform: uppercase;">ENGINEER ${report.engineerName}</div>
                </div>
                <div class="info-block" style="grid-column: span 2;">
                    <div class="label">${tLang("VISIT SERVICE TYPE", "পরিসেবা প্রকার")}</div>
                    <div class="value" style="color: #10b981;">${amountLabel}</div>
                </div>
                ${report.visitLocation ? `
                <div class="info-block" style="grid-column: span 2;">
                    <div class="label">${tLang("LOCATION DETAILS", "লোকেশন ডিটেইলস")}</div>
                    <div class="value" style="font-size: 10px; text-transform: uppercase; font-weight: normal;">${report.visitLocation}</div>
                </div>
                ` : ""}
                ${(report.purposeOfVisitText || report.purposeOfVisitLabel) && report.includePurposeInOutput !== false ? `
                <div class="info-block" style="grid-column: span 2;">
                    <div class="label">${report.purposeOfVisitLabel || tLang("PURPOSE OF VISITS", "পরিদর্শনের উদ্দেশ্য")}</div>
                    <div class="value" style="font-size: 10px; text-transform: uppercase; font-weight: normal; color: #6366f1;">${report.purposeOfVisitText || ""}</div>
                </div>
                ` : ""}
            </div>

            <div class="section-title">🔍 ${tLang("INSPECTION FINDINGS & FIELD OBSERVATIONS", "১. পরিদর্শন ও তদন্তের বিবরণ")}</div>
            <div class="text-area-box">${report.workDetails}</div>

            ${report.operationalLogs ? `
              <div class="section-title">📋 ${tLang("OPERATIONAL SUMMARY LOGS", "২. অপারেশনাল বিবরণী")}</div>
              <div class="text-area-box">${report.operationalLogs}</div>
            ` : ""}

            ${report.zoneComments && Object.entries(report.zoneComments).some(([_, val]) => typeof val === "string" && val.trim()) ? `
              <div class="section-title">📍 ${tLang("Area-Specific Special Observations", "জোন ভিত্তিক বিশেষ পর্যবেক্ষণসমূহ")}</div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
                ${Object.entries(report.zoneComments).map(([zoneId, comment]) => {
                  if (!comment || typeof comment !== "string" || !comment.trim()) return "";
                  const catName = (zoneId === "Kitchen" ? (isBengali ? "রান্নাঘর" : "KITCHEN") : 
                                       zoneId === "Drains" ? (isBengali ? "ড্রেন/নর্দমা" : "DRAINS/SEWERS") : 
                                       zoneId === "Garbage" ? (isBengali ? "ময়লার স্থান" : "GARBAGE/BINS") : 
                                       zoneId === "Storage" ? (isBengali ? "স্টোরেজ/গোডাউন" : "STORAGE/WAREHOUSE") : 
                                       zoneId.toUpperCase());
                  return `
                    <div style="background: #f8fafc; padding: 8px 10px; border-radius: 6px; border: 1px solid #e2e8f0;">
                      <div style="font-size: 8px; color: #1e3a8a; font-weight: bold; margin-bottom: 4px;">📍 ${catName}</div>
                      <div style="font-size: 10px; font-weight: 600; color: #334155; font-style: italic;">"${comment}"</div>
                    </div>
                  `;
                }).join("")}
              </div>
            ` : ""}

            ${report.recommendationText ? `
              <div class="section-title">🛠️ ${tLang("SYSTEM REFORMS & TECHNICAL SOLUTIONS", "৩. সংস্কার ও সমাধান পরিকল্পনা")}</div>
              <div class="text-area-box">${report.recommendationText}</div>
            ` : ""}

            ${report.treatmentCorrectiveText && report.includeTreatmentCorrectiveInOutput !== false ? `
              <div class="section-title" style="color: #d97706;">⚠️ ${tLang("TREATMENT CORRECTIVE RECOMMENDATIONS", "সংশোধনমূলক সুপারিশ")}</div>
              <div class="text-area-box">${report.treatmentCorrectiveText}</div>
            ` : ""}
        </div>

        <div style="border-top: 1.5px solid #cbd5e1; padding-top: 20px; margin-top: 15px; margin-bottom: 10px;">
            <p style="font-size: 8px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; text-align: center; margin-bottom: 25px;">
                AUTHORIZATION SIGNATURE & COMPANY SEAL
            </p>
            <div style="display: flex; justify-content: center; text-align: center;">
                <div style="width: 50%;">
                    <div style="border-top: 1px solid #cbd5e1; width: 80%; margin: 0 auto; margin-bottom: 6px;"></div>
                    <p style="font-size: 8px; font-weight: bold; color: #64748b; text-transform: uppercase; margin: 2px 0 0 0;">In-Charge Supervising Engineer</p>
                </div>
            </div>
        </div>
        <div class="footer">
            Al Wafa Star Security & Safety Ltd • Engineering Operations Department
        </div>
    </div>

    <!-- PAGE 2: TREATMENTS, SYSTEMIC PROCEDURES & AUTHORIZATIONS -->
    <div class="pdf-page">
        <div class="watermark">
            <svg viewBox="0 0 100 100">
               <polygon points="50,5 64,36 98,36 71,57 81,91 50,70 19,91 29,57 2,36 36,36" fill="#ED1C24" />
            </svg>
        </div>
        <div class="header" style="display: flex; flex-direction: column; align-items: center; justify-content: center; margin-bottom: 25px; padding-bottom: 12px; border-bottom: none;">
            <div style="display: flex; align-items: center; width: 100%; gap: 15px;">
                <div style="flex-shrink: 0; line-height: 0;">
                    <svg viewBox="0 0 100 100" style="width: 58px; height: 58px; display: block;">
                        <polygon points="50,5 64,36 98,36 71,57 81,91 50,70 19,91 29,57 2,36 36,36" fill="#ED1C24" stroke="#000000" stroke-width="4.5" />
                    </svg>
                </div>
                <div style="flex-grow: 1; display: flex; flex-direction: column; justify-content: center;">
                    <div style="font-size: 21px; font-weight: 800; color: #000000; font-family: Georgia, 'Times New Roman', serif; text-align: left; line-height: 1.2;">نجمة الوفاء لخدمات التنظيف والحراسة</div>
                    <div style="display: flex; align-items: baseline; gap: 8px; margin-top: 4px; line-height: 1;">
                        <span style="font-size: 22px; font-weight: 950; color: #000000; font-family: Arial, sans-serif; letter-spacing: -0.5px;">AL WAFA STAR</span>
                        <span style="font-size: 13px; font-weight: bold; color: #000000; font-family: Arial, sans-serif;">Cleaning & Security Services</span>
                    </div>
                </div>
            </div>
            <div style="width: 100%; margin-top: 8px; line-height: 0;">
                <div style="height: 2px; background-color: #000000; width: 100%;"></div>
                <div style="height: 1.5px; background-color: #ffffff; width: 100%;"></div>
                <div style="height: 1.5px; background-color: #ED1C24; width: 100%;"></div>
            </div>
        </div>
        <div class="content" style="display: flex; flex-direction: column; justify-content: space-between;">
            <div style="margin-top: 15px;">
                <h3 style="font-size: 12px; font-weight: 900; color: #1e3a8a; border-bottom: 2px solid #ef1c24; padding-bottom: 4px; margin-bottom: 12px; text-transform: uppercase;">
                    4. ${tLang("Treatment Protocols Implemented", "বাস্তবায়িত ট্রিটমেন্ট প্রোটোকল সূচী")}
                </h3>
                <ul style="font-size: 11px; color: #334155; padding-left: 20px; line-height: 1.6; font-weight: 600; margin-bottom: 25px;">
                    <li style="margin-bottom: 8px;">${tLang("Spraying of approved insecticidal active chemical was conducted inside external manhole chambers, around gully traps, and exterior borders.", "ম্যানহোল চেম্বারের ভেতরে, ড্রেনগুলির মুখে এবং বহিঃসীমানায় অনুমোদিত পেস্ট কন্ট্রোল স্প্রে ছিটানো সম্পন্ন করা হয়েছে।")}</li>
                    <li style="margin-bottom: 8px;">${tLang("The formulations are approved for public health environment safety according to UAE municipal health codes.", "ব্যবহৃত ফর্মুলেশনগুলি ইউএইর পৌর স্বাস্থ্য নীতিবিধি অনুযায়ী নিরাপদ ও অনুমোদনপ্রাপ্ত ক্যাটাগরি হিসেবে প্রত্যায়يت।")}</li>
                    <li style="margin-bottom: 8px;">${tLang("Strategic bait station installations monitored and professional insecticidal gels loaded inside crawl pathways.", "উইপোকা এবং পোকামাকড়ের আনাগোনার পয়েন্টে কীটনাশক জেল এবং রড টোপ পুনরায় সচল রাখা হয়েছে।")}</li>
                </ul>
            </div>

            <div style="margin-bottom: 40px;">
                <h3 style="font-size: 12px; font-weight: 900; color: #1e3a8a; border-bottom: 2px solid #ef1c24; padding-bottom: 4px; margin-bottom: 12px; text-transform: uppercase;">
                    5. ${tLang("Monitoring & Systemic Follow-Up", "পরবর্তী তদারকি ও নিয়মিত ফলো-আপ প্ল্যান")}
                </h3>
                <p style="font-size: 11px; color: #334155; line-height: 1.6; font-weight: 600;">
                    ${tLang("It is highly recommended to perform follow-up inspectorial sweeps and chemical targeted barriers every 2 weeks to ensure newly sprouted vectors are permanently eliminated and control is thoroughly anchored.", "নতুন পোকামাকড়ের ডিম ফুটার চক্র ব্যাহত করতে প্রতি ২ সপ্তাহ অন্তর ফলো-আপ পরিদর্শনের এবং রুটিন কড়াকড়ির পরামর্শ দেয়া হলো।")}
                </p>
            </div>

            <div style="border-top: 1.5px solid #cbd5e1; padding-top: 25px; margin-top: auto; margin-bottom: 15px;">
                <p style="font-size: 8px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; text-align: center; margin-bottom: 35px;">
                    AUTHORIZATION SIGNATURE & COMPANY SEAL
                </p>
                <div style="display: flex; justify-content: center; text-align: center;">
                    <div style="width: 50%;">
                        <div style="border-top: 1px solid #cbd5e1; width: 80%; margin: 0 auto; margin-bottom: 6px;"></div>
                        <p style="font-size: 8px; font-weight: bold; color: #64748b; text-transform: uppercase; margin: 2px 0 0 0;">In-Charge Supervising Engineer</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="footer">
            Al Wafa Star Security & Safety Ltd • Engineering Operations Department
        </div>
    </div>

    <!-- IMAGES PAGES -->
    ${photosHTML}
    ${recPhotosHTML}
    </div>
</body>
</html>
`;


    return htmlContent;
};

export default function ClientDirectory({
  onSelectClientToPrefill,
  language,
  reports,
  onUpdateReports
}: ClientDirectoryProps) {
  const [search, setSearch] = useState("");
  const [selectedEmirate, setSelectedEmirate] = useState<string>("ALL");
  const [showCopiedAlert, setShowCopiedAlert] = useState<string | null>(null);
  
  // Secondary local Tab Selector: Option 1 (Locations Map Cards), Option 2 (State Ledger Spreadsheet Excel)
  const [activeSubTab, setActiveSubTab] = useState<"cards" | "excel">("excel");
  
  // Custom report preview modal before downloading
  const [previewReport, setPreviewReport] = useState<ReportItem | null>(null);

  // Multi-selection state for deleting ledger items in bulk
  const [selectedReportIds, setSelectedReportIds] = useState<string[]>([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [isDeleteSelectionMode, setIsDeleteSelectionMode] = useState(false);

  // Custom delete state to avoid iframe window.confirm blockages
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Custom facilities suggestions added dynamically by the user
  const [customFacilities, setCustomFacilities] = useState<Record<string, string[]>>(() => {
    try {
      const saved = localStorage.getItem("ALW_CUSTOM_EMIRATE_FACILITIES");
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Sync custom facilities with Firestore on load
  useEffect(() => {
    getStoreValue<Record<string, string[]>>("custom_emirate_facilities", {})
      .then((val) => {
        if (val && Object.keys(val).length > 0) {
          setCustomFacilities(val);
          localStorage.setItem("ALW_CUSTOM_EMIRATE_FACILITIES", JSON.stringify(val));
        }
      })
      .catch((err) => console.log("Failed to sync custom facilities:", err));
  }, []);

  // Track which input row has its dropdown suggestions visible
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // States for the newly requested screen-centered full-screen selection popup modal
  const [activeModalReportId, setActiveModalReportId] = useState<string | null>(null);
  const [facilitySearchQuery, setFacilitySearchQuery] = useState<string>("");

  const saveCustomFacility = (emirate: string, facilityName: string) => {
    const normEmirate = (emirate || "ajman").toLowerCase().trim();
    const trimmedName = (facilityName || "").trim();
    if (!trimmedName) return;

    const currentList = customFacilities[normEmirate] || [];
    if (!currentList.includes(trimmedName)) {
      const nextList = [...currentList, trimmedName];
      const nextObj = { ...customFacilities, [normEmirate]: nextList };
      setCustomFacilities(nextObj);
      localStorage.setItem("ALW_CUSTOM_EMIRATE_FACILITIES", JSON.stringify(nextObj));
      saveStoreValue("custom_emirate_facilities", nextObj)
        .catch((err) => console.log("Failed to sync new facility to Firestore:", err));
    }
  };

  const downloadFullReport = (report: ReportItem | any) => {
    const htmlContent = report.rawEngineeringData ? generateEngineeringHTML(report.rawEngineeringData, language) : generateReportHTML(report, language);

    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `AlWafaStar-Report-${report.id}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadFullReportPDF = async (report: ReportItem | any, customNameOverride?: string) => {
    try {
      const defaultName = `AlWafaStar-${report.facilityName ? report.facilityName.substring(0,20) : "Report"}-${report.ticketNo || report.id}`;
      let customFileName = customNameOverride;
      if (!customFileName) {
        customFileName = window.prompt(
          language === "bn" ? "ডাউনলোড ফাইলের নাম দিন:" : "Enter a file name for the PDF:",
          defaultName
        );
      }

      if (!customFileName) return;

      const htmlContent = report.rawEngineeringData ? generateEngineeringHTML(report.rawEngineeringData, language) : generateReportHTML(report, language);

      const isEngineering = !!report.rawEngineeringData;
      const layoutWidth = isEngineering ? 794 : 816;

      const overlay = document.createElement("div");
      overlay.id = "pdf-loading-overlay";
      overlay.style.position = "fixed";
      overlay.style.top = "0";
      overlay.style.left = "0";
      overlay.style.width = "100vw";
      overlay.style.height = "100vh";
      overlay.style.backgroundColor = "rgba(15, 23, 42, 0.95)";
      overlay.style.zIndex = "999999";
      overlay.style.display = "flex";
      overlay.style.flexDirection = "column";
      overlay.style.alignItems = "center";
      overlay.style.justifyContent = "center";
      overlay.style.color = "white";
      overlay.innerHTML = `
        <div style="font-size: 40px; margin-bottom: 20px;">🖨️</div>
        <div style="font-size: 18px; font-weight: bold; font-family: sans-serif;">${language === "bn" ? "PDF তৈরি হচ্ছে, অপেক্ষা করুন..." : "Preparing PDF Document..."}</div>
      `;
      document.body.appendChild(overlay);

      const container = document.createElement("div");
      container.id = "pdf-temp-container";
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.top = "-9999px";
      container.style.width = `${layoutWidth}px`;
      container.style.background = "#ffffff";
      container.innerHTML = htmlContent;
      document.body.appendChild(container);

      const targetElement = (container.querySelector(".report-wrapper") || 
                            container.querySelector(".engineering-report-wrapper") || 
                            container) as HTMLElement;

      setTimeout(async () => {
        try {
          const opt = {
            margin:       0,
            filename:     customFileName + '.pdf',
            image:        { type: 'jpeg' as const, quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true, windowWidth: layoutWidth },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
            pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
          };
          await html2pdf().set(opt).from(targetElement).save();
        } catch (err) {
          console.error("PDF generator error:", err);
        } finally {
          if (document.body.contains(overlay)) document.body.removeChild(overlay);
          if (document.body.contains(container)) document.body.removeChild(container);
        }
      }, 1000);

    } catch (err) {
      console.error(err);
      alert("Failed to create PDF view.");
      const overlay = document.getElementById("pdf-loading-overlay");
      if (overlay && document.body.contains(overlay)) document.body.removeChild(overlay);
    }
  };

  const handleBulkDownloadPDFs = async () => {
    if (selectedReportIds.length === 0) return;
    
    const confirmDownload = window.confirm(
      language === "bn" 
        ? `আপনি কি সত্যিই ${selectedReportIds.length}টি ফাইলের PDF ডাউনলোড করতে চান?`
        : `Are you sure you want to download PDFs for ${selectedReportIds.length} selected facility reports?`
    );
    if (!confirmDownload) return;

    for (let i = 0; i < selectedReportIds.length; i++) {
      const id = selectedReportIds[i];
      const report = activeExcelReports.find(r => r.id === id);
      if (report) {
        const defaultName = `AlWafaStar-${report.facilityName ? report.facilityName.substring(0,20) : "Report"}-${report.ticketNo || report.id}`;
        await downloadFullReportPDF(report, defaultName);
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    }

    setSelectedReportIds([]);
    setIsDeleteSelectionMode(false);
  };

  const getFacilitiesForEmirate = (emirate: string): string[] => {
    const list = new Set<string>();
    const emLower = (emirate || "").toLowerCase().trim();

    // 1. Predefined map
    const mapped = EMIRATE_MAPPING_FACILITIES[emLower] || [];
    mapped.forEach(name => list.add(name));

    // 2. Custom user-saved facilities
    const userSaved = customFacilities[emLower] || [];
    userSaved.forEach(name => list.add(name));

    // Also look for matches by keyword in all standard facilities just in case
    STANDARD_FACILITIES.forEach(name => {
      const nameLower = name.toLowerCase();
      if (nameLower.includes(emLower)) {
        list.add(name);
      }
    });

    // 3. Client inputted values currently in database (reports) for this emirate
    reports.forEach(r => {
      if (r.emirate && r.emirate.toLowerCase().trim() === emLower && r.facilityName) {
        const trimmed = r.facilityName.trim();
        if (trimmed) {
          list.add(trimmed);
        }
      }
    });

    return Array.from(list);
  };

  const t = {
    en: {
      title: "Admin: System Operations Ledger",
      subtitle: "Configure compliance states, view branch facilities, and perform rapid inline edits on UAE operations",
      searchPlaceholder: "Search registered hospitals, clinics, contracts...",
      emirateFilter: "All Emirates Locations",
      autoFillBtn: "Auto-Fill Web Form",
      copied: "Linked successfully! Form Prefilled.",
      tabCards: "📍 Registered UAE Locations Cards",
      tabExcel: "📊 Dynamic Operation Ledger (Excel Style)"
    },
    bn: {
      title: "অ্যাডমিন পোর্টাল: সিস্টেম অপারেশনাল লেজার",
      subtitle: "মেডিকেল সাইট ফিল্টার ও সম্পন্ন কাজের ডাইরেক্ট আপডেট পোর্টাল",
      searchPlaceholder: "ক্লিনিক, হসপিটাল বা চুক্তি অনুসন্ধান করুন...",
      emirateFilter: "সকল আমিরাত স্টেট",
      autoFillBtn: "ফর্ম অটো-ফিল করুন",
      copied: "সফলভাবে ফর্মে সংযুক্ত করা হয়েছে!",
      tabCards: "📍 নিবন্ধিত মেডিকেল লোকেশন সমূহ",
      tabExcel: "📊 অপারেশনাল ডাইরেক্ট এক্সেল লেজার"
    },
    ar: {
      title: "بوابة المدير: دفتر العمليات والتعقيم المعتمد",
      subtitle: "معالجة وتحديث لوحة العمليات وحالة التعقيم للمراكز الطبية دولة الإمارات",
      searchPlaceholder: "ابحث عن مستشفى، عيادة، عقد...",
      emirateFilter: "جميع الإمارات",
      autoFillBtn: "تعبئة تلقائية للنموذج",
      copied: "تم الربط والمزامنة تلقائياً بنجاح!",
      tabCards: "📍 بطاقات فروع المواقع الطبية",
      tabExcel: "📊 دفتر معالجة العمليات والبيانات المباشر"
    }
  }[language];

  // Primary Predefined locations list
  const locations = [
    // AJMAN
    { name: "Al Hamidiyah Health Center", emirate: "Ajman", type: "Health Center", contact: "Dr. Amna Al Shamsi", email: "hamidiyah.hc@moh.gov.ae", contract: "CON-4820-A", id: "ALW-CLI-3901" },
    { name: "Public Health Center", emirate: "Ajman", type: "Health Center", contact: "Mrs. Fatima Al Hammadi", email: "ajman.phc@moh.gov.ae", contract: "CON-4820-B", id: "ALW-CLI-3902" },
    { name: "Dental Health Center", emirate: "Ajman", type: "Health Center", contact: "Dr. Salem Obaid", email: "ajman.dhc@moh.gov.ae", contract: "CON-9301-C", id: "ALW-CLI-3903" },
    { name: "Mushairif Health Center", emirate: "Ajman", type: "Health Center", contact: "Dr. Khaled Al Nuaimi", email: "mushairif.hc@moh.gov.ae", contract: "CON-4021-X", id: "ALW-CLI-3904" },
    { name: "Maple Clinic", emirate: "Ajman", type: "Clinic", contact: "Dr. John Mathews", email: "info@mapleclinic.ae", contract: "CON-8821-M", id: "ALW-CLI-3905" },
    { name: "Ajman Medical Store", emirate: "Ajman", type: "Warehouse", contact: "Mr. Shafiqa Jaber", email: "ajman.store@medical.ae", contract: "CON-7432-Y", id: "ALW-CLI-3906" },
    { name: "Ajman DTC", emirate: "Ajman", type: "Health Center", contact: "Dr. Maryam Al Ali", email: "dtc.ajman@moh.gov.ae", contract: "CON-3392-L", id: "ALW-CLI-3907" },
    { name: "Al Rashidiya Clinic", emirate: "Ajman", type: "Clinic", contact: "Dr. Sara Al Mazrouei", email: "rashidiya.clinic@moh.gov.ae", contract: "CON-2849-Z", id: "ALW-CLI-3908" },

    // DUBAI
    { name: "Al Kuwait Hospital", emirate: "Dubai", type: "Hospital", contact: "Eng. Sayed Abdul Rahman", email: "s.rahman@kuwaithospital.ae", contract: "CON-9921-X", id: "ALW-CLI-4028" },
    { name: "Hor Al Anz Health Center", emirate: "Dubai", type: "Health Center", contact: "Dr. Mona Al Falasi", email: "horalanz.hc@dha.gov.ae", contract: "CON-1903-P", id: "ALW-CLI-4029" },
    { name: "Smart Salem Medical Fitness Centre", emirate: "Dubai", type: "Medical Center", contact: "Mr. Saeed Al Falasi", email: "info@smartsalem-fitness.ae", contract: "CON-3801-S", id: "ALW-CLI-4030" },
    { name: "DTC Rashidiya", emirate: "Dubai", type: "Health Center", contact: "Dr. Humaid Al Qutami", email: "dtc.rashidiya@dha.gov.ae", contract: "CON-9891-B", id: "ALW-CLI-4031" },
    { name: "ENOC Salem", emirate: "Dubai", type: "Medical Center", contact: "Mr. Salim Al Gurg", email: "enoc.salem@salem.ae", contract: "CON-1830-W", id: "ALW-CLI-4032" },
    { name: "Erada Center", emirate: "Dubai", type: "Health Center", contact: "Dr. Hamad Al Ghaferi", email: "erada.rehab@erada.ae", contract: "CON-8472-F", id: "ALW-CLI-4033" },
    { name: "Silicon Oasis Health Center", emirate: "Dubai", type: "Health Center", contact: "Dr. Aisha Bin Bishr", email: "silicon.oasis@dha.gov.ae", contract: "CON-4201-E", id: "ALW-CLI-4034" },

    // SHARJAH
    { name: "Al Kuwait Hospital", emirate: "Sharjah", type: "Hospital", contact: "Dr. Afra Al Suwaidi", email: "shj.kuwait@moh.gov.ae", contract: "CON-1122-A", id: "ALW-CLI-5001" },
    { name: "Family Health Promotion Center", emirate: "Sharjah", type: "Health Center", contact: "Mrs. Noura Al Nooman", email: "familyhealth.shj@moh.gov.ae", contract: "CON-3281-B", id: "ALW-CLI-5002" },
    { name: "Blood Transfusion Center", emirate: "Sharjah", type: "Laboratory", contact: "Dr. Amin Al Amiri", email: "sharjah.bloodbank@moh.gov.ae", contract: "CON-7431-L", id: "ALW-CLI-5003" },
    { name: "Khorfakkan Hospital", emirate: "Sharjah", type: "Hospital", contact: "Mr. Obaid Al Khalfan", email: "khorfakkan.hp@moh.gov.ae", contract: "CON-8422-C", id: "ALW-CLI-5004" },
    { name: "Malaria Unit", emirate: "Sharjah", type: "Health Center", contact: "Mr. Tariq Al Kaabi", email: "malaria.shj@moh.gov.ae", contract: "CON-9302-M", id: "ALW-CLI-5005" },

    // UMM AL QUWAIN
    { name: "Umm Al Quwain Hospital", emirate: "Umm Al Quwain", type: "Hospital", contact: "Dr. Maitha Al Shali", email: "uaq.hospital@moh.gov.ae", contract: "CON-5011-H", id: "ALW-CLI-6001" },
    { name: "Al Khazan Health Center", emirate: "Umm Al Quwain", type: "Health Center", contact: "Mrs. Maryam Al Ali", email: "khazan.hc@moh.gov.ae", contract: "CON-3394-K", id: "ALW-CLI-6002" },
    { name: "Falaj Al Mualla Health Center", emirate: "Umm Al Quwain", type: "Health Center", contact: "Dr. Saif Al Bedwawi", email: "falaj.hc@moh.gov.ae", contract: "CON-4822-F", id: "ALW-CLI-6003" },
    { name: "Al Rafa Health Center", emirate: "Umm Al Quwain", type: "Health Center", contact: "Dr. Fatima Al Nuaimi", email: "rafa.hc@moh.gov.ae", contract: "CON-5582-R", id: "ALW-CLI-6004" }
  ];

  const emirates = ["ALL", "Ajman", "Dubai", "Sharjah", "Umm Al Quwain", "Ras Al Khaimah", "Fujairah"];

  // Search filter for option 1 Locations Cards
  const filteredLocs = locations.filter((loc) => {
    const matchesSearch = 
      (loc.name || "").toLowerCase().includes((search || "").toLowerCase()) || 
      (loc.contact || "").toLowerCase().includes((search || "").toLowerCase()) ||
      (loc.id || "").toLowerCase().includes((search || "").toLowerCase());
    const matchesEmirate = 
      selectedEmirate === "ALL" || (loc.emirate || "").toLowerCase() === (selectedEmirate || "").toLowerCase();
    return matchesSearch && matchesEmirate;
  });

  const handleApplyPrefill = (loc: any) => {
    onSelectClientToPrefill(loc);
    setShowCopiedAlert(loc.id);
    setTimeout(() => {
      setShowCopiedAlert(null);
    }, 2500);
  };

  // Excel Cell Change handler
  const handleExcelCellChange = (reportId: string, field: string, value: any) => {
    if (!onUpdateReports) return;
    const updated = reports.map(r => {
      if (r.id === reportId) {
        if (field === "dateOfOperation") {
          let nextDueDate = r.endDate;
          try {
            const d = new Date(value);
            if (!isNaN(d.getTime())) {
              d.setDate(d.getDate() + 30);
              nextDueDate = d.toISOString().split("T")[0];
            }
          } catch(e) {}
          return { ...r, dateOfOperation: value, endDate: nextDueDate };
        }
        if (field === "billingAmount") {
          return {
            ...r,
            billing: {
              ...r.billing,
              amount: value
            }
          };
        }
        return {
          ...r,
          [field]: value
        };
      }
      return r;
    });
    onUpdateReports(updated);
  };

  // Excel delete Row using custom safe modal state instead of default blocked confirm dialogs
  const handleExcelDeleteRow = (reportId: string) => {
    setDeleteId(reportId);
  };

  // Excel Add Row (Appended to Very Bottom!)
  const handleExcelAddRow = (emirateName: string) => {
    const newId = `ALW-CLI-${Math.floor(1000 + Math.random() * 9000)}`;
    const todayStr = new Date().toISOString().split("T")[0];
    const nextMonthStr = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    
    const newReport: ReportItem = {
      id: `REP-${Math.floor(10000 + Math.random() * 90000)}`,
      facilityName: "",
      clientId: newId,
      contractNo: `CON-${Math.floor(10000 + Math.random() * 90000)}`,
      branchName: "Main Branch",
      facilityType: "Clinic",
      emirate: emirateName || "Dubai",
      address: `${emirateName} Health Sector, UAE`,
      contactPerson: "Dr. Ahmed Hamdy",
      mobile: "050-XXXXXXX",
      whatsapp: "050-XXXXXXX",
      email: "clinic@alwafastar.ae",
      startDate: todayStr,
      endDate: nextMonthStr,
      validity: "1 Year",
      dateOfOperation: todayStr,
      ticketNo: `TKT-${Math.floor(10000 + Math.random() * 90000)}-AL`,
      startTime: "09:00",
      endTime: "10:30",
      duration: "1h 30m",
      categories: ["Pest Control", "Disinfection"],
      areas: ["Internal Lobby", "Sanitation Zone"],
      reportText: "Automated service report logged on spreadsheet level.",
      workStatus: "Completed",
      methods: ["Spraying"],
      chemicals: [
        { name: "Deltacide SC", dilution: "1:100", used: "200 ml", batch: "DT-0294", expiry: "2027-02-18", remaining: "4.8 L" }
      ],
      infestation: { Cockroaches: "Low" },
      sanitation: "Satisfactory",
      proofing: "Satisfactory",
      recommendations: ["Ensure doors remain tightly closed after operations"],
      billing: {
        invoiceNo: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        invoiceDate: todayStr,
        amount: "", // Initialized as Blank
        discount: 0,
        vat: 0,
        total: 0,
        method: "Bank Transfer",
        status: "Paid"
      },
      technicians: ["Hamdy", "Hussin"],
      signatures: {}
    };
    
    // Append to bottom as requested: "যেটা নতুন করব সেটা সবচেয়ে নিচে চলে যাবে"
    onUpdateReports([...reports, newReport]);
  };

  const isRunningMonth = (dateStr: string | undefined): boolean => {
    if (!dateStr) return false;
    try {
      const trimmed = dateStr.trim();
      const matchYMD = trimmed.match(/^(\d{4})[-/](\d{2})[-/](\d{2})/);
      const now = new Date();
      if (matchYMD) {
        const year = parseInt(matchYMD[1], 10);
        const month = parseInt(matchYMD[2], 10) - 1; // 0-indexed
        return year === now.getFullYear() && month === now.getMonth();
      }
      const matchDMY = trimmed.match(/^(\d{2})[-/](\d{2})[-/](\d{4})/);
      if (matchDMY) {
        const year = parseInt(matchDMY[3], 10);
        const month = parseInt(matchDMY[2], 10) - 1; // 0-indexed
        return year === now.getFullYear() && month === now.getMonth();
      }
      const parsedDate = new Date(trimmed);
      if (isNaN(parsedDate.getTime())) return false;
      return parsedDate.getFullYear() === now.getFullYear() && parsedDate.getMonth() === now.getMonth();
    } catch (e) {
      return false;
    }
  };

  // Engineering Reports loading
  const [engineeringReports, setEngineeringReports] = useState<any[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("ALW_ENGINEERING_REPORTS");
      if (raw) {
        setEngineeringReports(JSON.parse(raw));
      }
    } catch (e) {}
  }, []);

  // Map engineering reports to standard format
  const mappedEngineeringReports = engineeringReports.map(eng => ({
    id: eng.id,
    facilityName: eng.clientName,
    clientId: eng.reportNo,
    contractNo: eng.reportNo,
    branchName: "Main",
    facilityType: "Engineering Report", 
    emirate: eng.emirate || "Dubai",
    address: "",
    contactPerson: eng.engineerName || "",
    mobile: "",
    whatsapp: "",
    email: "",
    startDate: eng.date,
    endDate: "",
    validity: "N/A",
    dateOfOperation: eng.date,
    ticketNo: eng.reportNo,
    reportText: "Engineering Report",
    workStatus: "Completed",
    rawEngineeringData: eng
  } as any));

  // Filter completed or active operational reports for Excel ledger
  const activeExcelReports = [...reports, ...mappedEngineeringReports].filter((r) => {
    // Show only completed service reports as requested
    const isServiceReport = r.workStatus === "Completed" || !r.workStatus;
    if (!isServiceReport) return false;

    // Note: If a row is added directly from the spreadsheet, it should always be visible so adding/editing is seamless.
    const isManuallyAddedInExcel = r.reportText === "Automated service report logged on spreadsheet level.";

    const matchesSearch = 
      (r.facilityName || "").toLowerCase().includes(search.toLowerCase()) || 
      (r.id || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.clientId || "").toLowerCase().includes(search.toLowerCase());
    const matchesEmirate = 
      selectedEmirate === "ALL" || (r.emirate || "").toLowerCase() === selectedEmirate.toLowerCase();
    return matchesSearch && matchesEmirate;
  });

  return (
    <div id="admin-location-ledger-view" className="space-y-6 pb-12">
      
      {/* Top Banner and Tabs Card */}
      <div className="bg-[#1E293B]/60 border border-[#334155] rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-[#10B981]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-100 tracking-tight flex items-center gap-2">
              <Layers className="text-[#10B981] w-5.5 h-5.5" />
              <span>{t.title}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-2xl">
              {t.subtitle}
            </p>
          </div>

          {/* Quick Sub-tab Switcher: Option 1 vs Option 2 */}
          <div className="flex bg-slate-900 border border-slate-700/60 p-1 rounded-2xl">
            <button
              onClick={() => setActiveSubTab("excel")}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeSubTab === "excel"
                  ? "bg-[#10B981] text-slate-950 shadow-md shadow-emerald-500/10"
                  : "text-slate-400 hover:text-slate-100"
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{t.tabExcel}</span>
            </button>
            <button
              onClick={() => setActiveSubTab("cards")}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeSubTab === "cards"
                  ? "bg-[#2563EB] text-slate-50 shadow-md shadow-blue-500/10"
                  : "text-slate-400 hover:text-slate-100"
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>{t.tabCards}</span>
            </button>
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-700/50">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              id="ledger-search-box"
              type="text"
              placeholder={t.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:ring-1 focus:ring-[#10B981] focus:border-[#10B981] outline-none"
            />
          </div>

          <div>
            <select
              id="ledger-emirate-dropdown"
              value={selectedEmirate}
              onChange={(e) => setSelectedEmirate(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 border border-slate-700 rounded-xl py-2.5 px-3.5 text-xs focus:ring-1 focus:ring-[#10B981] outline-none cursor-pointer"
            >
              {emirates.map((em) => (
                <option key={em} value={em}>
                  {em === "ALL" ? t.emirateFilter : em.toUpperCase() + " STATE"}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* RENDER VIEW TAB 1: REGISTERED CARDS */}
      {activeSubTab === "cards" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {filteredLocs.map((loc) => {
            const isCopied = showCopiedAlert === loc.id;
            return (
              <div 
                id={`loc-card-${loc.id}`}
                key={loc.id} 
                className="bg-slate-900 border border-slate-800 hover:border-[#10B981]/50 p-5 rounded-2xl shadow-md space-y-4 flex flex-col justify-between transition-all"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] bg-emerald-500/10 text-[#10B981] font-mono font-bold uppercase rounded px-2.5 py-1 tracking-wider border border-[#10B981]/20">
                      {loc.emirate}
                    </span>
                    <span className="text-xs font-mono text-slate-500 text-right">
                      {loc.id}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-100 leading-tight">
                      {loc.name}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {loc.type} | Contract No: {loc.contract}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800 space-y-1 text-slate-300">
                    <p className="text-xs flex items-center gap-1.5 leading-snug">
                      <span className="font-semibold text-slate-500 shrink-0">Supervisor:</span> 
                      <span className="truncate">{loc.contact}</span>
                    </p>
                    <p className="text-xs flex items-center gap-1.5 leading-snug">
                      <span className="font-semibold text-slate-500 shrink-0">Email:</span> 
                      <span className="text-[11px] font-mono text-emerald-400 truncate">{loc.email}</span>
                    </p>
                  </div>
                </div>

                <div>
                  <button
                    id={`link-btn-${loc.id}`}
                    onClick={() => handleApplyPrefill(loc)}
                    className={`w-full text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isCopied 
                        ? "bg-slate-950 text-[#10B981] border border-[#10B981]" 
                        : "bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20"
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-4 h-4 animate-bounce" />
                        <span>{t.copied}</span>
                      </>
                    ) : (
                      <>
                        <ClipboardCopy className="w-4 h-4" />
                        <span>{t.autoFillBtn}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* RENDER VIEW TAB 2: EXCEL LEDGER Direct spreadsheet */}
      {activeSubTab === "excel" && (
        <div className="space-y-6 animate-fade-in font-sans text-xs">
          
          {/* Quick instructions widget */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 font-medium">
            <div className="space-y-1">
              <p className="text-[#10B981] font-bold flex items-center gap-1.5">
                <span>⚡</span>
                <span>{language === "bn" ? "এক্সেল ডাইরেক্ট অপারেশনাল লেজার সক্রিয়" : "Dynamic Operations Ledger Spreadsheet Active"}</span>
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                {language === "bn" 
                  ? "১. হসপিটাল/ক্লিনিক নামের ঘরে ক্লিক করলে সাজেশন্স পাবেন, ইচ্ছামত টাইপও করতে পারবেন। ২. কাজ করার তারিখ বদল করলে পরবর্তী মেয়াদ ৩০ দিন স্বয়ংক্রিয়ভাবে বৃদ্ধি পাবে। ৩. টাকার ঘরের ৩টি অপশন: ব্লাঙ্ক (ফাঁকা), No (ফ্রি), এবং কাস্টম পেইড (সবুজ রং)। ৪. প্রতিটি আমিরাত স্টেটের সিরিয়াল নং আলাদাভাবে হিসাব করা হয়।"
                  : "1. Click inside Facility Name to select from suggestions or custom type. 2. Modifying operations date auto-shifts due expiry by 30 days. 3. Three cash options: Blank, No Charge (No), or Custom Paid Cash (Emerald Green)."}
              </p>
            </div>
             <div className="flex flex-wrap items-center gap-2 shrink-0">
              {isDeleteSelectionMode ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDeleteSelectionMode(false);
                      setSelectedReportIds([]);
                    }}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-350 hover:text-white font-bold rounded-xl transition cursor-pointer text-xs flex items-center gap-1.5 border border-slate-700"
                  >
                    ✕ {language === "bn" ? "মোড বাতিল" : "Cancel"}
                  </button>

                  <button
                    type="button"
                    disabled={selectedReportIds.length === 0}
                    onClick={handleBulkDownloadPDFs}
                    className={`px-4 py-2.5 font-black text-xs rounded-xl transition flex items-center gap-1.5 shadow-lg ${
                      selectedReportIds.length > 0 
                        ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 cursor-pointer border border-emerald-500" 
                        : "bg-slate-850 text-slate-500 cursor-not-allowed border border-slate-800"
                    }`}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>
                      {language === "bn" 
                        ? (selectedReportIds.length > 0 ? `নির্বাচিত ${selectedReportIds.length}টি PDF ডাউনলোড` : "সিলেক্ট করুন") 
                        : (selectedReportIds.length > 0 ? `Download PDF (${selectedReportIds.length})` : "Download Selected")}
                    </span>
                  </button>

                  <button
                    type="button"
                    disabled={selectedReportIds.length === 0}
                    onClick={() => setShowBulkDeleteConfirm(true)}
                    className={`px-4 py-2.5 font-black text-xs rounded-xl transition flex items-center gap-1.5 shadow-lg ${
                      selectedReportIds.length > 0 
                        ? "bg-rose-650 hover:bg-red-500 text-white shadow-rose-600/30 cursor-pointer border border-rose-500" 
                        : "bg-slate-850 text-slate-500 cursor-not-allowed border border-slate-800"
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>
                      {language === "bn" 
                        ? (selectedReportIds.length > 0 ? `নির্বাচিত ${selectedReportIds.length}টি মুছুন` : "সিলেক্ট করুন") 
                        : (selectedReportIds.length > 0 ? `Delete Selected (${selectedReportIds.length})` : "Delete Selected")}
                    </span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteSelectionMode(true);
                    setSelectedReportIds([]);
                  }}
                  className="px-4 py-2.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 hover:text-indigo-350 font-black rounded-xl border border-indigo-500/25 transition flex items-center gap-1.5 cursor-pointer text-xs shadow-sm shadow-indigo-600/5 hover:scale-[1.01]"
                  title={language === "bn" ? "একাধিক রো সিলেক্ট করে ডিলিট বা ডাউনলোড করুন" : "Enable selection mode to delete or download multiple rows"}
                >
                  <Layers className="w-3.5 h-3.5 text-indigo-550" />
                  <span>
                    {language === "bn" ? "⚙️ একাধিক সিলেক্ট করুন" : "⚙️ Select Multiple"}
                  </span>
                </button>
              )}
              
              <button
                onClick={() => {
                  const defaultEmirateName = selectedEmirate === "ALL" ? "Dubai" : selectedEmirate;
                  handleExcelAddRow(defaultEmirateName);
                }}
                className="px-4 py-2.5 bg-[#10B981] hover:bg-emerald-400 text-slate-950 font-black rounded-xl transition shrink-0 cursor-pointer shadow-lg shadow-emerald-500/20 text-xs"
              >
                ➕ {language === "bn" ? "নতুন রো যোগ করুন" : "Add Facility Row"}
              </button>
            </div>
          </div>

          {/* DYNAMIC MULTI-SELECT ACTIVE DELETION BANNER */}
          {isDeleteSelectionMode && (
            <div className="p-3.5 bg-rose-950/20 border border-rose-500/25 rounded-2xl text-xs text-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-505 animate-pulse shrink-0 block"></span>
                <span className="font-semibold text-[11px]">
                  {language === "bn" 
                    ? "🗑️ ডিলিট কন্ট্রোল সক্রিয়: একাধিক সারি একসাথে ডিলিট করার জন্য নিচে বাম পাশের টিক-বক্সে (✔) চাপ দিন।" 
                    : "🗑️ Deletion Panel Active: Tick the selecting boxes (✔) on the left of each row to delete multiple entries."}
                </span>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <span className="text-[10px] bg-rose-650/45 text-rose-200 border border-rose-500/30 px-2.5 py-1 rounded-lg font-bold font-mono">
                  {language === "bn" ? `নির্বাচিত: ${selectedReportIds.length} টি` : `Selected: ${selectedReportIds.length}`}
                </span>
              </div>
            </div>
          )}

          {/* Grouped state Tables to maintain individual state serials */}
          {["Ajman", "Dubai", "Sharjah", "Umm Al Quwain", "Ras Al Khaimah", "Fujairah", "Al Dhaid"]
            .filter((state) => selectedEmirate === "ALL" || selectedEmirate.toLowerCase() === state.toLowerCase())
            .map((emirateState) => {
              const stateReports = activeExcelReports.filter((r) => (r.emirate || "").toLowerCase() === emirateState.toLowerCase());
              if (stateReports.length === 0) return null;

              return (
                <div key={emirateState} className="bg-[#1E293B]/40 border border-[#334155] rounded-2xl p-4 shadow-sm space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-700/60 pb-2">
                    <h3 className="text-xs font-black text-emerald-400 tracking-wide flex items-center gap-1.5 uppercase">
                      <span className="text-xs">📍</span>
                      <span>{emirateState} Operational Ledger</span>
                      <span className="text-[9px] bg-slate-800 text-[#10B981] font-mono border border-[#10B981]/25 py-0.5 px-2 rounded-full">
                        {stateReports.length} {stateReports.length === 1 ? "Line Item" : "Line Items"}
                      </span>
                    </h3>
                    <button
                      onClick={() => handleExcelAddRow(emirateState)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer border border-slate-700"
                    >
                      ➕ Add Entry ({emirateState})
                    </button>
                  </div>

                  {/* Spreadsheet Grid container */}
                  <div className="overflow-x-auto rounded-xl border border-slate-800">
                    <table className="w-full text-slate-200 text-left border-collapse table-auto text-[9.5px] font-medium min-w-[700px]">
                      <thead>
                        <tr className="bg-slate-950 text-slate-400 font-mono text-[8px] uppercase tracking-wider border-b border-slate-800">
                           {isDeleteSelectionMode && (
                             <th className="py-2 px-1 border-r border-slate-800 w-[30px] text-center">
                               <input
                                 type="checkbox"
                                 checked={stateReports.length > 0 && stateReports.every(r => selectedReportIds.includes(r.id))}
                                 onChange={(e) => {
                                   const checked = e.target.checked;
                                   if (checked) {
                                     const newSelections = Array.from(new Set([...selectedReportIds, ...stateReports.map(r => r.id)]));
                                     setSelectedReportIds(newSelections);
                                   } else {
                                     const newSelections = selectedReportIds.filter(id => !stateReports.some(r => r.id === id));
                                     setSelectedReportIds(newSelections);
                                   }
                                 }}
                                 className="rounded cursor-pointer accent-[#10B981]"
                               />
                             </th>
                           )}
                           <th className="py-2 px-1 border-r border-slate-800 w-[26px] text-center">(#)</th>
                           <th className="py-2 px-1 border-r border-slate-800 w-[124px]">{language === "bn" ? "ক্লিনিক নাম" : "Clinic Name"}</th>
                           <th className="py-2 px-1 border-r border-slate-800 w-[76px]">{language === "bn" ? "কাজের অবস্থা" : "Status"}</th>
                           <th className="py-2 px-1 border-r border-slate-800 w-[92px]">{language === "bn" ? "কাজের তারিখ" : "Work Date"}</th>
                           <th className="py-2 px-1 border-r border-slate-800 w-[92px]">{language === "bn" ? "পরবর্তী মেয়াদ" : "Next Due (30d)"}</th>
                           <th className="py-2 px-1 border-r border-slate-800 w-[76px]">{language === "bn" ? "বাকি দিন" : "Days Left"}</th>
                           <th className="py-2 px-1 border-r border-slate-800 w-[82px]">{language === "bn" ? "বিলিং" : "Billing"}</th>
                           <th className="py-2 px-1 border-r border-slate-800 w-[84px] text-center">{language === "bn" ? "ডাউনলোড" : "Download"}</th>
                           <th className="py-2 px-1 text-center w-[50px]">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {stateReports.map((report, idx) => {
                          const isReadonly = report.workStatus === "Completed" && report.reportText !== "Automated service report logged on spreadsheet level.";
                          
                          const amountValue = report.billing?.amount ?? "";
                          let pricingOption = "blank";
                          if (amountValue === "No" || amountValue === "no") {
                            pricingOption = "no";
                          } else if (amountValue !== "" && !isNaN(Number(amountValue))) {
                            pricingOption = "paid";
                          }

                          return (
                            <tr key={`${report.id}-${idx}`} className="hover:bg-slate-800/40 bg-slate-950/20 transition">
                              
                              {/* Selection checkbox */}
                              {isDeleteSelectionMode && (
                                <td className="py-1 px-1 border-r border-slate-800 text-center w-[30px] bg-slate-950/20">
                                  <input
                                    type="checkbox"
                                    checked={selectedReportIds.includes(report.id)}
                                    onChange={(e) => {
                                      const checked = e.target.checked;
                                      if (checked) {
                                        setSelectedReportIds([...selectedReportIds, report.id]);
                                      } else {
                                        setSelectedReportIds(selectedReportIds.filter(id => id !== report.id));
                                      }
                                    }}
                                    className="rounded cursor-pointer accent-[#10B981]"
                                  />
                                </td>
                              )}

                              {/* Serial count localized per state starting at 1 */}
                              <td className="py-1 px-1 border-r border-slate-800 text-center font-bold text-slate-500 bg-slate-950/40 w-[26px] font-mono">
                                {idx + 1}
                              </td>

                              {/* Autocomplete Input Column utilizing the screen-centered selector Modal */}
                              <td className="py-1 px-1 border-r border-slate-800 w-[124px] font-sans">
                                <button
                                  type="button"
                                  disabled={isReadonly}
                                  onClick={() => {
                                    if (isReadonly) return;
                                    setActiveModalReportId(report.id);
                                    setFacilitySearchQuery("");
                                  }}
                                  className={`w-full text-left bg-slate-900 border text-slate-300 font-bold rounded px-1 py-0.5 outline-none transition text-[9.5px] flex justify-between items-center gap-0.5 ${isReadonly ? "opacity-60 cursor-not-allowed border-transparent" : "hover:bg-slate-850 border-[#334155]/60 hover:border-[#10B981]/50 cursor-pointer group"}`}
                                  title={language === "bn" ? "ক্লিনিক বা হসপিটাল নাম নির্বাচন করতে ক্লিক করুন" : "Click to select clinic"}
                                >
                                  <span className={`truncate flex-1 ${report.facilityName ? "text-[#10B981] font-black" : "text-slate-400 font-bold"}`}>
                                    {report.facilityName || (language === "bn" ? "সিলেক্ট..." : "Select...")}
                                  </span>
                                  <span className={`text-[7.5px] shrink-0 transition-colors ${isReadonly ? "text-slate-600" : "text-slate-400 group-hover:text-[#10B981]"}`}>
                                    {isReadonly ? "🔒" : "▼"}
                                  </span>
                                </button>
                              </td>

                              {/* Sector Clinic Type Selection */}
                              <td className="py-1 px-0.5 border-r border-slate-800 w-[76px]">
                                <select
                                  disabled={isReadonly}
                                  value={report.facilityType}
                                  onChange={(e) => handleExcelCellChange(report.id, "facilityType", e.target.value)}
                                  className={`bg-slate-900 text-slate-300 border border-[#334155]/60 px-1 py-0.5 text-[9.5px] font-bold w-full rounded outline-none ${isReadonly ? "opacity-60 cursor-not-allowed" : "cursor-pointer focus:border-blue-500"}`}
                                >
                                  {(() => {
                                    const currentVal = report.facilityType || "Incomplete";
                                    const isStandard = ["Completed", "Partially Completed", "Incomplete"].includes(currentVal);
                                    const options = [
                                      { value: "Completed", label: language === "bn" ? "কমপ্লিট" : "Completed" },
                                      { value: "Partially Completed", label: language === "bn" ? "অর্ধেক করা হয়েছে" : "Partially Completed" },
                                      { value: "Incomplete", label: language === "bn" ? "কমপ্লিট হয়নি" : "Incomplete" }
                                    ];
                                    if (!isStandard && currentVal) {
                                      options.push({ value: currentVal, label: currentVal });
                                    }
                                    return options.map(opt => (
                                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ));
                                  })()}
                                </select>
                              </td>

                              {/* Operational Date Input */}
                              <td className="py-1 px-0.5 border-r border-[#1E293B] w-[92px]">
                                <input
                                  type="date"
                                  disabled={isReadonly}
                                  value={report.dateOfOperation}
                                  onChange={(e) => handleExcelCellChange(report.id, "dateOfOperation", e.target.value)}
                                  className={`w-full bg-slate-900 border border-slate-800 text-slate-100 px-1 py-0.5 text-[9px] font-mono font-bold rounded outline-none ${isReadonly ? "opacity-60 cursor-not-allowed" : "focus:border-blue-500 cursor-pointer"}`}
                                />
                              </td>

                              {/* Automatic Expiry date extension (+30 Days) */}
                              <td className="py-1 px-0.5 border-r border-[#1E293B] w-[92px]">
                                <input
                                  type="date"
                                  disabled={isReadonly}
                                  value={report.endDate}
                                  onChange={(e) => handleExcelCellChange(report.id, "endDate", e.target.value)}
                                  className={`w-full bg-slate-900 border border-slate-800 text-emerald-400 px-1 py-0.5 text-[9px] font-mono font-bold rounded outline-none ${isReadonly ? "opacity-60 cursor-not-allowed" : "focus:border-blue-500 cursor-pointer"}`}
                                />
                              </td>

                              {/* Days Remaining Live Countdown */}
                              <td className="py-1 px-1 border-r border-slate-800 w-[76px] text-center font-mono font-bold">
                                {(() => {
                                  if (!report.endDate) return <span className="text-slate-500">—</span>;
                                  
                                  const today = new Date();
                                  today.setHours(0, 0, 0, 0);
                                  const due = new Date(report.endDate);
                                  due.setHours(0, 0, 0, 0);
                                  
                                  const diffTime = due.getTime() - today.getTime();
                                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                  
                                  if (isNaN(diffDays)) {
                                    return <span className="text-slate-500">—</span>;
                                  }

                                  if (diffDays < 0) {
                                    return (
                                      <span className="text-[8.5px] text-red-400 bg-red-400/10 px-0.5 py-0.5 rounded border border-red-500/20 block truncate max-w-full" title="Overdue">
                                        {language === "bn" ? `${Math.abs(diffDays)} দিন পার` : `${Math.abs(diffDays)}d Over`}
                                      </span>
                                    );
                                  } else if (diffDays === 0) {
                                    return (
                                      <span className="text-[8.5px] text-amber-405 bg-amber-500/10 px-0.5 py-0.5 rounded border border-amber-500/25 block truncate max-w-full font-sans">
                                        {language === "bn" ? "আজ শেষ" : "Today"}
                                      </span>
                                    );
                                  } else if (diffDays <= 5) {
                                    return (
                                      <span className="text-[9px] text-rose-300 bg-rose-500/10 px-0.5 py-0.5 rounded border border-rose-500/20 block truncate max-w-full">
                                        {language === "bn" ? `${diffDays} দিন` : `${diffDays}d left`}
                                      </span>
                                    );
                                  } else if (diffDays <= 15) {
                                    return (
                                      <span className="text-[9px] text-amber-300 bg-amber-500/10 px-0.5 py-0.5 rounded border border-amber-500/20 block truncate max-w-full">
                                        {language === "bn" ? `${diffDays} দিন` : `${diffDays}d left`}
                                      </span>
                                    );
                                  } else {
                                    return (
                                      <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-0.5 py-0.5 rounded border border-emerald-500/25 block truncate max-w-full">
                                        {language === "bn" ? `${diffDays} দিন` : `${diffDays}d left`}
                                      </span>
                                    );
                                  }
                                })()}
                              </td>

                              {/* Billing Status with 3 choices & colors - COMPACTED in width */}
                              <td className="py-1 px-1 border-r border-[#1E293B] w-[82px]">
                                <div className="flex items-center gap-0.5 w-full justify-between">
                                  <select
                                    disabled={isReadonly}
                                    value={pricingOption}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      if (val === "blank") {
                                        handleExcelCellChange(report.id, "billingAmount", "");
                                      } else if (val === "no") {
                                        handleExcelCellChange(report.id, "billingAmount", "No");
                                      } else {
                                        handleExcelCellChange(report.id, "billingAmount", 1200);
                                      }
                                    }}
                                    className={`bg-slate-900 border border-slate-800 text-slate-200 rounded px-0.5 py-0.5 text-[8px] font-bold outline-none shrink-0 w-[42px] ${isReadonly ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                                  >
                                    <option value="blank">{language === "bn" ? "খালি" : "Blank"}</option>
                                    <option value="no">{language === "bn" ? "ফ্রি" : "Free"}</option>
                                    <option value="paid">{language === "bn" ? "পেইড" : "Paid"}</option>
                                  </select>

                                  {pricingOption === "paid" && (
                                    <div className={`flex items-center bg-slate-950 border border-emerald-500/30 rounded px-0.5 py-0.5 shrink-0 w-[38px] ${isReadonly ? "opacity-60" : ""}`}>
                                      <input
                                        type="number"
                                        disabled={isReadonly}
                                        value={isNaN(Number(report.billing?.amount)) ? "" : report.billing.amount}
                                        onChange={(e) => {
                                          const entered = e.target.value === "" ? "" : Number(e.target.value);
                                          handleExcelCellChange(report.id, "billingAmount", entered);
                                        }}
                                        className={`w-full bg-transparent border-none text-[9.5px] font-mono font-extrabold text-[#10B981] text-right outline-none p-0 ${isReadonly ? "cursor-not-allowed" : ""}`}
                                        placeholder="0"
                                      />
                                    </div>
                                  )}

                                  {pricingOption === "no" && (
                                    <span className="text-[8px] font-black text-amber-550 bg-amber-500/10 px-0.5 py-0.5 rounded border border-amber-500/20 shrink-0 select-none">
                                      {language === "bn" ? "ফ্রি" : "FREE"}
                                    </span>
                                  )}

                                  {pricingOption === "blank" && (
                                    <span className="text-[9px] text-slate-500 italic font-mono px-0.5 shrink-0 select-none">
                                      —
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Download Form Button */}
                              <td className="py-1 px-1 border-r border-slate-800 w-[84px] text-center">
                                <button
                                  type="button"
                                  onClick={() => setPreviewReport(report)}
                                  className="mx-auto px-1.5 py-0.5 bg-[#10B981] hover:bg-emerald-400 text-slate-950 font-black rounded transition-all duration-75 flex items-center justify-center gap-1 cursor-pointer text-[9px] active:scale-95 shadow-sm"
                                  title={language === "bn" ? "ডاونلوډ করার পূর্বে ফর্মটি চেক করুন" : "Preview form before downloading"}
                                >
                                  <Download className="w-2.5 h-2.5 shrink-0" />
                                  <span>{language === "bn" ? "ডাউনলোড" : "Download"}</span>
                                </button>
                              </td>

                              {/* Table row actions */}
                              <td className="py-1 px-1 w-[50px] text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => setPreviewReport(report)}
                                    className="p-1 text-blue-400 hover:text-blue-350 hover:bg-blue-500/15 bg-slate-900 border border-slate-800/85 rounded transition flex items-center justify-center cursor-pointer"
                                    title={language === "bn" ? "বিস্তারিত দেখুন" : "View Details"}
                                  >
                                    <Eye className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleExcelDeleteRow(report.id)}
                                    className="p-1 text-red-400 hover:text-red-350 hover:bg-red-500/15 bg-slate-900 border border-slate-800/85 rounded transition flex items-center justify-center cursor-pointer"
                                    title={language === "bn" ? "মুছে ফেলুন" : "Delete"}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </td>

                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
        </div>
      )}


      {/* CUSTOM RECONCILED CONFIRMATION DELETE DIALOG */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in font-sans">
          <div className="w-full max-w-md bg-slate-900 border border-red-550/30 rounded-3xl overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-center gap-3 text-red-500">
              <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center font-bold text-xl">
                ⚠️
              </div>
              <div>
                <h3 className="text-base font-black text-slate-100">
                  {language === "bn" ? "তথ্য মুছে ফেলা নিশ্চিত করুন" : "Confirm Data Deletion"}
                </h3>
                <p className="text-xs text-slate-400">
                  {language === "bn" ? "আপনি কি এই অপারেশনাল লাইন আইটেমটি মুছে ফেলতে চান?" : "Are you sure you want to delete this operational ledger entry?"}
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300">
              <span className="text-slate-500 block text-[10px] uppercase font-bold font-mono">Ledger Row Reference</span>
              <span className="text-slate-200 font-bold block mt-0.5 text-ellipsis overflow-hidden whitespace-nowrap">
                {reports.find(r => r.id === deleteId)?.facilityName || "Selected Facility"}
              </span>
              <span className="text-slate-500 font-mono text-[10px] block mt-0.5">
                ID: {deleteId}
              </span>
            </div>

            <p className="text-xs text-red-400 leading-relaxed bg-red-500/5 p-3 rounded-lg border border-red-500/10">
              {language === "bn" 
                ? "সতর্কতা: এই পদক্ষেপটি অপূরণীয়। ডিলিট করার পর ডাটাবেজ এবং ক্লায়েন্ট হিস্ট্রি থেকে এটি চিরতরে হারিয়ে যাবে।" 
                : "Warning: This action cannot be undone. Once deleted, this entry will be permanently removed from database and client histories."}
            </p>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteSelectionMode(true);
                  if (deleteId) {
                    setSelectedReportIds([deleteId]);
                  }
                  setDeleteId(null);
                }}
                className="px-3.5 py-2 bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 border border-rose-800/30 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                title={language === "bn" ? "একাধিক তথ্য একসাথে ডিলিট করুন" : "Enable selection to delete multiple items"}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{language === "bn" ? "একাধিক ডিলিট" : "Multi-Delete"}</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteId(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-350 hover:text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  {language === "bn" ? "বাতিল করুন" : "Cancel"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const isEngReport = engineeringReports.find(eng => eng.id === deleteId);
                    if (isEngReport) {
                      const newEng = engineeringReports.filter(eng => eng.id !== deleteId);
                      setEngineeringReports(newEng);
                      localStorage.setItem("ALW_ENGINEERING_REPORTS", JSON.stringify(newEng));
                    } else {
                      onUpdateReports(reports.filter(r => r.id !== deleteId));
                    }
                    setSelectedReportIds(selectedReportIds.filter(id => id !== deleteId));
                    setDeleteId(null);
                  }}
                  className="px-5 py-2 bg-[#EF4444] hover:bg-red-500 text-white rounded-xl text-xs font-black transition cursor-pointer shadow-lg shadow-red-500/15"
                >
                  {language === "bn" ? "হ্যাঁ, ডিলিট করুন" : "Yes, Delete Entry"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM RECONCILED CONFIRMATION BULK DELETE DIALOG */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in font-sans">
          <div className="w-full max-w-md bg-slate-900 border border-slate-750 rounded-3xl overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-center gap-3 text-red-550">
              <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center font-bold text-xl">
                ⚠️
              </div>
              <div>
                <h3 className="text-base font-black text-slate-100">
                  {language === "bn" ? "একসঙ্গে একাধিক তথ্য ডিলিট নিশ্চিতকরণ" : "Confirm Bulk Deletion"}
                </h3>
                <p className="text-xs text-slate-400">
                  {language === "bn" 
                    ? `আপনি কি নিশ্চিত যে নির্বাচিত ${selectedReportIds.length}টি অপারেশনাল রেকর্ড ডিলিট করতে চান?` 
                    : `Are you sure you want to delete the ${selectedReportIds.length} selected operational ledger entries?`}
                </p>
              </div>
            </div>

            <div className="max-h-32 overflow-y-auto bg-slate-950 rounded-xl border border-slate-850 p-3 divide-y divide-slate-800 text-xs text-slate-300">
              {activeExcelReports
                .filter(r => selectedReportIds.includes(r.id))
                .map((r, idx) => (
                  <div key={`${r.id}-${idx}`} className="py-1.5 flex justify-between items-center text-slate-350 font-sans">
                    <span className="font-bold truncate max-w-[220px] text-emerald-400">{r.facilityName || (language === "bn" ? "[নামহীন]" : "[Unnamed]")}</span>
                    <span className="font-mono text-[9px] text-slate-500 uppercase shrink-0">{r.emirate} ({r.id})</span>
                  </div>
                ))}
            </div>

            <p className="text-xs text-rose-450 leading-relaxed bg-red-500/5 p-3 rounded-lg border border-red-500/10">
              {language === "bn" 
                ? "সতর্কতা: এই পদক্ষেপটি অপূরণীয়। ডিলিট করার পর ডাটাবেজ এবং ক্লায়েন্ট হিস্ট্রি থেকে এই নির্বাচিত ডাটাগুলো চিরতরে হারিয়ে যাবে।" 
                : "Warning: This action cannot be undone. Once deleted, these selected entries will be permanently removed from database and client histories."}
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowBulkDeleteConfirm(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-350 hover:text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                {language === "bn" ? "বাতিল করুন" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={() => {
                  const newEng = engineeringReports.filter(eng => !selectedReportIds.includes(eng.id));
                  if (newEng.length !== engineeringReports.length) {
                     setEngineeringReports(newEng);
                     localStorage.setItem("ALW_ENGINEERING_REPORTS", JSON.stringify(newEng));
                  }
                  
                  const newReports = reports.filter(r => !selectedReportIds.includes(r.id));
                  if (newReports.length !== reports.length) {
                     onUpdateReports(newReports);
                  }
                  
                  setSelectedReportIds([]);
                  setShowBulkDeleteConfirm(false);
                  setIsDeleteSelectionMode(false);
                }}
                className="px-5 py-2 bg-red-650 hover:bg-red-500 text-white rounded-xl text-xs font-black transition cursor-pointer shadow-lg shadow-red-500/15"
              >
                {language === "bn" ? "হ্যাঁ, ডিলিট করুন" : "Yes, Delete Selected"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REPORT VALIDATION PREVIEW BEFORE DOWNLOAD */}
      {previewReport && (() => {
        const report = previewReport;

        return (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs transition-all animate-fadeIn font-sans">
            <div className="bg-[#FFFDF3] border-2 border-slate-900 max-w-4xl w-full h-[90vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl relative text-slate-900 font-sans border-t-8 border-t-indigo-650 animate-scale-up">
              
              {/* Header Tools (Hidden in Print) */}
              <div className="p-4 bg-slate-900 text-white flex justify-between items-center no-print shrink-0">
                <div className="flex items-center gap-1">
                  <span className="text-rose-550 text-xs">●</span>
                  <span className="text-xs font-black tracking-widest font-mono text-slate-300">
                    {language === "bn" ? "অপারেশন প্রুফ ভিউয়ার" : "AL WAFA STAR PDF COMPLIANCE GATEWAY"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      downloadFullReportPDF(report);
                      setPreviewReport(null);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition duration-150 shadow"
                  >
                    <span className="text-sm">📥</span>
                    <span>
                      {language === "bn" ? "সরাসরি PDF ডাউনলোড" : "Download PDF"}
                    </span>
                  </button>

                  <button
                    onClick={() => setPreviewReport(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition duration-150 shadow border border-slate-700"
                  >
                    <span>✕ {language === "bn" ? "ফিরে যান" : "Close"}</span>
                  </button>
                </div>
              </div>

              {/* Print Friendly Sandbox Tip (Hidden in print) */}
              <div className="px-5 py-2.5 bg-indigo-50 border-b border-indigo-200 text-indigo-900 text-[11px] font-bold flex items-center gap-2 no-print shrink-0">
                <span className="animate-pulse">💡</span>
                <p className="leading-normal">
                  {language === "bn"
                    ? "ইন্টারনেট ব্রাউজার থেকে সরাসরি PDF ডাউনলোড করতে উপরের প্রিন্ট বাটনে চাপ দিন। কোনো কারণে পপআপ বা উইন্ডো না খুললে, স্ক্রীনের উপরে ডানে থাকা 'Open in New Tab' বাটনে ক্লিক করে অ্যাপটি খুলুন।"
                    : "To download as PDF, click print and choose 'Save as PDF'. If the print layout is blocked, please click the native 'Open in New Tab' portal launcher on the top right."}
                </p>
              </div>

              {/* Document page viewport */}
              <div className="flex-1 overflow-auto p-0 bg-[#323639] w-full relative">
                <iframe 
                  srcDoc={report.rawEngineeringData ? generateEngineeringHTML(report.rawEngineeringData, language) : generateReportHTML(report, language)} 
                  className="w-full h-full border-0 bg-[#323639]" 
                  title="Report Preview" 
                />
              </div>

            </div>
          </div>
        );
      })()}

      {/* SCREEN-CENTERED CLINIC/HOSPITAL SELECTION MODAL */}
      {activeModalReportId && (() => {
        const activeModalReport = reports.find(r => r.id === activeModalReportId);
        if (!activeModalReport) return null;

        const currentEmirate = activeModalReport.emirate || "Ajman";
        const currentSelectedValue = activeModalReport.facilityName || "";
        const allSuggestions = getFacilitiesForEmirate(currentEmirate);
        
        // Filter suggestions based on what's typed in the search box
        const filtered = allSuggestions.filter(facility => 
          facility.toLowerCase().includes(facilitySearchQuery.toLowerCase())
        );

        const handleAddAndSelect = (customName: string) => {
          const trimmed = customName.trim();
          if (!trimmed) return;
          
          // Save option to custom storage list for this Emirate
          saveCustomFacility(currentEmirate, trimmed);
          
          // Set values on current spreadsheet item
          handleExcelCellChange(activeModalReport.id, "facilityName", trimmed);
          
          // Clean up states
          setFacilitySearchQuery("");
          setActiveModalReportId(null);
        };

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 animate-fade-in font-sans">
            <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh] animate-scale-up">
              
              {/* Modal Header */}
              <div className="p-3 px-4 border-b border-slate-800 bg-[#0F172A] flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🏥</span>
                  <div>
                    <h3 className="text-xs font-black text-slate-100 uppercase tracking-wide">
                      {language === "bn" ? "ক্লিনিক ও হসপিটাল ম্যানেজার" : "Clinic & Hospital Manager"}
                    </h3>
                    <p className="text-[9px] text-slate-400 font-bold font-mono">
                      {language === "bn" ? `স্থান: ${currentEmirate}` : `Emirate: ${currentEmirate}`}
                    </p>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => {
                    setActiveModalReportId(null);
                    setFacilitySearchQuery("");
                  }}
                  className="p-1 px-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-bold transition-all text-[10px] cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Modal Core Content */}
              <div className="p-4 space-y-3.5 overflow-y-auto flex-1 select-text">
                
                {/* Search & Dynamic Registration Input section */}
                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase tracking-wider font-extrabold text-[#10B981] block">
                    {language === "bn" ? "ক্লিনিক খুঁজুন অথবা নতুন তৈরি করুন" : "Search or Create"}
                  </label>
                  
                  <div className="flex gap-1.5">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={facilitySearchQuery}
                        onChange={(e) => setFacilitySearchQuery(e.target.value)}
                        placeholder={language === "bn" ? "নাম..." : "Clinic/hospital name..."}
                        className="w-full bg-slate-950 text-slate-150 border border-slate-700/80 rounded-lg py-1.5 px-2.5 pr-7 text-[10.5px] font-bold font-sans outline-none focus:border-[#10B981] transition"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddAndSelect(facilitySearchQuery);
                          }
                        }}
                        autoFocus
                      />
                      {facilitySearchQuery && (
                        <button
                          type="button"
                          onClick={() => setFacilitySearchQuery("")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-[10px] cursor-pointer"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={!facilitySearchQuery.trim()}
                      onClick={() => handleAddAndSelect(facilitySearchQuery)}
                      className="bg-[#10B981] disabled:bg-slate-800 disabled:text-slate-600 hover:bg-emerald-400 text-slate-950 font-black px-2.5 rounded-lg text-[10.5px] transition flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed transform active:scale-95 duration-75 shrink-0"
                      title={language === "bn" ? "নতুন নাম যোগ করুন" : "Add as selected"}
                    >
                      <span className="text-xs">➕</span>
                      <span>{language === "bn" ? "যোগ" : "Add"}</span>
                    </button>
                  </div>
                </div>

                {/* Suggestions List container */}
                <div className="space-y-1.5 border-t border-slate-800/80 pt-2.5">
                  <div className="flex justify-between items-center text-[9.5px]">
                    <span className="uppercase tracking-wider font-extrabold text-slate-400">
                      {language === "bn" ? `নিবন্ধিত ক্লিনিক সমূহ` : `Registered`}: {filtered.length}
                    </span>
                    {facilitySearchQuery && (
                      <button 
                        onClick={() => setFacilitySearchQuery("")}
                        className="text-[#10B981] font-bold hover:underline cursor-pointer"
                      >
                        {language === "bn" ? "সবগুলো" : "Reset"}
                      </button>
                    )}
                  </div>

                  <div className="max-h-40 overflow-y-auto bg-slate-950 rounded-xl border border-slate-800/60 p-1.5">
                    {filtered.length === 0 ? (
                      <div className="p-4 text-center space-y-1">
                        <span className="text-lg block">🏥</span>
                        <p className="text-[10px] text-slate-500 font-bold italic">
                          {language === "bn" ? "কোন তথ্য পাওয়া যায়নি" : "No clinics found"}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-0.5">
                        {filtered.map((facility) => {
                          const isSelected = currentSelectedValue.toLowerCase().trim() === facility.toLowerCase().trim();
                          return (
                            <button
                              key={facility}
                              type="button"
                              onClick={() => {
                                handleExcelCellChange(activeModalReport.id, "facilityName", facility);
                                setActiveModalReportId(null);
                                setFacilitySearchQuery("");
                              }}
                              className={`w-full text-left py-1.5 px-2.5 rounded-md text-[10px] font-bold transition flex items-center justify-between gap-1.5 cursor-pointer ${
                                isSelected 
                                  ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/20" 
                                  : "text-slate-200 hover:bg-slate-900 override-border"
                              }`}
                            >
                              <span className="truncate">{facility}</span>
                              {isSelected && (
                                <span className="text-[8px] font-extrabold text-[#10B981] shrink-0 font-mono">
                                  ✓
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-2.5 bg-slate-950 border-t border-slate-850 flex justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setActiveModalReportId(null);
                    setFacilitySearchQuery("");
                  }}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-lg text-[10px] font-bold transition cursor-pointer"
                >
                  {language === "bn" ? "বন্ধ করুন" : "Close"}
                </button>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}
