#!/usr/bin/env node
import { createReadStream, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve(process.cwd());
const port = Number(process.argv[2] || 8000);
const types = { ".html":"text/html; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".css":"text/css; charset=utf-8", ".json":"application/json; charset=utf-8", ".svg":"image/svg+xml", ".webmanifest":"application/manifest+json", ".xml":"application/xml; charset=utf-8", ".txt":"text/plain; charset=utf-8", ".md":"text/markdown; charset=utf-8" };

createServer((request,response)=>{
  const pathname=decodeURIComponent(new URL(request.url,"http://localhost").pathname);
  const relative=normalize(pathname).replace(/^([/\\])+/,"");
  let file=join(root,relative||"index.html");
  if(!file.startsWith(root)){response.writeHead(403);response.end("Forbidden");return}
  try{if(statSync(file).isDirectory())file=join(file,"index.html");response.writeHead(200,{"Content-Type":types[extname(file)]||"application/octet-stream","Cache-Control":"no-cache"});createReadStream(file).pipe(response)}catch{response.writeHead(404,{"Content-Type":"text/html; charset=utf-8"});createReadStream(join(root,"404.html")).pipe(response)}
}).listen(port,"127.0.0.1",()=>console.log(`Day R Clan Hub: http://127.0.0.1:${port}/`));
