export { moods,samplePieces } from './catalog.js';
export { pairing } from './styling.js';
export function detectMood(title){return /class|lecture|seminar|study|library|exam/i.test(title)?'study':/gym|run\b|workout|yoga|pilates|sport|training|fitness|hike/i.test(title)?'athletic':/meeting|office|interview|presentation|conference|client|work\b|business/i.test(title)?'professional':'casual'}
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
