import { Routes, Route, Link, useParams, useNavigate } from "react-router-dom";
import { MessageSquare, Pin, Lock, User, Clock, ChevronRight, Send, AlertCircle, FileText, Search, Unlock, Trash2, ShieldAlert, X, VolumeX } from "lucide-react";
import { motion } from "motion/react";
import React, { useState, useEffect, useMemo } from "react";
import { db, auth } from "../lib/firebase";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  doc, 
  getDoc,
  Timestamp,
  limit,
  updateDoc,
  deleteDoc,
  increment
} from "firebase/firestore";
import { clsx } from "clsx";
import { useToast } from "../components/Toast";

export default function Forum() {
  const [userRole, setUserRole] = useState("User");
  const [userPerms, setUserPerms] = useState<any>({});

  const [isMuted, setIsMuted] = useState(false);
  const [muteData, setMuteData] = useState<any>(null);

  useEffect(() => {
    if (!auth.currentUser) return;
    const unsub = onSnapshot(doc(db, "users", auth.currentUser.uid), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setUserRole(data.role || "User");
        setUserPerms(data.permissions || {});
      }
    });

    const qMutes = query(
      collection(db, "mutes"), 
      where("targetUid", "==", auth.currentUser.uid),
      orderBy("createdAt", "desc"),
      limit(5)
    );
    const unsubMutes = onSnapshot(qMutes, (snap) => {
      const activeMute = snap.docs.find(d => !d.data().inactive);
      if (activeMute) {
        const data = activeMute.data();
        const createdAt = data.createdAt?.toDate();
        if (createdAt) {
          const durationStr = data.duration || "0 Minutes";
          const [amount, unit] = durationStr.split(" ");
          const ms = parseInt(amount) * (
            unit.startsWith("Minute") ? 60000 :
            unit.startsWith("Hour") ? 3600000 :
            unit.startsWith("Day") ? 86400000 : 0
          );
          if (Date.now() < createdAt.getTime() + ms) {
            setIsMuted(true);
            setMuteData(data);
            return;
          }
        }
      }
      setIsMuted(false);
      setMuteData(null);
    });

    return () => { unsub(); unsubMutes(); };
  }, []);

  const isStaff = ['Moderator', 'Admin', 'Super Admin', 'Forum Moderator'].includes(userRole) || userPerms.canEditForums;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-1.5 h-10 bg-(--accent) shadow-[0_0_15px_var(--glow)]" />
        <div className="flex flex-col">
          <h1 className="text-3xl font-black uppercase tracking-tighter italic font-display">PUBLIC MATRIX</h1>
          <span className="text-[9px] font-mono tracking-[0.4em] opacity-40 uppercase -mt-1">Communication Log: ReckLess Network</span>
        </div>
      </div>

      {isMuted && (
        <div className="bg-blue-500/10 border border-blue-500 p-4 mb-2 flex items-center gap-4 text-blue-500 animate-pulse">
          <VolumeX size={24} />
          <div className="flex flex-col">
            <h4 className="text-xs font-black uppercase tracking-widest">Communication Restricted</h4>
            <p className="text-[10px] font-bold uppercase opacity-80">You are currently muted for: <span className="text-white italic">{muteData?.reason}</span>. This restriction is active.</p>
          </div>
        </div>
      )}

      <Routes>
        <Route path="/" element={<ForumIndex />} />
        <Route path="/:forumId" element={<ForumSection isStaff={isStaff} isMuted={isMuted} />} />
        <Route path="/thread/:forumId/:threadId" element={<ThreadView isStaff={isStaff} isMuted={isMuted} />} />
        <Route path="/appeal" element={<BanAppealPage />} />
      </Routes>
    </div>
  );
}

function ForumIndex() {
  const [categories, setCategories] = useState<any[]>([]);
  const [forums, setForums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const qCat = query(collection(db, "categories"), orderBy("order", "asc"));
    const unsubCat = onSnapshot(qCat, (snap) => {
      setCategories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const qForums = query(collection(db, "forums"), orderBy("order", "asc"));
    const unsubForums = onSnapshot(qForums, (snap) => {
      setForums(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => {
      unsubCat();
      unsubForums();
    };
  }, []);

  const filteredForums = forums.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-(--accent) border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-black/20 p-4 border border-(--border-color)">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-(--text-secondary)">
          <span className="text-white">Forum</span>
          <ChevronRight size={10} />
          <span className="text-white/40">Home</span>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Link to="/forum/appeal" className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-colors flex items-center gap-2">
            <ShieldAlert size={12} /> Ban Appeals
          </Link>
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-black/40 border border-(--border-color) pl-10 pr-4 py-2 text-xs outline-none focus:border-(--accent) w-full"
              placeholder="Search forums..." 
            />
          </div>
        </div>
      </div>

      {categories.map(cat => (
        <ForumCategory 
          key={cat.id} 
          title={cat.name} 
          items={filteredForums.filter(f => f.categoryId === cat.id)} 
        />
      ))}
      
      {!loading && categories.length === 0 && (
        <div className="portal-card p-12 text-center text-gray-500 font-bold uppercase tracking-widest bg-black/20">
          No forum categories found. Setup required in Admin Panel.
        </div>
      )}

      <div className="portal-card p-4 flex justify-between items-center bg-black/40">
        <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest">
          <div className="flex flex-col">
            <span className="text-(--text-secondary)">Forum Mode</span>
            <span>PUBLIC ACCESS</span>
          </div>
          <div className="flex flex-col">
            <span className="text-(--text-secondary)">Sync Status</span>
            <span className="text-emerald-500">LIVE</span>
          </div>
        </div>
        <div className="text-[10px] text-right font-mono">
          <span className="text-(--text-secondary)">Current Time:</span> <span className="text-(--accent)">{new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
}

function ForumCategory({ title, items }: any) {
  return (
    <div className="flex flex-col">
      <div className="bg-black/40 backdrop-blur-md border border-white/5 p-4 flex items-center justify-between group">
        <div className="flex items-center gap-4">
          <div className="w-2 h-2 bg-(--accent) group-hover:scale-150 transition-transform" />
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white font-display neon-text">{title}</h2>
        </div>
        <div className="h-[1px] flex-1 bg-white/5 mx-6" />
        <div className="text-[9px] font-mono text-gray-700 tracking-widest uppercase">CAT_ID_{title.slice(0, 3).toUpperCase()}</div>
      </div>
      <div className="portal-card rounded-t-none border-t-0 overflow-hidden mb-6">
        <table className="vbulletin-table">
          <thead>
            <tr>
              <th className="w-16"></th>
              <th className="font-display tracking-[0.1em]">Protocol Node</th>
              <th className="w-24 text-center hidden md:table-cell">Threads</th>
              <th className="w-24 text-center hidden md:table-cell">Posts</th>
              <th className="w-80 font-display tracking-[0.1em]">Operational Intel</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} className="hover:bg-(--accent)/5 transition-colors border-b border-white/5 last:border-0 group">
                <td className="text-center bg-black/5 group-hover:bg-(--accent)/10 transition-colors">
                  <div className="relative inline-block">
                    <MessageSquare size={18} className="mx-auto text-gray-700 group-hover:text-(--accent) transition-colors" />
                    <div className="absolute inset-0 bg-(--accent) blur-md opacity-0 group-hover:opacity-20 transition-opacity" />
                  </div>
                </td>
                <td className="py-5">
                  <Link to={`/forum/${item.id}`} className="text-base font-black uppercase tracking-tight block hover:text-(--accent) transition-colors">{item.name}</Link>
                </td>
                <td className="text-center font-mono text-xs font-bold hidden md:table-cell text-gray-500 group-hover:text-white transition-colors">{item.threadCount || 0}</td>
                <td className="text-center font-mono text-xs font-bold hidden md:table-cell text-gray-500 group-hover:text-white transition-colors">{item.postCount || 0}</td>
                <td className="text-[10px] text-(--text-secondary) font-black uppercase tracking-widest py-5 opacity-40 group-hover:opacity-100 transition-opacity">
                  {item.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ForumSection({ isStaff, isMuted }: { isStaff: boolean; isMuted: boolean }) {
  const { forumId } = useParams();
  const [threads, setThreads] = useState<any[]>([]);
  const [forum, setForum] = useState<any>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!forumId) return;

    const getForum = async () => {
      const docSnap = await getDoc(doc(db, "forums", forumId));
      if (docSnap.exists()) setForum(docSnap.data());
    };
    getForum();

    const qThreads = query(
      collection(db, `forums/${forumId}/threads`),
      orderBy("sticky", "desc"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(qThreads, (snap) => {
      setThreads(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsub();
  }, [forumId]);

  const filteredThreads = threads.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.authorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const togglePin = async (threadId: string, currentState: boolean) => {
    if (!forumId || !isStaff) return;
    try {
      await updateDoc(doc(db, `forums/${forumId}/threads`, threadId), { sticky: !currentState });
      toast("info", currentState ? "Thread Unpinned" : "Thread Pinned", `The thread has been ${currentState ? 'unpinned' : 'pinned'}.`);
    } catch (e) {
      toast("error", "Error", "Failed to update pin status.");
    }
  };

  const toggleLock = async (threadId: string, currentState: boolean) => {
    if (!forumId || !isStaff) return;
    if (!window.confirm(`Are you sure you want to ${currentState ? 'unlock' : 'lock'} this thread?`)) return;
    try {
      await updateDoc(doc(db, `forums/${forumId}/threads`, threadId), { locked: !currentState });
      toast("info", currentState ? "Thread Unlocked" : "Thread Locked", `The thread has been ${currentState ? 'unlocked' : 'locked'}.`);
    } catch (e) {
      toast("error", "Error", "Failed to update thread status.");
    }
  };

  const deleteThread = async (threadId: string) => {
    if (!forumId || !isStaff || !window.confirm("CRITICAL: You are about to permanently delete this thread and all associated metadata. This action is irreversible. Continue?")) return;
    try {
      await deleteDoc(doc(db, `forums/${forumId}/threads`, threadId));
      await updateDoc(doc(db, "forums", forumId), { threadCount: increment(-1) });
      toast("success", "Thread Deleted", "The thread has been removed from the registry.");
    } catch (e) {
      toast("error", "Error", "Failed to purge thread data.");
    }
  };

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !newTitle || !newContent || !forumId) return;
    if (isMuted) {
      toast("error", "Muted", "You cannot create threads while muted.");
      return;
    }

    try {
      const threadRef = await addDoc(collection(db, `forums/${forumId}/threads`), {
        title: newTitle,
        content: newContent,
        authorId: auth.currentUser.uid,
        authorName: auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || "Unknown",
        createdAt: serverTimestamp(),
        sticky: false,
        locked: false,
        replyCount: 0,
        viewCount: 0
      });

      // Add first post for internal tracking if needed, though we already have content in thread doc for this simple version
      await addDoc(collection(db, `threads/${threadRef.id}/posts`), {
        threadId: threadRef.id,
        authorId: auth.currentUser.uid,
        authorName: auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || "Unknown",
        content: newContent,
        createdAt: serverTimestamp()
      });

      setNewTitle("");
      setNewContent("");
      setShowCreate(false);
      toast("success", "Thread Created", "Your new thread has been published.");
    } catch (e) {
      toast("error", "Post Failed", "There was an error creating your thread.");
      console.error("Error creating thread", e);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <div className="bg-black/20 p-3 border border-(--border-color) flex items-center gap-2 text-[10px] font-black uppercase text-(--text-secondary)">
          <Link to="/forum" className="hover:text-white transition-colors">Forum</Link>
          <ChevronRight size={10} />
          <span className="text-white">{forum?.name || "..."}</span>
        </div>
        <div className="flex justify-between items-center bg-black/20 p-4 border border-(--border-color) border-t-0">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center gap-2">
              <MessageSquare size={16} className="text-(--accent)" />
              <h2 className="text-lg font-black uppercase italic tracking-wider">{forum?.name || "Loading..."}</h2>
            </div>
            <div className="relative w-full max-w-xs ml-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 border border-white/10 pl-10 pr-4 py-1.5 text-[10px] uppercase font-bold outline-none focus:border-(--accent)"
                placeholder="Search threads..."
              />
            </div>
          </div>
          {auth.currentUser && (
            <button 
              onClick={() => setShowCreate(!showCreate)}
              className="bg-(--accent) text-black px-4 py-1 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-colors ml-4"
            >
              {showCreate ? "Cancel" : "New Thread"}
            </button>
          )}
        </div>
      </div>
      {/* ... rest of the render logic remains similar but uses filteredThreads ... */}

      {showCreate && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="portal-card"
        >
          <div className="portal-header">Post New Thread</div>
          <form onSubmit={handleCreateThread} className="p-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase text-(--text-secondary)">Thread Title</label>
              <input 
                required
                disabled={isMuted}
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="bg-black/20 border border-(--border-color) p-3 text-sm outline-none focus:border-(--accent) disabled:opacity-50" 
                placeholder={isMuted ? "Restricted" : "Enter a descriptive title..."}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase text-(--text-secondary)">Content</label>
              <textarea 
                required
                disabled={isMuted}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="bg-black/20 border border-(--border-color) p-3 text-sm min-h-[150px] outline-none focus:border-(--accent) transition-colors disabled:opacity-50" 
                placeholder={isMuted ? "You are currently muted and cannot create new threads." : "Post content details here..."} 
              />
            </div>
            <div className="flex justify-end gap-2">
               <button 
                 type="submit" 
                 disabled={isMuted}
                 className="bg-(--accent) text-black px-8 py-2 text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
               >
                 Create Thread
               </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="portal-card">
        <table className="vbulletin-table">
          <thead>
            <tr>
              <th className="w-12"></th>
              <th>Topic</th>
              <th className="w-32">Author</th>
              <th className="w-24 text-center">Date</th>
              <th className="w-32 text-right">Last Post</th>
            </tr>
          </thead>
          <tbody>
            {threads.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-xs text-gray-500 font-bold uppercase">No threads found in this section.</td>
              </tr>
            ) : filteredThreads.map((t) => (
              <tr key={t.id} className="hover:bg-white/5 group">
                <td className="text-center">
                  {t.sticky ? <Pin size={12} className="text-(--accent) mx-auto" /> : <FileText size={12} className="text-gray-500 mx-auto" />}
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    {t.sticky && (
                      <span className="bg-(--accent)/10 border border-(--accent)/30 text-(--accent) px-1.5 py-0.5 text-[8px] font-black uppercase tracking-tighter">
                        Sticky
                      </span>
                    )}
                    {t.locked && <Lock size={12} className="text-red-500" />}
                    <Link to={`/forum/thread/${forumId}/${t.id}`} className="text-sm font-bold hover:text-(--accent)">{t.title}</Link>
                  </div>
                  {isStaff && (
                    <div className="flex gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => togglePin(t.id, t.sticky)} className="text-[8px] font-black uppercase text-emerald-500 hover:underline">{t.sticky ? 'Unpin' : 'Pin'}</button>
                      <button onClick={() => toggleLock(t.id, t.locked)} className="text-[8px] font-black uppercase text-blue-500 hover:underline">{t.locked ? 'Unlock' : 'Lock'}</button>
                      <button onClick={() => deleteThread(t.id)} className="text-[8px] font-black uppercase text-red-500 hover:underline">Delete</button>
                    </div>
                  )}
                </td>
                <td className="text-xs font-bold text-(--text-secondary)">{t.authorName}</td>
                <td className="text-center font-mono text-[10px] text-gray-500">
                  {t.createdAt?.toDate().toLocaleDateString() || "..."}
                </td>
                <td className="text-right text-[10px] text-(--text-secondary) font-bold uppercase">
                  VIEW THREAD
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ThreadView({ isStaff, isMuted }: { isStaff: boolean; isMuted: boolean }) {
  const { forumId, threadId } = useParams();
  const [thread, setThread] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [reportingPost, setReportingPost] = useState<any | null>(null);
  const [reportReason, setReportReason] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (!forumId || !threadId) return;

    // Real-time thread metadata listener
    const unsubThread = onSnapshot(doc(db, `forums/${forumId}/threads`, threadId), (snap) => {
      if (snap.exists()) {
        setThread({ id: snap.id, ...snap.data() });
      }
    });

    const qPosts = query(
      collection(db, `threads/${threadId}/posts`),
      orderBy("createdAt", "asc")
    );
    const unsubPosts = onSnapshot(qPosts, (snap) => {
      setPosts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => {
      unsubThread();
      unsubPosts();
    };
  }, [threadId, forumId]);

  const togglePin = async () => {
    if (!forumId || !threadId || !isStaff || !thread) return;
    try {
      const newState = !thread.sticky;
      await updateDoc(doc(db, `forums/${forumId}/threads`, threadId), { sticky: newState });
      toast("info", newState ? "Thread Pinned" : "Thread Unpinned", `The topic has been ${newState ? 'prioritized' : 'restored to normal sequence'}.`);
    } catch (e) {
      toast("error", "Error", "Failed to update broadcast status.");
    }
  };

  const toggleLock = async () => {
    if (!forumId || !threadId || !isStaff || !thread) return;
    const currentState = thread.locked;
    if (!window.confirm(`Are you sure you want to ${currentState ? 'unlock' : 'lock'} this thread?`)) return;
    try {
      await updateDoc(doc(db, `forums/${forumId}/threads`, threadId), { locked: !currentState });
      toast("info", currentState ? "Thread Unlocked" : "Thread Locked", `The discussion has been ${currentState ? 'opened' : 'closed'}.`);
    } catch (e) {
      toast("error", "Error", "Failed to update discussion state.");
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !reply || !threadId) return;
    if (isMuted) {
      toast("error", "Muted", "You cannot post replies while muted.");
      return;
    }

    try {
      await addDoc(collection(db, `threads/${threadId}/posts`), {
        threadId,
        authorId: auth.currentUser.uid,
        authorName: auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || "Unknown",
        content: reply,
        createdAt: serverTimestamp()
      });
      setReply("");
      toast("success", "Reply Posted", "Your message has been added to the thread.");
    } catch (e) {
      toast("error", "Reply Failed", "Could not post your reply.");
      console.error("Error posting reply", e);
    }
  };

  const deletePost = async (postId: string) => {
    if (!isStaff || !threadId || !window.confirm("Are you sure you want to permanently delete this post?")) return;
    try {
      await deleteDoc(doc(db, `threads/${threadId}/posts`, postId));
      toast("success", "Post Deleted", "The specific post was removed from the thread.");
    } catch (e) {
      toast("error", "Error", "Failed to request post deletion.");
    }
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !reportingPost || !reportReason) return;
    try {
      await addDoc(collection(db, "reports"), {
        targetUid: reportingPost.authorId || "Unknown",
        targetUsername: reportingPost.authorName,
        reason: `[Forum Post ID: ${reportingPost.id}] ${reportReason}`,
        reportedBy: auth.currentUser.uid,
        reportedByName: auth.currentUser.displayName || "User",
        status: "Open",
        createdAt: serverTimestamp()
      });
      toast("success", "Report Filed", "The moderator team has been notified of this violation.");
      setReportingPost(null);
      setReportReason("");
    } catch (err) {
      console.error(err);
      toast("error", "Error", "Failed to file report.");
    }
  };

  if (loading) return <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-(--accent) border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-black/20 p-4 border border-(--border-color) flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase text-(--text-secondary) mb-1">
            <Link to="/forum" className="hover:text-white transition-colors">Forum</Link>
            <ChevronRight size={10} />
            <Link to={`/forum/${forumId}`} className="hover:text-white transition-colors">Section</Link>
            <ChevronRight size={10} />
            <span className="text-white">Thread</span>
          </div>
          <div className="flex items-center gap-3">
            {thread?.sticky && <Pin size={16} className="text-(--accent)" />}
            <h2 className="text-lg font-black uppercase italic tracking-wider flex items-center gap-3">
              {thread?.sticky && (
                <span className="bg-(--accent)/10 border border-(--accent)/30 text-(--accent) px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter not-italic">
                  Sticky
                </span>
              )}
              {thread?.title || "Loading..."}
              {thread?.locked && <Lock size={14} className="text-red-500" />}
            </h2>
          </div>
        </div>
        
        {isStaff && (
          <div className="flex gap-2">
            <button 
              onClick={togglePin}
              className={clsx(
                "px-4 py-1.5 text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-2",
                thread?.sticky ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
              )}
            >
              <Pin size={12} /> {thread?.sticky ? 'Pinned' : 'Pin Thread'}
            </button>
            <button 
              onClick={toggleLock}
              className={clsx(
                "px-4 py-1.5 text-[10px] font-black uppercase tracking-widest border transition-all flex items-center gap-2",
                thread?.locked ? "bg-red-500 text-white border-red-500" : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
              )}
            >
              {thread?.locked ? <Unlock size={12} /> : <Lock size={12} />}
              {thread?.locked ? 'Unlock' : 'Lock Thread'}
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {posts.map((p, idx) => (
          <Post 
            key={p.id}
            index={idx + 1}
            id={p.id}
            author={p.authorName} 
            rank={idx === 0 ? "Thread Starter" : "Member"} 
            avatar={p.authorName[0]} 
            content={p.content} 
            date={p.createdAt?.toDate().toLocaleString() || "..."}
            isStaff={isStaff}
            onDelete={deletePost}
            onReport={() => setReportingPost(p)}
          />
        ))}
      </div>

      {reportingPost && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
          <div className="portal-card w-full max-w-md">
            <div className="portal-header flex justify-between items-center">
              <span>Report Post by {reportingPost.authorName}</span>
              <button onClick={() => setReportingPost(null)}><X size={16} /></button>
            </div>
            <form onSubmit={handleReport} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase text-gray-500">Violation Reason</label>
                <textarea 
                  required
                  value={reportReason}
                  onChange={e => setReportReason(e.target.value)}
                  className="bg-black/40 border border-white/10 p-3 text-sm min-h-[100px] outline-none focus:border-red-500 transition-colors"
                  placeholder="Explain why this content violates forum rules..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setReportingPost(null)} className="px-4 py-2 text-[10px] font-bold uppercase transition-colors hover:bg-white/5">Cancel</button>
                <button type="submit" className="bg-red-600 text-white px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 transition-colors">Submit Report</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {auth.currentUser && !thread?.locked ? (
        <div className="portal-card">
          <div className="portal-header">Quick Reply</div>
          <form onSubmit={handleReply} className="p-4 flex flex-col gap-3">
            <textarea 
              required
              disabled={isMuted}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              className="w-full bg-black/40 border border-(--border-color) p-3 text-sm min-h-[150px] outline-none focus:border-(--accent) transition-colors disabled:opacity-50" 
              placeholder={isMuted ? "You are currently muted and cannot participate in public discussion." : "Type your reply here..."} 
            />
            <div className="flex justify-end gap-2">
              <button 
                type="submit" 
                disabled={isMuted}
                className="bg-(--accent) text-black px-6 py-2 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 disabled:opacity-50"
              >
                <Send size={12} /> Submit Reply
              </button>
            </div>
          </form>
        </div>
      ) : thread?.locked ? (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 text-xs font-black uppercase tracking-widest text-center">
          <Lock size={16} className="inline mr-2" /> This thread is locked.
        </div>
      ) : (
        <div className="bg-black/20 border border-(--border-color) p-4 text-xs font-black uppercase tracking-widest text-center">
          <p className="text-(--text-secondary)">You must be <Link to="/login" className="text-(--accent) hover:underline">logged in</Link> to reply.</p>
        </div>
      )}
    </div>
  );
}

function Post({ index, id, author, rank, avatar, content, date, isStaff, onDelete, onReport }: any) {
  return (
    <div className="flex portal-card min-h-[220px] flex-col md:flex-row group border-white/5 overflow-hidden" id={`post-${id}`}>
      <aside className="w-full md:w-56 bg-black/40 backdrop-blur-md border-b md:border-b-0 md:border-r border-white/5 p-6 flex flex-col items-center gap-4 group-hover:bg-black/60 transition-colors">
        <div className="relative">
          <div className="w-24 h-24 bg-(--accent)/5 border border-(--accent)/20 flex items-center justify-center text-5xl font-black text-(--accent) rotate-3 group-hover:rotate-0 transition-transform shadow-[0_0_20px_rgba(56,189,248,0.1)]">
            {avatar}
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-black rounded-full" title="Online" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="font-black uppercase tracking-tight text-white group-hover:text-(--accent) transition-colors text-lg italic">{author}</span>
          <span className={clsx(
            "text-[9px] font-black uppercase tracking-[0.3em] px-3 py-1 border leading-none shadow-sm",
            rank === 'Thread Starter' ? "bg-(--accent)/10 border-(--accent) text-(--accent) neon-shadow" : "bg-white/5 border-white/10 text-gray-500"
          )}>{rank}</span>
        </div>
        <div className="mt-2 w-full flex flex-col gap-1.5">
          <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-gray-700">
             <span>Identity</span>
             <span className="text-gray-500">VERIFIED</span>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
             <div className="h-full bg-(--accent) w-3/4 opacity-40 shadow-[0_0_10px_var(--glow)]" />
          </div>
        </div>
      </aside>
      <div className="flex-1 p-8 relative flex flex-col">
        <div className="flex justify-between items-center mb-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 border-b border-white/5 pb-3">
          <div className="flex items-center gap-3">
             <span className="bg-white/5 px-2 py-0.5 text-gray-400">#{index}</span>
             <span className="opacity-40 tracking-widest whitespace-nowrap">TRANSMISSION RECEIVED: {date}</span>
          </div>
          <div className="flex gap-4 opacity-40 group-hover:opacity-100 transition-opacity">
            {isStaff && onDelete && id && (
              <button onClick={() => onDelete(id)} className="text-red-500 hover:text-red-400 flex items-center gap-1 transition-colors">
                <Trash2 size={12} /> PURGE
              </button>
            )}
            <button className="hover:text-white transition-all flex items-center gap-1">
               <Send size={11} className="rotate-45" /> QUOTE
            </button>
            <button onClick={onReport} className="hover:text-red-500 transition-all flex items-center gap-1">
               <AlertCircle size={11} /> FLAG
            </button>
          </div>
        </div>
        <div className="text-base leading-relaxed whitespace-pre-line text-gray-300 font-medium italic opacity-90 mb-8">
          "{content}"
        </div>
        <div className="mt-auto pt-4 border-t border-white/5 flex items-center gap-2 text-[8px] font-mono tracking-widest text-gray-800">
           <div className="w-2 h-2 bg-gray-900 rounded-full animate-pulse" />
           CRC_CHECK: HEX_7F2A_B3P
        </div>
      </div>
    </div>
  );
}

function BanAppealPage() {
  const [form, setForm] = useState({ reason: "", appeal: "", inGameName: "" });
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.reason || !form.appeal || !form.inGameName) return;
    try {
      await addDoc(collection(db, "ban_appeals"), {
        ...form,
        uid: auth.currentUser?.uid,
        status: "Pending",
        createdAt: serverTimestamp()
      });
      setSubmitted(true);
      toast("success", "Appeal Filed", "Your ban appeal has been submitted for review.");
    } catch (e) {
      toast("error", "Submission Error", "Failed to file your appeal.");
      console.error("Error submitting appeal", e);
    }
  };

  if (submitted) {
    return (
      <div className="portal-card p-12 text-center">
        <ShieldAlert size={48} className="mx-auto mb-6 text-emerald-500 animate-pulse" />
        <h2 className="text-xl font-black uppercase italic mb-2 text-white">Appeal Submitted</h2>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest max-w-md mx-auto">
          Your request has been filed for staff review. Please wait up to 48 hours for a decision. Do not double-post.
        </p>
        <Link to="/forum" className="inline-block mt-8 text-[10px] font-black uppercase tracking-widest text-(--accent) hover:underline">&larr; Return to Forum</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div className="flex items-center gap-3 mb-2">
        <ShieldAlert className="text-red-500" size={24} />
        <h1 className="text-2xl font-black uppercase tracking-tighter italic">Ban Appeals</h1>
      </div>
      
      <div className="portal-card">
        <div className="portal-header">Submit Sanction Appeal</div>
        <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
          <div className="bg-red-500/10 border border-red-500/20 p-4 text-[10px] font-bold uppercase tracking-wide leading-relaxed text-red-100">
            WARNING: Lying in a ban appeal will result in a permanent blacklist from our services. Provide honest and detailed accounts of the incident.
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Character Name / ID</label>
            <input 
              required
              value={form.inGameName}
              onChange={(e) => setForm({ ...form, inGameName: e.target.value })}
              className="bg-black/40 border border-(--border-color) px-4 py-2 text-xs outline-none focus:border-red-500 uppercase font-bold" 
              placeholder="e.g. CJ_V2 (ID: 4120)"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Reason for Ban</label>
            <input 
              required
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              className="bg-black/40 border border-(--border-color) px-4 py-2 text-xs outline-none focus:border-red-500" 
              placeholder="e.g. VDM / MetaGaming"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Appeal Statement</label>
            <textarea 
              required
              value={form.appeal}
              onChange={(e) => setForm({ ...form, appeal: e.target.value })}
              className="bg-black/40 border border-(--border-color) px-4 py-3 text-xs min-h-[150px] outline-none focus:border-red-500" 
              placeholder="Detailed explanation and why you should be unbanned..."
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-red-500 text-white py-4 font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-red-500/20 hover:bg-white hover:text-black transition-colors"
          >
            File Appeal Request
          </button>
        </form>
      </div>
    </div>
  );
}
