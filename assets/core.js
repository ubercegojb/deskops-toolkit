/* DeskOps Toolkit — funções sem dependências */
(function(root){
"use strict";
function calculateSla(opening,hours){
 const date=new Date(opening), duration=Number(hours);
 if(Number.isNaN(date.getTime())||!Number.isFinite(duration)||duration<=0||duration>1000)throw Error("Informe data e prazo válido (até 1000 horas).");
 let remain=Math.round(duration*3600000),guard=0;
 while(remain>0&&guard++<2000){
  const weekday=date.getDay(),start=new Date(date),end=new Date(date);
  start.setHours(9,0,0,0);end.setHours(18,0,0,0);
  if(weekday===0||weekday===6||date>=end){date.setDate(date.getDate()+1);date.setHours(9,0,0,0);continue;}
  if(date<start)date.setHours(9,0,0,0);
  const available=end.getTime()-date.getTime(),used=Math.min(available,remain);
  date.setTime(date.getTime()+used);remain-=used;
 }
 return date;
}
function calculateSubnet(ip,prefix){
 const parts=String(ip).trim().split(".");
 const p=Number(prefix);
 if(parts.length!==4||parts.some(x=>!/^(0|[1-9][0-9]{0,2})$/.test(x)||Number(x)>255)||String(prefix).trim()===""||!Number.isInteger(p)||p<0||p>32)throw Error("Informe IPv4 e CIDR válidos (0 a 32).");
 const number=parts.reduce((n,x)=>((n<<8)|Number(x))>>>0,0);
 const mask=p===0?0:(0xffffffff <<(32-p))>>>0;
 const net=(number&mask)>>>0,bcast=(net|(~mask>>>0))>>>0;
 const format=n=>[24,16,8,0].map(s=>(n>>>s)&255).join(".");
 const count=p===32?1:p===31?2:Math.max(0,2**(32-p)-2);
 const first=p>=31?net:net+1,last=p>=31?bcast:bcast-1;
 return {network:format(net),mask:format(mask),broadcast:format(bcast),prefix:p,range:format(first)+(first===last?"":" – "+format(last)),usableCount:count};
}
function generatePassword({length=20,lower=true,upper=true,numbers=true,symbols=true}={}){
 const groups=[lower&&"abcdefghijklmnopqrstuvwxyz",upper&&"ABCDEFGHIJKLMNOPQRSTUVWXYZ",numbers&&"0123456789",symbols&&"!@#$%&*()-_=+?"].filter(Boolean);
 if(!Number.isInteger(length)||length<8||length>128||!groups.length)throw Error("Selecione um tipo e comprimento entre 8 e 128.");
 if(!root.crypto||!root.crypto.getRandomValues)throw Error("Gerador seguro indisponível neste navegador.");
 function rand(limit){const max=Math.floor(4294967296/limit)*limit;let n;do{const a=new Uint32Array(1);root.crypto.getRandomValues(a);n=a[0];}while(n>=max);return n%limit;}
 const alphabet=groups.join("");const chars=groups.map(g=>g[rand(g.length)]);
 while(chars.length<length)chars.push(alphabet[rand(alphabet.length)]);
 for(let i=chars.length-1;i>0;i--){const j=rand(i+1);[chars[i],chars[j]]=[chars[j],chars[i]];}
 return chars.join("");
}
root.DeskOpsCore={calculateSla,calculateSubnet,generatePassword};
if(typeof module!=="undefined")module.exports=root.DeskOpsCore;
})(typeof window!=="undefined"?window:globalThis);
