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
f.addEventListener("submit",async e=>{e.preventDefault();const er=$("#formErr");er.textContent="";
let ph=$("#phone").value.replace(/\D/g,"");if(ph.length===12&&ph.startsWith("91"))ph=ph.slice(2);
if(!/^[6-9]\d{9}$/.test(ph)){er.textContent="कृपया सही 10 अंकों का मोबाइल नंबर डालें / Enter a valid 10-digit Indian mobile number";return;}
if(!$("#name").value.trim()){er.textContent="संकल्प नाम आवश्यक है"+" / Sankalp name required";return;}
const fl=$("#shot").files[0];if(!fl||!fl.type.startsWith("image/")){er.textContent="भुगतान का स्क्रीनशॉट (image) अपलोड करें / Upload payment screenshot";return;}
const {t,label}=calc(),d=new Date(),ref="BS-"+String(d.getFullYear()).slice(2)+String(d.getMonth()+1).padStart(2,"0")+String(d.getDate()).padStart(2,"0")+"-"+Math.random().toString(36).slice(2,6).toUpperCase();
const btn=$("#submitBtn");btn.disabled=true;btn.textContent="भेजा जा रहा है…";
try{const {createClient}=await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm");
const sb=createClient(C.SUPABASE_URL,C.SUPABASE_KEY,{auth:{persistSession:false,autoRefreshToken:false,storageKey:"bs-public"}});
const ext=((fl.name.split(".").pop()||"jpg").toLowerCase().replace(/[^a-z0-9]/g,"")||"jpg").slice(0,5);
if(fl.size>5*1024*1024){throw {hi:"स्क्रीनशॉट 5MB से छोटा होना चाहिए / Screenshot must be under 5MB"};}
const path="bookings/"+ref+"/"+crypto.randomUUID()+"."+ext;
const up=await sb.storage.from(C.SCREENSHOT_BUCKET).upload(path,fl,{contentType:fl.type||"image/jpeg",upsert:false});
if(up.error)throw {hi:"स्क्रीनशॉट अपलोड नहीं हो सका, कृपया दोबारा प्रयास करें / Screenshot upload failed, please retry."};
const isK=seva.value==="kanya",kp=C.KANYA_PACKAGES.find(x=>x.id===pkg.value);
const row={booking_ref:ref,seva:seva.options[seva.selectedIndex].text,package:label,quantity:isK?kp.qty:Math.max(1,parseInt(qty.value)||1),amount:t,sankalp_name:$("#name").value.trim(),gotra:$("#gotra").value.trim()||null,phone:ph,preferred_date:$("#date").value||null,message:$("#msg").value.trim()||null,screenshot_path:path};
const ins=await sb.from("bs_bookings").insert(row);
if(ins.error)throw {hi:"बुकिंग सहेजी नहीं जा सकी, कृपया दोबारा प्रयास करें / Booking could not be saved, please retry."};
}catch(x){er.textContent=(x&&x.hi)||"नेटवर्क समस्या, कृपया दोबारा प्रयास करें / Network error, please retry.";btn.disabled=false;btn.textContent="बुकिंग भेजें / Submit Booking";return;}
try{window.fbq&&fbq("track","Purchase",{value:t,currency:"INR",content_name:label,content_type:"product",num_items:(seva.value==="kanya"?C.KANYA_PACKAGES.find(x=>x.id===pkg.value).qty:Math.max(1,parseInt(qty.value)||1))},{eventID:ref});}catch(e){}
f.classList.add("hidden");$("#payBox").classList.add("hidden");$("#thanks").classList.remove("hidden");
$("#ref").textContent=ref;$("#tSum").textContent=label+" · "+inr(t);scrollTo(0,0);});
})();
