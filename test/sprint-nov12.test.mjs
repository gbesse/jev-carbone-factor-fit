import test from 'node:test';import assert from 'node:assert/strict';
import {compareEmissionFactors}from '../src/index.mjs';const factors=[{id:'v1',activityUnit:'kWh',kgCO2ePerUnit:.1},{id:'v2',activityUnit:'kWh',kgCO2ePerUnit:.2}];
test('factor alternatives are not summed emissions',()=>{const x=compareEmissionFactors({quantity:100,activityUnit:'kWh',factors});assert.deepEqual(x.estimateRangeKgCO2e,[10,20]);assert.equal(x.factorSelected,false);assert.equal(x.uncertaintyIntervalCombined,false);});
test('mixed units refused rather than averaged',()=>assert.throws(()=>compareEmissionFactors({quantity:100,activityUnit:'kg',factors})));
test('same identity cannot disguise alternatives',()=>assert.throws(()=>compareEmissionFactors({quantity:100,activityUnit:'kWh',factors:[factors[0],factors[0]]})));
