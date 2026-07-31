// Minimal static server for _app with hub rewrites, so visual verification does not depend on a
// CDN edge. A firebase preview channel caches /houses/hub/* for 3600s and serves DIFFERENT
// variants to curl and Chrome -- one of which was stale, which made a correct change look
// unapplied for two rounds of iteration.
const http=require('http'),fs=require('fs'),path=require('path');
const ROOT=path.resolve(__dirname,'../../../_app'),PORT=+(process.env.PORT||8994);
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2'};
http.createServer((q,s)=>{
  let u=decodeURIComponent(q.url.split('?')[0]);
  let p=path.join(ROOT,u);
  if(/^\/houses\/hub\/[^/]+\/?$/.test(u)) p=path.join(ROOT,'houses/hub/index.html');
  fs.readFile(p,(e,b)=>{
    if(e){s.writeHead(404);s.end('nf');return;}
    s.writeHead(200,{'Content-Type':MIME[path.extname(p)]||'application/octet-stream','Cache-Control':'no-store'});
    s.end(b);
  });
}).listen(PORT,()=>console.log('serving _app on '+PORT));
