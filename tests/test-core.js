/* Rode: node tests/test-core.js */
const assert=require("node:assert/strict");
const {calculateSla,calculateSubnet,generatePassword}=require("../assets/core.js");
const sla=calculateSla(new Date("2026-11-13T17:00:00"),3);
assert.equal(sla.getFullYear(),2026);
assert.equal(sla.getMonth(),10);
assert.equal(sla.getDate(),16);
assert.equal(sla.getHours(),11);
const a=calculateSubnet("192.168.10.42",24);
assert.equal(a.network,"192.168.10.0");
assert.equal(a.broadcast,"192.168.10.255");
assert.equal(a.usableCount,254);
assert.equal(calculateSubnet("10.0.0.0",31).usableCount,2);
assert.equal(calculateSubnet("10.0.0.1",32).usableCount,1);
assert.throws(()=>calculateSubnet("999.1.1.1",24));
const pass=generatePassword({length:24});
assert.equal(pass.length,24);
assert.match(pass,/[a-z]/);assert.match(pass,/[A-Z]/);assert.match(pass,/[0-9]/);

// Revisão final: cenários de expediente, bordas de redes e senha.
const afterHours = calculateSla(new Date("2026-11-16T19:24:00"),8);
assert.equal(afterHours.getDate(),17);
assert.equal(afterHours.getHours(),17);
assert.equal(afterHours.getMinutes(),0);
const weekend = calculateSla(new Date("2026-11-14T12:00:00"),3);
assert.equal(weekend.getDate(),16);
assert.equal(weekend.getHours(),12);
assert.equal(calculateSubnet("0.0.0.0",0).broadcast,"255.255.255.255");
assert.equal(calculateSubnet("10.8.1.2",8).network,"10.0.0.0");
assert.equal(calculateSubnet("192.168.5.7",32).range,"192.168.5.7");
assert.equal(calculateSubnet("10.0.0.0",31).range,"10.0.0.0 – 10.0.0.1");
assert.throws(()=>calculateSubnet("192.168.1.256",24));
assert.throws(()=>calculateSubnet("192.168.1.0",33));
assert.throws(()=>calculateSla("sem data",1));
assert.throws(()=>calculateSla(new Date(),0));
const digits=generatePassword({length:12,lower:false,upper:false,numbers:true,symbols:false});
assert.match(digits,/^[0-9]{12}$/);
assert.throws(()=>generatePassword({lower:false,upper:false,numbers:false,symbols:false}),/Selecione/);
assert.throws(()=>generatePassword({length:3}),/comprimento/);

console.log("Todos os testes passaram.");