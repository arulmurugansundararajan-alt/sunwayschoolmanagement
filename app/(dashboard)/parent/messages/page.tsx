"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogCloseButton, DialogFooter } from "@/components/ui/dialog";
import { mockMessages, mockNotifications } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";
import { Send, Bell, MessageSquare, CheckCheck } from "lucide-react";

const teachers = [
  { id: "t1", name: "Mrs. Lakshmi Devi", subject: "Class Teacher / Math", initials: "LD" },
  { id: "t2", name: "Mr. Rajan Kumar", subject: "Science Teacher", initials: "RK" },
  { id: "t3", name: "Mrs. Meenakshi", subject: "English Teacher", initials: "MM" },
];

export default function ParentMessagesPage() {
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [replySent, setReplySent] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [composeSent, setComposeSent] = useState(false);

  const notifications = mockNotifications.filter(n => n.targetRole === "parent" || n.targetRole === "all");
  const messages = mockMessages;

  const activeMsg = messages.find(m => m._id === activeThread);

  const handleReply = () => {
    if (!reply.trim()) return;
    setReplySent(true);
    setReply("");
    setTimeout(() => setReplySent(false), 2000);
  };

  const handleCompose = () => {
    if (!selectedTeacher || !body.trim()) return;
    setComposeSent(true);
    setTimeout(() => { setComposeOpen(false); setComposeSent(false); setSelectedTeacher(""); setSubject(""); setBody(""); }, 1500);
  };

  return (
    <div className="space-y-5">
      <div className="flex gap-3">
        <Button variant="default" onClick={() => setComposeOpen(true)}>
          <Send className="w-4 h-4 mr-2" /> Message a Teacher
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Messages List */}
        <div className="xl:col-span-2 space-y-3">
          <h3 className="text-sm font-bold text-gray-700">Inbox</h3>
          {messages.map((msg, i) => (
            <div
              key={msg._id}
              onClick={() => setActiveThread(msg._id === activeThread ? null : msg._id)}
              className={`bg-white rounded-xl border transition-all cursor-pointer ${
                activeThread === msg._id ? "border-purple-300 shadow-md" : "border-gray-100 hover:border-gray-200 hover:shadow-sm"
              }`}
            >
              <div className="flex items-start gap-3 p-4">
                <Avatar name={msg.senderName} size="md" colorIndex={i % 8} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{msg.senderName}</p>
                      <p className="font-medium text-gray-800 text-sm mt-0.5">{msg.subject}</p>
                    </div>
                    <div className="flex-shrink-0 flex flex-col items-end gap-1">
                      <p className="text-xs text-gray-400">{formatDate(msg.createdAt)}</p>
                      {!msg.isRead && <div className="w-2 h-2 rounded-full bg-purple-500" />}
                    </div>
                  </div>
                  <p className={`text-xs text-gray-500 mt-1 ${activeThread === msg._id ? "" : "line-clamp-1"}`}>
                    {msg.content}
                  </p>
                  {/* Expanded reply area */}
                  {activeThread === msg._id && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      {replySent && (
                        <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mb-2">
                          <CheckCheck className="w-3.5 h-3.5" /> Reply sent!
                        </p>
                      )}
                      <div className="flex gap-2">
                        <input
                          value={reply}
                          onChange={e => setReply(e.target.value)}
                          placeholder="Type your reply…"
                          className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400"
                          onKeyDown={e => { if (e.key === "Enter") handleReply(); }}
                        />
                        <Button size="sm" variant="default" onClick={handleReply} disabled={!reply.trim()}>
                          <Send className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Notifications + Teachers */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">School Notifications</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {notifications.slice(0, 4).map(notif => (
                <div key={notif._id} className={`flex gap-2.5 p-3 rounded-xl ${!notif.isRead ? "bg-purple-50" : "bg-gray-50"}`}>
                  <Bell className="w-3.5 h-3.5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">{notif.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-gray-400">{formatDate(notif.createdAt)}</p>
                      <Badge variant={notif.priority === "high" ? "destructive" : "secondary"} className="text-xs py-0">{notif.priority}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Teacher Directory */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">My Teachers</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {teachers.map((t, i) => (
                <div key={t.id} className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-gray-50 cursor-pointer" onClick={() => { setSelectedTeacher(t.id); setComposeOpen(true); }}>
                  <Avatar name={t.name} size="sm" colorIndex={i + 4} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.subject}</p>
                  </div>
                  <Send className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Compose Dialog */}
      <Dialog isOpen={composeOpen} onClose={() => setComposeOpen(false)} size="lg">
        <DialogHeader>
          <DialogTitle>Message a Teacher</DialogTitle>
          <DialogCloseButton onClose={() => setComposeOpen(false)} />
        </DialogHeader>
        <DialogContent>
          {composeSent ? (
            <div className="py-10 flex flex-col items-center gap-3">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCheck className="w-7 h-7 text-emerald-600" />
              </div>
              <p className="font-bold text-gray-900">Message Sent!</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">To</label>
                <select
                  value={selectedTeacher}
                  onChange={e => setSelectedTeacher(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
                >
                  <option value="">Select teacher…</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.name} — {t.subject}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Subject</label>
                <input
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="e.g. Regarding attendance on 12th Jan"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Message</label>
                <textarea
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  rows={5}
                  placeholder="Type your message here…"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                />
              </div>
            </div>
          )}
        </DialogContent>
        {!composeSent && (
          <DialogFooter>
            <Button variant="outline" onClick={() => setComposeOpen(false)}>Cancel</Button>
            <Button variant="default" onClick={handleCompose} disabled={!selectedTeacher || !body.trim()}>
              <Send className="w-3.5 h-3.5 mr-1.5" /> Send
            </Button>
          </DialogFooter>
        )}
      </Dialog>
    </div>
  );
}
