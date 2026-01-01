import os
import sympy
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from dotenv import load_dotenv
from google import genai

# Load environment variables
load_dotenv()

app = FastAPI()

# 1. CORS CONFIGURATION
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. CLIENT INITIALIZATION
try:
    supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
    
    # Initialize the new google-genai client
    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
    # Use gemini-2.0-flash for the latest features and stability
    MODEL_ID = "gemini-2.0-flash"
    
except Exception as e:
    print(f"CRITICAL: System initialization failed: {e}")

@app.get("/")
async def root():
    return {"status": "Hybrid Assistant API active", "model": "gemini-2.0-flash"}

@app.post("/chat")
async def chat(request: Request):
    try:
        body = await request.json()
        user_input = str(body.get("message", ""))
        session_id = body.get("session_id", "user_1")

        if not user_input:
            return {"response": "Please enter a message."}

        # --- PATH 1: ARITHMETIC (Immediate Response) ---
        # Handles simple math like 88+12
        if all(c in "0123456789+-*/(). " for c in user_input) and any(c in "+-*/" for c in user_input):
            try:
                result = eval(user_input)
                return {"response": f"**Calculation Result:** `{user_input} = {result}`"}
            except:
                pass 

        # --- DB LOGGING (User) ---
        try:
            supabase.table("chat_messages").insert({
                "session_id": session_id, "role": "user", "content": user_input
            }).execute()
        except: pass

        final_response = None

        # --- PATH 2: SYMBOLIC MATH (SymPy Engine) ---
        math_triggers = ['sqrt', '^', 'log', 'sin', 'cos', 'tan', 'integrate', 'diff', 'limit']
        if any(trigger in user_input.lower() for trigger in math_triggers):
            try:
                expr = sympy.sympify(user_input.replace('^', '**'))
                res = sympy.simplify(expr)
                final_response = f"**Symbolic Computation Result:** $${sympy.latex(res)}$$ \n\n (via Math Engine)"
            except:
                final_response = None

        # --- PATH 3: LLM FALLBACK (google-genai) ---
        if not final_response:
            # Modern generation syntax using the latest SDK
            response = client.models.generate_content(
                model=MODEL_ID,
                contents=user_input
            )
            final_response = response.text

        # --- DB LOGGING (Model) ---
        try:
            supabase.table("chat_messages").insert({
                "session_id": session_id, "role": "model", "content": final_response
            }).execute()
        except: pass

        return {"response": final_response}

    except Exception as global_err:
        print(f"Global Error: {global_err}")
        return {"response": f"System Error: {str(global_err)}"}