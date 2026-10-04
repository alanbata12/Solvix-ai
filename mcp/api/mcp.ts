import { createMcpHandler, McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";

const REPO = "alanbata12/Solvix-ai";
const GITHUB_API = "https://api.github.com";
const VERCEL_API = "https://api.vercel.com";

function githubHeaders() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN is not configured on the Solvix MCP deployment.");
  return { Accept: "application/vnd.github+json", Authorization: "Bearer " + token, "X-GitHub-Api-Version": "2022-11-28", "Content-Type": "application/json" };
}
async function github(path: string, init?: RequestInit) {
  const response = await fetch(GITHUB_API + path, { ...init, headers: { ...githubHeaders(), ...(init?.headers ?? {}) } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`GitHub API ${response.status}: ${data?.message ?? "request failed"}`);
  return data;
}
function vercelHeaders() {
  const token = process.env.VERCEL_TOKEN;
  if (!token) throw new Error("VERCEL_TOKEN is not configured on the Solvix MCP deployment.");
  return { Authorization: "Bearer " + token, "Content-Type": "application/json" };
}
async function vercel(path: string, init?: RequestInit) {
  const response = await fetch(VERCEL_API + path, { ...init, headers: { ...vercelHeaders(), ...(init?.headers ?? {}) } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`Vercel API ${response.status}: ${data?.error?.message ?? "request failed"}`);
  return data;
}
function registerTools(server: McpServer) {
  server.registerTool("solvix_status",{description:"Return Solvix MCP connectivity and enabled capabilities.",inputSchema:z.object({}),annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:false}},async()=>({content:[{type:"text",text:JSON.stringify({ok:true,service:"solvix-grok-mcp",version:"1.0.0",repository:REPO,githubWrite:Boolean(process.env.GITHUB_TOKEN),vercelAccess:Boolean(process.env.VERCEL_TOKEN),vercelTeam:process.env.VERCEL_TEAM_ID??null,backendAccess:Boolean(process.env.SOLVIX_BACKEND_URL&&process.env.SOLVIX_BACKEND_TOKEN)})}]}));
  server.registerTool("github_get_file",{description:"Read a text file from the Solvix GitHub repository.",inputSchema:z.object({path:z.string().min(1),ref:z.string().default("main")}),annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:false}},async({path,ref})=>{const encoded=path.split("/").map(encodeURIComponent).join("/");const data=await github("/repos/"+REPO+"/contents/"+encoded+"?ref="+encodeURIComponent(ref));if(Array.isArray(data)||data.type!=="file")throw new Error("The requested path is not a single file.");return{content:[{type:"text",text:JSON.stringify({path,ref,sha:data.sha,content:Buffer.from(data.content??"","base64").toString("utf8")})}]};});
  server.registerTool("github_search_code",{description:"Search the Solvix repository for code or configuration.",inputSchema:z.object({query:z.string().min(1)}),annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:false}},async({query})=>{const data=await github("/search/code?q="+encodeURIComponent(query+" repo:"+REPO));return{content:[{type:"text",text:JSON.stringify(data.items??[])}]};});
  server.registerTool("github_create_branch",{description:"Create a Solvix GitHub branch.",inputSchema:z.object({branch:z.string().min(1),base:z.string().default("main")}),annotations:{readOnlyHint:false,destructiveHint:false,openWorldHint:false}},async({branch,base})=>{const ref=await github("/repos/"+REPO+"/git/ref/heads/"+encodeURIComponent(base));const data=await github("/repos/"+REPO+"/git/refs",{method:"POST",body:JSON.stringify({ref:"refs/heads/"+branch,sha:ref.object.sha})});return{content:[{type:"text",text:JSON.stringify({branch,sha:data.object?.sha})}]};});
  server.registerTool("github_write_file",{description:"Create or replace a text file in Solvix. Provide the current sha when updating an existing file.",inputSchema:z.object({path:z.string().min(1),content:z.string(),message:z.string().min(1),branch:z.string().default("main"),sha:z.string().optional()}),annotations:{readOnlyHint:false,destructiveHint:false,openWorldHint:false}},async({path,content,message,branch,sha})=>{const encoded=path.split("/").map(encodeURIComponent).join("/");const body:Record<string,unknown>={message,content:Buffer.from(content,"utf8").toString("base64"),branch};if(sha)body.sha=sha;const data=await github("/repos/"+REPO+"/contents/"+encoded,{method:"PUT",body:JSON.stringify(body)});return{content:[{type:"text",text:JSON.stringify({path,branch,commit:data.commit?.sha,contentSha:data.content?.sha})}]};});
  server.registerTool("github_delete_file",{description:"Delete a file from Solvix GitHub. Requires the current file sha.",inputSchema:z.object({path:z.string().min(1),sha:z.string().min(1),message:z.string().min(1),branch:z.string().default("main")}),annotations:{readOnlyHint:false,destructiveHint:true,openWorldHint:false}},async({path,sha,message,branch})=>{const encoded=path.split("/").map(encodeURIComponent).join("/");const data=await github("/repos/"+REPO+"/contents/"+encoded,{method:"DELETE",body:JSON.stringify({message,sha,branch})});return{content:[{type:"text",text:JSON.stringify({path,branch,commit:data.commit?.sha})}]};});
  server.registerTool("vercel_deployments",{description:"List Solvix Vercel deployments and states.",inputSchema:z.object({projectId:z.string().optional(),limit:z.number().int().min(1).max(100).default(10)}),annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:false}},async({projectId,limit})=>{const qs=new URLSearchParams({limit:String(limit)});if(process.env.VERCEL_TEAM_ID)qs.set("teamId",process.env.VERCEL_TEAM_ID);if(projectId)qs.set("projectId",projectId);const data=await vercel("/v6/deployments?"+qs.toString());return{content:[{type:"text",text:JSON.stringify(data.deployments??[])}]};});
  server.registerTool("vercel_deployment_events",{description:"Read build/deployment events for a Solvix Vercel deployment.",inputSchema:z.object({deploymentId:z.string().min(1)}),annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:false}},async({deploymentId})=>{const qs=process.env.VERCEL_TEAM_ID?"?teamId="+encodeURIComponent(process.env.VERCEL_TEAM_ID):"";const data=await vercel("/v3/deployments/"+encodeURIComponent(deploymentId)+"/events"+qs);return{content:[{type:"text",text:JSON.stringify(data)}]};});
  server.registerTool("solvix_backend_request",{description:"Call an explicitly configured Solvix backend endpoint. Server credentials remain private.",inputSchema:z.object({method:z.enum(["GET","POST","PUT","PATCH","DELETE"]),path:z.string().regex(/^\//),body:z.any().optional()}),annotations:{readOnlyHint:false,destructiveHint:false,openWorldHint:true}},async({method,path,body})=>{const base=process.env.SOLVIX_BACKEND_URL,token=process.env.SOLVIX_BACKEND_TOKEN;if(!base||!token)throw new Error("SOLVIX_BACKEND_URL and SOLVIX_BACKEND_TOKEN must be configured.");const url=new URL(path,base).toString();const response=await fetch(url,{method,headers:{Authorization:"Bearer "+token,"Content-Type":"application/json"},body:method==="GET"?undefined:JSON.stringify(body??{})});const textBody=await response.text();return{content:[{type:"text",text:JSON.stringify({status:response.status,body:textBody.slice(0,50000)})}]};});
}
const handler=createMcpHandler(()=>{const server=new McpServer({name:"solvix-grok-mcp",version:"1.0.0"},{instructions:"Solvix MCP gateway. Inspect status first. Use GitHub/Vercel tools for engineering operations and the Solvix backend tool for application operations. Never expose server-side credentials."});registerTools(server);return server;});
export default {async fetch(request:Request){const expected=process.env.SOLVIX_MCP_API_KEY;if(!expected||request.headers.get("authorization")!=="Bearer "+expected)return new Response("Unauthorized",{status:401,headers:{"WWW-Authenticate":"Bearer"}});return handler.fetch(request);}};
