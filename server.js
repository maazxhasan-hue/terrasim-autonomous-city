const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const MIME = { ".html":"text/html; charset=utf-8", ".css":"text/css; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".json":"application/json; charset=utf-8", ".svg":"image/svg+xml" };
function send(res, status, data, type="application/json; charset=utf-8") { res.writeHead(status, { "content-type":type, "cache-control":"no-store" }); res.end(typeof data==="string" ? data : JSON.stringify(data)); }
function readBody(req) { return new Promise((resolve,reject)=>{ let body=""; req.on("data",chunk=>{ body+=chunk; if(body.length>1_000_000) reject(new Error("Request too large")); }); req.on("end",()=>{ try{resolve(body?JSON.parse(body):{});}catch{reject(new Error("Invalid JSON"));} }); req.on("error",reject); }); }
const server=http.createServer(async(req,res)=>{
 const url=new URL(req.url,"http://localhost");
 if(req.method==="OPTIONS"){res.writeHead(204,{"access-control-allow-methods":"GET,POST,OPTIONS","access-control-allow-headers":"content-type"});return res.end();}
 if(url.pathname==="/api/health") return send(res,200,{ok:true,service:"terrasim-autonomous-city",version:"1.0.0",aiConfigured:Boolean(process.env.AI_API_KEY),timestamp:new Date().toISOString()});
 if(url.pathname==="/api/plan"&&req.method==="POST"){
  let body;try{body=await readBody(req);}catch(e){return send(res,400,{error:e.message});}
  const prompt=String(body.prompt||"").trim().slice(0,4000);if(!prompt)return send(res,400,{error:"Provide a civilization goal or question."});
  if(!process.env.AI_API_KEY)return send(res,200,{mode:"local",plan:"AI provider is not connected yet. The local simulation runs with built-in decision rules. To enable AI planning, configure AI_API_KEY, AI_BASE_URL, and AI_MODEL as private service environment variables.",aiConfigured:false});
  const base=(process.env.AI_BASE_URL||"https://api.openai.com/v1").replace(/\/+$/,"");const model=process.env.AI_MODEL||"gpt-4.1-mini";
  try{const upstream=await fetch(base+"/chat/completions",{method:"POST",headers:{"content-type":"application/json","authorization":"Bearer "+process.env.AI_API_KEY},body:JSON.stringify({model,temperature:.4,messages:[{role:"system",content:"You are TerraSim's civilization planning advisor. Help a simulation of 50 agents develop a sustainable city on a small grid. Give practical, resource-aware steps. Do not claim actions were executed. Keep responses concise."},{role:"user",content:prompt+"\nCurrent simulation snapshot: "+JSON.stringify({day:body.day,food:body.food,materials:body.materials,knowledge:body.knowledge,happiness:body.happiness,housing:body.housing,buildings:body.buildings})}]})});
   const result=await upstream.json().catch(()=>({}));if(!upstream.ok)return send(res,502,{error:"AI provider request failed",detail:result.error?.message||("HTTP "+upstream.status)});
   return send(res,200,{mode:"ai",aiConfigured:true,model,plan:result.choices?.[0]?.message?.content||"No plan returned."});
  }catch(e){return send(res,502,{error:"Could not reach AI provider",detail:e.message});}
 }
 if(url.pathname.startsWith("/api/"))return send(res,404,{error:"API route not found"});
 const requested=url.pathname==="/"?"/public/index.html":url.pathname;const file=path.resolve(ROOT,"."+requested);
 if(!file.startsWith(path.resolve(ROOT)+path.sep))return send(res,403,{error:"Forbidden"});
 fs.readFile(file,(err,bytes)=>{if(err)return send(res,404,"Not found","text/plain; charset=utf-8");send(res,200,bytes.toString(),MIME[path.extname(file)]||"application/octet-stream");});
});
server.listen(PORT,"0.0.0.0",()=>console.log("TerraSim listening on "+PORT));