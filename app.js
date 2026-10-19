(function(){
const C=window.BS_CONFIG,inr=n=>"₹"+Number(n).toLocaleString("en-IN"),$=s=>document.querySelector(s);
document.querySelectorAll("[data-cfg]").forEach(e=>e.textContent=C[e.dataset.cfg]||"");
const kp=$("#kanya-grid");
if(kp)kp.innerHTML=C.KANYA_PACKAGES.map(p=>`<div class="card ${p.badge?'pop':''}">${p.badge?`<span class="badge">${p.badge}</span>`:''}<h3>${p.qty} कन्या भोजन</h3><div class="en">${p.qty} Kanya Bhojan</div><div class="price">${inr(p.price)}</div><p style="font-size:14px">${C.KANYA_INCLUDES}</p><a class="btn" href="booking.html?seva=kanya&pkg=${p.id}">बुक करें</a></div>`).join("");
const sg=$("#seva-grid");
if(sg)sg.innerHTML=C.SEVAS.map(s=>`<div class="card"><h3>${s.hi}</h3><div class="en">${s.en}</div><div class="price">${inr(s.price)}</div><div style="font-size:14px">${s.unit} (सुझाई गई राशि)</div><br><a class="btn alt" href="booking.html?seva=${s.id}">बुक करें</a></div>`).join("");
const f=$("#bookForm");if(!f)return;
const seva=$("#seva"),pkg=$("#pkg"),qty=$("#qty"),q=new URLSearchParams(location.search);
seva.innerHTML=`<option value="kanya">कन्या भोजन / Kanya Bhojan</option>`+C.SEVAS.map(s=>`<option value="${s.id}">${s.hi} / ${s.en}</option>`).join("");
pkg.innerHTML=C.KANYA_PACKAGES.map(p=>`<option value="${p.id}">${p.qty} कन्या — ${inr(p.price)}</option>`).join("");
if(q.get("seva"))seva.value=q.get("seva");if(q.get("pkg"))pkg.value=q.get("pkg");
$("#qrimg").src=C.UPI_QR;
function calc(){const k=seva.value==="kanya";$("#pkgWrap").classList.toggle("hidden",!k);$("#qtyWrap").classList.toggle("hidden",k);
let t,label;if(k){const p=C.KANYA_PACKAGES.find(x=>x.id===pkg.value);t=p.price;label=p.qty+" कन्या भोजन";}
else{const s=C.SEVAS.find(x=>x.id===seva.value);const n=Math.max(1,parseInt(qty.value)||1);t=s.price*n;label=s.hi+" × "+n+" ("+s.unit+")";$("#unit").textContent="इकाई / Unit: "+s.unit+" — "+inr(s.price);}
$("#total").textContent=inr(t);$("#payAmt").textContent=inr(t);return{t,label};}
[seva,pkg,qty].forEach(e=>e.addEventListener("input",calc));calc();window.__bsCalc=calc;
$("#shot").addEventListener("change",e=>{const fl=e.target.files[0];const pv=$("#preview");if(fl&&fl.type.startsWith("image/")){pv.src=URL.createObjectURL(fl);pv.style.display="block";}else pv.style.display="none";});
if(!C.WEB3FORMS_KEY&&/^(localhost|127\.|0\.0)/.test(location.hostname))$("#devNotice").classList.remove("hidden");
f.addEventListener("submit",async e=>{e.preventDefault();const er=$("#formErr");er.textContent="";
let ph=$("#phone").value.replace(/\D/g,"");if(ph.length===12&&ph.startsWith("91"))ph=ph.slice(2);
if(!/^[6-9]\d{9}$/.test(ph)){er.textContent="कृपया सही 10 अंकों का मोबाइल नंबर डालें / Enter a valid 10-digit Indian mobile number";return;}
if(!$("#name").value.trim()){er.textContent="संकल्प नाम आवश्यक है"+" / Sankalp name required";return;}
const fl=$("#shot").files[0];if(!fl||!fl.type.startsWith("image/")){er.textContent="भुगतान का स्क्रीनशॉट (image) अपलोड करें / Upload payment screenshot";return;}
const {t,label}=calc(),d=new Date(),ref="BS-"+String(d.getFullYear()).slice(2)+String(d.getMonth()+1).padStart(2,"0")+String(d.getDate()).padStart(2,"0")+"-"+Math.random().toString(36).slice(2,6).toUpperCase();
const btn=$("#submitBtn");btn.disabled=true;btn.textContent="भेजा जा रहा है…";
let noAttach=false;
if(C.WEB3FORMS_KEY){const base={access_key:C.WEB3FORMS_KEY,subject:"नई बुकिंग "+ref+" — "+label,from_name:"Be Sanatan Website",booking_ref:ref,name:$("#name").value,phone:ph,gotra:$("#gotra").value,seva:seva.options[seva.selectedIndex].text,package:label,amount:inr(t),date:$("#date").value,message:$("#msg").value};
const send=async(withFile)=>{const fd=new FormData();Object.entries(base).forEach(([k,v])=>fd.append(k,v));if(withFile)fd.append("attachment",fl);else fd.append("screenshot_note","Screenshot not attached (upload failed) — ask customer to share it");const r=await fetch("https://api.web3forms.com/submit",{method:"POST",body:fd});return r.json();};
let ok=false;try{ok=(await send(true)).success;}catch(x){}
if(!ok){try{ok=(await send(false)).success;noAttach=ok;}catch(x){}}
if(!ok){er.textContent="भेजने में समस्या हुई, कृपया दोबारा प्रयास करें / Submission failed, please retry.";btn.disabled=false;btn.textContent="बुकिंग भेजें";return;}}
f.classList.add("hidden");$("#payBox").classList.add("hidden");$("#thanks").classList.remove("hidden");
$("#ref").textContent=ref;$("#tSum").textContent=label+" · "+inr(t);$("#keepShot").classList.toggle("hidden",!noAttach);scrollTo(0,0);});
})();
