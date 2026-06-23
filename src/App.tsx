/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from "react";
import {
  Play,
  Send,
  RefreshCw,
  FileText,
  CheckCircle,
  TrendingUp,
  Video,
  Plus,
  Users,
  Target,
  DollarSign,
  Activity,
  LogOut,
  Settings,
  Layers,
  Bot,
  Mail,
  FileSignature,
  Cpu,
  Shield,
  Globe,
  Search,
  Sparkles,
  Clock,
  User,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  Building,
  Briefcase
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { SCITBDTask, SCITBDKpi, TimeBlock, PresetPrompt, GoogleChatSpace, GoogleContact } from "./types";
import {
  INITIAL_TASKS,
  INITIAL_KPIS,
  DAILY_OPERATIONAL_CYCLE,
  PRESET_PROMPTS,
  SANDBOX_SPACES,
  SANDBOX_CONTACTS
} from "./data";
import {
  initiateGoogleLogin,
  handleOAuthRedirect,
  fetchGoogleProfile,
  fetchGoogleChatSpaces,
  fetchGoogleContacts,
  sendGoogleChatMessage,
  setCachedToken,
  setGoogleUser,
  getCachedToken,
  getGoogleUser
} from "./lib/googleAuth";

export default function App() {
  // State variables for application data
  const [tasks, setTasks] = useState<SCITBDTask[]>([]);
  const [kpis, setKpis] = useState<SCITBDKpi[]>([]);
  const [activeTab, setActiveTab] = useState<"tasks" | "kpis" | "schedule">("tasks");
  const [selectedDivision, setSelectedDivision] = useState<string>("all");

  // State for user authentication & Workspace configuration
  const [isSandbox, setIsSandbox] = useState<boolean>(true);
  const [clientId, setClientId] = useState<string>("960642349167-placeholder.apps.googleusercontent.com");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<{ name: string; email: string; photoUrl?: string } | null>(null);
  const [spaces, setSpaces] = useState<GoogleChatSpace[]>([]);
  const [contacts, setContacts] = useState<GoogleContact[]>([]);
  const [loadingWorkspace, setLoadingWorkspace] = useState<boolean>(false);
  
  // State for CEO brain actions
  const [promptCategory, setPromptCategory] = useState<string>("all");
  const [selectedPrompt, setSelectedPrompt] = useState<PresetPrompt | null>(PRESET_PROMPTS[0]);
  const [customInputPrompt, setCustomInputPrompt] = useState<string>("");
  const [useCustomPrompt, setUseCustomPrompt] = useState<boolean>(false);
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Transmission and tags state
  const [selectedChatSpace, setSelectedChatSpace] = useState<string>("");
  const [selectedContact, setSelectedContact] = useState<string>("");
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);

  // New task builder state
  const [showAddTaskModal, setShowAddTaskModal] = useState<boolean>(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskDivision, setNewTaskDivision] = useState<SCITBDTask["division"]>("marketing");
  const [newTaskPriority, setNewTaskPriority] = useState<SCITBDTask["priority"]>("HIGH");
  const [newTaskDeadline, setNewTaskDeadline] = useState("Rolling Monthly");
  const [newTaskKpi, setNewTaskKpi] = useState("");

  // Feedback notifications
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorAlert, setErrorAlert] = useState<string | null>(null);

  // UTC clock for operations cycle matching
  const [currentUtcTime, setCurrentUtcTime] = useState<string>("");
  const [activeCycleIndex, setActiveCycleIndex] = useState<number>(0);

  // Load initial datasets & trigger timers
  useEffect(() => {
    // Load local storage if stored, else defaults
    const localTasks = localStorage.getItem("scitbd_tasks");
    if (localTasks) {
      try { setTasks(JSON.parse(localTasks)); } catch { setTasks(INITIAL_TASKS); }
    } else {
      setTasks(INITIAL_TASKS);
    }

    const localKpis = localStorage.getItem("scitbd_kpis");
    if (localKpis) {
      try { setKpis(JSON.parse(localKpis)); } catch { setKpis(INITIAL_KPIS); }
    } else {
      setKpis(INITIAL_KPIS);
    }

    // Check for standard Google OAuth redirect hash fragment
    const oauthResult = handleOAuthRedirect();
    if (oauthResult) {
      const { token } = oauthResult;
      setCachedToken(token);
      setAccessToken(token);
      setIsSandbox(false);

      // Fetch official Google profile info
      fetchGoogleProfile(token)
        .then((profile) => {
          const u = { name: profile.name, email: profile.email, picture: profile.picture };
          setGoogleUser(u);
          setUserProfile({ name: profile.name, email: profile.email, photoUrl: profile.picture });
          showToast("Successfully Authenticated Google Workspace account!");
        })
        .catch((err) => {
          console.error("Failed to load Google profile", err);
          setErrorAlert("Failed to complete full profile sync with Google.");
        });
    } else {
      // Check if we already have it in memory
      const memoizedToken = getCachedToken();
      if (memoizedToken) {
        setAccessToken(memoizedToken);
        setIsSandbox(false);
        const me = getGoogleUser();
        if (me) {
          setUserProfile({ name: me.name, email: me.email, photoUrl: me.picture });
        }
      }
    }

    // Interval to calculate UTC time and operational highlight
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, "0");
      const minutes = String(now.getUTCMinutes()).padStart(2, "0");
      const seconds = String(now.getUTCSeconds()).padStart(2, "0");
      setCurrentUtcTime(`${hours}:${minutes}:${seconds} UTC`);

      // Determine cycle index:
      // 0 = 00:00 - 06:00
      // 1 = 06:00 - 12:00
      // 2 = 12:00 - 18:00
      // 3 = 18:00 - 24:00
      const currentHour = now.getUTCHours();
      if (currentHour >= 0 && currentHour < 6) setActiveCycleIndex(0);
      else if (currentHour >= 6 && currentHour < 12) setActiveCycleIndex(1);
      else if (currentHour >= 12 && currentHour < 18) setActiveCycleIndex(2);
      else setActiveCycleIndex(3);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Save tasks and KPIs to local storage whenever they change
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem("scitbd_tasks", JSON.stringify(tasks));
    }
  }, [tasks]);

  useEffect(() => {
    if (kpis.length > 0) {
      localStorage.setItem("scitbd_kpis", JSON.stringify(kpis));
    }
  }, [kpis]);

  // Synchronize Google Chat and Contacts based on space choice
  useEffect(() => {
    if (isSandbox) {
      setSpaces(SANDBOX_SPACES);
      setSelectedChatSpace(SANDBOX_SPACES[0].name);
      setContacts(SANDBOX_CONTACTS);
      setSelectedContact(SANDBOX_CONTACTS[0].id);
    } else if (accessToken) {
      setLoadingWorkspace(true);
      setErrorAlert(null);
      Promise.all([
        fetchGoogleChatSpaces(accessToken),
        fetchGoogleContacts(accessToken)
      ])
        .then(([fetchedSpaces, fetchedContacts]) => {
          if (fetchedSpaces.length > 0) {
            setSpaces(fetchedSpaces);
            setSelectedChatSpace(fetchedSpaces[0].name);
          } else {
            setSpaces(SANDBOX_SPACES);
            setSelectedChatSpace(SANDBOX_SPACES[0].name);
            setErrorAlert("No live Google Chat spaces found. Loaded sandbox spaces for channel transmission.");
          }

          if (fetchedContacts.length > 0) {
            setContacts(fetchedContacts);
            setSelectedContact(fetchedContacts[0].id);
          } else {
            setContacts(SANDBOX_CONTACTS);
            setSelectedContact(SANDBOX_CONTACTS[0].id);
          }
        })
        .catch((err) => {
          console.error(err);
          setErrorAlert(`Workspace sync failed: ${err.message}. Enabling safety Sandbox environments.`);
          setSpaces(SANDBOX_SPACES);
          setSelectedChatSpace(SANDBOX_SPACES[0].name);
          setContacts(SANDBOX_CONTACTS);
          setSelectedContact(SANDBOX_CONTACTS[0].id);
        })
        .finally(() => {
          setLoadingWorkspace(false);
        });
    }
  }, [isSandbox, accessToken]);

  // Toast feedback controller
  const showToast = (message: string) => {
    setSuccessToast(message);
    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);
  };

  // Google OAuth Log In Trigger
  const handleInitiateOAuth = () => {
    if (!clientId.trim()) {
      setErrorAlert("Please specify a valid Google OAuth Client ID first.");
      return;
    }
    const scopes = [
      "https://www.googleapis.com/auth/chat.spaces",
      "https://www.googleapis.com/auth/chat.messages",
      "https://www.googleapis.com/auth/chat.memberships",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile"
    ];
    try {
      initiateGoogleLogin(clientId, scopes);
    } catch (err: any) {
      setErrorAlert(`OAuth Redirection Failed: ${err.message}`);
    }
  };

  // Log out (clear state in-memory)
  const handleOAuthLogout = () => {
    setCachedToken(null);
    setGoogleUser(null);
    setAccessToken(null);
    setUserProfile(null);
    setIsSandbox(true);
    showToast("Signed out of Google Workspace successfully.");
  };

  // Update a task state
  const handleUpdateTaskStatus = (id: number, status: SCITBDTask["status"]) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    showToast(`Task status updated!`);
  };

  // Create customized corporate task
  const handleAddNewTask = (e: FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !newTaskKpi.trim()) {
      setErrorAlert("Please enter a title and quantitative KPI parameter.");
      return;
    }

    const t: SCITBDTask = {
      id: Date.now(),
      title: newTaskTitle,
      description: newTaskDesc,
      division: newTaskDivision,
      priority: newTaskPriority,
      deadline: newTaskDeadline,
      kpi: newTaskKpi,
      status: "not_started"
    };

    setTasks(prev => [t, ...prev]);
    setNewTaskTitle("");
    setNewTaskDesc("");
    setNewTaskKpi("");
    setShowAddTaskModal(false);
    showToast("Assigned new growth directive successfully!");
  };

  // Execute server-side Gemini command builder
  const handleExecuteCEOCommand = async () => {
    const promptText = useCustomPrompt ? customInputPrompt : selectedPrompt?.prompt;
    if (!promptText || !promptText.trim()) {
      setErrorAlert("No CEO Command directive has been selected or defined.");
      return;
    }

    setIsGenerating(true);
    setErrorAlert(null);
    setGeneratedContent("");

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptText,
          systemInstruction: `You are the visionary, relentlessly competitive Chief Executive Officer (AI Agent) of SCITBD (Social Communication IT Bangladesh). 
You never sleep, and operate in over 30 countries globally. Write a premium corporate response, campaign email sequence, proposal outline, ad script, or strategic roadmap. 
Speak with absolute executive authority, data-driven precision, and highlight high ROI. Include explicit schedules, owner roles, and KPIs where appropriate. Do not output metadata or system code. 
Return your complete strategic output formatted in clear, elegant, scannable Markdown containing bold titles, headers, bulleted lists, and tables if helpful.`
        })
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.error || "Server-side generation pipeline failed.");
      }

      const resData = await response.json();
      setGeneratedContent(resData.text || "No strategy drafted.");
      showToast("Strategic SCITBD CEO output generated successfully.");
    } catch (err: any) {
      console.error(err);
      setErrorAlert(`Gemini CEO Strategy Error: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Send content to Google Chat space (requires confirmation payload)
  const handleTransmitToGoogleChat = async () => {
    if (!generatedContent) {
      setErrorAlert("Please execute a CEO Directive to generate strategic content first.");
      return;
    }

    const targetSpace = spaces.find(s => s.name === selectedChatSpace);
    if (!targetSpace) {
      setErrorAlert("Please specify an active Google Chat Space destination.");
      return;
    }

    // MANDATORY explicit user confirmation before writing or sending on user's behalf
    const userConfirmed = window.confirm(
      `PROPT AUDIT: Do you authorize the SCITBD Autonomous Agent to transmit this executive document directly to the Google Chat space "${targetSpace.displayName}"?`
    );
    if (!userConfirmed) return;

    setIsTransmitting(true);
    setErrorAlert(null);

    try {
      let metadataAddendum = "";
      if (selectedContact) {
        const contact = contacts.find(c => c.id === selectedContact);
        if (contact) {
          metadataAddendum = `\n\n📌 *Growth Owner Assignment*\n👤 Contact: ${contact.name}\n📧 Email: ${contact.email}`;
        }
      }

      const transmitMessage = `🔥 *SCITBD CEO STRATEGIC DIRECTIVE* 🔥\n\n${generatedContent}${metadataAddendum}\n\n_Transmitted via SCITBD-CEO Autonomous Command Center_`;

      if (isSandbox) {
        // Mock transmission pipeline
        await new Promise(resolve => setTimeout(resolve, 1000));
        showToast(`Sandbox post transmitted successfully to channel "${targetSpace.displayName}"!`);
      } else if (accessToken) {
        await sendGoogleChatMessage(accessToken, targetSpace.name, transmitMessage);
        showToast(`Enterprise post successfully transmitted to live channel "${targetSpace.displayName}"!`);
      } else {
        throw new Error("Google access token is unavailable. Try toggling Sandbox mode.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorAlert(`Transmission failed: ${err.message}`);
    } finally {
      setIsTransmitting(false);
    }
  };

  // Helper function to render text securely with rich mock markdown format preview
  const parseMockMarkdownAndRender = (content: string) => {
    if (!content) {
      return (
        <div className="flex flex-col items-center justify-center text-center py-20 px-6 text-white/40">
          <Bot className="w-12 h-12 mb-4 text-emerald-400 animate-pulse" />
          <h4 className="text-base font-bold text-white uppercase tracking-wider font-mono">SCITBD CEO Strategic Vault</h4>
          <p className="text-xs text-white/60 max-w-sm mt-2 font-mono">Select a preset command on the left or type a custom company directive to generate elite high-converting collateral.</p>
        </div>
      );
    }

    const lines = content.split("\n");
    return (
      <div className="space-y-3 font-sans text-white/90 text-sm leading-relaxed">
        {lines.map((line, idx) => {
          // Headers
          if (line.startsWith("# ")) {
            return (
              <h1 key={idx} className="text-xl font-black font-sans uppercase tracking-tight text-emerald-400 border-b border-white/20 pb-2 mt-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                {line.replace("# ", "")}
              </h1>
            );
          }
          if (line.startsWith("## ")) {
            return (
              <h2 key={idx} className="text-sm font-bold font-mono uppercase tracking-wider text-white mt-5 mb-2 border-b border-white/15 pb-1 flex items-center gap-1">
                <ChevronRight className="w-4 h-4 text-emerald-400" />
                {line.replace("## ", "")}
              </h2>
            );
          }
          if (line.startsWith("### ")) {
            return (
              <h3 key={idx} className="text-xs font-semibold font-mono uppercase text-white/80 mt-4 mb-2">
                {line.replace("### ", "")}
              </h3>
            );
          }
          // horizontal rules
          if (line.trim() === "---") {
            return <hr key={idx} className="border-white/20 my-4" />;
          }
          // tables
          if (line.startsWith("|")) {
            return (
              <div key={idx} className="overflow-x-auto my-3 border border-white/20 bg-white/5 rounded-none">
                <div className="text-xs font-mono text-emerald-400 p-2 whitespace-pre leading-normal">
                  {line}
                </div>
              </div>
            );
          }
          // lists
          if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
            const rawText = line.trim().substring(2);
            return (
              <div key={idx} className="flex items-start gap-2 ml-4 my-1">
                <span className="text-emerald-400 mt-1">•</span>
                <span>{rawText}</span>
              </div>
            );
          }
          // standard paragraphs
          return <p key={idx} className="my-2 text-white/95 font-sans text-sm">{line}</p>;
        })}
      </div>
    );
  };

  const currentActiveBlock = DAILY_OPERATIONAL_CYCLE[activeCycleIndex];

  // Filtering presets based on selected category
  const filteredPresets = PRESET_PROMPTS.filter(p => promptCategory === "all" || p.category === promptCategory);

  // Filtering tasks based on selected division
  const filteredTasks = tasks.filter(t => selectedDivision === "all" || t.division === selectedDivision);

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* Upper Status Bar & Continuous 24/7 Operations Radar */}
      <div className="bg-black border-b border-white/20 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 text-white/50">
        <div className="flex items-center gap-3">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-black tracking-widest text-white uppercase font-mono">SCITBD CEO COMMAND ARCHIVE v2.0</span>
          <span className="hidden sm:inline text-white/20">|</span>
          <span className="hidden sm:inline flex items-center gap-1 font-mono text-white/70">
            <Clock className="w-3.5 h-3.5 text-white/40" />
            SYSTEM CLOCK: <span className="text-emerald-305 font-bold">{currentUtcTime}</span>
          </span>
        </div>

        {/* Global Operational Cycle Radar Notification */}
        <div className="flex items-center gap-2 bg-[#131316] border border-white/10 rounded-none px-3 py-1 text-[11px] max-w-sm overflow-hidden text-ellipsis whitespace-nowrap font-mono select-none">
          <span className="bg-emerald-400 text-black px-1.5 py-0.5 text-[9px] font-mono tracking-wider uppercase font-black">
            {currentActiveBlock?.time.split(" ")[0]} UTC
          </span>
          <span className="text-[#34d399] font-bold">{currentActiveBlock?.zone}:</span>
          <span className="text-white/60 italic">{currentActiveBlock?.task.substring(0, 40)}...</span>
        </div>

        {/* Workspace Connection Settings */}
        <div className="flex items-center gap-2 font-mono">
          <span className="text-[11px] text-white/40">MODE:</span>
          <button
            onClick={() => setIsSandbox(!isSandbox)}
            className={`px-2.5 py-0.5 rounded-none font-mono text-[10px] border transition-all uppercase font-bold cursor-pointer ${
              isSandbox 
                ? "bg-white/10 text-white border-white/25 hover:bg-white/20"
                : "bg-emerald-400/10 text-emerald-400 border-emerald-400/30 hover:bg-emerald-400/20"
            }`}
          >
            {isSandbox ? "🛠️ SANDBOX ACTIVE" : "⚡ LIVE EXECUTIVE CLIENT"}
          </button>
        </div>
      </div>

      {/* Main Executive Heading & Dashboard Intro */}
      <header className="bg-black border-b-2 border-white pt-6 pb-6 px-6 flex flex-col md:flex-row items-end justify-between gap-6 relative select-none">
        
        <div className="flex flex-col relative z-10">
          <h1 className="text-6xl font-black tracking-tighter leading-none uppercase italic text-white flex items-baseline gap-2">
            SCITBD
          </h1>
          <p className="text-xs font-mono tracking-widest text-emerald-400 mt-1.5 uppercase underline underline-offset-4">
            Chief Executive Officer — Master AI Directive
          </p>
          <p className="text-xs text-white/50 font-sans mt-2 max-w-xl leading-normal">
            Global Growth Strategy and Continuous B2B Digital Marketing Operations Hub • Bangladesh
          </p>
        </div>

        {/* User Workspace Info & Connection Module */}
        <div className="flex flex-col items-end gap-2 relative z-10 w-full md:w-auto shrink-0">
          {userProfile ? (
            <div className="flex items-center gap-3 bg-white/5 border border-white/20 p-2 text-white font-mono w-full md:w-80">
              {userProfile.photoUrl ? (
                <img src={userProfile.photoUrl} alt="User Profile" referrerPolicy="no-referrer" className="w-10 h-10 border border-white/25 shadow-sm" />
              ) : (
                <div className="w-10 h-10 bg-white/10 border border-white/20 flex items-center justify-center text-emerald-400 font-bold uppercase text-sm">
                  {userProfile.name.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold truncate text-white uppercase tracking-tight">{userProfile.name}</div>
                <div className="text-[10px] text-white/40 truncate font-mono">{userProfile.email}</div>
              </div>
              <button 
                onClick={handleOAuthLogout}
                title="Log out from Workspace" 
                className="p-1 px-2.5 bg-white/10 border border-white/20 hover:bg-neutral-850 hover:text-red-400 text-white/80 transition text-xs font-bold uppercase font-mono cursor-pointer"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="bg-white/5 p-3 border border-white/10 w-full md:w-80 flex flex-col gap-2 font-mono">
              <div className="flex items-center gap-2 text-[10px] text-emerald-400 uppercase tracking-widest">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span>Workspace: 24/7 Enterprise Link</span>
              </div>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="Insert OAuth Client ID"
                  className="bg-black text-white border border-white/20 rounded-none px-2.5 py-1 text-xs font-mono flex-1 focus:outline-none focus:border-white focus:ring-0"
                />
                <button
                  type="button"
                  onClick={handleInitiateOAuth}
                  className="bg-white hover:bg-emerald-400 text-black px-3 py-1 font-bold rounded-none text-xs transition flex items-center justify-center gap-1.5 cursor-pointer uppercase font-sans border border-white shrink-0"
                >
                  Connect
                </button>
              </div>
              <div className="text-[9px] leading-tight text-white/40 font-mono">
                Authenticates Google Chat & Contacts securely.
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Grid: Left strategy block vs Right strategy core */}
      <main className="flex-1 p-6 grid grid-cols-1 xl:grid-cols-12 gap-6 items-start relative bg-[#0A0A0B]">
        
        {/* Error Alert Bar & Feedbacks */}
        <AnimatePresence>
          {errorAlert && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="xl:col-span-12 bg-red-950/40 border-2 border-red-500/30 rounded-none p-4 flex items-start gap-3 text-red-200 text-xs font-mono mb-4 relative z-10"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <div className="flex-1">
                <span className="font-extrabold uppercase tracking-widest block text-sm">System Alert Signal</span>
                <span className="leading-relaxed mt-1 block">{errorAlert}</span>
              </div>
              <button 
                className="text-red-400 hover:text-red-200 font-extrabold ml-4"
                onClick={() => setErrorAlert(null)}
              >
                ✕
              </button>
            </motion.div>
          )}

          {successToast && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="fixed bottom-6 right-6 bg-black border-2 border-emerald-400 px-6 py-4 rounded-none shadow-2xl flex items-center gap-3 text-xs text-white z-50 font-mono"
            >
              <div className="p-1.5 bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="font-black uppercase tracking-widest text-[#34d399]">SCITBD COMMAND OK</span>
                <span className="text-white/70 mt-1 max-w-xs">{successToast}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* LEFT COLUMN: CEO Intelligence Brain Generator (Col-span 7) */}
        <div className="xl:col-span-7 flex flex-col gap-6 w-full">
          
          <div className="bg-[#0D0D10] border border-white/20 rounded-none overflow-hidden flex flex-col h-full flex-1">
            
            {/* Component Header */}
            <div className="p-5 border-b border-white/20 bg-black/40 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/5 border border-white/10 rounded-none text-emerald-400">
                  <Bot className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-black uppercase tracking-tight text-white font-mono">CEO Operational Core Brain</h3>
                  <p className="text-[11px] text-white/50 font-mono mt-0.5">Deploy high-converting campaigns instantly via Gemini 3.5 Flash</p>
                </div>
              </div>
              
              <div className="flex gap-1.5 self-center font-mono select-none">
                <button
                  onClick={() => { setPromptCategory("all"); setSelectedPrompt(filteredPresets[0]); }}
                  className={`px-3 py-1 rounded-none text-[10px] uppercase font-bold tracking-wider transition ${promptCategory === "all" ? "bg-white text-black border border-white" : "text-white/40 border border-white/10 hover:text-white hover:border-white/20 bg-transparent"}`}
                >
                  All
                </button>
                <button
                  onClick={() => { setPromptCategory("marketing"); setSelectedPrompt(PRESET_PROMPTS.find(p => p.category === "marketing") || null); }}
                  className={`px-3 py-1 rounded-none text-[10px] uppercase font-bold tracking-wider transition ${promptCategory === "marketing" ? "bg-white text-black border border-white" : "text-white/40 border border-white/10 hover:text-white hover:border-white/20 bg-transparent"}`}
                >
                  Marketing
                </button>
                <button
                  onClick={() => { setPromptCategory("bd"); setSelectedPrompt(PRESET_PROMPTS.find(p => p.category === "bd") || null); }}
                  className={`px-3 py-1 rounded-none text-[10px] uppercase font-bold tracking-wider transition ${promptCategory === "bd" ? "bg-white text-black border border-white" : "text-white/40 border border-white/10 hover:text-white hover:border-white/20 bg-transparent"}`}
                >
                  Acquisition
                </button>
                <button
                  onClick={() => { setPromptCategory("operations"); setSelectedPrompt(PRESET_PROMPTS.find(p => p.category === "operations") || null); }}
                  className={`px-3 py-1 rounded-none text-[10px] uppercase font-bold tracking-wider transition ${promptCategory === "operations" ? "bg-white text-black border border-white" : "text-white/40 border border-white/10 hover:text-white hover:border-white/20 bg-transparent"}`}
                >
                  Operations
                </button>
              </div>
            </div>

            {/* Directive Selection Frame */}
            <div className="p-5 border-b border-white/10 bg-white/[0.02]">
              <div className="flex items-center justify-between mb-3 font-mono">
                <label className="text-xs font-bold text-white/50 uppercase tracking-widest flex items-center gap-2 select-none">
                  <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                  Select Command Preset ({filteredPresets.length})
                </label>
                <button
                  type="button"
                  onClick={() => setUseCustomPrompt(!useCustomPrompt)}
                  className="text-xs text-emerald-400 hover:text-[#34d399] uppercase tracking-wider font-bold cursor-pointer transition no-underline"
                >
                  {useCustomPrompt ? "← Preset Directives" : "✎ Custom AI Directive"}
                </button>
              </div>

              {!useCustomPrompt ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar font-sans">
                  {filteredPresets.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setSelectedPrompt(preset);
                        setCustomInputPrompt(preset.prompt);
                      }}
                      className={`text-left p-3.5 rounded-none border text-xs transition duration-150 flex flex-col justify-between h-20 cursor-pointer ${
                        selectedPrompt?.id === preset.id 
                          ? "bg-white/10 border-white text-white" 
                          : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/15 text-white/80"
                      }`}
                    >
                      <span className="font-extrabold text-white uppercase tracking-tight line-clamp-1">{preset.title}</span>
                      <span className="text-[10px] text-white/50 line-clamp-1 mt-1 italic font-mono">{preset.prompt}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <textarea
                  value={customInputPrompt}
                  onChange={(e) => setCustomInputPrompt(e.target.value)}
                  placeholder="Format specialized CEO requests (e.g. 'Generate competitive proposal for Custom Hospital Portal client in UAE...')"
                  className="w-full h-24 bg-black text-white border border-white/20 rounded-none p-3 text-xs focus:outline-none focus:border-white focus:ring-0 font-mono resize-none"
                />
              )}

              {/* Run Trigger */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4 bg-black p-3 border border-white/15 font-mono select-none">
                <div className="text-xs text-white/50 max-w-sm">
                  {!useCustomPrompt ? (
                    <span>ACTIVE DIRECTIVE: <strong className="text-white uppercase font-bold">{selectedPrompt?.title}</strong></span>
                  ) : (
                    <span className="text-emerald-400 font-extrabold">✓ RUNNING CUSTOM EXECUTIVE INPUT</span>
                  )}
                </div>
                
                <button
                  type="button"
                  onClick={handleExecuteCEOCommand}
                  disabled={isGenerating}
                  className="bg-white hover:bg-[#34d399] disabled:bg-white/10 text-black disabled:text-white/30 hover:scale-100 disabled:scale-100 font-black px-5 py-2.5 rounded-none text-xs tracking-wider uppercase transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 border border-white"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>CEO Thinking...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-black" />
                      <span>Execute CEO Command</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Generated Collage strategy preview */}
            <div className="p-5 flex-1 flex flex-col min-h-96 relative bg-black/20">
              
              <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                <span className="text-xs font-bold text-white/50 uppercase tracking-widest flex items-center gap-2 font-mono">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  Strategic Output Terminal
                </span>
                
                {generatedContent && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedContent);
                      showToast("Copied content to clipboard!");
                    }}
                    className="text-xs text-emerald-400 hover:text-[#34d399] transition underline uppercase tracking-wider font-mono font-bold"
                  >
                    Copy Strategy Text_
                  </button>
                )}
              </div>

              {/* Execution window */}
              <div className="flex-1 bg-black border border-white/15 p-5 overflow-y-auto max-h-[500px] custom-scrollbar rounded-none relative">
                {isGenerating && (
                  <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center gap-3">
                    <Activity className="w-8 h-8 text-emerald-400 animate-pulse" />
                    <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest animate-pulse">Consulting Corporate Directives...</span>
                  </div>
                )}
                
                {parseMockMarkdownAndRender(generatedContent)}
              </div>

              {/* TRANSMITTER CORE: Send outputs directly to Connected spaces */}
              {generatedContent && (
                <div className="mt-4 p-4 bg-[#121215] border border-white/20 rounded-none flex flex-col gap-3 font-mono">
                  <div className="flex items-center gap-2 border-b border-white/10 pb-2 select-none">
                    <Send className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-black text-white uppercase tracking-wider">Transmit Output to Corporate Channels</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
                    
                    {/* Choose Target Space */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-bold text-white/40">
                        1. Target Google Chat Space
                      </label>
                      <select
                        value={selectedChatSpace}
                        onChange={(e) => setSelectedChatSpace(e.target.value)}
                        className="bg-black text-white border border-white/20 rounded-none p-2 text-xs focus:outline-none focus:border-white font-mono"
                      >
                        {spaces.map((s, idx) => (
                          <option key={s.name || idx} value={s.name}>
                            {s.displayName} {isSandbox ? "(Sandbox)" : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Choose growth lead tag */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-bold text-white/40">
                        2. Assign Strategic Growth Lead
                      </label>
                      <select
                        value={selectedContact}
                        onChange={(e) => setSelectedContact(e.target.value)}
                        className="bg-black text-white border border-white/20 rounded-none p-2 text-xs focus:outline-none focus:border-white font-mono"
                      >
                        <option value="">No Assignment Tag</option>
                        {contacts.map((c, idx) => (
                          <option key={c.id || idx} value={c.id}>
                            {c.name} ({c.email})
                          </option>
                        ))}
                      </select>
                    </div>

                  </div>

                  {/* Transmit action */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-2 pt-2 border-t border-white/10">
                    <span className="text-[9px] leading-snug text-white/40 max-w-sm select-none uppercase">
                      MANDATORY AUDIT CHECK: Authorizes autonomous posting signature to Google workspace api client parameters.
                    </span>
                    
                    <button
                      type="button"
                      onClick={handleTransmitToGoogleChat}
                      disabled={isTransmitting}
                      className="bg-emerald-400 hover:bg-emerald-300 disabled:bg-white/10 text-black disabled:text-white/30 font-black px-5 py-2.5 rounded-none text-xs transition flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider border border-white shrink-0"
                    >
                      {isTransmitting ? (
                        <>
                          <RefreshCw className="w-3 text-black h-3 animate-spin" />
                          <span>Posting...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3 text-black h-3" />
                          <span>Post to Chat</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>
              )}

            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: Enterprise Strategy & Operations Dashboard (Col-span 5) */}
        <div className="xl:col-span-5 flex flex-col gap-6 w-full">
          
          <div className="bg-[#0D0D10] border border-white/20 rounded-none shadow-none overflow-hidden flex flex-col min-h-[600px]">
            
            {/* Tab Controller UI */}
            <div className="flex border-b border-white/20 bg-black/40 font-mono select-none">
              <button
                type="button"
                onClick={() => setActiveTab("tasks")}
                className={`flex-1 py-3 px-4 text-xs font-black uppercase tracking-widest border-b-2 transition flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === "tasks" 
                    ? "text-[#34d399] border-emerald-400 bg-white/5" 
                    : "text-white/40 border-transparent hover:text-white hover:bg-white/5"
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>CEO Growth Tasks</span>
              </button>
              
              <button
                type="button"
                onClick={() => setActiveTab("kpis")}
                className={`flex-1 py-3 px-4 text-xs font-black uppercase tracking-widest border-b-2 transition flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === "kpis" 
                    ? "text-[#34d399] border-emerald-400 bg-white/5" 
                    : "text-white/40 border-transparent hover:text-white hover:bg-white/5"
                }`}
              >
                <Target className="w-4 h-4" />
                <span>OKR Key KPIs</span>
              </button>
              
              <button
                type="button"
                onClick={() => setActiveTab("schedule")}
                className={`flex-1 py-3 px-4 text-xs font-black uppercase tracking-widest border-b-2 transition flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === "schedule" 
                    ? "text-[#34d399] border-emerald-400 bg-white/5" 
                    : "text-white/40 border-transparent hover:text-white hover:bg-white/5"
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>24/7 Schedule</span>
              </button>
            </div>

            {/* TAB CONTENT: CEO Tasks */}
            {activeTab === "tasks" && (
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-white/50 tracking-widest">Division:</span>
                    <select
                      value={selectedDivision}
                      onChange={(e) => setSelectedDivision(e.target.value)}
                      className="bg-black text-white border border-white/20 rounded-none px-2.5 py-1 text-xs focus:outline-none focus:border-white font-mono"
                    >
                      <option value="all">Global (All)</option>
                      <option value="marketing">Brand & Marketing</option>
                      <option value="sales">Sales & Business Dev</option>
                      <option value="tech">AI & Technology Team</option>
                      <option value="success">Client Success</option>
                      <option value="finance">Growth Intelligence</option>
                    </select>
                  </div>

                  <button
                    onClick={() => setShowAddTaskModal(true)}
                    className="bg-white hover:bg-emerald-400 text-black px-3 py-1 font-bold rounded-none text-xs transition flex items-center gap-1.5 cursor-pointer uppercase border border-white font-sans shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Assign Task</span>
                  </button>
                </div>

                {/* Real-time listing scroll */}
                <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1 custom-scrollbar">
                  {filteredTasks.length === 0 ? (
                    <div className="text-center py-10 text-white/30 text-xs italic font-mono">
                      No strategic tasks assigned under this catalog filter.
                    </div>
                  ) : (
                    filteredTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`p-4 rounded-none border transition ${
                          task.status === "completed" 
                            ? "bg-black/60 border-emerald-500/20 opacity-60"
                            : task.status === "in_progress"
                              ? "bg-white/10 border-white/40"
                              : "bg-white/5 border-white/15"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex flex-col min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-black text-white tracking-wide truncate uppercase font-mono">{task.title}</span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-none font-mono font-black border ${
                                task.priority === "CRITICAL"
                                  ? "bg-red-500/15 text-red-400 border-red-500/30"
                                  : task.priority === "HIGH"
                                    ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                                    : "bg-white/10 text-white/80 border-white/20"
                              }`}>
                                {task.priority}
                              </span>
                            </div>
                            <span className="text-[10px] text-white/40 font-mono mt-1 uppercase tracking-wider">
                              Division: <span className="text-white/70 font-bold">{task.division}</span> • Deadline: <span className="text-emerald-400 font-bold">{task.deadline}</span>
                            </span>
                          </div>

                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <select
                              value={task.status}
                              onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value as SCITBDTask["status"])}
                              className="bg-black text-white border border-white/20 rounded-none px-1.5 py-0.5 text-[9px] focus:outline-none font-mono"
                            >
                              <option value="not_started">💤 Not Started</option>
                              <option value="in_progress">⚙️ In Progress</option>
                              <option value="completed">✅ Completed</option>
                            </select>
                          </div>
                        </div>

                        <p className="text-xs text-white/70 mt-2 font-sans leading-relaxed">{task.description}</p>
                        
                        <div className="mt-3 text-[10px] bg-black p-2 border border-white/10 rounded-none font-mono text-white/40">
                          🎯 <strong className="text-white/70 font-bold">KPI TARGETS: </strong> <span className="text-emerald-400 font-extrabold">{task.kpi}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: OKR key performance metrics */}
            {activeTab === "kpis" && (
              <div className="p-5 flex-1 flex flex-col">
                <div className="bg-white/[0.02] p-4 border border-white/10 mb-4 font-mono">
                  <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5 mb-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    SCITBD Board Scorecard (Continuous Monitoring)
                  </h4>
                  <p className="text-xs text-white/50 leading-relaxed font-sans">
                    Division objectives are set with rolling checkpoints. Missing targets for two consecutive parameters signals immediate escalation to CEO headquarters.
                  </p>
                </div>

                <div className="space-y-3.5 overflow-y-auto max-h-[460px] pr-1 custom-scrollbar font-mono">
                  {kpis.map((k, idx) => (
                    <div key={idx} className="p-4 bg-black border border-white/15 rounded-none">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-white uppercase tracking-wider">{k.metric}</span>
                        <span className="text-[10px] font-mono font-bold bg-white/10 text-[#34d399] border border-white/20 px-2 py-0.5 rounded-none">
                          Current: {k.current}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-white/10 text-[10px] text-white/55">
                        <div>
                          <span className="block text-[8px] uppercase font-bold text-white/40">Baseline</span>
                          <span className="font-mono text-white/80">{k.baseline}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] uppercase font-bold text-white/40">6-Month Target</span>
                          <span className="font-mono text-white/80">{k.target6m}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] uppercase font-bold text-white/40">12-Month Limit</span>
                          <span className="font-mono text-emerald-400 font-bold">{k.target12m}</span>
                        </div>
                      </div>

                      {/* Visual progress mock bar */}
                      <div className="w-full bg-[#1A1A22] h-1.5 rounded-none mt-2.5 overflow-hidden">
                        <div 
                          className="bg-[#34d399] h-full"
                          style={{ width: `${Math.min(100, Math.max(30, (idx * 9) + 40))}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: 24/7 Operating Cycle Schedule */}
            {activeTab === "schedule" && (
              <div className="p-5 flex-1 flex flex-col justify-between">
                
                <div className="space-y-3">
                  <div className="bg-white/[0.02] p-4 border border-white/10 mb-2 font-mono">
                    <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5 mb-2">
                      <Clock className="w-4 h-4 text-emerald-400" />
                      Continuous 24-Hour B2B Operations Cycle
                    </h4>
                    <p className="text-xs text-white/50 leading-relaxed font-sans">
                      As a relentless corporate executive engine, SCITBD schedules campaign outreach, ad audits, and lead scraping continuously across appropriate world zones.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {DAILY_OPERATIONAL_CYCLE.map((block, idx) => {
                      const isActiveNow = idx === activeCycleIndex;
                      return (
                        <div
                          key={idx}
                          className={`p-3.5 border transition rounded-none ${
                            isActiveNow 
                              ? "bg-white/10 border-white" 
                              : "bg-black/40 border-white/10"
                          }`}
                        >
                          <div className="flex items-center justify-between font-mono">
                            <span className="text-xs font-black text-white">{block.time}</span>
                            <span className={`text-[9px] px-2 py-0.5 rounded-none font-mono font-bold uppercase tracking-wider ${
                              isActiveNow 
                                ? "bg-emerald-400 text-black font-black" 
                                : "bg-white/5 text-white/30 border border-white/10"
                            }`}>
                              {isActiveNow ? "⚡ ACTIVE FOCUS NOW" : "STANDBY STATUS"}
                            </span>
                          </div>

                          <div className="mt-1.5 font-mono">
                            <span className="text-[10px] font-bold text-[#34d399] uppercase tracking-wide block">{block.zone}</span>
                            <p className="text-xs text-white/70 mt-1 leading-relaxed font-sans">{block.task}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4 p-3 bg-white/[0.02] border border-white/10 text-white/40 text-[10px] text-center font-mono uppercase tracking-wide select-none">
                  The AI CEO Operations Engine runs on automated, headless CRON instances synchronized to global delivery APIs.
                </div>

              </div>
            )}

          </div>

        </div>

      </main>

      {/* FOOTER */}
      <footer className="bg-black border-t-2 border-white p-6 mt-auto text-white/40 text-xs flex flex-col md:flex-row items-center justify-between gap-4 font-mono select-none">
        <div className="flex items-center gap-2">
          <span>© 2026 Social Communication IT Bangladesh (SCITBD). AUTONOMOUS ENTERPRISE CONTROL.</span>
        </div>
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-4 gap-y-2 text-[10px] uppercase font-black tracking-wider text-emerald-400">
          <span>✓ ISO 27001 SECURITIES</span>
          <span>•</span>
          <span>OPERATIONAL REACH: 30+ COUNTRIES</span>
          <span>•</span>
          <span className="text-white">USD / BDT / EUR OK</span>
        </div>
      </footer>

      {/* ADD TASK MODAL POPUP */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#0D0D10] border-2 border-white max-w-md w-full overflow-hidden font-mono shadow-2xl rounded-none"
          >
            <div className="p-5 border-b border-white/20 bg-black/40 flex items-center justify-between select-none">
              <h3 className="text-xs font-black uppercase text-white tracking-widest">Assign OKR Growth Task</h3>
              <button 
                onClick={() => setShowAddTaskModal(false)}
                className="text-white hover:text-red-400 font-extrabold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNewTask} className="p-5 space-y-4">
              
              <div>
                <label className="text-[9px] uppercase font-bold text-white/50 block mb-1 tracking-widest">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Expand bKash Integration Coverage"
                  className="w-full bg-black text-white border border-white/20 rounded-none p-2 text-xs focus:outline-none focus:border-white font-mono placeholder:text-white/20"
                />
              </div>

              <div>
                <label className="text-[9px] uppercase font-bold text-white/50 block mb-1 tracking-widest">Scope Description</label>
                <textarea
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Draft details of objectives, expectations, and targeted outcomes..."
                  className="w-full h-20 bg-black text-white border border-white/20 rounded-none p-2 text-xs focus:outline-none focus:border-white resize-none font-mono placeholder:text-white/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] uppercase font-bold text-white/50 block mb-1 tracking-widest">Assigned Division</label>
                  <select
                    value={newTaskDivision}
                    onChange={(e) => setNewTaskDivision(e.target.value as SCITBDTask["division"])}
                    className="w-full bg-black text-white border border-white/20 rounded-none p-2 text-xs focus:outline-none focus:border-white font-mono"
                  >
                    <option value="marketing">Brand & Marketing</option>
                    <option value="sales">Sales & Business Dev</option>
                    <option value="tech">AI & Technology Team</option>
                    <option value="success">Client Success</option>
                    <option value="finance">Growth Intelligence</option>
                  </select>
                </div>

                <div>
                  <label className="text-[9px] uppercase font-bold text-white/50 block mb-1 tracking-widest">Priority Metric</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as SCITBDTask["priority"])}
                    className="w-full bg-black text-white border border-white/20 rounded-none p-2 text-xs focus:outline-none focus:border-white font-mono"
                  >
                    <option value="CRITICAL">🔴 CRITICAL</option>
                    <option value="HIGH">🟡 HIGH</option>
                    <option value="MEDIUM">🟢 MEDIUM</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] uppercase font-bold text-white/50 block mb-1 tracking-widest">Target Deadline</label>
                  <input
                    type="text"
                    required
                    value={newTaskDeadline}
                    onChange={(e) => setNewTaskDeadline(e.target.value)}
                    placeholder="e.g. Rolling Weekly"
                    className="w-full bg-black text-white border border-white/20 rounded-none p-2 text-xs focus:outline-none focus:border-white font-mono placeholder:text-white/20"
                  />
                </div>

                <div>
                  <label className="text-[9px] uppercase font-bold text-white/50 block mb-1 tracking-widest">Quantitative KPI</label>
                  <input
                    type="text"
                    required
                    value={newTaskKpi}
                    onChange={(e) => setNewTaskKpi(e.target.value)}
                    placeholder="e.g. Convert 4 clients/mo"
                    className="w-full bg-black text-white border border-white/20 rounded-none p-2 text-xs focus:outline-none focus:border-white font-mono placeholder:text-white/20"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-white/10 select-none">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="bg-transparent hover:bg-white/5 px-4 py-2 text-xs font-bold text-white/40 hover:text-white border border-transparent hover:border-white/10 rounded-none font-mono tracking-wide uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-white hover:bg-emerald-400 text-black px-4 py-2 text-xs font-black rounded-none border border-white uppercase tracking-wider font-mono cursor-pointer"
                >
                  Assign Directive
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
