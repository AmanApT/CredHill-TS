"use client";

import { useEffect, useState } from "react";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  DEFAULT_CONFIG,
  parseConfig,
  slugifyKey,
  LOCKED_HEADER_KEYS,
  LOCKED_TABLE_KEYS,
  type CustomFieldType,
  type HeaderFieldConfig,
  type TableColumnConfig,
  type CustomHeaderFieldConfig,
} from "@/lib/invoiceConfig";
import {
  Eye,
  EyeOff,
  GripVertical,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Lock,
} from "lucide-react";

export default function InvoiceSettingsPage() {
  const { user } = useKindeBrowserClient();
  const email = user?.email ?? "";

  const saved = useQuery(
    api.functions.invoiceConfig.getConfig,
    email ? { email } : "skip"
  );
  const saveConfig = useMutation(api.functions.invoiceConfig.saveConfig);

  const [headerFields, setHeaderFields] = useState<HeaderFieldConfig[]>(
    DEFAULT_CONFIG.headerFields
  );
  const [tableColumns, setTableColumns] = useState<TableColumnConfig[]>(
    DEFAULT_CONFIG.tableColumns
  );
  const [customFields, setCustomFields] = useState<CustomHeaderFieldConfig[]>(
    []
  );
  const [isSaving, setIsSaving] = useState(false);
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldType, setNewFieldType] = useState<CustomFieldType>("text");

  // Load saved config on mount
  useEffect(() => {
    if (saved !== undefined) {
      const parsed = parseConfig(saved);
      setHeaderFields(parsed.headerFields);
      setTableColumns(parsed.tableColumns);
      setCustomFields(parsed.customHeaderFields);
    }
  }, [saved]);

  const updateHeaderField = (
    key: string,
    patch: Partial<HeaderFieldConfig>
  ) => {
    setHeaderFields((prev) =>
      prev.map((f) => (f.key === key ? { ...f, ...patch } : f))
    );
  };

  const updateTableColumn = (
    key: string,
    patch: Partial<TableColumnConfig>
  ) => {
    setTableColumns((prev) =>
      prev.map((c) => (c.key === key ? { ...c, ...patch } : c))
    );
  };

  const updateCustomField = (
    key: string,
    patch: Partial<CustomHeaderFieldConfig>
  ) => {
    setCustomFields((prev) =>
      prev.map((f) => (f.key === key ? { ...f, ...patch } : f))
    );
  };

  const addCustomField = () => {
    const label = newFieldLabel.trim();
    if (!label) {
      toast("Please enter a field name", {
        style: { backgroundColor: "#ef4444", color: "white" },
      });
      return;
    }
    const key = slugifyKey(label);
    if (
      customFields.some((f) => f.key === key) ||
      headerFields.some((f) => f.key === key)
    ) {
      toast("A field with this name already exists", {
        style: { backgroundColor: "#ef4444", color: "white" },
      });
      return;
    }
    setCustomFields((prev) => [...prev, { key, label, type: newFieldType }]);
    setNewFieldLabel("");
    setNewFieldType("text");
  };

  const removeCustomField = (key: string) => {
    setCustomFields((prev) => prev.filter((f) => f.key !== key));
  };

  const resetToDefaults = () => {
    if (
      !confirm(
        "Reset all invoice settings to defaults? Your custom fields will be removed."
      )
    )
      return;
    setHeaderFields(DEFAULT_CONFIG.headerFields);
    setTableColumns(DEFAULT_CONFIG.tableColumns);
    setCustomFields([]);
  };

  const handleSave = async () => {
    if (!email) return;
    setIsSaving(true);
    try {
      await saveConfig({
        email,
        headerFields: JSON.stringify(headerFields),
        tableColumns: JSON.stringify(tableColumns),
        customHeaderFields: JSON.stringify(customFields),
      });
      toast("Settings saved", {
        style: { backgroundColor: "#16a34a", color: "white" },
      });
    } catch (err: any) {
      toast(`Error: ${err?.message ?? "Could not save"}`, {
        style: { backgroundColor: "#ef4444", color: "white" },
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="min-h-screen bg-slate-50">
      <div className="px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="page-title text-gray-900">Invoice Settings</h1>
            <p className="small-text text-gray-500 mt-1">
              Customize which fields and columns appear on your invoices.
              Changes don't affect invoices you've already created.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetToDefaults}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              size="sm"
              className="gap-2 bg-orange-500 hover:bg-orange-600"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Saving…" : "Save Settings"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Header Fields */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
            <h2 className="section-heading text-gray-900 mb-1">
              Header Fields
            </h2>
            <p className="small-text text-gray-500 mb-4">
              Fields shown at the top of your invoice (invoice number, date,
              venue, etc.)
            </p>

            {/* Core fields */}
            <div className="space-y-2">
              {headerFields.map((field) => {
                const locked = LOCKED_HEADER_KEYS.has(field.key);
                return (
                  <div
                    key={field.key}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      field.visible
                        ? "bg-white border-gray-200"
                        : "bg-gray-50 border-gray-100"
                    }`}
                  >
                    <GripVertical className="h-4 w-4 text-gray-300" />
                    <Input
                      value={field.label}
                      onChange={(e) =>
                        updateHeaderField(field.key, { label: e.target.value })
                      }
                      className="flex-1 h-8"
                    />
                    {locked ? (
                      <span
                        className="flex items-center gap-1 text-xs text-gray-400"
                        title="This field is required on every invoice"
                      >
                        <Lock className="h-3 w-3" />
                        Required
                      </span>
                    ) : (
                      <button
                        onClick={() =>
                          updateHeaderField(field.key, {
                            visible: !field.visible,
                          })
                        }
                        className={`p-1.5 rounded transition ${
                          field.visible
                            ? "text-gray-600 hover:bg-gray-100"
                            : "text-gray-400 hover:bg-gray-100"
                        }`}
                        title={field.visible ? "Hide field" : "Show field"}
                      >
                        {field.visible ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Custom fields */}
            <div className="mt-6">
              <h3 className="label-text text-gray-700 mb-2">
                Custom Fields
                {customFields.length > 0 && (
                  <span className="ml-2 small-text text-gray-400">
                    ({customFields.length})
                  </span>
                )}
              </h3>

              {customFields.length === 0 && (
                <p className="small-text text-gray-400 italic mb-3">
                  Add your own fields below (e.g. PO Number, Delivery Date…)
                </p>
              )}

              <div className="space-y-2">
                {customFields.map((field) => (
                  <div
                    key={field.key}
                    className="flex items-center gap-2 p-3 rounded-lg border border-orange-100 bg-orange-50/40"
                  >
                    <Input
                      value={field.label}
                      onChange={(e) =>
                        updateCustomField(field.key, {
                          label: e.target.value,
                        })
                      }
                      className="flex-1 h-8"
                    />
                    <select
                      value={field.type}
                      onChange={(e) =>
                        updateCustomField(field.key, {
                          type: e.target.value as CustomFieldType,
                        })
                      }
                      className="text-xs border border-gray-200 rounded px-2 py-1 h-8 bg-white"
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="date">Date</option>
                    </select>
                    <button
                      onClick={() => removeCustomField(field.key)}
                      className="p-1.5 rounded text-red-500 hover:bg-red-50"
                      title="Remove field"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add new custom field */}
              <div className="mt-3 flex items-center gap-2">
                <Input
                  placeholder="New field name (e.g. PO Number)"
                  value={newFieldLabel}
                  onChange={(e) => setNewFieldLabel(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addCustomField();
                  }}
                  className="flex-1 h-8"
                />
                <select
                  value={newFieldType}
                  onChange={(e) =>
                    setNewFieldType(e.target.value as CustomFieldType)
                  }
                  className="text-xs border border-gray-200 rounded px-2 py-1 h-8 bg-white"
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                </select>
                <Button
                  onClick={addCustomField}
                  size="sm"
                  variant="outline"
                  className="gap-1 h-8"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </Button>
              </div>
            </div>
          </div>

          {/* Table Columns */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-5">
            <h2 className="section-heading text-gray-900 mb-1">
              Table Columns
            </h2>
            <p className="small-text text-gray-500 mb-4">
              Columns shown on the line-item table of your invoice.
            </p>

            <div className="space-y-2">
              {tableColumns.map((col) => {
                const locked = LOCKED_TABLE_KEYS.has(col.key);
                return (
                  <div
                    key={col.key}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      col.visible
                        ? "bg-white border-gray-200"
                        : "bg-gray-50 border-gray-100"
                    }`}
                  >
                    <GripVertical className="h-4 w-4 text-gray-300" />
                    <Input
                      value={col.label}
                      onChange={(e) =>
                        updateTableColumn(col.key, { label: e.target.value })
                      }
                      className="flex-1 h-8"
                    />
                    {locked ? (
                      <span
                        className="flex items-center gap-1 text-xs text-gray-400"
                        title="This column is required"
                      >
                        <Lock className="h-3 w-3" />
                        Required
                      </span>
                    ) : (
                      <button
                        onClick={() =>
                          updateTableColumn(col.key, { visible: !col.visible })
                        }
                        className={`p-1.5 rounded transition ${
                          col.visible
                            ? "text-gray-600 hover:bg-gray-100"
                            : "text-gray-400 hover:bg-gray-100"
                        }`}
                        title={col.visible ? "Hide column" : "Show column"}
                      >
                        {col.visible ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <p className="small-text text-blue-700">
                <strong>Note:</strong> GST columns (CGST/SGST/IGST) display
                automatically based on client location. Hiding them here won't
                prevent calculations — it only hides the column from display.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
