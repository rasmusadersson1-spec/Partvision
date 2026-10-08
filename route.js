import OpenAI from "openai";
export const runtime="nodejs";
const client=new OpenAI({apiKey:process.env.OPENAI_API_KEY});
export async function POST(req){try{
 if(!process.env.OPENAI_API_KEY)return Response.json({error:"OPENAI_API_KEY saknas."},{status:500});
 const form=await req.formData(),image=form.get("image"),hint=form.get("hint")||"";
 if(!image||typeof image==="string")return Response.json({error:"Ingen bild skickades."},{status:400});
 const b=Buffer.from(await image.arrayBuffer()).toString("base64"),mime=image.type||"image/jpeg";
 const prompt=`Du är PartVision, en teknisk reservdelsidentifierare. Analysera bilden försiktigt. Läs synlig text. Identifiera komponenttyp, tillverkare, modell/serie och artikelnummer om det kan beläggas. Hitta inte på nummer. Ange alternativa kandidater och vad som måste verifieras. Extra ledtråd: ${hint||"(ingen)"}. Svara ENDAST som giltig JSON med fälten component_type,manufacturer,model_or_series,part_number,confidence_percent,visible_markings,observations,likely_applications,alternative_candidates,what_to_photograph_next,verification_needed.`;
 const r=await client.responses.create({model:"gpt-6-luna",input:[{role:"user",content:[{type:"input_text",text:prompt},{type:"input_image",image_url:`data:${mime};base64,${b}`}]}]});
 let t=r.output_text.trim(),d;try{d=JSON.parse(t)}catch{const m=t.match(/\{[\s\S]*\}/);if(!m)throw Error("Ogiltigt AI-svar");d=JSON.parse(m[0])}return Response.json(d);
 }catch(e){return Response.json({error:e.message||"AI-anrop misslyckades."},{status:500})}}