import OpenAI from "openai";
import {createClient} from "@supabase/supabase-js";

//OpenAI Configuration
if(!process.env.OPENAI_API_KEY) throw new Error("Missing OpenAI API key in environment variables."); {
  export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  })
}

//Supabase Configuration
const sbPrivateKey = process.env.SUPABASE_PROJECT_ID;
if(!sbPrivateKey) throw new Error("Missing Supabase project ID in environment variables."); 
const sbUrl = process.env.SUPABASE_URL;
if(!sbUrl) throw new Error("Missing Supabase URL in environment variables.");

export const supabase = createClient(sbUrl, sbPrivateKey);