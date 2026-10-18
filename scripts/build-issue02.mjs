import fs from 'node:fs';
import path from 'node:path';

const BASE='/-frame-magazine';
const ROOT='_site';
const src=JSON.parse(fs.readFileSync('data/frame_archive_556.json','utf8'));
const recent=JSON.parse(fs.readFileSync('data/frame_verified_october_2026.json','utf8'));
const all=[...src,...recent];
if(src.length!==556||recent.length!==16||all.length!==572)throw new Error('Record count mismatch.');
if(new Set(all.map(x=>x.id)).size!==572)throw new Error('Duplicate record identifiers.');
const esc=x=>String(x??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const slug=s=>String(s??'').toLocaleLowerCase('tr').replaceAll('ı','i').replaceAll('ğ','g').replaceAll('ü','u').replaceAll('ş','s').replaceAll('ö','o').replaceAll('ç','c').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,68);
const article=x=>BASE+'/tr/articles/'+slug(x.title)+'-'+x.id+'/';
const category=c=>BASE+'/tr/konular/'+slug(c||'Sinema')+'/';
const sort=(a,b)=>(b.date||'').localeCompare(a.date||'')||b.id-a.id;
const news=all.filter(x=>(x.id>=20001&&x.id<=20014)||(x.id>=40001&&x.id<=40016)).sort(sort);
const byCat=c=>all.filter(x=>x.cat===c && !news.some(y=>y.id===x.id)).sort(sort);
if(news.length!==30)throw new Error('Expected 30 October news stories');
const date=x=>x.date?x.date.slice(8,10)+'.'+x.date.slice(5,7)+'.'+x.date.slice(0,4):'ARŞİV';
const when=new Intl.DateTimeFormat('tr-TR',{dateStyle:'full',timeZone:'Europe/Istanbul'}).format(new Date('2026-10-18T12:00:00Z'));
const lead=news.find(x=>x.id===40001)||news[0];
const highlightIds=[20002,20001,40003,20003,40002,20004,40004,40005,20006,40009,40013];
const highlights=highlightIds.map(id=>news.find(x=>x.id===id)).filter(Boolean);
function catLabel(x){return '<span class="kicker">'+esc(x.cat)+' <em>· '+date(x)+'</em></span>';}
function leadImg(){return '<img class="lead-pic" src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1000&q=82" alt="Sinema salonu; temsilî editoryal görsel" fetchpriority="high"><span class="lead-pic-note">Temsili sinema görseli, filmden kare değildir</span>';}
function short(x){return '<a class="headline" href="'+article(x)+'">'+catLabel(x)+'<h3>'+esc(x.title)+'</h3></a>';}
function piece(x,kind='news'){return '<a class="'+(kind==='news'?'feed-article':'feature-article')+' edition-article" href="'+article(x)+'" data-search="'+esc((x.title+' '+x.cat+' '+(x.desc||'')).toLocaleLowerCase('tr'))+'">'+(kind==='news'?catLabel(x)+'<h3>'+esc(x.title)+'</h3><p>'+esc(x.desc||'')+'</p>':'<div>'+catLabel(x)+'<h3>'+esc(x.title)+'</h3><p>'+esc(x.desc||'')+'</p></div>')+'</a>';}
function title(name,id,count,viewAll){return '<div class="section-title" id="'+id+'"><h2>'+esc(name)+'</h2><small>'+count+' İÇERİK'+(viewAll?' · <a href="'+viewAll+'">TÜMÜ →</a>':'')+'</small></div>';}
function section(cat,limit=15){const list=byCat(cat);return '<section class="edition-section">'+title(cat,'bolum-'+slug(cat),list.length,category(cat))+'<div class="special-layout">'+list.slice(0,limit).map(x=>piece(x,'feature')).join('')+'</div>'+(list.length>limit?'<div class="breakout"><div><strong>'+esc(cat)+' arşivine devam et</strong><small>'+list.length+' kayıt · Yayın tarihi ve kaynak bağlantılarıyla</small></div><a href="'+category(cat)+'">TÜM KAYITLAR →</a></div>':'')+'</section>';}
function head(){return '<div class="issue-strip"><div class="wrap"><span><strong>FRAME.</strong> · KÜRESEL SİNEMA VE SANAT GAZETESİ</span><span>'+esc(when)+' · TÜRKÇE</span></div></div><header class="wrap"><div class="mast"><div class="mast-side"><strong>Sinema · Sanat · Teknoloji</strong>Bağımsız kültür gazetesi<br>İkinci çevrimiçi sayı</div><a href="'+BASE+'/tr/" class="brand"><span class="wordmark">FRAME<span>.</span></span><div class="submark">THE GLOBAL CINEMA & ART JOURNAL</div></a><div class="mast-side r"><strong>EKİM 2026 SAYISI</strong>30 tarihli haber · 572 kayıt<br><a href="'+BASE+'/en/">ENGLISH EDITION ↗</a></div></div><nav class="nav"><a class="current" href="'+BASE+'/tr/gazete/">GAZETE / SAYI 02</a><a href="'+BASE+'/tr/gundem/">30 HABER</a><a href="#bolum-festival">FESTİVALLER</a><a href="#bolum-film-dunyasi">SİNEMA</a><a href="#bolum-sanat-tarihi">SANAT</a><a href="#bolum-yapay-zeka">YAPAY ZEKÂ</a><a href="'+BASE+'/tr/archive/">TÜM ARŞİV</a></nav></header>';}
function shell(main,titleText){return '<!doctype html><html lang="tr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><meta name="description" content="FRAME: Ekim 2026 sinema gündeminden 30 haber ve 572 yazılık sanat, sinema, teknoloji arşivi."><title>'+esc(titleText)+' | FRAME.</title><link rel="stylesheet" href="'+BASE+'/assets/edition02.css"></head><body>'+head()+'<main class="wrap">'+main+'</main><footer class="wrap"><strong>FRAME.</strong><span>Sinema · Sanat Tarihi · Filmcilik · Yapay Zekâ<br>© 2026 FRAME — Geliştirme yayını</span></footer><nav class="mobilenav"><a href="'+BASE+'/tr/"><span>⌂</span>Ana sayfa</a><a href="'+BASE+'/tr/gundem/"><span>▤</span>30 haber</a><a href="'+BASE+'/tr/archive/"><span>▦</span>Arşiv</a></nav><script>const s=document.getElementById("frame-search");if(s){s.addEventListener("input",()=>{const q=s.value.toLocaleLowerCase("tr").trim();for(const el of document.querySelectorAll(".edition-article"))el.classList.toggle("hidden-query",!!q&&!el.dataset.search.includes(q));});}</script></body></html>';}
const heroNews=[...highlights.filter(x=>x.id!==lead.id)].slice(0,12);
const hero='<div class="edition-top"><strong>FRAME / SAYI 02 — EKİM 2026</strong><small>GÜNCEL HABER · SANAT · FİLM DÜNYASI</small></div>'
 +'<div class="news-counts"><span><b>30</b> tarihli Ekim haberi</span><span><b>572</b> ayrı makale sayfası</span><span><b>18</b> içerik kategorisi</span></div>'
 +'<div class="issue-line"><div><b>Bu sayıda gerçek bir haber akışı var.</b><br><span>Manşetin yanında 12 ayrı haber başlığı; hemen altında 30 haberin tamamı ve yüzlerce arşiv dosyası.</span></div><a href="#tum-haberler">TÜM HABERLERE GİT ↓</a></div>'
 +'<div class="top-grid"><div class="top-col"><span class="kicker">ANA MANŞET · '+date(lead)+'</span><a href="'+article(lead)+'">'+leadImg()+'<h2>'+esc(lead.title)+'</h2><p>'+esc(lead.desc||'')+'</p></a></div>'
 +'<div class="top-col">'+heroNews.slice(0,4).map(short).join('')+'</div>'
 +'<div class="top-col">'+heroNews.slice(4,8).map(short).join('')+'</div>'
 +'<div class="top-col">'+heroNews.slice(8,12).map(short).join('')+'</div></div>';
const issueInfo='<div class="edition-top"><strong>SİNEMA GÜNDEMİ / 12–17 EKİM 2026</strong><small>FRAME GAZETESİ · SAYI 02</small></div>';
const allNews=title('Ekim 2026: 30 haberin tamamı','tum-haberler',news.length,BASE+'/tr/gundem/')+'<div class="news-counts"><span>Gerçek yayın tarihleriyle listelenir; otomatik canlı haber akışı değildir.</span></div><label class="searchbar" for="frame-search"><b>⌕</b><span>HABERLERDE ARA</span><input id="frame-search" placeholder="Film, festival, yapay zekâ, yönetmen..." aria-label="Haberlerde ara"></label><div class="full-feed">'+news.map(x=>piece(x)).join('')+'</div>';
const categories=['Film Dünyası','Festival','Ödüller','Yapay Zekâ','Sanat Tarihi','Dünya Sineması','Yönetmenlik','Kamera Arkası','Teknoloji','Filmcilik','Sinema Kültürü','Belgesel','Kulis & Tartışma','Dikey Dizi','Film Atlası'];
const sections=categories.map(cat=>section(cat,cat==='Film Atlası'?20:cat==='Festival'?18:cat==='Film Dünyası'?20:cat==='Sanat Tarihi'?13:cat==='Kulis & Tartışma'?4:12)).join('');
const foot='<div class="footnote"><b>EDİTORYAL BİLGİ:</b> Bu sayıda 30 Ekim 2026 tarihli kaynak bağlantılı haber ve daha eski arşiv kayıtları yer alır. 572 kayıt uzun araştırma makalesi anlamına gelmez; bazı dosyalar kısa taslak veya veri kartıdır. Kullanılan fotoğraflar temsili editoryal görsellerdir. Telif ve doğrulama denetimi süren içerikler bulunmaktadır.</div>';
const front=shell(hero+allNews+sections+'<div class="breakout"><div><strong>FRAME'in 572 kayıtlık arşivi</strong><small>Film atlası, 2024–26 sinema gündemi, sanat tarihi, yapım teknikleri ve AI</small></div><a href="'+BASE+'/tr/archive/">572 KAYDIN TAMAMI →</a></div>'+foot,'FRAME Gazetesi — 30 Haber ve 572 İçerik');
const newsOnly=shell(issueInfo+allNews+'<div class="breakout"><div><strong>Diğer 542 kayıt arşivde.</strong><small>30 tarihli haberin ardından festival, sanat tarihi ve sinema arşivini keşfet.</small></div><a href="'+BASE+'/tr/gazete/">TAM GAZETEYİ AÇ →</a></div>'+foot,'FRAME Güncel Haberler — 30 Ekim Haberi');
for(const [name,html] of [['tr/index.html',front],['tr/gazete/index.html',front],['tr/gundem/index.html',newsOnly]]){
  const p=path.join(ROOT,name);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,html);
}
const distinct=new Set([...front.matchAll(/href="\/-frame-magazine\/tr\/articles\/([^"?#]+)\//g)].map(m=>m[1]));
const visibleNews=new Set([...newsOnly.matchAll(/href="\/-frame-magazine\/tr\/articles\/([^"?#]+)\//g)].map(m=>m[1]));
if(visibleNews.size!==30)throw new Error('Expected 30 distinct linked articles on news page, got '+visibleNews.size);
if(distinct.size<155)throw new Error('Expected at least 155 linked articles on homepage, got '+distinct.size);
if(!front.includes('FRAME / SAYI 02')||!front.includes('assets/edition02.css'))throw new Error('Missing new newspaper marker or CSS');
console.log('FRAME ISSUE 02 QA:',JSON.stringify({news:visibleNews.size,homepageArticleLinks:distinct.size,totalRecords:all.length,sections:categories.length,files:3,marker:'SAYI 02'}));