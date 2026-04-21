"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  ShieldCheck, GraduationCap, Calculator, Save, Loader2,
  CheckCircle2, Info, Plus, Trash2, UserCog, X,
} from "lucide-react";

interface Module { key: string; label: string; description: string; }

interface RolePermission {
  _id: string; role: string; label: string; isSystem: boolean;
  modules: string[]; updatedBy?: string; updatedAt: string;
}

const CUSTOM_COLORS = [
  { color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", toggle: "bg-orange-500" },
  { color: "text-rose-600",   bg: "bg-rose-50",   border: "border-rose-200",   toggle: "bg-rose-500"   },
  { color: "text-sky-600",    bg: "bg-sky-50",    border: "border-sky-200",    toggle: "bg-sky-500"    },
  { color: "text-amber-600",  bg: "bg-amber-50",  border: "border-amber-200",  toggle: "bg-amber-500"  },
  { color: "text-teal-600",   bg: "bg-teal-50",   border: "border-teal-200",   toggle: "bg-teal-500"   },
  { color: "text-fuchsia-600",bg: "bg-fuchsia-50",border: "border-fuchsia-200",toggle: "bg-fuchsia-500"},
];

const SYSTEM_META: Record<string, { color: string; bg: string; border: string; toggle: string; icon: React.ElementType }> = {
  teacher:    { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", toggle: "bg-emerald-500", icon: GraduationCap },
  accountant: { color: "text-violet-600",  bg: "bg-violet-50",  border: "border-violet-200",  toggle: "bg-violet-500",  icon: Calculator    },
};

function getCustomColor(index: number) { return CUSTOM_COLORS[index % CUSTOM_COLORS.length]; }

// -- Role Card ----------------------------------------------------------------
interface RoleCardProps {
  perm: RolePermission; allModules: Module[]; currentModules: Set<string>;
  dirty: boolean; saving: string | null; saved: string | null; deleting: string | null;
  meta: { color: string; bg: string; border: string; toggle: string };
  Icon: React.ElementType;
  onToggle: (role: string, key: string) => void;
  onSave: (role: string) => void;
  onDelete: (role: string) => void;
  canDelete?: boolean;
}

function RoleCard({ perm, allModules, currentModules, dirty, saving, saved, deleting, meta, Icon, onToggle, onSave, onDelete, canDelete = false }: RoleCardProps) {
  return (
    <Card className={`border-2 ${dirty ? "border-amber-300" : meta.border}`}>
      <CardHeader className={`${meta.bg} rounded-t-xl pb-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg ${meta.bg} border ${meta.border} flex items-center justify-center`}>
              <Icon className={`w-4 h-4 ${meta.color}`} />
            </div>
            <div>
              <CardTitle className="text-base">{perm.label}</CardTitle>
              <p className="text-xs text-gray-500">
                {currentModules.size} module{currentModules.size !== 1 ? "s" : ""} enabled
                {!perm.isSystem && <span className="ml-2 font-mono text-gray-400">({perm.role})</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {dirty && <Badge variant="outline" className="text-xs text-amber-600 border-amber-300 bg-amber-50">Unsaved</Badge>}
            {saved === perm.role && (
              <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Saved
              </span>
            )}
            {canDelete && (
              <button onClick={() => onDelete(perm.role)} disabled={deleting === perm.role}
                className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all" title="Delete role">
                {deleting === perm.role ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        <div className="grid grid-cols-1 gap-2">
          {allModules.map((mod) => {
            const isEnabled = currentModules.has(mod.key);
            const isRequired = mod.key === "dashboard";
            return (
              <button key={mod.key} type="button" disabled={isRequired}
                onClick={() => onToggle(perm.role, mod.key)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition-all ${
                  isEnabled ? `${meta.bg} ${meta.border} ${meta.color}` : "bg-gray-50 border-gray-200 text-gray-400"
                } ${isRequired ? "cursor-not-allowed opacity-80" : "cursor-pointer hover:opacity-90"}`}>
                <div>
                  <span className="text-sm font-medium block">{mod.label}</span>
                  <span className="text-xs opacity-70">{mod.description}</span>
                </div>
                <div className={`w-10 h-5 rounded-full flex items-center transition-all ${isEnabled ? meta.toggle : "bg-gray-300"}`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-0.5 ${isEnabled ? "translate-x-5" : "translate-x-0"}`} />
                </div>
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          {perm?.updatedAt && (
            <p className="text-xs text-gray-400">
              Updated {new Date(perm.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              {perm.updatedBy ? ` by ${perm.updatedBy}` : ""}
            </p>
          )}
          <Button size="sm" onClick={() => onSave(perm.role)} disabled={saving === perm.role || !dirty}
            className="ml-auto gap-2" variant={dirty ? "default" : "outline"}>
            {saving === perm.role ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// -- Main Page ----------------------------------------------------------------
export default function AdminRolesPage() {
  const [allModules, setAllModules] = useState<Module[]>([]);
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [draft, setDraft] = useState<Record<string, Set<string>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Create dialog
  const [showCreate, setShowCreate] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newModules, setNewModules] = useState<Set<string>>(new Set(["dashboard"]));
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/role-permissions");
        const json = await res.json();
        if (json.success) {
          setAllModules(json.allModules);
          setPermissions(json.data);
          const d: Record<string, Set<string>> = {};
          json.data.forEach((p: RolePermission) => { d[p.role] = new Set(p.modules); });
          setDraft(d);
        }
      } catch { setError("Failed to load permissions"); }
      finally { setLoading(false); }
    })();
  }, []);

  const toggleModule = (role: string, key: string) => {
    if (key === "dashboard") return;
    setSaved(null);
    setDraft((prev) => {
      const s = new Set(prev[role] || []);
      s.has(key) ? s.delete(key) : s.add(key);
      return { ...prev, [role]: s };
    });
  };

  const handleSave = async (role: string) => {
    setSaving(role); setSaved(null); setError(null);
    try {
      const res = await fetch("/api/admin/role-permissions", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, modules: Array.from(draft[role] || []) }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setPermissions((prev) => prev.map((p) => p.role === role ? { ...p, ...json.data } : p));
      setDraft((prev) => ({ ...prev, [role]: new Set(json.data.modules) }));
      setSaved(role); setTimeout(() => setSaved(null), 3000);
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to save"); }
    finally { setSaving(null); }
  };

  const handleDelete = async (role: string) => {
    if (!confirm(`Delete role "${role}"? This cannot be undone.`)) return;
    setDeleting(role); setError(null);
    try {
      const res = await fetch(`/api/admin/role-permissions?role=${encodeURIComponent(role)}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setPermissions((prev) => prev.filter((p) => p.role !== role));
      setDraft((prev) => { const n = { ...prev }; delete n[role]; return n; });
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to delete"); }
    finally { setDeleting(null); }
  };

  const handleCreate = async () => {
    if (!newLabel.trim()) { setCreateError("Role name is required"); return; }
    setCreating(true); setCreateError(null);
    try {
      const res = await fetch("/api/admin/role-permissions", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: newLabel.trim().toLowerCase().replace(/\s+/g, "_"),
          label: newLabel.trim(),
          modules: Array.from(newModules),
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setPermissions((prev) => [...prev, json.data]);
      setDraft((prev) => ({ ...prev, [json.data.role]: new Set(json.data.modules) }));
      setShowCreate(false); setNewLabel(""); setNewModules(new Set(["dashboard"]));
    } catch (e) { setCreateError(e instanceof Error ? e.message : "Failed to create"); }
    finally { setCreating(false); }
  };

  const isDirty = (role: string) => {
    const orig = permissions.find((p) => p.role === role);
    if (!orig || !draft[role]) return false;
    const os = new Set(orig.modules); const ds = draft[role];
    if (os.size !== ds.size) return true;
    for (const m of os) if (!ds.has(m)) return true;
    return false;
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400">
      <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading permissions...
    </div>
  );

  const systemRoles = permissions.filter((p) => p.isSystem);
  const customRoles = permissions.filter((p) => !p.isSystem);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Role Permissions</h1>
            <p className="text-sm text-gray-500">Control module access per staff role. Create custom roles as needed.</p>
          </div>
        </div>
        <Button onClick={() => { setShowCreate(true); setCreateError(null); }} className="gap-2">
          <Plus className="w-4 h-4" /> Create Role
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <Info className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-blue-700">
          <span className="font-semibold">Note:</span> Dashboard is always enabled. System roles (Teacher, Accountant) cannot be deleted. Changes take effect on next login.
        </p>
      </div>

      {/* System Roles */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">System Roles</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {systemRoles.map((perm) => {
            const meta = SYSTEM_META[perm.role] || SYSTEM_META["teacher"];
            return (
              <RoleCard key={perm.role} perm={perm} allModules={allModules}
                currentModules={draft[perm.role] || new Set()} dirty={isDirty(perm.role)}
                saving={saving} saved={saved} deleting={deleting} meta={meta} Icon={meta.icon}
                onToggle={toggleModule} onSave={handleSave} onDelete={handleDelete} />
            );
          })}
        </div>
      </div>

      {/* Custom Roles */}
      {customRoles.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Custom Roles</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {customRoles.map((perm, i) => (
              <RoleCard key={perm.role} perm={perm} allModules={allModules}
                currentModules={draft[perm.role] || new Set()} dirty={isDirty(perm.role)}
                saving={saving} saved={saved} deleting={deleting}
                meta={getCustomColor(i)} Icon={UserCog}
                onToggle={toggleModule} onSave={handleSave} onDelete={handleDelete} canDelete />
            ))}
          </div>
        </div>
      )}

      {/* Module Reference */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Module Reference</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {allModules.map((mod) => (
              <div key={mod.key} className="flex items-start gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-xs font-mono bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded mt-0.5">{mod.key}</span>
                <div>
                  <p className="text-xs font-semibold text-gray-800">{mod.label}</p>
                  <p className="text-xs text-gray-500">{mod.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Role Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="w-5 h-5 text-indigo-600" /> Create New Role
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {createError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                <Info className="w-4 h-4 flex-shrink-0" /> {createError}
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Role Name</label>
              <Input placeholder="e.g. Librarian, Counselor, Lab Assistant"
                value={newLabel} onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()} />
              {newLabel.trim() && (
                <p className="text-xs text-gray-400 mt-1">
                  Role key: <span className="font-mono">{newLabel.trim().toLowerCase().replace(/\s+/g, "_")}</span>
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Module Access</label>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {allModules.map((mod) => {
                  const isEnabled = newModules.has(mod.key);
                  const isRequired = mod.key === "dashboard";
                  return (
                    <button key={mod.key} type="button" disabled={isRequired}
                      onClick={() => {
                        if (isRequired) return;
                        setNewModules((prev) => {
                          const n = new Set(prev);
                          n.has(mod.key) ? n.delete(mod.key) : n.add(mod.key);
                          return n;
                        });
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition-all ${
                        isEnabled ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-gray-50 border-gray-200 text-gray-400"
                      } ${isRequired ? "cursor-not-allowed opacity-80" : "cursor-pointer hover:opacity-90"}`}>
                      <div>
                        <span className="text-sm font-medium block">{mod.label}</span>
                        <span className="text-xs opacity-70">{mod.description}</span>
                      </div>
                      <div className={`w-10 h-5 rounded-full flex items-center transition-all ${isEnabled ? "bg-indigo-500" : "bg-gray-300"}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-0.5 ${isEnabled ? "translate-x-5" : "translate-x-0"}`} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
              <Button variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>
                <X className="w-4 h-4 mr-1.5" /> Cancel
              </Button>
              <Button className="flex-1 gap-2" onClick={handleCreate} disabled={creating}>
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Create Role
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
