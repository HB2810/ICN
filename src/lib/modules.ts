// Module/schema definitions for all CSSD registers.
// Keeping schemas data-driven lets us reuse one Register component.

export type FieldType = "text" | "number" | "date" | "select" | "textarea" | "computed" | "image";

export interface Field {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  required?: boolean;
  compute?: (row: Record<string, any>) => string;
  readonly?: boolean;
}

export interface ModuleDef {
  slug: string;
  table: string;
  title: string;
  short: string;
  fields: Field[];
}

export const MODULES: ModuleDef[] = [
  {
    slug: "sterilization-load",
    table: "sterilization_load",
    title: "Sterilization Load Register",
    short: "Load Register",
    fields: [
      { key: "date", label: "Date", type: "date", required: true },
      { key: "loadNumber", label: "Load Number", type: "text", readonly: true },
      { key: "sterilizerId", label: "Sterilizer ID", type: "text", required: true },
      { key: "cycleType", label: "Cycle Type", type: "select", options: ["Steam", "ETO", "Plasma"], required: true },
      { key: "department", label: "Department", type: "text" },
      { key: "setName", label: "Set Name", type: "text" },
      { key: "quantity", label: "Quantity", type: "number" },
      { key: "temperature", label: "Temperature (°C)", type: "number" },
      { key: "time", label: "Time (min)", type: "number" },
      { key: "ciResult", label: "Chemical Indicator Result", type: "select", options: ["Pass", "Fail"] },
      { key: "biNumber", label: "Biological Indicator Number", type: "text" },
      { key: "biResult", label: "Biological Indicator Result", type: "select", options: ["Pass", "Fail", "Pending"] },
      { key: "operator", label: "Operator", type: "text" },
      { key: "supervisor", label: "Supervisor", type: "text" },
      { key: "remarks", label: "Remarks", type: "textarea" },
    ],
  },
  {
    slug: "biological-indicator",
    table: "biological_indicator",
    title: "Biological Indicator Register",
    short: "BI Register",
    fields: [
      { key: "date", label: "Date", type: "date", required: true },
      { key: "loadNumber", label: "Load Number", type: "text" },
      { key: "sterilizerNumber", label: "Sterilizer Number", type: "text" },
      { key: "biLotNumber", label: "BI Lot Number", type: "text" },
      { key: "incubationStart", label: "Incubation Start", type: "date" },
      { key: "incubationEnd", label: "Incubation End", type: "date" },
      { key: "result", label: "Result", type: "select", options: ["Pass", "Fail", "Pending"] },
      { key: "verifiedBy", label: "Verified By", type: "text" },
      { key: "capa", label: "CAPA", type: "textarea" },
    ],
  },
  {
    slug: "bowie-dick",
    table: "bowie_dick",
    title: "Bowie Dick Test Register",
    short: "Bowie Dick",
    fields: [
      { key: "date", label: "Date", type: "date", required: true },
      { key: "sterilizer", label: "Sterilizer", type: "text" },
      { key: "testResult", label: "Test Result", type: "select", options: ["Pass", "Fail"] },
      { key: "checkedBy", label: "Checked By", type: "text" },
      { key: "remarks", label: "Remarks", type: "textarea" },
      { key: "testStripImage", label: "Test Strip Image", type: "image" },
    ],
  },
  {
    slug: "leak-test",
    table: "leak_test",
    title: "Leak Test Register",
    short: "Leak Test",
    fields: [
      { key: "date", label: "Date", type: "date", required: true },
      { key: "sterilizer", label: "Sterilizer", type: "text" },
      { key: "testResult", label: "Test Result", type: "select", options: ["Pass", "Fail"] },
      { key: "verifiedBy", label: "Verified By", type: "text" },
      { key: "remarks", label: "Remarks", type: "textarea" },
    ],
  },
  {
    slug: "instrument-tracking",
    table: "instrument_tracking",
    title: "Instrument Tracking Register",
    short: "Instrument Tracking",
    fields: [
      { key: "date", label: "Date", type: "date", required: true },
      { key: "batchNumber", label: "Batch Number", type: "text" },
      { key: "setName", label: "Set Name", type: "text" },
      { key: "department", label: "Department", type: "text" },
      { key: "quantity", label: "Quantity", type: "number" },
      { key: "sterilizedDate", label: "Sterilized Date", type: "date" },
      {
        key: "expiryDate",
        label: "Expiry Date",
        type: "computed",
        readonly: true,
        compute: (r) => {
          if (!r.sterilizedDate) return "";
          const d = new Date(r.sterilizedDate);
          d.setDate(d.getDate() + 30);
          return d.toISOString().slice(0, 10);
        },
      },
      { key: "issuedBy", label: "Issued By", type: "text" },
      { key: "receivedBy", label: "Received By", type: "text" },
    ],
  },
  {
    slug: "distribution",
    table: "distribution",
    title: "Distribution Register",
    short: "Distribution",
    fields: [
      { key: "date", label: "Date", type: "date", required: true },
      { key: "department", label: "Department", type: "text" },
      { key: "setName", label: "Set Name", type: "text" },
      { key: "batchNumber", label: "Batch Number", type: "text" },
      { key: "quantityIssued", label: "Quantity Issued", type: "number" },
      { key: "issuedBy", label: "Issued By", type: "text" },
      { key: "receivedBy", label: "Received By", type: "text" },
    ],
  },
  {
    slug: "recall",
    table: "recall",
    title: "Recall Register",
    short: "Recall",
    fields: [
      { key: "recallNumber", label: "Recall Number", type: "text" },
      { key: "date", label: "Date", type: "date", required: true },
      { key: "batchNumber", label: "Batch Number", type: "text" },
      { key: "reason", label: "Reason", type: "textarea" },
      { key: "department", label: "Department", type: "text" },
      { key: "quantityRecalled", label: "Quantity Recalled", type: "number" },
      { key: "actionTaken", label: "Action Taken", type: "textarea" },
      { key: "closureDate", label: "Closure Date", type: "date" },
      { key: "approvedBy", label: "Approved By", type: "text" },
    ],
  },
  {
    slug: "instrument-damage",
    table: "instrument_damage",
    title: "Instrument Damage Register",
    short: "Damage",
    fields: [
      { key: "date", label: "Date", type: "date", required: true },
      { key: "instrument", label: "Instrument", type: "text" },
      { key: "setName", label: "Set Name", type: "text" },
      { key: "damageType", label: "Damage Type", type: "text" },
      { key: "action", label: "Repair or Discard", type: "select", options: ["Repair", "Discard"] },
      { key: "reportedBy", label: "Reported By", type: "text" },
      { key: "approvedBy", label: "Approved By", type: "text" },
    ],
  },
  {
    slug: "sterile-store",
    table: "sterile_store",
    title: "Sterile Store Monitoring",
    short: "Sterile Store",
    fields: [
      { key: "date", label: "Date", type: "date", required: true },
      { key: "temperature", label: "Temperature (°C)", type: "number" },
      { key: "humidity", label: "Humidity (%)", type: "number" },
      { key: "cleaningDone", label: "Cleaning Done", type: "select", options: ["Yes", "No"] },
      { key: "observation", label: "Observation", type: "textarea" },
      { key: "checkedBy", label: "Checked By", type: "text" },
    ],
  },
  {
    slug: "equipment-maintenance",
    table: "equipment_maintenance",
    title: "Equipment Maintenance & Calibration",
    short: "Equipment",
    fields: [
      { key: "equipmentId", label: "Equipment ID", type: "text", required: true },
      { key: "equipmentName", label: "Equipment Name", type: "text" },
      { key: "calibrationDate", label: "Calibration Date", type: "date" },
      {
        key: "nextDueDate",
        label: "Next Due Date",
        type: "computed",
        readonly: true,
        compute: (r) => {
          if (!r.calibrationDate) return "";
          const d = new Date(r.calibrationDate);
          d.setFullYear(d.getFullYear() + 1);
          return d.toISOString().slice(0, 10);
        },
      },
      { key: "vendor", label: "Vendor", type: "text" },
      { key: "certificateNumber", label: "Certificate Number", type: "text" },
      {
        key: "status",
        label: "Status",
        type: "computed",
        readonly: true,
        compute: (r) => {
          if (!r.calibrationDate) return "";
          const d = new Date(r.calibrationDate);
          d.setFullYear(d.getFullYear() + 1);
          return d.getTime() < Date.now() ? "OVERDUE" : "VALID";
        },
      },
    ],
  },
  {
    slug: "quality-capa",
    table: "quality_capa",
    title: "Quality Indicators & CAPA",
    short: "Quality & CAPA",
    fields: [
      { key: "month", label: "Month", type: "text", required: true },
      { key: "totalLoads", label: "Total Loads", type: "number" },
      { key: "failedLoads", label: "Failed Loads", type: "number" },
      {
        key: "failureRate",
        label: "Failure Rate (%)",
        type: "computed",
        readonly: true,
        compute: (r) => {
          const t = Number(r.totalLoads) || 0;
          const f = Number(r.failedLoads) || 0;
          return t > 0 ? ((f / t) * 100).toFixed(2) : "0";
        },
      },
      { key: "biPlanned", label: "BI Planned", type: "number" },
      { key: "biCompleted", label: "BI Completed", type: "number" },
      {
        key: "biCompliance",
        label: "BI Compliance (%)",
        type: "computed",
        readonly: true,
        compute: (r) => {
          const p = Number(r.biPlanned) || 0;
          const c = Number(r.biCompleted) || 0;
          return p > 0 ? ((c / p) * 100).toFixed(2) : "0";
        },
      },
      { key: "recallRate", label: "Recall Rate (%)", type: "number" },
      { key: "capaInitiated", label: "CAPA Initiated", type: "number" },
      { key: "capaClosed", label: "CAPA Closed", type: "number" },
    ],
  },
];

export function getModule(slug: string): ModuleDef | undefined {
  return MODULES.find((m) => m.slug === slug);
}
