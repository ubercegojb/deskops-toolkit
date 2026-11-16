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
console.log("Todos os testes passaram.");