import test from 'node:test';
import assert from 'node:assert/strict';
import {activityCase,matchEmissionFactor} from '../src/index.mjs';
const base={id:'synthetic-id',text:'synthetic activity',source:{url:'https://example.test/evidence',date:'2026-10-17'}};
test('nonstring and blank record identity, text and evidence URL fail before provider work',async()=>{
 let calls=0;const provider={async decide(){calls++;throw Error('must not run');}};
 for(const lang of ['fr','en','es'])for(const field of ['id','text','url'])for(const value of [true,12,[],{},'','  ']){
  const record=structuredClone(base);if(field==='url')record.source.url=value;else record[field]=value;
  await assert.rejects(matchEmissionFactor(record,provider,{lang}),/Record requires/);
 }
 assert.equal(calls,0);
});
test('identity remains literal and source extras are retained in the detached record',()=>{
 const source={...base,source:{...base.source,note:'Texto del usuario'}};const record=activityCase(source);
 assert.equal(record.id,source.id);assert.equal(record.source.note,'Texto del usuario');source.source.note='changed';assert.equal(record.source.note,'Texto del usuario');
});
