export function scaleEmissionEstimate({quantity,activityUnit,factor}){
 const fail=()=>{throw new TypeError('FR: Quantité ou facteur incompatible. / EN: Incompatible quantity or factor. / ES: Cantidad o factor incompatible.');};
 if(!Number.isFinite(quantity)||quantity<0||!factor||typeof factor.id!=='string'||!factor.id||typeof activityUnit!=='string'||!activityUnit||activityUnit!==factor.activityUnit||!Number.isFinite(factor.kgCO2ePerUnit)||factor.kgCO2ePerUnit<0)fail();
 let interval=null;
 if(factor.interval!==undefined){const x=factor.interval;if(!Array.isArray(x)||x.length!==2||!x.every(Number.isFinite)||x[0]<0||x[0]>factor.kgCO2ePerUnit||x[1]<factor.kgCO2ePerUnit)fail();interval=x.map(v=>v*quantity);}
 const estimate=factor.kgCO2ePerUnit*quantity;if(!Number.isFinite(estimate)||interval?.some(v=>!Number.isFinite(v)))fail();
 return {factorId:factor.id,quantity,activityUnit,kgCO2e:estimate,intervalKgCO2e:interval,factorSelection:'caller_supplied_not_automatic',unitConversionApplied:false};
}
