import { useState } from "react";

const SOURCES = ["Facebook", "Instagram", "WhatsApp", "TikTok", "Referral", "Other"];
const SERVICES = ["Home Automation", "ELV Solution", "Both HA and ELV"];
const PROPERTY_STATUSES = ["Under Construction", "Finishing Stage", "Ready to Buy"];
const LOCATIONS = ["Abu Dhabi", "Al Ain", "Dubai", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Um Al Quwain"];
const STATUSES = ["New", "Contacted", "Qualified", "Proposal Sent", "Won", "Lost"];
const TEAM = ["Unassigned", "Rami", "Khaled", "George jr", "Ahmed", "New Sales"];

const COLORS = {
  red: "#e7373e", redLight: "#fdeaeb", green: "#107c10", greenLight: "#dff6dd",
  darkRed: "#a4262c", darkRedLight: "#fde7e9", gray: "#f3f2f1", border: "#edebe9",
  text: "#323130", muted: "#605e5c",
};

const statusColor = (s) => {
  if (s === "New") return { bg: COLORS.redLight, color: COLORS.red };
  if (s === "Contacted") return { bg: "#fff4ce", color: "#5d4037" };
  if (s === "Qualified") return { bg: "#e8f5e9", color: "#2e7d32" };
  if (s === "Proposal Sent") return { bg: "#ede7f6", color: "#4527a0" };
  if (s === "Won") return { bg: COLORS.greenLight, color: COLORS.green };
  if (s === "Lost") return { bg: COLORS.darkRedLight, color: COLORS.darkRed };
  return { bg: COLORS.gray, color: COLORS.text };
};

const fmtDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const emptyForm = {
  name: "", phone: "", email: "",
  source: "Facebook", service: "Home Automation",
  propertyStatus: "Under Construction", location: "Abu Dhabi",
  campaign: "", notes: ""
};

export default function App() {
  const [tab, setTab] = useState("submit");
  const [leads, setLeads] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [edits, setEdits] = useState({});
  const [saved, setSaved] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const handleSubmit = () => {
    if (!form.name || !form.phone) return showToast("Name and Phone are required", "error");
    const newLead = { id: Date.now().toString(), ...form, status: "New", assignedTo: "Unassigned", salesNotes: "", submittedAt: new Date().toISOString() };
    setLeads([newLead, ...leads]);
    setForm(emptyForm);
    showToast("Lead submitted successfully!");
  };

  const startEdit = (lead) => setEdits(p => ({ ...p, [lead.id]: { status: lead.status, assignedTo: lead.assignedTo, salesNotes: lead.salesNotes } }));
  const updateEdit = (id, f, v) => setEdits(p => ({ ...p, [id]: { ...p[id], [f]: v } }));
  const saveLead = (id) => {
    setLeads(leads.map(l => l.id === id ? { ...l, ...edits[id] } : l));
    setSaved(id); setTimeout(() => setSaved(null), 1500);
    setEdits(p => { const n = { ...p }; delete n[id]; return n; });
    showToast("Lead updated!");
  };

  const filtered = leads.filter(l => {
    const q = search.toLowerCase();
    const ms = !q || l.name?.toLowerCase().includes(q) || l.phone?.includes(q);
    return ms && (filterStatus === "All" || l.status === filterStatus);
  });

  const counts = STATUSES.reduce((acc, s) => { acc[s] = leads.filter(l => l.status === s).length; return acc; }, {});
  const sel = { width: "100%", padding: "8px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 4, fontSize: 14, background: "#fff" };

  return (
    <div style={{ fontFamily: "'Segoe UI',sans-serif", minHeight: "100vh", background: "#faf9f8", color: COLORS.text }}>
      {/* Header */}
      <div style={{ background: COLORS.red, padding: "0 24px", display: "flex", alignItems: "center", gap: 12, height: 52 }}>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>Zettanet</span>
        <span style={{ color: "rgba(255,255,255,0.4)" }}>|</span>
        <span style={{ color: "#fff", fontSize: 15 }}>Lead Tracker</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
          {["submit", "pipeline"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ background: tab === t ? "rgba(255,255,255,0.2)" : "transparent", color: "#fff", border: "none", borderRadius: 4, padding: "6px 16px", fontWeight: tab === t ? 600 : 400, cursor: "pointer", fontSize: 14 }}>
              {t === "submit" ? "Submit Lead" : `Pipeline (${leads.length})`}
            </button>
          ))}
        </div>
      </div>

      {toast && <div style={{ position: "fixed", top: 16, right: 16, zIndex: 999, background: toast.type === "error" ? COLORS.darkRed : COLORS.green, color: "#fff", padding: "10px 20px", borderRadius: 6, fontSize: 14, boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>{toast.msg}</div>}

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px" }}>

        {tab === "submit" && (
          <div style={{ maxWidth: 520 }}>
            <h2 style={{ margin: "0 0 4px", fontSize: 20 }}>Submit New Lead</h2>
            <p style={{ color: COLORS.muted, margin: "0 0 24px", fontSize: 13 }}>Fill in the lead details from Meta campaigns</p>
            <div style={{ background: "#fff", border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>

              {[["Full Name *", "name", "text"], ["Phone Number *", "phone", "tel"], ["Email", "email", "email"], ["Campaign Name", "campaign", "text"]].map(([label, field, type]) => (
                <div key={field}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 5 }}>{label}</label>
                  <input type={type} value={form[field]} onChange={e => setForm({ ...form, [field]: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 4, fontSize: 14, boxSizing: "border-box", outline: "none" }} />
                </div>
              ))}

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 5 }}>Source</label>
                <select value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} style={sel}>
                  {SOURCES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 5 }}>Service</label>
                <select value={form.service} onChange={e => setForm({ ...form, service: e.target.value })} style={sel}>
                  {SERVICES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 5 }}>Property Status</label>
                <select value={form.propertyStatus} onChange={e => setForm({ ...form, propertyStatus: e.target.value })} style={sel}>
                  {PROPERTY_STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 5 }}>Location</label>
                <select value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} style={sel}>
                  {LOCATIONS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 5 }}>Notes</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3}
                  style={{ width: "100%", padding: "8px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 4, fontSize: 14, resize: "vertical", boxSizing: "border-box" }} />
              </div>

              <button onClick={handleSubmit} style={{ background: COLORS.red, color: "#fff", border: "none", borderRadius: 4, padding: "10px 0", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
                Submit Lead
              </button>
            </div>
          </div>
        )}

        {tab === "pipeline" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <div>
                <h2 style={{ margin: "0 0 4px", fontSize: 20 }}>Lead Pipeline</h2>
                <p style={{ color: COLORS.muted, margin: 0, fontSize: 13 }}>{leads.length} total leads</p>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
              {STATUSES.map(s => { const sc = statusColor(s); return (
                <div key={s} style={{ background: sc.bg, border: `1px solid ${sc.color}33`, borderRadius: 6, padding: "6px 14px", textAlign: "center", minWidth: 75 }}>
                  <div style={{ fontWeight: 700, fontSize: 20, color: sc.color }}>{counts[s] || 0}</div>
                  <div style={{ fontSize: 10, color: sc.color, fontWeight: 600 }}>{s}</div>
                </div>
              ); })}
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <input placeholder="Search name or phone..." value={search} onChange={e => setSearch(e.target.value)}
                style={{ flex: 1, padding: "8px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 4, fontSize: 13 }} />
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: "8px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 4, fontSize: 13, background: "#fff" }}>
                <option>All</option>{STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60, color: COLORS.muted }}>No leads yet — submit one from the Submit Lead tab!</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, background: "#fff", border: `1px solid ${COLORS.border}`, borderRadius: 8 }}>
                  <thead>
                    <tr style={{ background: COLORS.gray }}>
                      {["Name", "Phone", "Source", "Service", "Property Status", "Location", "Date", "Status", "Assigned To", "Notes", ""].map(h => (
                        <th key={h} style={{ padding: "9px 10px", textAlign: "left", fontWeight: 600, fontSize: 11, color: COLORS.muted, borderBottom: `1px solid ${COLORS.border}`, whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((lead, i) => {
                      const edit = edits[lead.id];
                      const sc = statusColor(edit?.status || lead.status);
                      return (
                        <tr key={lead.id} style={{ borderBottom: `1px solid ${COLORS.border}`, background: i % 2 === 0 ? "#fff" : "#faf9f8", cursor: "pointer" }}
                          onClick={() => !edit && startEdit(lead)}>
                          <td style={{ padding: "9px 10px", fontWeight: 600 }}>{lead.name}</td>
                          <td style={{ padding: "9px 10px" }}>{lead.phone}</td>
                          <td style={{ padding: "9px 10px" }}>{lead.source}</td>
                          <td style={{ padding: "9px 10px" }}>{lead.service}</td>
                          <td style={{ padding: "9px 10px" }}>{lead.propertyStatus}</td>
                          <td style={{ padding: "9px 10px" }}>{lead.location}</td>
                          <td style={{ padding: "9px 10px", whiteSpace: "nowrap", color: COLORS.muted }}>{fmtDate(lead.submittedAt)}</td>
                          <td style={{ padding: "9px 10px" }}>
                            {edit
                              ? <select value={edit.status} onChange={e => updateEdit(lead.id, "status", e.target.value)} style={{ padding: "3px 6px", border: `1px solid ${COLORS.border}`, borderRadius: 4, fontSize: 11 }}>
                                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                                </select>
                              : <span style={{ background: sc.bg, color: sc.color, padding: "2px 8px", borderRadius: 10, fontSize: 10, fontWeight: 600 }}>{lead.status}</span>
                            }
                          </td>
                          <td style={{ padding: "9px 10px" }}>
                            {edit
                              ? <select value={edit.assignedTo} onChange={e => updateEdit(lead.id, "assignedTo", e.target.value)} style={{ padding: "3px 6px", border: `1px solid ${COLORS.border}`, borderRadius: 4, fontSize: 11 }}>
                                  {TEAM.map(t => <option key={t}>{t}</option>)}
                                </select>
                              : lead.assignedTo
                            }
                          </td>
                          <td style={{ padding: "9px 10px" }}>
                            {edit
                              ? <input value={edit.salesNotes} onChange={e => updateEdit(lead.id, "salesNotes", e.target.value)} style={{ padding: "3px 6px", border: `1px solid ${COLORS.border}`, borderRadius: 4, fontSize: 11, width: 100 }} />
                              : <span style={{ color: COLORS.muted }}>{lead.salesNotes || "—"}</span>
                            }
                          </td>
                          <td style={{ padding: "9px 10px" }}>
                            {edit && <button onClick={e => { e.stopPropagation(); saveLead(lead.id); }}
                              style={{ background: saved === lead.id ? COLORS.green : COLORS.red, color: "#fff", border: "none", borderRadius: 4, padding: "4px 10px", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>
                              {saved === lead.id ? "✓" : "Save"}
                            </button>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}