"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  GraduationCap,
  Calculator,
  Save,
  Loader2,
  CheckCircle2,
  Info,
} from "lucide-react";

interface Module {
  key: string;
  label: string;
  description: string;
}

interface RolePermission {
  _id: string;
  role: "teacher" | "accountant";
  modules: string[];
  updatedBy?: string;
  updatedAt: string;
}

const ROLE_META = {
  teacher: {
    label: "Teacher",
    icon: GraduationCap,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    badge: "bg-emerald-100 text-emerald-700",
  },
  accountant: {
    label: "Accountant",
    icon: Calculator,
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
    badge: "bg-violet-100 text-violet-700",
  },
};

export default function AdminRolesPage() {
  const [allModules, setAllModules] = useState<Module[]>([]);
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [draft, setDraft] = useState<Record<string, Set<string>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/role-permissions");
        const json = await res.json();
        if (json.success) {
          setAllModules(json.allModules);
          setPermissions(json.data);
          // Initialize draft state
          const initialDraft: Record<string, Set<string>> = {};
          json.data.forEach((p: RolePermission) => {
            initialDraft[p.role] = new Set(p.modules);
          });
          setDraft(initialDraft);
        }
      } catch {
        setError("Failed to load role permissions");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleModule = (role: string, moduleKey: string) => {
    if (moduleKey === "dashboard") return; // Always required
    setSaved(null);
    setDraft((prev) => {
      const newSet = new Set(prev[role] || []);
      if (newSet.has(moduleKey)) {
        newSet.delete(moduleKey);
      } else {
        newSet.add(moduleKey);
      }
      return { ...prev, [role]: newSet };
    });
  };

  const handleSave = async (role: string) => {
    setSaving(role);
    setSaved(null);
    setError(null);
    try {
      const modules = Array.from(draft[role] || []);
      const res = await fetch("/api/admin/role-permissions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, modules }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Failed to save");
      // Update local state
      setPermissions((prev) =>
        prev.map((p) => (p.role === role ? { ...p, modules: json.data.modules, updatedAt: json.data.updatedAt, updatedBy: json.data.updatedBy } : p))
      );
      setDraft((prev) => ({ ...prev, [role]: new Set(json.data.modules) }));
      setSaved(role);
      setTimeout(() => setSaved(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(null);
    }
  };

  const isDirty = (role: string) => {
    const original = permissions.find((p) => p.role === role);
    if (!original || !draft[role]) return false;
    const origSet = new Set(original.modules);
    const draftSet = draft[role];
    if (origSet.size !== draftSet.size) return true;
    for (const m of origSet) {
      if (!draftSet.has(m)) return true;
    }
    return false;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading permissions...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Role Permissions</h1>
          <p className="text-sm text-gray-500">
            Control which modules each staff role can access in the portal.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <Info className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-blue-700">
          <span className="font-semibold">Note:</span> The <span className="font-medium">Dashboard</span> module is always enabled and cannot be removed. Changes take effect immediately for new sessions.
        </p>
      </div>

      {/* Role cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {(["teacher", "accountant"] as const).map((role) => {
          const meta = ROLE_META[role];
          const Icon = meta.icon;
          const currentModules = draft[role] || new Set();
          const perm = permissions.find((p) => p.role === role);
          const dirty = isDirty(role);

          return (
            <Card key={role} className={`border-2 ${dirty ? "border-amber-300" : meta.border}`}>
              <CardHeader className={`${meta.bg} rounded-t-xl pb-3`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg ${meta.bg} border ${meta.border} flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${meta.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-base">{meta.label}</CardTitle>
                      <p className="text-xs text-gray-500">
                        {currentModules.size} module{currentModules.size !== 1 ? "s" : ""} enabled
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {dirty && (
                      <Badge variant="outline" className="text-xs text-amber-600 border-amber-300 bg-amber-50">
                        Unsaved
                      </Badge>
                    )}
                    {saved === role && (
                      <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Saved
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {/* Module toggles */}
                <div className="grid grid-cols-1 gap-2">
                  {allModules.map((mod) => {
                    const isEnabled = currentModules.has(mod.key);
                    const isRequired = mod.key === "dashboard";
                    return (
                      <button
                        key={mod.key}
                        type="button"
                        disabled={isRequired}
                        onClick={() => toggleModule(role, mod.key)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition-all ${
                          isEnabled
                            ? `${meta.bg} ${meta.border} ${meta.color}`
                            : "bg-gray-50 border-gray-200 text-gray-400"
                        } ${isRequired ? "cursor-not-allowed opacity-80" : "cursor-pointer hover:opacity-90"}`}
                      >
                        <div>
                          <span className="text-sm font-medium block">{mod.label}</span>
                          <span className="text-xs opacity-70">{mod.description}</span>
                        </div>
                        <div className={`w-10 h-5 rounded-full flex items-center transition-all ${isEnabled ? (role === "teacher" ? "bg-emerald-500" : "bg-violet-500") : "bg-gray-300"}`}>
                          <div
                            className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-0.5 ${isEnabled ? "translate-x-5" : "translate-x-0"}`}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Save button */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  {perm?.updatedAt && (
                    <p className="text-xs text-gray-400">
                      Last updated {new Date(perm.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      {perm.updatedBy ? ` by ${perm.updatedBy}` : ""}
                    </p>
                  )}
                  <Button
                    size="sm"
                    onClick={() => handleSave(role)}
                    disabled={saving === role || !dirty}
                    className="ml-auto gap-2"
                    variant={dirty ? "default" : "outline"}
                  >
                    {saving === role ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Module reference table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Module Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {allModules.map((mod) => (
              <div key={mod.key} className="flex items-start gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-xs font-mono bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded mt-0.5">
                  {mod.key}
                </span>
                <div>
                  <p className="text-xs font-semibold text-gray-800">{mod.label}</p>
                  <p className="text-xs text-gray-500">{mod.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
