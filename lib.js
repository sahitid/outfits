export const moods=['casual','professional','athletic'];
export const samplePieces=[{category:'tops',moods:['casual'],color:'cream',warmth:3},{category:'tops',moods:['casual','athletic'],color:'white',warmth:1},{category:'tops',moods:['professional','casual'],color:'blue',warmth:2},{category:'layers',moods:['professional'],color:'charcoal',warmth:3},{category:'bottoms',moods:['casual'],color:'indigo',warmth:2},{category:'bottoms',moods:['professional','casual'],color:'beige',warmth:2},{category:'bottoms',moods:['athletic'],color:'black',warmth:1},{category:'tops',moods:['casual','athletic'],color:'green',warmth:2}].map((p,i)=>({...p,id:'sample-'+i}));
export function pairing(garments,mood,weather,date,variant=0){
 const tops=garments.filter(g=>g.category==='tops'),bottoms=garments.filter(g=>g.category==='bottoms');
 if(!tops.length||!bottoms.length)throw Error('Add at least one top and one bottom to find a complete pairing.');
 const temp=weather?.temperature??19,target=temp>=24?1:temp<=13?3:2;
 const neutral=new Set(['white','cream','beige','black','charcoal','indigo']);
 const combinations=[];for(const t of tops)for(const b of bottoms){const moodScore=(t.moods.includes(mood)?12:0)+(b.moods.includes(mood)?12:0);const warmthScore=weather?-Math.abs(t.warmth-target)*3-Math.abs(b.warmth-Math.min(target,2))*2:0;const colorScore=neutral.has(t.color)||neutral.has(b.color)?3:t.color===b.color?1:0;combinations.push({pieces:[t.id,b.id],score:moodScore+warmthScore+colorScore,matched:t.moods.includes(mood)&&b.moods.includes(mood)})}
 combinations.sort((a,b)=>b.score-a.score||a.pieces.join().localeCompare(b.pieces.join()));
 const best=combinations.filter(c=>c.score>=combinations[0].score-3);const seed=[...date].reduce((a,c)=>a+c.charCodeAt(0),0);const chosen=best[(seed+Math.max(0,variant))%best.length];
 const layer=garments.filter(g=>g.category==='layers'&&(g.moods.includes(mood))&&(temp<16||mood==='professional'&&temp<23)).sort((a,b)=>Math.abs(a.warmth-target)-Math.abs(b.warmth-target))[0];if(layer)chosen.pieces.push(layer.id);
 let reason=chosen.matched?({casual:'An easy top-and-bottom combination with colors that work together.',professional:'A polished pairing for meetings, the office, and a composed first impression.',athletic:'Pieces tagged for movement, paired for an active day.'}[mood]):`The closest ${mood} pairing in your closet. Add more ${mood} pieces for a better match.`;
 if(weather)reason+=temp>=24?' Light pieces help keep warm days comfortable.':temp<=13?layer?' An extra layer adds warmth for the cooler forecast.':' Cooler weather calls for warmth; add a jacket if you have one.':' A balanced choice for mild temperatures.';
 if((weather?.rain??0)>30)reason+=' Rain is possible. Bring an umbrella and choose weather-ready shoes.';
 return {pieces:chosen.pieces,reason,mood};
}
export function detectMood(title){return /gym|run\b|workout|yoga|pilates|sport|training|fitness|hike/i.test(title)?'athletic':/meeting|office|interview|presentation|conference|client|work\b|business/i.test(title)?'professional':'casual'}
function inZone(y,m,d,h,min,sec,zone){const wall=Date.UTC(y,m-1,d,h,min,sec);let value=wall;const fmt=new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});for(let i=0;i<3;i++){const p=Object.fromEntries(fmt.formatToParts(new Date(value)).map(p=>[p.type,p.value]));const repr=Date.UTC(+p.year,+p.month-1,+p.day,+p.hour,+p.minute,+p.second);value+=wall-repr}return new Date(value)}
function icsDate(value,zone){const m=value.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?)?(Z)?$/);if(!m)throw Error('Unsupported calendar date.');const [y,mo,d,h,mi,s]=[+m[1],+m[2],+m[3],m[4]?+m[4]:9,+(m[5]||0),+(m[6]||0)];return m[7]?new Date(Date.UTC(y,mo-1,d,h,mi,s)):inZone(y,mo,d,h,mi,s,zone)}
export function parseCalendar(ics,timezone='UTC',now=new Date()){
 if(!ics.includes('BEGIN:VCALENDAR'))throw Error('Choose a valid .ics calendar file.');
 try{new Intl.DateTimeFormat('en',{timeZone:timezone})}catch{throw Error('Unsupported calendar time zone.')}
 const unfolded=ics.replace(/\r?\n[ \t]/g,'');const blocks=unfolded.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g)||[];const result=[],end=new Date(now.getTime()+90*86400000),lower=new Date(now.getTime()-86400000);let skipped=0;
 for(const block of blocks.slice(0,1000)){try{const props={};for(const line of block.split(/\r?\n/)){const split=line.indexOf(':');if(split<0)continue;const left=line.slice(0,split),key=left.split(';')[0];props[key]={value:line.slice(split+1),zone:left.match(/TZID=([^;]+)/)?.[1]||timezone}}
 if(props.STATUS?.value==='CANCELLED')continue;
 if(!props.DTSTART||props['RECURRENCE-ID']){skipped++;continue}
 const title=(props.SUMMARY?.value||'Calendar plan').replace(/\\n/g,' ').replace(/\\([,;\\])/g,'$1').slice(0,120),start=icsDate(props.DTSTART.value,props.DTSTART.zone),finish=props.DTEND?icsDate(props.DTEND.value,props.DTEND.zone):null,uid=props.UID?.value||title;
 const append=d=>{if(d>=lower&&d<=end){result.push({source:uid+'|'+d.toISOString(),title,start:d.toISOString(),end:finish?new Date(d.getTime()+(finish.getTime()-start.getTime())).toISOString():null,mood:detectMood(title)})}};
 if(!props.RRULE){if(start>=lower&&start<=end)append(start);else skipped++;continue}
 const rule=Object.fromEntries(props.RRULE.value.split(';').map(s=>s.split('=')));
 if(!['DAILY','WEEKLY'].includes(rule.FREQ)||Object.keys(rule).some(k=>!['FREQ','INTERVAL','COUNT','UNTIL','BYDAY','WKST'].includes(k))||rule.BYDAY?.split(',').some(d=>!['MO','TU','WE','TH','FR','SA','SU'].includes(d))){skipped++;continue}
 const interval=Number(rule.INTERVAL||1);if(!Number.isInteger(interval)||interval<1||interval>365){skipped++;continue}
 const excluded=new Set((props.EXDATE?.value||'').split(',').filter(Boolean).map(v=>icsDate(v,props.EXDATE.zone).toISOString()));
 const until=rule.UNTIL?icsDate(rule.UNTIL,props.DTSTART.zone):end;const count=Number(rule.COUNT||100000);let occurrences=0;let produced=0;
 // Iterate calendar days in the event's time zone to preserve local time across DST.
 const fmt=new Intl.DateTimeFormat('en-CA',{timeZone:props.DTSTART.zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});const initial=Object.fromEntries(fmt.formatToParts(start).map(p=>[p.type,p.value]));const base=Date.UTC(+initial.year,+initial.month-1,+initial.day);const startDay=new Date(base).getUTCDay();const weekAnchor=base-((startDay+6)%7)*86400000;const names=['SU','MO','TU','WE','TH','FR','SA'];
 for(let day=0;day<20000&&occurrences<count;day++){const wall=new Date(base+day*86400000),d=inZone(wall.getUTCFullYear(),wall.getUTCMonth()+1,wall.getUTCDate(),+initial.hour,+initial.minute,+initial.second,props.DTSTART.zone);if(d>end||d>until)break;const week=Math.floor((wall.getTime()-weekAnchor)/(7*86400000));const valid=rule.FREQ==='DAILY'?day%interval===0:week%interval===0&&(rule.BYDAY?rule.BYDAY.split(',').includes(names[wall.getUTCDay()]):wall.getUTCDay()===startDay);if(!valid)continue;occurrences++;if(!excluded.has(d.toISOString())&&d>=lower){append(d);produced++}if(result.length>=500)break}if(!produced)skipped++;if(result.length>=500)break;
 }catch{skipped++}}
 return {events:result.slice(0,500),skipped};
}
export function weatherDescription(code){return code===0?'Clear skies':code<=2?'Partly cloudy':code===3?'Cloudy':code<=48?'Foggy':code<=67?'Rainy':code<=77?'Snowy':code<=82?'Rain showers':code<=86?'Snow showers':'Thunderstorms'}
