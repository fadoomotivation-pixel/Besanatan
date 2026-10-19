(function(){
const C=window.BS_CONFIG,$=s=>document.querySelector(s),inr=n=>"₹"+Number(n).toLocaleString("en-IN");
const P=[...C.KANYA_PACKAGES].sort((a,b)=>b.qty-a.qty);let sel=C.KANYA_PACKAGES.find(p=>p.badge)||P[0],step=1;
$("#pkgs").innerHTML=P.map(p=>`<label class="pk${p.id===sel.id?" sel":""}" data-id="${p.id}">${p.badge?`<span class="bd">⭐ सबसे लोकप्रिय · नवरात्रि</span>`:""}<input type="radio" name="pk" value="${p.id}"${p.id===sel.id?" checked":""}><div class="row"><span class="q">${p.qty} कन्या पूजन<small style="display:block;font-weight:400">${p.qty} Kanya Pujan</small></span><span class="p">${inr(p.price)}</span></div><small>भोजन + चुनरी + दक्षिणा + फ़ोटो/वीडियो प्रमाण</small></label>`).join("");
const lbl=()=>sel.qty+" कन्या पूजन · "+inr(sel.price);
function upd(){document.querySelectorAll(".pk").forEach(l=>l.classList.toggle("sel",l.dataset.id===sel.id));$("#sLbl").textContent=lbl();$("#amt").textContent=inr(sel.price);$("#amtLbl").textContent=sel.qty+" कन्या पूजन";$("#sum2").textContent="चयनित: "+lbl();}
$("#pkgs").addEventListener("change",e=>{sel=C.KANYA_PACKAGES.find(p=>p.id===e.target.value);upd();});upd();
const err=t=>$("#err").textContent=t||"";
const phone=()=>{let p=$("#phone").value.replace(/\D/g,"");if(p.length===12&&p.startsWith("91"))p=p.slice(2);if(p.length===11&&p.startsWith("0"))p=p.slice(1);return p;};
function show(n){step=n;document.querySelectorAll("[data-step]").forEach(d=>d.classList.toggle("hide",+d.dataset.step!==n));
 document.querySelectorAll("#prog div").forEach((d,i)=>d.classList.toggle("on",i<n));$("#back").classList.toggle("hide",n===1);
 $("#next").textContent=n===3?"✅ भुगतान हो गया →":n===4?"🙏 बुकिंग पूरी करें":"आगे बढ़ें →";err();
 if(n>=3)loadSb().catch(()=>{sbMod=null;});
 if(n===4)$("#sum4").textContent=lbl()+" · संकल्प: "+$("#name").value.trim();
 $("#book").scrollIntoView({behavior:"smooth",block:"start"});}
function valid(n){if(n===2){if(!$("#name").value.trim()){err("कृपया संकल्प का नाम भरें।");$("#name").focus();return false;}
 if(!/^[6-9]\d{9}$/.test(phone())){err("कृपया सही 10 अंकों का मोबाइल नंबर भरें।");$("#phone").focus();return false;}}return true;}
$("#back").onclick=()=>show(step-1);
$("#next").onclick=()=>{if(!valid(step))return;if(step<4)return show(step+1);submit();};
$("#shot").addEventListener("change",e=>{const f=e.target.files[0],pv=$("#preview");err();if(f&&f.type.startsWith("image/")){pv.src=URL.createObjectURL(f);pv.style.display="block";}else{pv.style.display="none";if(f)err("कृपया केवल फ़ोटो (image) चुनें।");}});
let sbMod=null;const loadSb=()=>sbMod||(sbMod=import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm"));
async function submit(){const fl=$("#shot").files[0];
 if(!fl||!fl.type.startsWith("image/"))return err("कृपया भुगतान का स्क्रीनशॉट अपलोड करें।");
 if(fl.size>5*1024*1024)return err("स्क्रीनशॉट 5MB से छोटा होना चाहिए।");
 const d=new Date(),ref="BS-"+String(d.getFullYear()).slice(2)+String(d.getMonth()+1).padStart(2,"0")+String(d.getDate()).padStart(2,"0")+"-"+Math.random().toString(36).slice(2,6).toUpperCase().padEnd(4,"X");
 const b=$("#next");b.disabled=true;b.textContent="भेजा जा रहा है…";
 try{const {createClient}=await loadSb();
  const sb=createClient(C.SUPABASE_URL,C.SUPABASE_KEY,{auth:{persistSession:false,autoRefreshToken:false,storageKey:"bs-public"}});
  const ext=((fl.name.split(".").pop()||"jpg").toLowerCase().replace(/[^a-z0-9]/g,"")||"jpg").slice(0,5);
  const path="bookings/"+ref+"/"+crypto.randomUUID()+"."+ext;
  const up=await sb.storage.from(C.SCREENSHOT_BUCKET).upload(path,fl,{contentType:fl.type||"image/jpeg",upsert:false});
  if(up.error)throw{hi:"स्क्रीनशॉट अपलोड नहीं हो सका, कृपया दोबारा प्रयास करें।"};
  const ins=await sb.from("bs_bookings").insert({booking_ref:ref,seva:"कन्या भोजन / Kanya Bhojan",package:sel.qty+" कन्या पूजन",quantity:sel.qty,amount:sel.price,sankalp_name:$("#name").value.trim(),gotra:$("#gotra").value.trim()||null,phone:phone(),preferred_date:$("#date").value||null,message:(($("#msg").value.trim()||"")+" [landing:kanya-pujan]").trim(),screenshot_path:path});
  if(ins.error)throw{hi:"बुकिंग सहेजी नहीं जा सकी, कृपया दोबारा प्रयास करें।"};
 }catch(x){if(!(x&&x.hi))sbMod=null;err((x&&x.hi)||"नेटवर्क समस्या — कृपया दोबारा प्रयास करें।");b.disabled=false;b.textContent="🙏 बुकिंग पूरी करें";return;}
 $("#lf").classList.add("hide");$("#prog").classList.add("hide");$("#thanks").classList.remove("hide");$("#ref").textContent=ref;$("#tsum").textContent=lbl()+" · संकल्प: "+$("#name").value.trim();
 $("#sticky").classList.add("off");$("#book").scrollIntoView({block:"start"});window.bsBooked=ref;}
// sticky CTA hides while booking section is on screen
const st=$("#sticky");new IntersectionObserver(es=>es.forEach(e=>st.classList.toggle("off",e.isIntersecting||!!window.bsBooked)),{threshold:.05}).observe($("#book"));
})();
