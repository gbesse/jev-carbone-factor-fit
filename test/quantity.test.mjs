import test from 'node:test';import assert from 'node:assert/strict';import {scaleEmissionEstimate}from '../src/index.mjs';const factor={id:'synthetic',activityUnit:'kg',kgCO2ePerUnit:2,interval:[1,3]};
test('quantity and interval scale together',()=>{const x=scaleEmissionEstimate({quantity:10,activityUnit:'kg',factor});assert.equal(x.kgCO2e,20);assert.deepEqual(x.intervalKgCO2e,[10,30]);assert.equal(x.unitConversionApplied,false);});
test('unit mismatch and negative quantity refused',()=>{assert.throws(()=>scaleEmissionEstimate({quantity:10,activityUnit:'tonne',factor}));assert.throws(()=>scaleEmissionEstimate({quantity:-1,activityUnit:'kg',factor}));});
test('zero quantity valid',()=>assert.equal(scaleEmissionEstimate({quantity:0,activityUnit:'kg',factor}).kgCO2e,0));
