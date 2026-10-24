import test from 'node:test';
import assert from 'node:assert/strict';
import { allowedUser, sameOrigin, trustedRequest } from '../server/access.js';
import { postgresQuery, createD1Adapter } from '../server/database.js';
import { createBucketAdapter } from '../server/storage.js';
test('only the verified owner can access the closet',()=>{
 const u={id:'owner',email:'Owner@example.com',email_confirmed_at:'2026-01-01'};
 assert(allowedUser(u,'owner@example.com'));
 assert(!allowedUser({...u,email_confirmed_at:null},'owner@example.com'));
 assert(!allowedUser(u,'other@example.com'));
 assert(!allowedUser(u,'')); assert(!allowedUser(null,'owner@example.com'));
});
test('cross-origin and missing-origin writes fail closed',()=>{
 assert(sameOrigin(new Request('https://closet.example/api/settings',{headers:{origin:'https://closet.example'}})));
 assert(!sameOrigin(new Request('https://closet.example/api/settings',{headers:{origin:'https://attacker.example'}})));
 assert(!sameOrigin(new Request('https://closet.example/api/settings')));
});
test('authenticated adapter discards forged identity headers and preserves request body',async()=>{
 const request=new Request('https://closet.example/api/settings',{method:'POST',headers:{'oai-authenticated-user-id':'attacker','oai-other':'forged'},body:'{"test":true}'});
 const result=trustedRequest(request,{id:'real-owner',email:'owner@example.com',user_metadata:{name:'Sahiti'}});
 assert.equal(result.headers.get('oai-authenticated-user-id'),'real-owner');
 assert.equal(result.headers.get('oai-other'),null);
 assert.equal(await result.text(),'{"test":true}');
});
test('database adapter parameterizes values and preserves transaction rollback boundary',async()=>{
 const calls=[];
 const sql={unsafe:async(q,args)=>{calls.push([q,args]);return [{id:'a'}];},begin:async fn=>fn(sql)};
 const db=createD1Adapter(sql);
 const bad="x'); DROP TABLE garments;--";
 const row=await db.prepare('SELECT id FROM garments WHERE owner = ?').bind(bad).first();
 assert.equal(row.id,'a');assert.equal(calls[0][0],'SELECT id FROM garments WHERE owner = $1');assert.deepEqual(calls[0][1],[bad]);
 assert.equal(postgresQuery('INSERT INTO events (start,end) VALUES (?,?)'),'INSERT INTO events (start,"end") VALUES ($1,$2)');
 const statements=[db.prepare('DELETE FROM events WHERE owner = ?').bind('a'),db.prepare('INSERT INTO events (id) VALUES (?)').bind('b')];
 await db.batch(statements);assert.equal(calls.length,3);
});
test('private storage distinguishes a missing file from service failure',async()=>{
 let response={error:{statusCode:'404'}};
 const adapter=createBucketAdapter({storage:{from(name){assert.equal(name,'closet-private');return {download:async()=>response};}}});
 assert.equal(await adapter.get('owner/missing'),null);
 response={error:{statusCode:'503',message:'unavailable'}};
 await assert.rejects(()=>adapter.get('owner/photo'),/Could not read/);
 response={data:new Blob(['photo'],{type:'image/jpeg'})};
 const object=await adapter.get('owner/photo');assert.equal(await object.text(),'photo');assert.equal(object.httpMetadata.contentType,'image/jpeg');
});
