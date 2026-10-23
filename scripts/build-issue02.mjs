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
function section(cat){
 const list=byCat(cat);
 const dense=list.length>75?' is-index':'';
 const markup=list.map(x=>piece(x,'feature')).join('');
 return '<section class="edition-section" id="bolum-'+slug(cat)+'">'+title(cat,'baslik-'+slug(cat),list.length,category(cat))+'<div class="special-layout'+dense+'">'+markup+'</div><div class="section-foot"><span>'+list.length+' kaydın tamamı bu sayfada listelendi</span><a href="'+category(cat)+'">BAĞIMSIZ KATEGORİ SAYFASI →</a></div></section>';
}
function head(){return '<div class="issue-strip"><div class="wrap"><span><strong>FRAME.</strong> · KÜRESEL SİNEMA VE SANAT GAZETESİ</span><span>'+esc(when)+' · TÜRKÇE</span></div></div><header class="wrap"><div class="mast"><div class="mast-side"><strong>Sinema · Sanat · Teknoloji</strong>Bağımsız kültür gazetesi<br>İkinci çevrimiçi sayı</div><a href="'+BASE+'/tr/" class="brand"><span class="wordmark">FRAME<span>.</span></span><div class="submark">THE GLOBAL CINEMA & ART JOURNAL</div></a><div class="mast-side r"><strong>EKİM 2026 SAYISI</strong>30 tarihli haber · 572 kayıt<br><a href="'+BASE+'/en/">ENGLISH EDITION ↗</a></div></div><nav class="nav"><a class="current" href="'+BASE+'/tr/gazete/">GAZETE / SAYI 02</a><a href="'+BASE+'/tr/gundem/">30 HABER</a><a href="#bolum-festival">FESTİVALLER</a><a href="#bolum-film-dunyasi">SİNEMA</a><a href="#bolum-sanat-tarihi">SANAT</a><a href="#bolum-yapay-zeka">YAPAY ZEKÂ</a><a href="'+BASE+'/tr/archive/">TÜM ARŞİV</a></nav></header>';}
function shell(main,titleText){return '<!doctype html><html lang="tr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><meta name="description" content="FRAME: Ekim 2026 sinema gündeminden 30 haber ve 572 yazılık sanat, sinema, teknoloji arşivi."><title>'+esc(titleText)+' | FRAME.</title><link rel="stylesheet" href="'+BASE+'/assets/edition02.css"></head><body>'+head()+'<main class="wrap">'+main+'</main><footer class="wrap"><strong>FRAME.</strong><span>Sinema · Sanat Tarihi · Filmcilik · Yapay Zekâ<br>© 2026 FRAME — Geliştirme yayını</span></footer><nav class="mobilenav"><a href="'+BASE+'/tr/"><span>⌂</span>Ana sayfa</a><a href="'+BASE+'/tr/gundem/"><span>▤</span>30 haber</a><a href="'+BASE+'/tr/archive/"><span>▦</span>Arşiv</a></nav><script>const s=document.getElementById("frame-search");if(s){const parts=[...document.querySelectorAll(".edition-article")],sections=[...document.querySelectorAll(".edition-section")],feedback=document.getElementById("search-feedback");const update=()=>{const q=s.value.toLocaleLowerCase("tr").trim();let count=0;for(const el of parts){const matches=!q||el.dataset.search.includes(q);el.classList.toggle("hidden-query",!matches);if(matches)count++;}for(const sec of sections){sec.classList.toggle("hidden-query",!!q&&!sec.querySelector(".edition-article:not(.hidden-query)"));}if(feedback)feedback.textContent=q?count+" eşleşen içerik":"572 içerik listeleniyor";};s.addEventListener("input",update);update();}</script></body></html>';}
const heroNews=[...highlights.filter(x=>x.id!==lead.id)].slice(0,12);
const mainLead=news.find(x=>x.id===40001)||news[0];
const leadPhoto='https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1400&q=85';
const editorialLead='<section class="editorial-lead"><a class="editorial-cover" href="'+article(mainLead)+'"><img src="'+leadPhoto+'" alt="Temsili editoryal sinema fotoğrafı" loading="eager"><span class="editorial-overline">FRAME · HAFTANIN MANŞETİ</span><h1>'+esc(mainLead.title)+'</h1><p>'+esc(mainLead.desc||'')+'</p></a><aside class="editorial-sidebar"><div class="editorial-sidebar-head">ÖNE ÇIKANLAR</div>'+[20002,40003,20004,40004].map(id=>news.find(x=>x.id===id)).filter(Boolean).map(x=>'<a href="'+article(x)+'" class="editorial-sidebar-story"><span class="kicker">'+esc(x.cat)+' · '+date(x)+'</span><h2>'+esc(x.title)+'</h2></a>').join('')+'</aside></section>';
const hero=editorialLead+'<section class="issue-newsboard" id="tum-haberler"><div class="editorial-section-head"><h2>Sinema gündemi</h2><p>30 haber, kaynakları ve yayın tarihleriyle</p></div><div class="issue-news-grid">'+news.map((x,i)=>'<a class="issue-news-headline edition-article" href="'+article(x)+'" data-search="'+esc((x.title+' '+x.cat+' '+(x.desc||'')).toLocaleLowerCase('tr'))+'"><span class="kicker">'+esc(x.cat)+' · '+date(x)+'</span><h2>'+esc(x.title)+'</h2></a>').join('')+'</div></section>';
const issueInfo='<div class="edition-top"><strong>SİNEMA GÜNDEMİ / 12–17 EKİM 2026</strong><small>FRAME GAZETESİ · SAYI 02</small></div>';
const allNews=title('Ekim 2026: 30 haberin tamamı','tum-haberler',news.length,BASE+'/tr/gundem/')+'<div class="news-counts"><span>Gerçek yayın tarihleriyle listelenir; otomatik canlı haber akışı değildir.</span></div><label class="searchbar" for="frame-search"><b>⌕</b><span>HABERLERDE ARA</span><input id="frame-search" placeholder="Film, festival, yapay zekâ, yönetmen..." aria-label="Haberlerde ara"></label><div class="full-feed">'+news.map(x=>piece(x)).join('')+'</div>';
const categories=[...new Set(all.map(x=>x.cat||'Sinema'))].sort((a,b)=>a.localeCompare(b,'tr'));
if(categories.length!==18)throw new Error('Expected 18 archive departments; got '+categories.length);
const sections=categories.map(cat=>section(cat)).join('');
const archiveCount=all.length-news.length;
const listedArchives=categories.reduce((n,cat)=>n+byCat(cat).length,0);
if(listedArchives!==archiveCount)throw new Error('Archive coverage mismatch '+listedArchives+' != '+archiveCount);
const topicIndex='<nav class="topic-index" id="tum-arsiv" aria-label="572 içeriğin kategori dizini"><strong>572 İÇERİĞİN TAMAMI BU GAZETEDE</strong><div class="topic-index-links">'+categories.map(cat=>'<a href="#bolum-'+slug(cat)+'">'+esc(cat)+' <span>('+byCat(cat).length+')</span></a>').join('')+'</div><p>30 tarihli haber yukarıda; kalan '+archiveCount+' arşiv kaydının tamamı aşağıdaki 18 kategoride. Hiçbir bölüm kısaltılmadı.</p></nav>';
const fullSearch='<label class="searchbar global-search" for="frame-search"><span>⌕ &nbsp; 572 İÇERİKTE ARA</span><input id="frame-search" type="search" autocomplete="off" placeholder="Film, festival, sanat tarihi, yapay zekâ..." aria-label="572 içerikte ara"></label><div class="search-feedback" id="search-feedback" role="status" aria-live="polite"></div>';
const foot='<div class="footnote"><b>EDİTORYAL BİLGİ:</b> Bu sayıda 30 Ekim 2026 tarihli kaynak bağlantılı haber ve daha eski arşiv kayıtları yer alır. 572 kayıt uzun araştırma makalesi anlamına gelmez; bazı dosyalar kısa taslak veya veri kartıdır. Kullanılan fotoğraflar temsili editoryal görsellerdir. Telif ve doğrulama denetimi süren içerikler bulunmaktadır.</div>';
const totalIssueInfo='<div class="issue-line"><div><b>BU SAYIDA: 572 YAZININ TAMAMI</b><br><span>30 haber + '+archiveCount+' arşiv kaydı. Başlıkların tamamı bu sayfanın içinde ve kendi HTML makalelerine bağlı.</span></div><a href="#tum-arsiv">18 KATEGORİYE İN ↓</a></div>';
const front=shell(hero+fullSearch+topicIndex+sections+'<div class="breakout"><div><strong>572 / 572 içerik: Tam liste</strong><small>'+news.length+' tarihli haber · '+archiveCount+' arşiv · '+categories.length+' kategori · Hepsinin ayrı makale HTML’si var.</small></div><a href="'+BASE+'/tr/archive/">AYRI ARŞİV SAYFASINA GEÇ →</a></div>'+foot,'FRAME Gazetesi — 572 İçeriğin Tamamı');
const newsOnly=shell(issueInfo+hero+'<div class="breakout"><div><strong>Diğer 542 kayıt gazete ana sayfasının devamında.</strong><small>30 tarihli haberin ardından festival, sanat tarihi ve sinema arşivini keşfet.</small></div><a href="'+BASE+'/tr/gazete/">TAM GAZETEYİ AÇ →</a></div>'+foot,'FRAME Güncel Haberler — 30 Ekim Haberi');
for(const [name,html] of [['tr/index.html',front],['tr/gazete/index.html',front],['tr/mansetler/index.html',front],['tr/gundem/index.html',newsOnly]]){
  const p=path.join(ROOT,name);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,html);
}
const distinct=new Set([...front.matchAll(/href="\/-frame-magazine\/tr\/articles\/([^"?#]+)\//g)].map(m=>m[1]));
const visibleNews=new Set([...newsOnly.matchAll(/href="\/-frame-magazine\/tr\/articles\/([^"?#]+)\//g)].map(m=>m[1]));
if(visibleNews.size!==30)throw new Error('Expected 30 distinct linked articles on news page, got '+visibleNews.size);
if((front.match(/class="issue-news-headline/g)||[]).length!==30)throw new Error('Expected 30 visible first-section headline elements');
if(distinct.size!==572)throw new Error('Expected exactly 572 distinct linked articles on homepage, got '+distinct.size);
if(!front.includes('issue-news-grid')||!front.includes('editorial-lead')||!front.includes('assets/edition02.css'))throw new Error('Missing all-headlines newspaper layout or CSS');
const summary={news:news.length,archive:archiveCount,homepageArticleLinks:distinct.size,totalRecords:all.length,sections:categories.length,files:4,marker:'30 HABER DOĞRUDAN MANŞETTE',allArticlesIncluded:true};
fs.writeFileSync(path.join(ROOT,'tr','gazete','coverage.json'),JSON.stringify(summary,null,2));
console.log('FRAME ISSUE 02 QA:',JSON.stringify(summary));