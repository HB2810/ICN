// Lightweight i18n for English + Gujarati.
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "gu";

const KEY = "cssd:lang";

type Dict = Record<string, string>;

const EN: Dict = {
  // Brand / chrome
  "brand.subtitle": "Sterile Processing",
  "brand.tag": "CSSD Management",
  "nav.dashboard": "Dashboard",
  "nav.reports": "Reports",
  "nav.logout": "Logout",
  "lang.label": "Language",

  // Login
  "login.title": "CSSD Management System",
  "login.subtitle": "Central Sterile Supply Department",
  "login.username": "Username",
  "login.password": "Password",
  "login.signin": "Sign In",
  "login.invalid": "Invalid credentials",
  "login.demoTitle": "Authorized accounts",
  "login.roleICN": "ICN Officer (Infection Control Nurse)",
  "login.roleStaff": "CSSD Staff",
  "login.roleViewer": "Read Only Auditor",

  // Dashboard
  "dash.title": "Dashboard",
  "dash.subtitle": "Real-time metrics across all CSSD activities",
  "kpi.totalLoads": "Total Loads Processed",
  "kpi.totalBI": "Total BI Tests",
  "kpi.biPass": "BI Pass Rate",
  "kpi.failRate": "Sterilization Failure Rate",
  "kpi.recallRate": "Recall Rate",
  "kpi.damageRate": "Instrument Damage Rate",
  "kpi.pm": "PM Compliance",
  "chart.monthlyLoad": "Monthly Load Trend",
  "chart.dept": "Department-wise Instrument Distribution",
  "chart.biTrend": "BI Compliance Trend (%)",
  "chart.failTrend": "Sterilization Failure Trend",
  "chart.equipStatus": "Equipment Maintenance Status",
  "chart.empty": "No data yet",

  // Register
  "reg.records": "records",
  "reg.record": "record",
  "reg.search": "Search records...",
  "reg.add": "Add Record",
  "reg.excel": "Excel",
  "reg.pdf": "PDF",
  "reg.print": "Print",
  "reg.actions": "Actions",
  "reg.noRecords": "No records yet.",
  "reg.prev": "Previous",
  "reg.next": "Next",
  "reg.pageOf": "Page {0} of {1}",
  "reg.new": "New Record",
  "reg.edit": "Edit Record",
  "reg.details": "Record Details",
  "reg.cancel": "Cancel",
  "reg.save": "Save",
  "reg.delete": "Delete this record?",
  "reg.upload": "Upload Image",
  "reg.replace": "Replace Image",
  "reg.remove": "Remove",
  "reg.viewImage": "View Image",
  "reg.noImage": "No image attached",

  // Reports
  "reports.title": "Reports",
  "reports.subtitle": "Export any register as Excel, PDF or print",
};

const GU: Dict = {
  "brand.subtitle": "સ્ટરાઇલ પ્રોસેસિંગ",
  "brand.tag": "CSSD વ્યવસ્થાપન",
  "nav.dashboard": "ડેશબોર્ડ",
  "nav.reports": "અહેવાલો",
  "nav.logout": "લૉગઆઉટ",
  "lang.label": "ભાષા",

  "login.title": "CSSD વ્યવસ્થાપન સિસ્ટમ",
  "login.subtitle": "સેન્ટ્રલ સ્ટરાઇલ સપ્લાય વિભાગ",
  "login.username": "વપરાશકર્તાનામ",
  "login.password": "પાસવર્ડ",
  "login.signin": "સાઇન ઇન",
  "login.invalid": "અમાન્ય ઓળખપત્ર",
  "login.demoTitle": "અધિકૃત ખાતાઓ",
  "login.roleICN": "ICN અધિકારી (ઈન્ફેક્શન કંટ્રોલ નર્સ)",
  "login.roleStaff": "CSSD સ્ટાફ",
  "login.roleViewer": "ફક્ત વાંચન ઓડિટર",

  "dash.title": "ડેશબોર્ડ",
  "dash.subtitle": "બધી CSSD પ્રવૃત્તિઓના રીઅલ-ટાઈમ આંકડા",
  "kpi.totalLoads": "કુલ લોડ પ્રક્રિયા",
  "kpi.totalBI": "કુલ BI પરીક્ષણો",
  "kpi.biPass": "BI પાસ દર",
  "kpi.failRate": "સ્ટરિલાઈઝેશન નિષ્ફળતા દર",
  "kpi.recallRate": "રિકોલ દર",
  "kpi.damageRate": "સાધન નુકસાન દર",
  "kpi.pm": "PM અનુપાલન",
  "chart.monthlyLoad": "માસિક લોડ વલણ",
  "chart.dept": "વિભાગ મુજબ સાધન વિતરણ",
  "chart.biTrend": "BI અનુપાલન વલણ (%)",
  "chart.failTrend": "સ્ટરિલાઈઝેશન નિષ્ફળતા વલણ",
  "chart.equipStatus": "સાધન જાળવણી સ્થિતિ",
  "chart.empty": "હજુ કોઈ ડેટા નથી",

  "reg.records": "રેકોર્ડ્સ",
  "reg.record": "રેકોર્ડ",
  "reg.search": "રેકોર્ડ શોધો...",
  "reg.add": "રેકોર્ડ ઉમેરો",
  "reg.excel": "એક્સેલ",
  "reg.pdf": "પીડીએફ",
  "reg.print": "પ્રિન્ટ",
  "reg.actions": "ક્રિયાઓ",
  "reg.noRecords": "હજુ કોઈ રેકોર્ડ નથી.",
  "reg.prev": "પાછળ",
  "reg.next": "આગળ",
  "reg.pageOf": "પૃષ્ઠ {0} / {1}",
  "reg.new": "નવો રેકોર્ડ",
  "reg.edit": "રેકોર્ડ સંપાદિત કરો",
  "reg.details": "રેકોર્ડ વિગતો",
  "reg.cancel": "રદ કરો",
  "reg.save": "સાચવો",
  "reg.delete": "આ રેકોર્ડ કાઢી નાખવો છે?",
  "reg.upload": "છબી અપલોડ કરો",
  "reg.replace": "છબી બદલો",
  "reg.remove": "દૂર કરો",
  "reg.viewImage": "છબી જુઓ",
  "reg.noImage": "કોઈ છબી જોડેલી નથી",

  "reports.title": "અહેવાલો",
  "reports.subtitle": "કોઈપણ રજિસ્ટરને એક્સેલ, પીડીએફ અથવા પ્રિન્ટ તરીકે નિકાસ કરો",
};

// Module titles + field labels (per-module)
const MOD_EN: Dict = {
  "mod.sterilization-load": "Sterilization Load Register",
  "mod.sterilization-load.short": "Load Register",
  "mod.biological-indicator": "Biological Indicator Register",
  "mod.biological-indicator.short": "BI Register",
  "mod.bowie-dick": "Bowie Dick Test Register",
  "mod.bowie-dick.short": "Bowie Dick",
  "mod.leak-test": "Leak Test Register",
  "mod.leak-test.short": "Leak Test",
  "mod.instrument-tracking": "Instrument Tracking Register",
  "mod.instrument-tracking.short": "Instrument Tracking",
  "mod.distribution": "Distribution Register",
  "mod.distribution.short": "Distribution",
  "mod.recall": "Recall Register",
  "mod.recall.short": "Recall",
  "mod.instrument-damage": "Instrument Damage Register",
  "mod.instrument-damage.short": "Damage",
  "mod.sterile-store": "Sterile Store Monitoring",
  "mod.sterile-store.short": "Sterile Store",
  "mod.equipment-maintenance": "Equipment Maintenance & Calibration",
  "mod.equipment-maintenance.short": "Equipment",
  "mod.quality-capa": "Quality Indicators & CAPA",
  "mod.quality-capa.short": "Quality & CAPA",
};

const MOD_GU: Dict = {
  "mod.sterilization-load": "સ્ટરિલાઈઝેશન લોડ રજિસ્ટર",
  "mod.sterilization-load.short": "લોડ રજિસ્ટર",
  "mod.biological-indicator": "બાયોલોજિકલ ઈન્ડિકેટર રજિસ્ટર",
  "mod.biological-indicator.short": "BI રજિસ્ટર",
  "mod.bowie-dick": "બોવી-ડિક ટેસ્ટ રજિસ્ટર",
  "mod.bowie-dick.short": "બોવી-ડિક",
  "mod.leak-test": "લીક ટેસ્ટ રજિસ્ટર",
  "mod.leak-test.short": "લીક ટેસ્ટ",
  "mod.instrument-tracking": "સાધન ટ્રેકિંગ રજિસ્ટર",
  "mod.instrument-tracking.short": "સાધન ટ્રેકિંગ",
  "mod.distribution": "વિતરણ રજિસ્ટર",
  "mod.distribution.short": "વિતરણ",
  "mod.recall": "રિકોલ રજિસ્ટર",
  "mod.recall.short": "રિકોલ",
  "mod.instrument-damage": "સાધન નુકસાન રજિસ્ટર",
  "mod.instrument-damage.short": "નુકસાન",
  "mod.sterile-store": "સ્ટરાઇલ સ્ટોર મોનિટરિંગ",
  "mod.sterile-store.short": "સ્ટરાઇલ સ્ટોર",
  "mod.equipment-maintenance": "સાધન જાળવણી અને કેલિબ્રેશન",
  "mod.equipment-maintenance.short": "સાધનો",
  "mod.quality-capa": "ગુણવત્તા સૂચકાંકો અને CAPA",
  "mod.quality-capa.short": "ગુણવત્તા અને CAPA",
};

// Field labels - common keys reused across modules
const FIELD_GU: Dict = {
  "f.date": "તારીખ",
  "f.loadNumber": "લોડ નંબર",
  "f.sterilizerId": "સ્ટરિલાઈઝર ID",
  "f.cycleType": "ચક્ર પ્રકાર",
  "f.department": "વિભાગ",
  "f.setName": "સેટ નામ",
  "f.quantity": "જથ્થો",
  "f.temperature": "તાપમાન (°C)",
  "f.time": "સમય (મિનિટ)",
  "f.ciResult": "કેમિકલ ઈન્ડિકેટર પરિણામ",
  "f.biNumber": "બાયોલોજિકલ ઈન્ડિકેટર નંબર",
  "f.biResult": "બાયોલોજિકલ ઈન્ડિકેટર પરિણામ",
  "f.operator": "ઓપરેટર",
  "f.supervisor": "સુપરવાઈઝર",
  "f.remarks": "ટિપ્પણીઓ",
  "f.sterilizerNumber": "સ્ટરિલાઈઝર નંબર",
  "f.biLotNumber": "BI લોટ નંબર",
  "f.incubationStart": "ઈન્ક્યુબેશન શરૂઆત",
  "f.incubationEnd": "ઈન્ક્યુબેશન અંત",
  "f.result": "પરિણામ",
  "f.verifiedBy": "ચકાસનાર",
  "f.capa": "CAPA",
  "f.sterilizer": "સ્ટરિલાઈઝર",
  "f.testResult": "પરીક્ષણ પરિણામ",
  "f.checkedBy": "તપાસનાર",
  "f.testStripImage": "ટેસ્ટ સ્ટ્રિપ છબી",
  "f.batchNumber": "બેચ નંબર",
  "f.sterilizedDate": "સ્ટરિલાઈઝ તારીખ",
  "f.expiryDate": "સમાપ્તિ તારીખ",
  "f.issuedBy": "જારી કરનાર",
  "f.receivedBy": "મેળવનાર",
  "f.quantityIssued": "જારી જથ્થો",
  "f.recallNumber": "રિકોલ નંબર",
  "f.reason": "કારણ",
  "f.quantityRecalled": "રિકોલ થયેલ જથ્થો",
  "f.actionTaken": "લેવાયેલ પગલાં",
  "f.closureDate": "બંધ થવાની તારીખ",
  "f.approvedBy": "મંજૂર કરનાર",
  "f.instrument": "સાધન",
  "f.damageType": "નુકસાન પ્રકાર",
  "f.action": "સમારકામ અથવા નિકાલ",
  "f.reportedBy": "જાણ કરનાર",
  "f.humidity": "ભેજ (%)",
  "f.cleaningDone": "સફાઈ થઈ",
  "f.observation": "નિરીક્ષણ",
  "f.equipmentId": "સાધન ID",
  "f.equipmentName": "સાધન નામ",
  "f.calibrationDate": "કેલિબ્રેશન તારીખ",
  "f.nextDueDate": "આગામી નિયત તારીખ",
  "f.vendor": "વિક્રેતા",
  "f.certificateNumber": "પ્રમાણપત્ર નંબર",
  "f.status": "સ્થિતિ",
  "f.month": "મહિનો",
  "f.totalLoads": "કુલ લોડ",
  "f.failedLoads": "નિષ્ફળ લોડ",
  "f.failureRate": "નિષ્ફળતા દર (%)",
  "f.biPlanned": "BI આયોજિત",
  "f.biCompleted": "BI પૂર્ણ",
  "f.biCompliance": "BI અનુપાલન (%)",
  "f.recallRate": "રિકોલ દર (%)",
  "f.capaInitiated": "CAPA શરૂ કરેલ",
  "f.capaClosed": "CAPA બંધ કરેલ",
};

const DICTS = {
  en: { ...EN, ...MOD_EN },
  gu: { ...GU, ...MOD_GU, ...FIELD_GU },
};

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: string, fallback?: string) => string }>({
  lang: "en",
  setLang: () => {},
  t: (k, f) => f ?? k,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === "gu" || saved === "en") setLangState(saved);
    } catch {}
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(KEY, l);
    } catch {}
  };

  const t = (key: string, fallback?: string) => {
    const d = DICTS[lang] as Dict;
    return d[key] ?? fallback ?? key;
  };

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export function useI18n() {
  return useContext(Ctx);
}

// Helper for field labels — falls back to English label.
export function tField(t: (k: string, f?: string) => string, key: string, englishLabel: string) {
  return t(`f.${key}`, englishLabel);
}
