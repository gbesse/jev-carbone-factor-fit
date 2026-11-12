import {scaleEmissionEstimate}from './quantity.mjs';
export function compareEmissionFactors({quantity,activityUnit,factors}){
 if(!Array.isArray(factors)||factors.length<1||factors.length>1000||new Set(factors.map(f=>f?.id)).size!==factors.length)throw new TypeError('Facteurs invalides / Invalid factors / Factores inválidos');
 const estimates=factors.map(f=>scaleEmissionEstimate({quantity,activityUnit,factor:f}));const values=estimates.map(r=>r.kgCO2e);
 return {estimates,estimateRangeKgCO2e:[Math.min(...values),Math.max(...values)],factorSelected:false,uncertaintyIntervalCombined:false,causalReductionProven:false};
}
