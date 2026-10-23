import fs from 'node:fs';
import path from 'node:path';
const root='_site', dirs=path.join(root,'tr','articles');
const articleDirs=fs.readdirSync(dirs,{withFileTypes:true}).filter(d=>d.isDirectory() && /-\d+$/.test(d.name));
if(articleDirs.length!==572)throw new Error('Expected 572 generated article dirs; got '+articleDirs.length);
let images=0,errors=[];
for(const dir of articleDirs){
  const file=path.join(dirs,dir.name,'index.html');
  if(!fs.existsSync(file)){errors.push(file+': missing');continue;}
  const h=fs.readFileSync(file,'utf8');
  if(!h.includes('<h1'))errors.push(file+': title missing');
  if(!h.includes('class="frame-cover frame-feature-photo"'))errors.push(file+': full article visual missing');
  if(!h.includes('<img '))errors.push(file+': img missing');
  else images++;
}
const home=fs.readFileSync(path.join(root,'tr','index.html'),'utf8');
if(!home.includes('issue-news-grid'))errors.push('30-headline grid missing');
if(!home.includes('editorial-lead'))errors.push('photographic newspaper lead missing');
if((home.match(/class="issue-news-headline/g)||[]).length!==30)errors.push('expected 30 dated news headlines below lead');
if(!home.includes('global-search'))errors.push('full archive search missing');
const css=fs.readFileSync(path.join(root,'assets','archive.css'),'utf8');
const newspaperCss=fs.readFileSync(path.join(root,'assets','newspaper.css'),'utf8');
if(!newspaperCss.includes('.np-lead')||!newspaperCss.includes('.np-newsgrid'))errors.push('legacy newspaper responsive CSS missing');
const issueCSS=fs.readFileSync(path.join(root,'assets','edition02.css'),'utf8');
if(!issueCSS.includes('.top-grid')||!issueCSS.includes('@media(max-width:460px)'))errors.push('new issue responsive CSS missing');
if(!fs.existsSync(path.join(root,'tr','gazete','index.html')))errors.push('new dedicated newspaper URL missing');
if(!fs.existsSync(path.join(root,'tr','mansetler','index.html')))errors.push('uncached full-headlines route missing');
const coveragePath=path.join(root,'tr','gazete','coverage.json');
if(!fs.existsSync(coveragePath))errors.push('newspaper coverage manifest missing');
else{const coverage=JSON.parse(fs.readFileSync(coveragePath,'utf8'));if(coverage.homepageArticleLinks!==572||coverage.archive!==542||coverage.news!==30||coverage.sections!==18)errors.push('incomplete 572-article issue coverage: '+JSON.stringify(coverage));}
if(!home.includes('572 İÇERİĞİN TAMAMI BU GAZETEDE'))errors.push('full issue category index missing');
if(!css.includes('.frame-cover img'))errors.push('photo CSS missing');
if(!fs.existsSync(path.join(root,'en','index.html')))errors.push('English edition missing');
if(!fs.existsSync(path.join(root,'ar','index.html')))errors.push('Arabic edition missing');

const issuePath=path.join(root,'tr','gundem','index.html');
if(!fs.existsSync(issuePath))errors.push('dated October news edition missing');
else{
 const issue=fs.readFileSync(issuePath,'utf8');
 const issueLinks=new Set([...issue.matchAll(/href="\/-frame-magazine\/tr\/articles\/([^"?#]+)\/"/g)].map(m=>m[1]));
 if(issueLinks.size!==30)errors.push('expected 30 linked October 2026 news items, got '+issueLinks.size);
 if(!issue.includes('Sinema gündemi'))errors.push('missing news section heading in issue');
}
const homepageLinks=new Set([...home.matchAll(/href="\/-frame-magazine\/tr\/articles\/([^"?#]+)\/"/g)].map(m=>m[1]));
if(homepageLinks.size!==572)errors.push('expected all 572 distinct article links on newspaper homepage, got '+homepageLinks.size);
const base=JSON.parse(fs.readFileSync('data/frame_archive_556.json','utf8'));
const added=JSON.parse(fs.readFileSync('data/frame_verified_october_2026.json','utf8'));
if(base.length!==556||added.length!==16)errors.push('source article count drift');
if(errors.length)throw new Error(errors.slice(0,20).join('\n'));
console.log('FRAME ISSUE 04 QA passed: 572 stories; 30 compact headlines displayed first; 572/572 links; 542 archive records; 18 categories.');
