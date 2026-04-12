"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogCloseButton, DialogFooter } from "@/components/ui/dialog";
import { mockMessages, mockNotifications } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";
import { Send, Bell, MessageSquare, Users, CheckCheck, ChevronRight } from "lucide-react";

const parents = [
  { id: "p1", name: "Mr. Suresh Kumar", child: "Arjun Kumar", class: "6A" },
  { id: "p2", name: "Mrs. Meena Raj", child: "Priya Raj", class: "6A" },
  { id: "p3", name: "Mr. Ramesh Babu", child: "Karthik Babu", class: "7B" },
];

export default function StaffCommunicationPage() {
  const [activeTab, setActiveTab] = useState<"inbox" | "notifications">("inbox");
  const [composeOpen, setComposeOpen] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sentMsg, setSentMsg] = useState(false);
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [broadcastSent, setBroadcastSent] = useState(false);

  const messages = mockMessages;
  const notifications = mockNotifications.filter(n => n.targetRole === "staff" || n.targetRole === "all");

  const handleSend = () => {
    if (!selectedRecipient || !body.trim()) return;
    setSentMsg(true);
    setTimeout(() => { setComposeOpen(false); setSentMsg(false); setSelectedRecipient(""); setSubject(""); setBody(""); }, 1500);
  };

  const handleBroadcast = () => {
    if (!broadcastMsg.trim()) return;
    setBroadcastSent(true);
    setTimeout(() => { setBroadcastOpen(false); setBroadcastSent(false); setBroadcastMsg(""); }, 1500);
  };

  return (
    <div className="space-y-5">
      {/* Actions */}
      <div className="flex gap-3 flex-wrap">
        <Button variant="default" onClick={() => setComposeOpen(true)}>
          <Send className="w-4 h-4 mr-2" /> Compose Message
        </Button>
        <Button variant="outline" onClick={() => setBroadcastOpen(true)}>
          <Users className="w-4 h-4 mr-2" /> Broadcast to Parents
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 max-w-xs">
        {[
          { key: "inbox", label: "Inbox", icon: MessageSquare, count: messages.length },
          { key: "notifications", label: "Alerts", icon: Bell, count: notifications.filter(n => !n.isRead).length },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab.key ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
            {tab.count > 0 && (
              <span className="bg-emerald-100 text-emerald-700 text-xs rounded-full px-1.5 py-0.5 leading-none">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "inbox" && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2 space-y-2">
            {messages.map((msg, i) => (
              <div key={msg._id} className="bg-white rounded-xl border border-gray-100 p-4 hover:border-emerald-200 hover:shadow-sm transition-all cursor-pointer">
                <div className="flex items-start gap-3">
                  <Avatar name={msg.senderName} size="md" colorIndex={i % 8} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{msg.senderName}</p>
                        <p className="text-xs text-gray-500">To: {msg.receiverName}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <p className="text-xs text-gray-400">{formatDate(msg.createdAt)}</p>
                        {!msg.isRead && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                      </div>
                    </div>
                    <p className="font-medium text-gray-800 text-sm mt-1">{msg.subject}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{msg.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Contacts */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Quick Message Parents</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {parents.map((p, i) => (
                <div key={p.id} className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-gray-50 cursor-pointer" onClick={() => { setSelectedRecipient(p.id); setComposeOpen(true); }}>
                  <Avatar name={p.name} size="sm" colorIndex={i % 8} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.child} • Class {p.class}</p>
                  </div>
                  <Send className="w-3.5 h-3.5 text-gray-300" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "notifications" && (
        <div className="space-y-3">
          {notifications.map(notif => (
            <div key={notif._id} className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${!notif.isRead ? "bg-indigo-50 border-indigo-100" : "bg-white border-gray-100"}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                notif.type === "academic" ? "bg-blue-100" :
                notif.type === "fee" ? "bg-amber-100" :
                notif.type === "event" ? "bg-purple-100" : "bg-gray-100"
              }`}>
                <Bell className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-gray-900 text-sm">{notif.title}</p>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Badge
                      variant={notif.priority === "high" ? "destructive" : notif.priority === "medium" ? "warning" : "secondary"}
                      className="text-xs"
                    >
                      {notif.priority}
                    </Badge>
                    {!notif.isRead && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-0.5">{notif.message}</p>
                <p className="text-xs text-gray-400 mt-1">{formatDate(notif.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Compose Dialog */}
      <Dialog isOpen={composeOpen} onClose={() => setComposeOpen(false)} size="lg">
        <DialogHeader>
          <DialogTitle>Compose Message</DialogTitle>
          <DialogCloseButton onClose={() => setComposeOpen(false)} />
        </DialogHeader>
        <DialogContent>
          {sentMsg ? (
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
                  value={selectedRecipient}
                  onChange={e => setSelectedRecipient(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
                >
                  <option value="">Select parent…</option>
                  {parents.map(p => <option key={p.id} value={p.id}>{p.name} ({p.child})</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Subject</label>
                <input
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="Message subject"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Message</label>
                <textarea
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  rows={5}
                  placeholder="Type your message here…"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
                />
              </div>
            </div>
          )}
        </DialogContent>
        {!sentMsg && (
          <DialogFooter>
            <Button variant="outline" onClick={() => setComposeOpen(false)}>Cancel</Button>
            <Button variant="default" onClick={handleSend} disabled={!selectedRecipient || !body.trim()}>
              <Send className="w-3.5 h-3.5 mr-1.5" /> Send
            </Button>
          </DialogFooter>
        )}
      </Dialog>

      {/* Broadcast Dialog */}
      <Dialog isOpen={broadcastOpen} onClose={() => setBroadcastOpen(false)} size="lg">
        <DialogHeader>
          <DialogTitle>Broadcast to All Parents — Class 6A</DialogTitle>
          <DialogCloseButton onClose={() => setBroadcastOpen(false)} />
        </DialogHeader>
        <DialogContent>
          {broadcastSent ? (
            <div className="py-10 flex flex-col items-center gap-3">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCheck className="w-7 h-7 text-emerald-600" />
              </div>
              <p className="font-bold text-gray-900">Broadcast sent to all parents!</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                This message will be sent to all parents of Class 6A (42 parents).
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Message</label>
                <textarea
                  value={broadcastMsg}
                  onChange={e => setBroadcastMsg(e.target.value)}
                  rows={5}
                  placeholder="Type your announcement…"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
                />
              </div>
            </div>
          )}
        </DialogContent>
        {!broadcastSent && (
          <DialogFooter>
            <Button variant="outline" onClick={() => setBroadcastOpen(false)}>Cancel</Button>
            <Button variant="default" onClick={handleBroadcast} disabled={!broadcastMsg.trim()}>
              <Users className="w-3.5 h-3.5 mr-1.5" /> Broadcast
            </Button>
          </DialogFooter>
        )}
      </Dialog>
    </div>
  );
}
