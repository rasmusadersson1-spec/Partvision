"use client";
import {useState} from "react";
export default function Home(){
 const [file,setFile]=useState(null),[preview,setPreview]=useState(""),[hint,setHint]=useState(""),[result,setResult]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState("");
 function choose(e){const f=e.target.files?.[0];if(!f)return;setFile(f);setPreview(URL.createObjectURL(f));setResult(null);setError("")}
 async function analyze(){if(!file)return;setBusy(true);setError("");setResult(null);const fd=new FormData();fd.append("image",file);fd.append("hint",hint);
 try{const r=await fetch("/api/analyze",{method:"POST",body:fd});const d=await r.json();if(!r.ok)throw Error(d.error||"Något gick fel");setResult(d)}catch(e){setError(e.message)}finally{setBusy(false)}}
 return <main><div className="wrap"><div className="badge">PARTVISION · PROTOTYP</div><h1>Vad håller du i handen?</h1><p className="lead">Ladda upp ett foto på en reservdel eller maskinkomponent.</p>
 <section className="card"><label className="drop">{preview?<img src={preview} alt="Förhandsvisning"/>:<div className="placeholder">📷<br/><span>Välj ett foto</span></div>}<input type="file" accept="image/*" onChange={choose}/></label>
 <input className="hint" value={hint} onChange={e=>setHint(e.target.value)} placeholder="Valfri ledtråd, t.ex. från en John Deere"/>
 <button disabled={!file||busy} onClick={analyze}>{busy?"Analyserar…":"🔍 Analysera komponent"}</button>{error&&<div className="error">{error}</div>}</section>
 {result&&<Result data={result}/>}</div></main>}
function Result({data}){return <section className="result"><div className="confidence"><span>AI:s säkerhet</span><strong>{data.confidence_percent??"—"}%</strong></div>
 <div className="grid">{[["Komponent",data.component_type],["Tillverkare",data.manufacturer],["Modell / serie",data.model_or_series],["Artikelnummer",data.part_number]].map(([k,v])=><div className="field" key={k}><small>{k}</small><b>{v||"Ej fastställt"}</b></div>)}</div>
 {["visible_markings","observations","likely_applications","alternative_candidates","what_to_photograph_next","verification_needed"].map((k)=><List key={k} title={{visible_markings:"Synliga märkningar",observations:"Observationer",likely_applications:"Troliga användningsområden",alternative_candidates:"Alternativa kandidater",what_to_photograph_next:"Fotografera härnäst",verification_needed:"Måste verifieras"}[k]} items={data[k]}/>)}
 <p className="warning">Prototyp: AI-svar ska verifieras mot originaldokumentation.</p></section>}
function List({title,items}){if(!items?.length)return null;return <div className="list"><h3>{title}</h3>{items.map((x,i)=><div key={i}>• {x}</div>)}</div>}