import { useState, useEffect } from "react";
const BIN_ID = "69e07dc136566621a8bb9605";
const API_KEY = "$2a$10$7I57YfKB5iuZ7KJm7E2Fy.EYLzGq05IGFNNt4poNKIwCs3t9i3qJm";
const BIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;
const SOURCES = ["Facebook", "Instagram", "WhatsApp", "TikTok", "Referral", "Other"];
const STATUSES = ["New", "Contacted", "Qualified", "Proposal Sent", "Won", "Lost"];
const TEAM = ["Unassigned", "Rami", "Khaled", "George jr", "Ahmed", "New Sales"];
const COLORS = { blue: "#0078d4", blueLight: "#e8f2fc", green: "#107c10", greenLight: "#dff6dd", red: "#a4262c", redLight: "#fde7e9", gray: "#f3f2f1", border: "#edebe9", text: "#323130", muted: "#605e5c" };
const statusColor = (s) => { if (s==="New") return {bg:COLORS.blueLight,color:COLORS.blue}; if (s==="Contacted") return {bg:"#fff4ce",color:"#5d4037"}; if (s==="Qualified") return {bg:"#e8f5e9",color:"#2e7d32"}; if (s==="Proposal Sent") return {bg:"#ede7f6",color:"#4527a0"}; if (s==="Won") return {bg:COLORS.greenLight,color:COLORS.green}; if (s==="Lost") return {bg:COLORS.redLight,color:COLORS.red}; return {bg:COLORS.gray,color:COLORS.text}; };
const now = () => new Date().toISOString();
const fmtDate = (iso) => { if (!iso) return "—"; const d = new Date(iso); return d.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})+" "+d.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"}); };
const emptyForm = { name:"", phone:"", email:"", source:"Facebook", campaign:"", notes:"" };
export default function App() {
  const [tab,setTab]=useState("submit");
  const [leads,setLeads]=useState([]);
  const [form,setForm]=useState(emptyForm);
  const [submitting,setSubmitting]=useState(false);
  const [loading,setLoading]=useState(false);
  const [saved,setSaved]=useState(null);
  const [edits,setEdits]=useState({});
  const [toast,setToast]=useState(null);
  const [search,setSearch]=useState("");
  const [filterStatus,setFilterStatus]=useState("All");
  const [filterSource,setFilterSource]=useState("All");
  const showToast=(msg,type="success")=>{setToast({msg,type});setTimeout(()=>setToast(null),3000);};
  const fetchLeads=async()=>{ setLoading(true); try{ const res=await fetch(BIN_URL+"/latest",{headers:{"X-Master-Key":API_KEY}}); const data=await res.json(); setLeads(data.record?.leads||[]); }catch{ showToast("Failed to fetch leads","error"); } setLoading(false); };
  const saveLeads=async(updated)=>{ try{ const res=await fetch(BIN_URL,{method:"PUT",headers:{"Content-Type":"application/json","X-Master-Key":API_KEY},body:JSON.stringify({leads:updated})}); if(!res.ok) throw new Error(); setLeads(updated); return true; }catch{ showToast("Failed to save","error"); return false; } };
  useEffect(()=>{fetchLeads();},[]);
  const handleSubmit=async()=>{ if(!form.name||!form.phone) return showToast("Name and Phone are required","error"); setSubmitting(true); const newLead={id:Date.now().toString(),...form,status:"New",assignedTo:"Unassigned",salesNotes:"",submittedAt:now(),updatedAt:now()}; const ok=await saveLeads([newLead,...leads]); if(ok){setForm(emptyForm);showToast("Lead submitted successfully!");} setSubmitting(false); };
  const startEdit=(lead)=>setEdits(prev=>({...prev,[lead.id]:{status:lead.status,assignedTo:lead.assignedTo,salesNotes:lead.salesNotes}}));
  const updateEdit=(id,field,val)=>setEdits(prev=>({...prev,[id]:{...prev[id],[field]:val}}));
  const saveLead=async(id)=>{ const edit=edits[id]; const updated=leads.map(l=>l.id===id?{...l,...edit,updatedAt:now()}:l); setSaved(id); const ok=await saveLeads(updated); if(ok){showToast("Lead updated!");setEdits(prev=>{const n={...prev};delete n[id];return n;});} setTimeout(()=>setSaved(null),1500); };
  const filtered=leads.filter(l=>{ const q=search.toLowerCase(); const ms=!q||l.name?.toLowerCase().includes(q)||l.phone?.includes(q)||l.email?.toLowerCase().includes(q)||l.campaign?.toLowerCase().includes(q); return ms&&(filterStatus==="All"||l.status===filterStatus)&&(filterSource==="All"||l.source===filterSource); });
  const counts=STATUSES.reduce((acc,s)=>{acc[s]=leads.filter(l=>l.status===s).length;return acc;},{});
  return (
    <div style={{fontFamily:"'Segoe UI',sans-serif",minHeight:"100vh",background:"#faf9f8",color:COLORS.text}}>
      <div style={{background:COLORS.blue,padding:"0 32px",display:"flex",alignItems:"center",gap:16,height:52}}>
        <span style={{color:"#fff",fontWeight:700,fontSize:18}}>Zettanet</span>
        <span style={{color:"rgba(255,255,255,0.5)",fontSize:18}}>|</span>
        <span style={{color:"#fff",fontSize:15}}>Lead Tracker</span>
        <div style={{marginLeft:"auto",display:"flex",gap:4}}>
          {["submit","pipeline"].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{background:tab===t?"rgba(255,255,255,0.2)":"transparent",color:"#fff",border:"none",borderRadius:4,padding:"6px 18px",fontWeight:tab===t?600:400,cursor:"pointer",fontSize:14}}>
              {t==="submit"?"Submit Lead":"Pipeline"}
            </button>
          ))}
        </div>
      </div>
      {toast&&<div style={{position:"fixed",top:16,right:24,zIndex:999,background:toast.type==="error"?COLORS.red:COLORS.green,color:"#fff",padding:"10px 20px",borderRadius:6,fontSize:14,boxShadow:"0 4px 12px rgba(0,0,0,0.15)"}}>{toast.msg}</div>}
      <div style={{maxWidth:1200,margin:"0 auto",padding:"32px 24px"}}>
        {tab==="submit"&&(
          <div style={{maxWidth:560}}>
            <h2 style={{margin:"0 0 6px",fontSize:22}}>Submit New Lead</h2>
            <p style={{color:COLORS.muted,margin:"0 0 28px",fontSize:14}}>Fill in the lead details from Meta campaigns</p>
            <div style={{background:"#fff",border:`1px solid ${COLORS.border}`,borderRadius:8,padding:28,display:"flex",flexDirection:"column",gap:18}}>
              {[["Full Name *","name","text"],["Phone Number *","phone","tel"],["Email","email","email"],["Campaign Name","campaign","text"]].map(([label,field,type])=>(
                <div key={field}>
                  <label style={{display:"block",fontSize:13,fontWeight:600,marginBottom:6}}>{label}</label>
                  <input type={type} value={form[field]} onChange={e=>setForm({...form,[field]:e.target.value})} style={{width:"100%",padding:"8px 12px",border:`1px solid ${COLORS.border}`,borderRadius:4,fontSize:14,boxSizing:"border-box",outline:"none"}}/>
                </div>
              ))}
              <div>
                <label style={{display:"block",fontSize:13,fontWeight:600,marginBottom:6}}>Source</label>
                <select value={form.source} onChange={e=>setForm({...form,source:e.target.value})} style={{width:"100%",padding:"8px 12px",border:`1px solid ${COLORS.border}`,borderRadius:4,fontSize:14,background:"#fff"}}>
                  {SOURCES.map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{display:"block",fontSize:13,fontWeight:600,marginBottom:6}}>Notes</label>
                <textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} rows={3} style={{width:"100%",padding:"8px 12px",border:`1px solid ${COLORS.border}`,borderRadius:4,fontSize:14,resize:"vertical",boxSizing:"border-box"}}/>
              </div>
              <button onClick={handleSubmit} disabled={submitting} style={{background:submitting?COLORS.muted:COLORS.blue,color:"#fff",border:"none",borderRadius:4,padding:"10px 0",fontSize:15,fontWeight:600,cursor:submitting?"not-allowed":"pointer"}}>
                {submitting?"Submitting...":"Submit Lead"}
              </button>
            </div>
          </div>
        )}
        {tab==="pipeline"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,flexWrap:"wrap",gap:12}}>
              <div><h2 style={{margin:"0 0 4px",fontSize:22}}>Lead Pipeline</h2><p style={{color:COLORS.muted,margin:0,fontSize:14}}>{leads.length} total leads</p></div>
              <button onClick={fetchLeads} style={{background:COLORS.blue,color:"#fff",border:"none",borderRadius:4,padding:"8px 18px",fontSize:14,cursor:"pointer"}}>↻ Refresh</button>
            </div>
            <div style={{display:"flex",gap:10,marginBottom:24,flexWrap:"wrap"}}>
              {STATUSES.map(s=>{const sc=statusColor(s);return(<div key={s} style={{background:sc.bg,border:`1px solid ${sc.color}22`,borderRadius:6,padding:"8px 16px",textAlign:"center",minWidth:80}}><div style={{fontWeight:700,fontSize:22,color:sc.color}}>{counts[s]||0}</div><div style={{fontSize:11,color:sc.color,fontWeight:600}}>{s}</div></div>);})}
            </div>
            <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
              <input placeholder="Search name, phone, email..." value={search} onChange={e=>setSearch(e.target.value)} style={{flex:1,minWidth:200,padding:"8px 12px",border:`1px solid ${COLORS.border}`,borderRadius:4,fontSize:14}}/>
              <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{padding:"8px 12px",border:`1px solid ${COLORS.border}`,borderRadius:4,fontSize:14,background:"#fff"}}><option>All</option>{STATUSES.map(s=><option key={s}>{s}</option>)}</select>
              <select value={filterSource} onChange={e=>setFilterSource(e.target.value)} style={{padding:"8px 12px",border:`1px solid ${COLORS.border}`,borderRadius:4,fontSize:14,background:"#fff"}}><option>All</option>{SOURCES.map(s=><option key={s}>{s}</option>)}</select>
            </div>
            {loading?<div style={{textAlign:"center",padding:60,color:COLORS.muted}}>Loading leads...</div>:filtered.length===0?<div style={{textAlign:"center",padding:60,color:COLORS.muted}}>No leads found</div>:(
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:13,background:"#fff",border:`1px solid ${COLORS.border}`,borderRadius:8}}>
                  <thead><tr style={{background:COLORS.gray}}>{["Name","Phone","Email","Source","Campaign","Submitted","Status","Assigned To","Sales Notes","Last Updated",""].map(h=><th key={h} style={{padding:"10px 12px",textAlign:"left",fontWeight:600,fontSize:12,color:COLORS.muted,borderBottom:`1px solid ${COLORS.border}`,whiteSpace:"nowrap"}}>{h}</th>)}</tr></thead>
                  <tbody>
                    {filtered.map((lead,i)=>{
                      const edit=edits[lead.id];
                      const sc=statusColor(edit?.status||lead.status);
                      return(
                        <tr key={lead.id} style={{borderBottom:`1px solid ${COLORS.border}`,background:i%2===0?"#fff":"#faf9f8",cursor:"pointer"}} onClick={()=>!edit&&startEdit(lead)}>
                          <td style={{padding:"10px 12px",fontWeight:600}}>{lead.name}</td>
                          <td style={{padding:"10px 12px"}}>{lead.phone}</td>
                          <td style={{padding:"10px 12px",color:COLORS.blue}}>{lead.email||"—"}</td>
                          <td style={{padding:"10px 12px"}}>{lead.source}</td>
                          <td style={{padding:"10px 12px"}}>{lead.campaign||"—"}</td>
                          <td style={{padding:"10px 12px",whiteSpace:"nowrap",color:COLORS.muted}}>{fmtDate(lead.submittedAt)}</td>
                          <td style={{padding:"10px 12px"}}>{edit?<select value={edit.status} onChange={e=>updateEdit(lead.id,"status",e.target.value)} style={{padding:"4px 8px",border:`1px solid ${COLORS.border}`,borderRadius:4,fontSize:12,background:"#fff"}}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select>:<span style={{background:sc.bg,color:sc.color,padding:"3px 10px",borderRadius:12,fontSize:11,fontWeight:600}}>{lead.status}</span>}</td>
                          <td style={{padding:"10px 12px"}}>{edit?<select value={edit.assignedTo} onChange={e=>updateEdit(lead.id,"assignedTo",e.target.value)} style={{padding:"4px 8px",border:`1px solid ${COLORS.border}`,borderRadius:4,fontSize:12,background:"#fff"}}>{TEAM.map(t=><option key={t}>{t}</option>)}</select>:lead.assignedTo||"Unassigned"}</td>
                          <td style={{padding:"10px 12px"}}>{edit?<input value={edit.salesNotes} onChange={e=>updateEdit(lead.id,"salesNotes",e.target.value)} style={{padding:"4px 8px",border:`1px solid ${COLORS.border}`,borderRadius:4,fontSize:12,width:140}}/>:<span style={{color:COLORS.muted}}>{lead.salesNotes||"—"}</span>}</td>
                          <td style={{padding:"10px 12px",whiteSpace:"nowrap",color:COLORS.muted,fontSize:12}}>{fmtDate(lead.updatedAt)}</td>
                          <td style={{padding:"10px 12px"}}>{edit&&<button onClick={e=>{e.stopPropagation();saveLead(lead.id);}} style={{background:saved===lead.id?COLORS.green:COLORS.blue,color:"#fff",border:"none",borderRadius:4,padding:"5px 14px",fontSize:12,cursor:"pointer",fontWeight:600}}>{saved===lead.id?"✓":"Save"}</button>}</td>
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
