import fs from 'node:fs';
import path from 'node:path';
const root='_site', dirs=path.join(root,'tr','articles');
const articleDirs=fs.readdirSync(dirs,{withFileTypes:true}).filter(d=>d.isDirectory() && /-\d+$/.test(d.name));
if(articleDirs.length!==556)throw new Error('Expected 556 generated article dirs; got '+articleDirs.length);
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
if(!home.includes('frame-front-layout'))errors.push('homepage hero layout missing');
if(!home.includes('frame-primary'))errors.push('homepage main cover missing');
if((home.match(/<img /g)||[]).length<8)errors.push('homepage visual cards missing');
const css=fs.readFileSync(path.join(root,'assets','archive.css'),'utf8');
if(!css.includes('.frame-cover img'))errors.push('photo CSS missing');
if(!fs.existsSync(path.join(root,'en','index.html')))errors.push('English edition missing');
if(!fs.existsSync(path.join(root,'ar','index.html')))errors.push('Arabic edition missing');
if(errors.length)throw new Error(errors.slice(0,20).join('\n'));
console.log('FRAME QA passed: 556 archive article pages plus '+(articleDirs.length-556)+' existing pilot pages; '+images+' article visuals, photo-led homepage and responsive CSS.');
