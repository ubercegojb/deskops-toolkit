/* DeskOps Toolkit — navegação e formulários */
(()=>{
"use strict";
const core=window.DeskOpsCore, $=id=>document.getElementById(id);
const pages={overview:"Visão geral",sla:"Calculadora de SLA",subnet:"Calculadora IPv4",password:"Gerador de senhas"};
function showView(page){
 const target=Object.prototype.hasOwnProperty.call(pages,page)?page:"overview";
 document.querySelectorAll(".view").forEach(el=>{const on=el.id==="view-"+target;el.hidden=!on;el.classList.toggle("is-visible",on);});
 document.querySelectorAll("[data-target]").forEach(el=>{
   const on=el.dataset.target===target;
   if(el.matches(".nav-link,.mobile-link")){el.classList.toggle("is-active",on);if(on)el.setAttribute("aria-current","page");else el.removeAttribute("aria-current");}
 });
 $("page-crumb").textContent=pages[target];document.title=pages[target]+" — DeskOps Toolkit";window.scrollTo(0,0);
}
document.querySelectorAll("[data-target]").forEach(el=>el.addEventListener("click",e=>{e.preventDefault();location.hash=el.dataset.target;showView(el.dataset.target);}));
window.addEventListener("hashchange",()=>showView(location.hash.slice(1)));showView(location.hash.slice(1));
const pad=n=>String(n).padStart(2,"0"),now=new Date();
$("sla-start").value=now.getFullYear()+"-"+pad(now.getMonth()+1)+"-"+pad(now.getDate())+"T"+pad(now.getHours())+":"+pad(now.getMinutes());
$("sla-form").addEventListener("submit",e=>{
 e.preventDefault();const status=$("sla-status");status.classList.remove("error");
 try{
  const val=$("sla-start").value;if(!val)throw Error("Informe a data de abertura.");
  const deadline=core.calculateSla(new Date(val),$("sla-hours").value);
  $("sla-result").textContent=new Intl.DateTimeFormat("pt-BR",{dateStyle:"full",timeStyle:"short"}).format(deadline);
  status.textContent=deadline<new Date()?"O prazo estimado já foi ultrapassado.":"Prazo estimado calculado. Sem feriados ou regras contratuais.";
 }catch(err){$("sla-result").textContent="—";status.textContent=err.message;status.classList.add("error");}
});
$("subnet-form").addEventListener("submit",e=>{
 e.preventDefault();const status=$("subnet-status");status.classList.remove("error");
 try{
  const r=core.calculateSubnet($("subnet-ip").value,$("subnet-prefix").value);
  $("out-network").textContent=r.network+"/"+r.prefix;$("out-mask").textContent=r.mask;
  $("out-broadcast").textContent=r.broadcast;$("out-range").textContent=r.range;
  $("out-hosts").textContent=r.usableCount.toLocaleString("pt-BR");status.textContent="Cálculo concluído.";
 }catch(err){["out-network","out-mask","out-broadcast","out-range","out-hosts"].forEach(k=>$(k).textContent="—");status.textContent=err.message;status.classList.add("error");}
});
$("pw-length").addEventListener("input",()=>$("pw-length-value").textContent=$("pw-length").value);
$("password-form").addEventListener("submit",e=>{
 e.preventDefault();const status=$("pw-message");status.classList.remove("error");
 try{
  $("pw-output").value=core.generatePassword({length:Number($("pw-length").value),lower:$("pw-lower").checked,upper:$("pw-upper").checked,numbers:$("pw-numbers").checked,symbols:$("pw-symbols").checked});
  status.textContent="Senha gerada localmente. Clique no ícone para copiar.";
 }catch(err){$("pw-output").value="";status.textContent=err.message;status.classList.add("error");}
});
$("pw-copy").addEventListener("click",async()=>{
 const password=$("pw-output").value,status=$("pw-message");
 if(!password){status.textContent="Gere uma senha antes de copiar.";return;}
 try{
  if(navigator.clipboard&&window.isSecureContext)await navigator.clipboard.writeText(password);
  else{const input=$("pw-output");input.select();if(!document.execCommand("copy"))throw Error("Cópia não permitida.");input.setSelectionRange(0,0);}
  status.classList.remove("error");status.textContent="Senha copiada.";
 }catch(_){status.classList.add("error");status.textContent="Selecione e copie a senha manualmente.";}
});
})();