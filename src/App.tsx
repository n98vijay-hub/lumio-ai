import { useState, useEffect, useRef, ReactNode, CSSProperties } from "react";

// ─── TYPES ────────────────────────────────────────────────
interface User { name: string; email: string; }
interface Plan { name: string; price: string; period: string; emoji: string; color: string; features: string[]; cta: string; popular?: boolean; }
interface Flashcard { front: string; back: string; }
interface QuizQuestion { question: string; options: string[]; answer: string; }
interface WeekItem { week: string; topic: string; tasks: string[]; }
interface Roadmap { title: string; duration: string; overview: string; weeks: WeekItem[]; projects: string[]; skills: string[]; interview: string[]; salary: string; }
interface Message { role: "user" | "ai"; text: string; }
interface Career { title: string; emoji: string; color: string; }
interface TabItem { id: string; icon: string; label: string; }

// ─── FONT LOADER ──────────────────────────────────────────
function useFonts() {
  useEffect(() => {
    const l = document.createElement("link");
    l.href = "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Fraunces:ital,wght@0,700;0,900;1,400&display=swap";
    l.rel = "stylesheet";
    document.head.appendChild(l);
    const style = document.createElement("style");
    style.textContent = `
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { background: #0d0a1a; }
      ::-webkit-scrollbar { width: 4px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: #ff6b4a55; border-radius: 4px; }
      @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
      @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
      @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      .fadeUp { animation: fadeUp 0.5s ease forwards; }
      .card-hover:hover { transform: translateY(-2px); transition: all 0.2s ease; }
      textarea:focus, input:focus { outline: none; }
    `;
    document.head.appendChild(style);
  }, []);
}

// ─── THEME ────────────────────────────────────────────────
const T = {
  bg: "#0d0a1a", surface: "#13102a", card: "#1a1630", border: "#2a2545",
  primary: "#ff6b4a", primaryDark: "#e85535", primaryGlow: "#ff6b4a33",
  accent: "#4affd4", accentGlow: "#4affd422", gold: "#ffd166",
  text: "#f0ecff", muted: "#7b7a9a", success: "#4affd4", danger: "#ff4a6b", warning: "#ffd166",
  font: "'Outfit', sans-serif", display: "'Fraunces', serif",
};

// ─── CLAUDE API ───────────────────────────────────────────
const callClaude = async (userMessage: string, systemPrompt: string, maxTokens = 1200): Promise<string> => {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || "";
};

// ─── UI COMPONENTS ────────────────────────────────────────
type BtnVariant = "primary" | "ghost" | "muted" | "accent";

const Btn = ({ children, onClick, variant = "primary", style = {}, disabled = false }: {
  children: ReactNode; onClick?: () => void; variant?: BtnVariant;
  style?: CSSProperties; disabled?: boolean;
}) => {
  const styles: Record<BtnVariant, CSSProperties> = {
    primary: { background: `linear-gradient(135deg, ${T.primary}, ${T.primaryDark})`, color: "#fff", boxShadow: `0 4px 20px ${T.primaryGlow}` },
    ghost: { background: "transparent", color: T.primary, border: `1.5px solid ${T.primary}` },
    muted: { background: T.card, color: T.muted, border: `1px solid ${T.border}` },
    accent: { background: `linear-gradient(135deg, ${T.accent}, #22d3c0)`, color: T.bg },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: "12px 22px", borderRadius: "14px", fontFamily: T.font, fontWeight: 700,
      fontSize: "15px", border: "none", cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1, transition: "all 0.2s", ...styles[variant], ...style
    }}>{children}</button>
  );
};

const Card = ({ children, style = {}, onClick }: { children: ReactNode; style?: CSSProperties; onClick?: () => void; }) => (
  <div className="card-hover" onClick={onClick} style={{
    background: T.card, borderRadius: "20px", border: `1px solid ${T.border}`,
    padding: "24px", transition: "all 0.2s", cursor: onClick ? "pointer" : "default", ...style
  }}>{children}</div>
);

const Input = ({ value, onChange, placeholder, type = "text", style = {}, onKeyDown }: {
  value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string; type?: string; style?: CSSProperties;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}) => (
  <input type={type} value={value} onChange={onChange} placeholder={placeholder} onKeyDown={onKeyDown}
    style={{ width: "100%", padding: "14px 18px", borderRadius: "14px", border: `1.5px solid ${T.border}`, background: T.surface, color: T.text, fontSize: "15px", fontFamily: T.font, transition: "all 0.2s", ...style }} />
);

const TextArea = ({ value, onChange, placeholder, rows = 5 }: {
  value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; placeholder: string; rows?: number;
}) => (
  <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows}
    style={{ width: "100%", padding: "14px 18px", borderRadius: "14px", border: `1.5px solid ${T.border}`, background: T.surface, color: T.text, fontSize: "15px", fontFamily: T.font, resize: "vertical", lineHeight: "1.6" }} />
);

const Badge = ({ children, color = T.primary }: { children: ReactNode; color?: string; }) => (
  <span style={{ background: `${color}22`, color, borderRadius: "20px", padding: "4px 14px", fontSize: "12px", fontWeight: 700, letterSpacing: "0.5px", border: `1px solid ${color}44` }}>{children}</span>
);

const Spinner = () => (
  <div style={{ width: "20px", height: "20px", borderRadius: "50%", border: `2px solid ${T.border}`, borderTopColor: T.primary, animation: "spin 0.8s linear infinite", display: "inline-block" }} />
);

// ─── DATA ─────────────────────────────────────────────────
const PLANS: Plan[] = [
  { name: "Free", price: "$0", period: "forever", emoji: "🌱", color: T.muted, features: ["2 uploads/month", "20 flashcards", "5 career plans", "Basic AI chat"], cta: "Start Free" },
  { name: "Learner", price: "$12.99", period: "/mo", emoji: "🎓", color: T.primary, features: ["Unlimited uploads", "Unlimited flashcards", "Full career roadmaps", "Daily task tracking", "AI quiz generator"], cta: "Go Learner", popular: true },
  { name: "Pro", price: "$24.99", period: "/mo", emoji: "🚀", color: T.accent, features: ["Everything in Learner", "Interview practice AI", "Job market analysis", "3 profile accounts", "Priority support"], cta: "Go Pro" },
  { name: "School", price: "$499", period: "/mo", emoji: "🏫", color: T.gold, features: ["Entire school access", "Teacher dashboard", "Progress reports", "Custom branding", "Dedicated support"], cta: "Contact Us" },
];

const CAREERS: Career[] = [
  { title: "Data Analyst", emoji: "📊", color: T.primary },
  { title: "Web Developer", emoji: "💻", color: T.accent },
  { title: "UI/UX Designer", emoji: "🎨", color: "#c084fc" },
  { title: "AI Engineer", emoji: "🤖", color: T.gold },
  { title: "Cybersecurity", emoji: "🔒", color: "#f43f5e" },
  { title: "Digital Marketer", emoji: "📈", color: "#34d399" },
  { title: "Cloud Engineer", emoji: "☁️", color: "#60a5fa" },
  { title: "App Developer", emoji: "📱", color: "#fb923c" },
];

const TABS: TabItem[] = [
  { id: "home", icon: "🏠", label: "Home" },
  { id: "career", icon: "🚀", label: "Career" },
  { id: "flashcards", icon: "🃏", label: "Cards" },
  { id: "quiz", icon: "📝", label: "Quiz" },
  { id: "chat", icon: "💬", label: "Chat" },
];

// ─── MAIN APP ─────────────────────────────────────────────
export default function App() {
  useFonts();
  const [screen, setScreen] = useState<"login" | "signup" | "pricing" | "app">("login");
  const [user, setUser] = useState<User | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [authErr, setAuthErr] = useState("");
  const [tab, setTab] = useState("home");

  const [notes, setNotes] = useState("");
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [cardIdx, setCardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [fcLoad, setFcLoad] = useState(false);

  const [quizTopic, setQuizTopic] = useState("");
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);
  const [qLoad, setQLoad] = useState(false);

  const [careerGoal, setCareerGoal] = useState("");
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [careerLoad, setCareerLoad] = useState(false);

  const [msgs, setMsgs] = useState<Message[]>([{ role: "ai", text: "Hey! I'm Lumio ✨ I can help you learn anything, build a career roadmap, explain tough topics, or quiz you. What's on your mind?" }]);
  const [chatIn, setChatIn] = useState("");
  const [chatLoad, setChatLoad] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => { chatRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const login = () => {
    if (!form.email || !form.password) { setAuthErr("Please fill all fields."); return; }
    setUser({ name: form.email.split("@")[0], email: form.email });
    setScreen("pricing");
  };
  const signup = () => {
    if (!form.name || !form.email || !form.password) { setAuthErr("Please fill all fields."); return; }
    if (form.password.length < 6) { setAuthErr("Password must be 6+ characters."); return; }
    setUser({ name: form.name, email: form.email });
    setScreen("pricing");
  };

  const genFlashcards = async () => {
    if (!notes.trim()) return;
    setFcLoad(true); setCards([]); setCardIdx(0); setFlipped(false);
    try {
      const raw = await callClaude(`Create flashcards from:\n${notes}`,
        `Generate exactly 6 flashcards as JSON array only (no markdown): [{"front":"Q?","back":"Answer"},...] Make questions clear and concise.`);
      setCards(JSON.parse(raw.replace(/```json|```/g, "").trim()));
    } catch { setCards([{ front: "Try again", back: "Paste clearer notes and retry." }]); }
    setFcLoad(false);
  };

  const genQuiz = async () => {
    if (!quizTopic.trim()) return;
    setQLoad(true); setQuiz([]); setQIdx(0); setSelected(null); setScore(0); setQuizDone(false);
    try {
      const raw = await callClaude(`Quiz about: ${quizTopic}`,
        `Generate 5 multiple choice questions as JSON only (no markdown): [{"question":"?","options":["A","B","C","D"],"answer":"A"},...]  "answer" must exactly match one option.`);
      setQuiz(JSON.parse(raw.replace(/```json|```/g, "").trim()));
    } catch { alert("Couldn't generate quiz. Try again."); }
    setQLoad(false);
  };

  const answerQ = (opt: string) => {
    if (selected !== null) return;
    setSelected(opt);
    if (opt === quiz[qIdx].answer) setScore(s => s + 1);
    setTimeout(() => {
      if (qIdx + 1 >= quiz.length) setQuizDone(true);
      else { setQIdx(i => i + 1); setSelected(null); }
    }, 1300);
  };

  const genCareer = async () => {
    if (!careerGoal.trim()) return;
    setCareerLoad(true); setRoadmap(null);
    try {
      const raw = await callClaude(`Career goal: ${careerGoal}`,
        `Create a detailed career learning roadmap. Return ONLY valid JSON (no markdown):
{"title":"Career title","duration":"X weeks","overview":"2 sentence description","weeks":[{"week":"Week 1-2","topic":"Topic name","tasks":["task1","task2","task3"]}],"projects":["project1","project2","project3"],"skills":["skill1","skill2","skill3","skill4","skill5"],"interview":["question1","question2","question3"],"salary":"$XX,000 - $XX,000/year"}
Include 6 week ranges, 3 projects, 5 skills, 3 interview questions.`, 1500);
      setRoadmap(JSON.parse(raw.replace(/```json|```/g, "").trim()));
    } catch { alert("Couldn't generate roadmap. Try again."); }
    setCareerLoad(false);
  };

  const sendChat = async () => {
    if (!chatIn.trim() || chatLoad) return;
    const msg = chatIn; setChatIn("");
    setMsgs(prev => [...prev, { role: "user", text: msg }]);
    setChatLoad(true);
    try {
      const history = msgs.slice(-6).map(m => `${m.role === "user" ? "Student" : "Lumio"}: ${m.text}`).join("\n");
      const reply = await callClaude(`${history}\nStudent: ${msg}`,
        `You are Lumio, a brilliant, friendly AI learning coach. Help with any subject, career advice, study tips. Be warm, clear, encouraging. Use simple language. Add relevant emojis. Keep responses helpful but concise.`, 800);
      setMsgs(prev => [...prev, { role: "ai", text: reply }]);
    } catch { setMsgs(prev => [...prev, { role: "ai", text: "Oops! Had a hiccup. Try again? 😅" }]); }
    setChatLoad(false);
  };

  // ─── AUTH ─────────────────────────────────────────────────
  if (screen === "login" || screen === "signup") {
    const isLogin = screen === "login";
    return (
      <div style={{ fontFamily: T.font, background: T.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "fixed", top: "-100px", right: "-100px", width: "400px", height: "400px", background: `radial-gradient(circle, ${T.primaryGlow}, transparent 70%)`, pointerEvents: "none" }} />
        <div style={{ position: "fixed", bottom: "-100px", left: "-100px", width: "400px", height: "400px", background: `radial-gradient(circle, ${T.accentGlow}, transparent 70%)`, pointerEvents: "none" }} />
        <div className="fadeUp" style={{ width: "100%", maxWidth: "420px", background: T.card, borderRadius: "28px", padding: "44px 40px", border: `1px solid ${T.border}`, boxShadow: `0 30px 80px rgba(0,0,0,0.5)` }}>
          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <div style={{ width: "72px", height: "72px", borderRadius: "22px", background: `linear-gradient(135deg, ${T.primary}, #ff9a4a)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", margin: "0 auto 16px", boxShadow: `0 8px 30px ${T.primaryGlow}` }}>✨</div>
            <div style={{ fontFamily: T.display, fontSize: "34px", fontWeight: 900, color: T.text, letterSpacing: "-1px" }}>Lumio AI</div>
            <div style={{ color: T.muted, fontSize: "14px", marginTop: "6px" }}>{isLogin ? "Welcome back, scholar 👋" : "Start your learning journey 🚀"}</div>
          </div>
          {authErr && <div style={{ background: "#ff4a6b18", border: `1px solid ${T.danger}44`, color: T.danger, borderRadius: "12px", padding: "12px 16px", fontSize: "14px", marginBottom: "20px" }}>{authErr}</div>}
          {!isLogin && (<>
            <div style={{ color: T.muted, fontSize: "12px", fontWeight: 700, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>Your Name</div>
            <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Alex Johnson" style={{ marginBottom: "16px" }} />
          </>)}
          <div style={{ color: T.muted, fontSize: "12px", fontWeight: 700, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>Email</div>
          <Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" style={{ marginBottom: "16px" }} />
          <div style={{ color: T.muted, fontSize: "12px", fontWeight: 700, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>Password</div>
          <Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" style={{ marginBottom: "28px" }}
            onKeyDown={e => e.key === "Enter" && (isLogin ? login() : signup())} />
          <Btn onClick={isLogin ? login : signup} style={{ width: "100%", padding: "16px", fontSize: "16px" }}>
            {isLogin ? "Sign In →" : "Create Account →"}
          </Btn>
          <div style={{ textAlign: "center", marginTop: "24px", fontSize: "14px", color: T.muted }}>
            {isLogin ? "New here? " : "Already have an account? "}
            <span style={{ color: T.primary, fontWeight: 700, cursor: "pointer" }} onClick={() => { setScreen(isLogin ? "signup" : "login"); setAuthErr(""); }}>
              {isLogin ? "Create account" : "Sign in"}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ─── PRICING ──────────────────────────────────────────────
  if (screen === "pricing") return (
    <div style={{ fontFamily: T.font, background: T.bg, minHeight: "100vh", padding: "52px 20px", position: "relative" }}>
      <div style={{ position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)", width: "600px", height: "300px", background: `radial-gradient(ellipse, ${T.primaryGlow}, transparent 70%)`, pointerEvents: "none" }} />
      <div style={{ maxWidth: "1020px", margin: "0 auto" }}>
        <div className="fadeUp" style={{ textAlign: "center", marginBottom: "56px" }}>
          <Badge color={T.primary}>✨ Choose Your Plan</Badge>
          <div style={{ fontFamily: T.display, fontSize: "44px", fontWeight: 900, color: T.text, margin: "16px 0 10px", letterSpacing: "-2px" }}>Invest in Your Future</div>
          <div style={{ color: T.muted, fontSize: "16px" }}>Start free. Upgrade when ready. Cancel anytime.</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
          {PLANS.map((p, i) => (
            <div key={p.name} className="card-hover" style={{
              background: p.popular ? `linear-gradient(145deg, #1e1530, #2a1f45)` : T.card,
              borderRadius: "24px", padding: "32px 24px",
              border: p.popular ? `2px solid ${T.primary}` : `1px solid ${T.border}`,
              boxShadow: p.popular ? `0 0 60px ${T.primaryGlow}` : "none",
              position: "relative", animation: `fadeUp 0.5s ease ${i * 0.1}s both`
            }}>
              {p.popular && <div style={{ position: "absolute", top: "-14px", left: "50%", transform: "translateX(-50%)", background: `linear-gradient(135deg, ${T.primary}, #ff9a4a)`, color: "#fff", borderRadius: "20px", padding: "5px 20px", fontSize: "11px", fontWeight: 800, letterSpacing: "1px", whiteSpace: "nowrap" }}>⭐ MOST POPULAR</div>}
              <div style={{ fontSize: "36px", marginBottom: "12px" }}>{p.emoji}</div>
              <div style={{ color: p.color, fontWeight: 800, fontSize: "13px", textTransform: "uppercase", letterSpacing: "1.5px" }}>{p.name}</div>
              <div style={{ fontFamily: T.display, fontSize: "40px", fontWeight: 900, color: T.text, margin: "10px 0 4px", letterSpacing: "-1px" }}>{p.price}<span style={{ fontSize: "14px", fontWeight: 400, color: T.muted, fontFamily: T.font }}>{p.period}</span></div>
              <div style={{ height: "1px", background: T.border, margin: "20px 0" }} />
              {p.features.map(f => (
                <div key={f} style={{ display: "flex", gap: "10px", marginBottom: "10px", fontSize: "14px", color: T.text, alignItems: "flex-start" }}>
                  <span style={{ color: T.accent, flexShrink: 0 }}>✓</span>{f}
                </div>
              ))}
              <div style={{ marginTop: "24px" }}>
                <Btn onClick={() => { setPlan(p); setScreen("app"); }} variant={p.popular ? "primary" : "ghost"} style={{ width: "100%" }}>{p.cta}</Btn>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ─── HOME ─────────────────────────────────────────────────
  const HomeTab = () => (
    <div className="fadeUp">
      <div style={{ background: `linear-gradient(135deg, #1e1030, #2a1520)`, borderRadius: "24px", padding: "32px", marginBottom: "20px", border: `1px solid ${T.primary}44`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "200px", height: "200px", background: `radial-gradient(circle, ${T.primaryGlow}, transparent 70%)`, pointerEvents: "none" }} />
        <Badge color={T.primary}>{plan?.name} Plan</Badge>
        <div style={{ fontFamily: T.display, fontSize: "28px", fontWeight: 900, color: T.text, margin: "12px 0 6px" }}>Hey, {user?.name}! 👋</div>
        <div style={{ color: T.muted, fontSize: "14px", marginBottom: "24px", lineHeight: "1.6" }}>Ready to level up today? Pick where you want to start.</div>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Btn onClick={() => setTab("career")} style={{ fontSize: "14px", padding: "11px 20px" }}>🚀 Build Career Path</Btn>
          <Btn onClick={() => setTab("chat")} variant="ghost" style={{ fontSize: "14px", padding: "11px 20px" }}>💬 Ask Lumio AI</Btn>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "20px" }}>
        {[
          { icon: "🚀", title: "Career Path", desc: "AI roadmap to your dream job", color: T.primary, action: () => setTab("career") },
          { icon: "🃏", title: "Flashcards", desc: "Learn from your own notes", color: T.accent, action: () => setTab("flashcards") },
          { icon: "📝", title: "Take a Quiz", desc: "Test what you know", color: T.gold, action: () => setTab("quiz") },
          { icon: "💬", title: "AI Tutor", desc: "Ask anything, anytime", color: "#c084fc", action: () => setTab("chat") },
        ].map(item => (
          <Card key={item.title} onClick={item.action} style={{ padding: "20px" }}>
            <div style={{ fontSize: "30px", marginBottom: "10px" }}>{item.icon}</div>
            <div style={{ fontWeight: 700, fontSize: "15px", color: item.color, marginBottom: "4px" }}>{item.title}</div>
            <div style={{ color: T.muted, fontSize: "12px", lineHeight: "1.4" }}>{item.desc}</div>
          </Card>
        ))}
      </div>
      <Card>
        <div style={{ fontWeight: 700, fontSize: "15px", color: T.text, marginBottom: "16px" }}>🔥 Trending Career Paths</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "10px" }}>
          {CAREERS.map(c => (
            <div key={c.title} onClick={() => { setCareerGoal(c.title); setTab("career"); }}
              style={{ background: T.surface, borderRadius: "14px", padding: "12px", textAlign: "center", cursor: "pointer", border: `1px solid ${T.border}`, transition: "all 0.2s" }}>
              <div style={{ fontSize: "24px", marginBottom: "6px" }}>{c.emoji}</div>
              <div style={{ fontSize: "11px", fontWeight: 600, color: T.text, lineHeight: "1.3" }}>{c.title}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  // ─── CAREER ───────────────────────────────────────────────
  const CareerTab = () => (
    <div className="fadeUp">
      <div style={{ marginBottom: "24px" }}>
        <div style={{ fontFamily: T.display, fontSize: "28px", fontWeight: 900, color: T.text, marginBottom: "4px" }}>🚀 Career Path Builder</div>
        <div style={{ color: T.muted, fontSize: "14px" }}>Tell us your dream career — AI builds your complete roadmap</div>
      </div>
      {!roadmap ? (
        <>
          <Card style={{ marginBottom: "16px" }}>
            <div style={{ fontWeight: 700, color: T.text, marginBottom: "12px", fontSize: "15px" }}>What do you want to become?</div>
            <Input value={careerGoal} onChange={e => setCareerGoal(e.target.value)}
              onKeyDown={e => e.key === "Enter" && genCareer()}
              placeholder="e.g. Data Analyst, Web Developer, UX Designer..." style={{ marginBottom: "16px" }} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
              {CAREERS.slice(0, 6).map(c => (
                <button key={c.title} onClick={() => setCareerGoal(c.title)} style={{
                  background: careerGoal === c.title ? `${T.primary}22` : T.surface,
                  border: `1px solid ${careerGoal === c.title ? T.primary : T.border}`,
                  color: careerGoal === c.title ? T.primary : T.muted,
                  borderRadius: "10px", padding: "7px 14px", fontSize: "13px", fontWeight: 600,
                  cursor: "pointer", fontFamily: T.font, transition: "all 0.2s"
                }}>{c.emoji} {c.title}</button>
              ))}
            </div>
            <Btn onClick={genCareer} disabled={careerLoad || !careerGoal.trim()} style={{ width: "100%", padding: "15px" }}>
              {careerLoad ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}><Spinner /> Building your roadmap...</span> : "✨ Generate My Career Roadmap"}
            </Btn>
          </Card>
          <Card>
            <div style={{ fontWeight: 700, color: T.text, marginBottom: "16px", fontSize: "15px" }}>💡 What you'll get</div>
            {["📅 Week-by-week learning plan", "🛠️ Real projects to build for your portfolio", "💼 Skills employers are looking for", "🎤 Interview questions & answers", "💰 Expected salary range"].map(item => (
              <div key={item} style={{ display: "flex", gap: "10px", marginBottom: "10px", fontSize: "14px", color: T.muted }}>
                <span style={{ color: T.accent }}>→</span>{item}
              </div>
            ))}
          </Card>
        </>
      ) : (
        <div>
          <div style={{ background: `linear-gradient(135deg, #1e1030, #2a1520)`, borderRadius: "20px", padding: "24px", marginBottom: "16px", border: `1px solid ${T.primary}44` }}>
            <Badge color={T.primary}>Career Roadmap</Badge>
            <div style={{ fontFamily: T.display, fontSize: "26px", fontWeight: 900, color: T.text, margin: "10px 0 6px" }}>{roadmap.title}</div>
            <div style={{ color: T.muted, fontSize: "14px", marginBottom: "14px", lineHeight: "1.6" }}>{roadmap.overview}</div>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <Badge color={T.accent}>⏱️ {roadmap.duration}</Badge>
              <Badge color={T.gold}>💰 {roadmap.salary}</Badge>
            </div>
          </div>
          <Card style={{ marginBottom: "14px" }}>
            <div style={{ fontWeight: 800, color: T.text, marginBottom: "16px", fontSize: "16px" }}>📅 Your Learning Schedule</div>
            {roadmap.weeks?.map((w, i) => (
              <div key={i} style={{ display: "flex", gap: "14px", marginBottom: "16px", alignItems: "flex-start" }}>
                <div style={{ background: `linear-gradient(135deg, ${T.primary}, #ff9a4a)`, borderRadius: "12px", padding: "6px 12px", fontSize: "12px", fontWeight: 800, color: "#fff", whiteSpace: "nowrap", flexShrink: 0 }}>{w.week}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: T.text, fontSize: "14px", marginBottom: "6px" }}>{w.topic}</div>
                  {w.tasks?.map((t, j) => (
                    <div key={j} style={{ display: "flex", gap: "8px", fontSize: "13px", color: T.muted, marginBottom: "4px" }}>
                      <span style={{ color: T.accent, flexShrink: 0 }}>•</span>{t}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </Card>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
            <Card>
              <div style={{ fontWeight: 800, color: T.text, marginBottom: "14px", fontSize: "15px" }}>🛠️ Key Skills</div>
              {roadmap.skills?.map((s, i) => (
                <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px", fontSize: "13px", color: T.muted }}>
                  <span style={{ color: T.primary, fontWeight: 800 }}>✓</span>{s}
                </div>
              ))}
            </Card>
            <Card>
              <div style={{ fontWeight: 800, color: T.text, marginBottom: "14px", fontSize: "15px" }}>📁 Projects</div>
              {roadmap.projects?.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px", fontSize: "13px", color: T.muted }}>
                  <span style={{ color: T.gold }}>🔷</span>{p}
                </div>
              ))}
            </Card>
          </div>
          <Card style={{ marginBottom: "16px" }}>
            <div style={{ fontWeight: 800, color: T.text, marginBottom: "14px", fontSize: "15px" }}>🎤 Interview Practice</div>
            {roadmap.interview?.map((q, i) => (
              <div key={i} style={{ background: T.surface, borderRadius: "12px", padding: "14px", marginBottom: "10px", border: `1px solid ${T.border}`, fontSize: "14px", color: T.text, lineHeight: "1.5" }}>
                <span style={{ color: T.primary, fontWeight: 700 }}>Q{i + 1}.</span> {q}
              </div>
            ))}
          </Card>
          <div style={{ display: "flex", gap: "12px" }}>
            <Btn onClick={() => { setRoadmap(null); setCareerGoal(""); }} variant="muted" style={{ flex: 1 }}>← Try Another</Btn>
            <Btn onClick={() => { setTab("chat"); setChatIn(`Help me start learning ${roadmap.title}`); }} style={{ flex: 1 }}>💬 Start Learning →</Btn>
          </div>
        </div>
      )}
    </div>
  );

  // ─── FLASHCARDS ───────────────────────────────────────────
  const FlashcardsTab = () => (
    <div className="fadeUp">
      <div style={{ marginBottom: "24px" }}>
        <div style={{ fontFamily: T.display, fontSize: "28px", fontWeight: 900, color: T.text, marginBottom: "4px" }}>🃏 Flashcard Generator</div>
        <div style={{ color: T.muted, fontSize: "14px" }}>Paste your notes — AI makes smart study cards instantly</div>
      </div>
      {cards.length === 0 ? (
        <Card>
          <div style={{ fontWeight: 700, color: T.text, marginBottom: "12px" }}>Paste your notes or any topic</div>
          <TextArea value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="e.g. The water cycle involves evaporation, condensation and precipitation..." />
          <Btn onClick={genFlashcards} disabled={fcLoad || !notes.trim()} style={{ width: "100%", marginTop: "16px", padding: "15px" }}>
            {fcLoad ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}><Spinner /> Creating cards...</span> : "✨ Generate Flashcards"}
          </Btn>
        </Card>
      ) : (
        <>
          <div onClick={() => setFlipped(!flipped)} style={{
            background: flipped ? `linear-gradient(135deg, #0d1f2a, #0d2a25)` : `linear-gradient(135deg, #1e1030, #2a1520)`,
            borderRadius: "24px", padding: "40px 28px", minHeight: "220px", cursor: "pointer",
            border: `2px solid ${flipped ? T.accent : T.primary}`,
            boxShadow: `0 0 40px ${flipped ? T.accentGlow : T.primaryGlow}`,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            textAlign: "center", transition: "all 0.35s ease", marginBottom: "16px", position: "relative"
          }}>
            <div style={{ position: "absolute", top: "16px", right: "18px", fontSize: "12px", color: T.muted, fontWeight: 600 }}>{cardIdx + 1}/{cards.length}</div>
            <Badge color={flipped ? T.accent : T.primary}>{flipped ? "💡 Answer" : "❓ Question"}</Badge>
            <div style={{ fontFamily: T.display, fontSize: "20px", lineHeight: "1.5", color: T.text, marginTop: "16px", fontStyle: flipped ? "italic" : "normal" }}>
              {flipped ? cards[cardIdx].back : cards[cardIdx].front}
            </div>
            <div style={{ position: "absolute", bottom: "14px", fontSize: "12px", color: T.muted }}>Tap to flip</div>
          </div>
          <div style={{ background: T.surface, borderRadius: "8px", height: "6px", marginBottom: "16px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${((cardIdx + 1) / cards.length) * 100}%`, background: `linear-gradient(90deg, ${T.primary}, #ff9a4a)`, borderRadius: "8px", transition: "width 0.3s" }} />
          </div>
          <div style={{ display: "flex", gap: "12px", marginBottom: "14px" }}>
            <Btn onClick={() => { setCardIdx(i => Math.max(0, i - 1)); setFlipped(false); }} variant="muted" disabled={cardIdx === 0} style={{ flex: 1 }}>← Prev</Btn>
            <Btn onClick={() => { setCardIdx(i => Math.min(cards.length - 1, i + 1)); setFlipped(false); }} disabled={cardIdx === cards.length - 1} style={{ flex: 1 }}>Next →</Btn>
          </div>
          <Btn onClick={() => { setCards([]); setNotes(""); setCardIdx(0); setFlipped(false); }} variant="muted" style={{ width: "100%" }}>🔄 Make New Cards</Btn>
        </>
      )}
    </div>
  );

  // ─── QUIZ ─────────────────────────────────────────────────
  const QuizTab = () => (
    <div className="fadeUp">
      <div style={{ marginBottom: "24px" }}>
        <div style={{ fontFamily: T.display, fontSize: "28px", fontWeight: 900, color: T.text, marginBottom: "4px" }}>📝 Quiz Generator</div>
        <div style={{ color: T.muted, fontSize: "14px" }}>Any topic → instant 5-question quiz with scoring</div>
      </div>
      {quiz.length === 0 ? (
        <Card>
          <div style={{ fontWeight: 700, color: T.text, marginBottom: "12px" }}>What topic do you want to be tested on?</div>
          <Input value={quizTopic} onChange={e => setQuizTopic(e.target.value)}
            onKeyDown={e => e.key === "Enter" && genQuiz()}
            placeholder="e.g. World War II, Photosynthesis, Python basics..." style={{ marginBottom: "16px" }} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
            {["Mathematics", "Science", "History", "Coding", "English"].map(s => (
              <button key={s} onClick={() => setQuizTopic(s)} style={{
                background: quizTopic === s ? `${T.primary}22` : T.surface, border: `1px solid ${quizTopic === s ? T.primary : T.border}`,
                color: quizTopic === s ? T.primary : T.muted, borderRadius: "10px", padding: "7px 14px",
                fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: T.font
              }}>{s}</button>
            ))}
          </div>
          <Btn onClick={genQuiz} disabled={qLoad || !quizTopic.trim()} style={{ width: "100%", padding: "15px" }}>
            {qLoad ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}><Spinner /> Building quiz...</span> : "🧠 Generate Quiz"}
          </Btn>
        </Card>
      ) : quizDone ? (
        <Card style={{ textAlign: "center", padding: "48px 28px" }}>
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>{score >= 4 ? "🏆" : score >= 3 ? "🎉" : "📚"}</div>
          <div style={{ fontFamily: T.display, fontSize: "30px", fontWeight: 900, color: T.text, marginBottom: "8px" }}>
            {score >= 4 ? "Outstanding!" : score >= 3 ? "Well done!" : "Keep going!"}
          </div>
          <div style={{ color: T.muted, marginBottom: "28px", fontSize: "15px" }}>
            You scored <span style={{ color: T.primary, fontWeight: 900, fontSize: "24px", fontFamily: T.display }}>{score}/{quiz.length}</span> on {quizTopic}
          </div>
          <div style={{ background: T.surface, borderRadius: "16px", padding: "20px", marginBottom: "28px" }}>
            <div style={{ height: "10px", background: T.border, borderRadius: "8px", overflow: "hidden", marginBottom: "10px" }}>
              <div style={{ height: "100%", width: `${(score / quiz.length) * 100}%`, background: score >= 4 ? `linear-gradient(90deg, ${T.accent}, #22d3c0)` : `linear-gradient(90deg, ${T.primary}, #ff9a4a)`, borderRadius: "8px", transition: "width 0.8s ease" }} />
            </div>
            <div style={{ fontSize: "13px", color: T.muted }}>{Math.round((score / quiz.length) * 100)}% correct</div>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <Btn onClick={() => { setQuiz([]); setQIdx(0); setSelected(null); setScore(0); setQuizDone(false); }} variant="muted" style={{ flex: 1 }}>New Topic</Btn>
            <Btn onClick={() => { setQIdx(0); setSelected(null); setScore(0); setQuizDone(false); }} style={{ flex: 1 }}>Retry ↺</Btn>
          </div>
        </Card>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <div style={{ fontSize: "13px", color: T.muted }}>Question {qIdx + 1} of {quiz.length}</div>
            <Badge color={T.gold}>Score: {score}</Badge>
          </div>
          <div style={{ background: T.surface, borderRadius: "8px", height: "6px", marginBottom: "20px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(qIdx / quiz.length) * 100}%`, background: `linear-gradient(90deg, ${T.primary}, #ff9a4a)`, borderRadius: "8px", transition: "width 0.3s" }} />
          </div>
          <Card style={{ marginBottom: "14px", border: `1px solid ${T.primary}44` }}>
            <Badge color={T.primary}>{`Question ${qIdx + 1}`}</Badge>
            <div style={{ fontFamily: T.display, fontSize: "19px", color: T.text, lineHeight: "1.5", marginTop: "12px" }}>{quiz[qIdx].question}</div>
          </Card>
          {quiz[qIdx].options.map((opt, i) => {
            const isCorrect = opt === quiz[qIdx].answer;
            const isSelected = opt === selected;
            let bg = T.card, border = T.border, color = T.text;
            if (selected !== null) {
              if (isCorrect) { bg = "#052e1a"; border = T.accent; color = T.accent; }
              else if (isSelected) { bg = "#2e0512"; border = T.danger; color = T.danger; }
            }
            return (
              <div key={i} onClick={() => answerQ(opt)} style={{
                background: bg, border: `1.5px solid ${border}`, borderRadius: "14px",
                padding: "16px 20px", marginBottom: "10px", cursor: selected !== null ? "default" : "pointer",
                display: "flex", alignItems: "center", gap: "14px", transition: "all 0.25s"
              }}>
                <div style={{ width: "30px", height: "30px", borderRadius: "50%", border: `2px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 800, color, flexShrink: 0 }}>
                  {selected !== null && isCorrect ? "✓" : selected !== null && isSelected ? "✗" : ["A", "B", "C", "D"][i]}
                </div>
                <span style={{ fontSize: "14px", lineHeight: "1.4", color, fontWeight: 500 }}>{opt}</span>
              </div>
            );
          })}
        </>
      )}
    </div>
  );

  // ─── CHAT ─────────────────────────────────────────────────
  const ChatTab = () => (
    <div className="fadeUp" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 180px)" }}>
      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontFamily: T.display, fontSize: "28px", fontWeight: 900, color: T.text, marginBottom: "4px" }}>💬 Lumio AI Tutor</div>
        <div style={{ color: T.muted, fontSize: "14px" }}>Ask anything — any subject, any level</div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", background: T.surface, borderRadius: "20px", padding: "16px", marginBottom: "12px", border: `1px solid ${T.border}` }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: "14px" }}>
            {m.role === "ai" && (
              <div style={{ width: "34px", height: "34px", borderRadius: "12px", background: `linear-gradient(135deg, ${T.primary}, #ff9a4a)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", marginRight: "8px", flexShrink: 0 }}>✨</div>
            )}
            <div style={{
              maxWidth: "80%", padding: "13px 17px",
              borderRadius: m.role === "user" ? "18px 4px 18px 18px" : "4px 18px 18px 18px",
              background: m.role === "user" ? `linear-gradient(135deg, ${T.primary}, ${T.primaryDark})` : T.card,
              color: m.role === "user" ? "#fff" : T.text,
              fontSize: "14px", lineHeight: "1.65", border: m.role === "ai" ? `1px solid ${T.border}` : "none",
              whiteSpace: "pre-wrap"
            }}>{m.text}</div>
          </div>
        ))}
        {chatLoad && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "12px", background: `linear-gradient(135deg, ${T.primary}, #ff9a4a)`, display: "flex", alignItems: "center", justifyContent: "center" }}>✨</div>
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: "4px 18px 18px 18px", padding: "13px 17px", display: "flex", gap: "6px", alignItems: "center" }}>
              {[0, 1, 2].map(i => <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: T.primary, animation: `pulse 1s ease ${i * 0.2}s infinite` }} />)}
            </div>
          </div>
        )}
        <div ref={chatRef} />
      </div>
      <div style={{ display: "flex", gap: "8px", marginBottom: "10px", overflowX: "auto", paddingBottom: "4px" }}>
        {["Explain like I'm 10 🎯", "Give me a study plan 📅", "Quiz me on anything 📝", "Help with my career 🚀"].map(s => (
          <button key={s} onClick={() => setChatIn(s)} style={{
            background: T.surface, border: `1px solid ${T.border}`, color: T.muted,
            borderRadius: "10px", padding: "7px 14px", fontSize: "12px", fontWeight: 600,
            cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, fontFamily: T.font
          }}>{s}</button>
        ))}
      </div>
      <div style={{ display: "flex", gap: "10px" }}>
        <Input value={chatIn} onChange={e => setChatIn(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendChat()}
          placeholder="Ask anything — history, math, coding, career advice..." />
        <Btn onClick={sendChat} disabled={chatLoad} style={{ flexShrink: 0, padding: "14px 20px", fontSize: "18px" }}>→</Btn>
      </div>
    </div>
  );

  // ─── MAIN LAYOUT ──────────────────────────────────────────
  return (
    <div style={{ fontFamily: T.font, background: T.bg, color: T.text, minHeight: "100vh" }}>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: `radial-gradient(ellipse at 20% 20%, ${T.primaryGlow}, transparent 50%), radial-gradient(ellipse at 80% 80%, ${T.accentGlow}, transparent 50%)`, pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "sticky", top: 0, zIndex: 100, background: `${T.surface}ee`, backdropFilter: "blur(20px)", borderBottom: `1px solid ${T.border}`, padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: T.display, fontSize: "22px", fontWeight: 900, color: T.text, letterSpacing: "-0.5px" }}>
          <span style={{ color: T.primary }}>✨</span> Lumio AI
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Badge color={T.primary}>{plan?.name}</Badge>
          <div style={{ width: "36px", height: "36px", borderRadius: "12px", background: `linear-gradient(135deg, ${T.primary}, #ff9a4a)`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "15px" }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
        </div>
      </div>
      <div style={{ padding: "24px 20px 100px", maxWidth: "680px", margin: "0 auto", position: "relative", zIndex: 1 }}>
        {tab === "home" && <HomeTab />}
        {tab === "career" && <CareerTab />}
        {tab === "flashcards" && <FlashcardsTab />}
        {tab === "quiz" && <QuizTab />}
        {tab === "chat" && <ChatTab />}
      </div>
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100, background: `${T.surface}f0`, backdropFilter: "blur(20px)", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "space-around", padding: "10px 0 18px" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
            background: "none", border: "none", cursor: "pointer", padding: "6px 14px",
            color: tab === t.id ? T.primary : T.muted, fontWeight: tab === t.id ? 700 : 500,
            fontSize: "11px", fontFamily: T.font, transition: "all 0.2s", position: "relative"
          }}>
            {tab === t.id && <div style={{ position: "absolute", top: "-10px", left: "50%", transform: "translateX(-50%)", width: "24px", height: "3px", background: T.primary, borderRadius: "3px" }} />}
            <span style={{ fontSize: "22px" }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
