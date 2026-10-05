import {mkdir,cp,writeFile,readFile,rm} from 'node:fs/promises';
await rm('dist',{recursive:true,force:true});await mkdir('dist/server',{recursive:true});await cp('public','dist/client',{recursive:true});await cp('worker.js','dist/server/index.js');await cp('lib.js','dist/server/lib.js');
await writeFile('dist/server/wrangler.json',JSON.stringify({name:'form-closet',main:'index.js',compatibility_date:'2026-09-01',assets:{directory:'../client',binding:'ASSETS',run_worker_first:true},d1_databases:[{binding:'DB',database_name:'form-closet',database_id:'00000000-0000-0000-0000-000000000000',migrations_dir:'../../drizzle'}],r2_buckets:[{binding:'BUCKET',bucket_name:'form-photos'}]},null,2));
console.log('Built private closet Worker, assets, and storage configuration.');
