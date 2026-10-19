import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
const C=window.BS_CONFIG,$=s=>document.querySelector(s),inr=n=>"₹"+Number(n||0).toLocaleString("en-IN");
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const sb=createClient(C.SUPABASE_URL,C.SUPABASE_KEY,{auth:{storageKey:"bs-admin-auth",persistSession:true,detectSessionInUrl:true}});
const REDIRECT=location.origin+location.pathname;
let mode="login",all=[];
function setMode(m){mode=m;document.querySelectorAll(".tabs button").forEach(b=>b.classList.toggle("on",b.dataset.m===m));
 $("#pwWrap").classList.toggle("hidden",m==="forgot");$("#pw").required=m!=="forgot";
 $("#pw").autocomplete=m==="signup"?"new-password":"current-password";
 $("#authBtn").textContent={login:"Login",signup:"Sign up / पासवर्ड सेट करें",forgot:"Send reset link"}[m];$("#authMsg").textContent="";}
document.querySelectorAll(".tabs button").forEach(b=>b.onclick=()=>setMode(b.dataset.m));
$("#authForm").onsubmit=async e=>{e.preventDefault();const em=$("#em").value.trim(),pw=$("#pw").value,msg=$("#authMsg");msg.textContent="…";let r;
 if(mode==="login")r=await sb.auth.signInWithPassword({email:em,password:pw});
 else if(mode==="signup"){r=await sb.auth.signUp({email:em,password:pw,options:{emailRedirectTo:REDIRECT}});if(!r.error){msg.innerHTML='<span class="ok">ईमेल पर पुष्टि लिंक भेजा गया है। Check your email to confirm, then log in.</span>';return;}}
 else{r=await sb.auth.resetPasswordForEmail(em,{redirectTo:REDIRECT});if(!r.error){msg.innerHTML='<span class="ok">Reset link sent (if the account exists).</span>';return;}}
 if(r.error)msg.textContent="त्रुटि / Error: "+r.error.message;};
$("#logout").onclick=async e=>{e.preventDefault();await sb.auth.signOut();location.reload();};
$("#setPw").onclick=async()=>{const r=await sb.auth.updateUser({password:$("#npw").value});$("#resetMsg").textContent=r.error?r.error.message:"Password updated ✓";if(!r.error){$("#resetBox").classList.add("hidden");show();}};
sb.auth.onAuthStateChange((ev)=>{if(ev==="PASSWORD_RECOVERY"){$("#authBox").classList.add("hidden");$("#resetBox").classList.remove("hidden");}else if(ev==="SIGNED_IN"||ev==="SIGNED_OUT")setTimeout(show,0);});
async function show(){const {data:{session}}=await sb.auth.getSession();
 ["#authBox","#denied","#dash"].forEach(s=>$(s).classList.add("hidden"));
 if(!session){$("#authBox").classList.remove("hidden");$("#who").textContent="";$("#logout").classList.add("hidden");return;}
 if(!$("#resetBox").classList.contains("hidden"))return;
 $("#who").textContent=session.user.email;$("#logout").classList.remove("hidden");
 const a=await sb.from("bs_admins").select("email").limit(1);
 if(a.error||!a.data.length){$("#denied").classList.remove("hidden");return;}
 $("#dash").classList.remove("hidden");load();}
async function load(){const r=await sb.from("bs_bookings").select("*").order("created_at",{ascending:false}).limit(5000);
 if(r.error){$("#count").textContent="Error: "+r.error.message;return;}all=r.data;
 const sv=[...new Set(all.map(b=>b.seva))].sort(),cur=$("#fSeva").value;$("#fSeva").innerHTML='<option value="">सभी सेवा / All seva</option>'+sv.map(s=>`<option>${esc(s)}</option>`).join("");$("#fSeva").value=cur;render();}
function filtered(){const st=$("#fStatus").value,sv=$("#fSeva").value,fr=$("#fFrom").value,to=$("#fTo").value,q=$("#fQ").value.trim().toLowerCase();
 return all.filter(b=>{const d=b.created_at.slice(0,10);return(!st||b.status===st)&&(!sv||b.seva===sv)&&(!fr||d>=fr)&&(!to||d<=to)&&(!q||[b.sankalp_name,b.phone,b.booking_ref].join(" ").toLowerCase().includes(q));});}
function render(){const L=filtered();$("#count").textContent=L.length+" bookings";
 const by=s=>L.filter(b=>!s||b.status===s);$("#stats").innerHTML=[["कुल / Total",""],["Pending","pending"],["Verified","verified"],["Completed","completed"],["Rejected","rejected"]].map(([n,s])=>{const x=by(s);return`<div class="stat">${n}<b>${x.length}</b>${inr(x.reduce((a,b)=>a+b.amount,0))}</div>`}).join("");
 $("#rows").innerHTML=L.map(b=>`<tr class="r" data-id="${b.id}"><td>${new Date(b.created_at).toLocaleString("en-IN",{timeZone:"Asia/Kolkata",dateStyle:"short",timeStyle:"short"})}</td><td>${esc(b.booking_ref)}</td><td>${esc(b.sankalp_name)}</td><td>${esc(b.phone)}</td><td>${esc(b.package||b.seva)}</td><td>${inr(b.amount)}</td><td><span class="st ${b.status}">${b.status}</span></td></tr>`).join("")||'<tr><td colspan="7">कोई बुकिंग नहीं / No bookings</td></tr>';
 document.querySelectorAll("tr.r").forEach(tr=>tr.onclick=()=>detail(tr.dataset.id));}
["#fStatus","#fSeva","#fFrom","#fTo","#fQ"].forEach(s=>$(s).addEventListener("input",render));
$("#reload").onclick=e=>{e.preventDefault();load();};
async function detail(id){const b=all.find(x=>x.id===id);let img="<p>No screenshot</p>";
 if(b.screenshot_path){const s=await sb.storage.from(C.SCREENSHOT_BUCKET).createSignedUrl(b.screenshot_path,600);img=s.error?`<p>Screenshot error: ${esc(s.error.message)}</p>`:`<a href="${s.data.signedUrl}" target="_blank" rel="noopener"><img src="${s.data.signedUrl}" alt="payment screenshot"></a><p class="small">Click to open full size (link valid 10 min)</p>`;}
 const f=[["Ref",b.booking_ref],["Created",new Date(b.created_at).toLocaleString("en-IN",{timeZone:"Asia/Kolkata"})+" IST"],["Seva",b.seva],["Package",b.package],["Quantity",b.quantity],["Amount",inr(b.amount)],["Sankalp name",b.sankalp_name],["Gotra",b.gotra],["Phone",b.phone],["Preferred date",b.preferred_date],["Message",b.message]];
 $("#mbody").innerHTML=`<h3>${esc(b.booking_ref)}</h3><div class="kv">${f.map(([k,v])=>`<b>${k}</b><span>${esc(v)}</span>`).join("")}</div><hr>${img}<label>Status</label><select id="mSt">${["pending","verified","completed","rejected"].map(s=>`<option ${s===b.status?"selected":""}>${s}</option>`).join("")}</select><label>Admin note</label><textarea id="mNote" rows="3">${esc(b.admin_note)}</textarea><p id="mMsg" class="small"></p><button class="btn" id="mSave">Save</button> <button class="btn alt" id="mClose">Close</button>`;
 $("#modal").classList.remove("hidden");$("#mClose").onclick=()=>$("#modal").classList.add("hidden");
 $("#mSave").onclick=async()=>{const up={status:$("#mSt").value,admin_note:$("#mNote").value.trim()||null};const r=await sb.from("bs_bookings").update(up).eq("id",id).select();
  if(r.error||!r.data.length){$("#mMsg").textContent="Save failed: "+(r.error?r.error.message:"no permission");return;}Object.assign(b,up);$("#mMsg").innerHTML='<span class="ok">Saved ✓</span>';render();};}
$("#modal").onclick=e=>{if(e.target.id==="modal")$("#modal").classList.add("hidden");};
$("#csv").onclick=()=>{const cols=["booking_ref","created_at","seva","package","quantity","amount","sankalp_name","gotra","phone","preferred_date","message","status","admin_note","screenshot_path"];
 const q=v=>{v=String(v??"");return/[",\n]/.test(v)||/^[=+\-@]/.test(v)?'"'+(/^[=+\-@]/.test(v)?"'":"")+v.replace(/"/g,'""')+'"':v;};
 const csv="\ufeff"+[cols.join(","),...filtered().map(b=>cols.map(c=>q(b[c])).join(","))].join("\n");
 const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download="besanatan-bookings-"+new Date().toISOString().slice(0,10)+".csv";a.click();};
show();
