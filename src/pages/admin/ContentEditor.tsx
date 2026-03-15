import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminApi, ContentBlock } from '../../lib/api';
import { Save, Clock } from 'lucide-react';

type PageKey = 'home' | 'temple' | 'pooja' | 'contact';
const PAGES: PageKey[] = ['home', 'temple', 'pooja', 'contact'];
const PAGE_LABELS: Record<PageKey, string> = {
  home: 'Home',
  temple: 'Temple',
  pooja: 'Pooja',
  contact: 'Contact',
};

interface BlockState {
  value_en: string;
  value_ml: string;
  saving: boolean;
}

const ContentEditor: React.FC = () => {
  const [grouped, setGrouped] = useState<Record<string, ContentBlock[]>>({});
  const [editState, setEditState] = useState<Record<string, BlockState>>({});
  const [activeTab, setActiveTab] = useState<PageKey>('home');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await adminApi.getContent();
        setGrouped(data);
        // Initialize edit state from fetched data
        const state: Record<string, BlockState> = {};
        for (const blocks of Object.values(data)) {
          for (const block of blocks) {
            state[block.key] = {
              value_en: block.value_en,
              value_ml: block.value_ml,
              saving: false,
            };
          }
        }
        setEditState(state);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load content blocks');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (key: string, field: 'value_en' | 'value_ml', value: string) => {
    setEditState((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  const handleSave = async (key: string) => {
    const state = editState[key];
    if (!state) return;
    setEditState((prev) => ({ ...prev, [key]: { ...prev[key], saving: true } }));
    try {
      await adminApi.updateContent(key, { value_en: state.value_en, value_ml: state.value_ml });
      // Update the grouped data to reflect new updated_at
      setGrouped((prev) => {
        const updated = { ...prev };
        for (const page of Object.keys(updated)) {
          updated[page] = updated[page].map((b) =>
            b.key === key
              ? { ...b, value_en: state.value_en, value_ml: state.value_ml, updated_at: new Date().toISOString() }
              : b
          );
        }
        return updated;
      });
      toast.success('Saved successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save content block');
    } finally {
      setEditState((prev) => ({ ...prev, [key]: { ...prev[key], saving: false } }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading content blocks...</p>
      </div>
    );
  }

  const activeBlocks = grouped[activeTab] ?? [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-teal-800">Content Blocks</h1>
        <p className="text-gray-500 text-sm mt-1">
          Edit site text for each page. Save each block individually.
        </p>
      </div>

      {/* Page tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {PAGES.map((page) => (
          <button
            key={page}
            onClick={() => setActiveTab(page)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === page
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {PAGE_LABELS[page]}
          </button>
        ))}
      </div>

      {activeBlocks.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
          No content blocks for this page.
        </div>
      ) : (
        <div className="space-y-5">
          {activeBlocks.map((block) => {
            const state = editState[block.key];
            if (!state) return null;
            return (
              <div
                key={block.key}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-semibold text-teal-800">{block.label}</p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{block.key}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>
                      {block.updated_at
                        ? new Date(block.updated_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Never'}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                      English
                    </label>
                    <textarea
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent resize-y min-h-[80px]"
                      value={state.value_en}
                      onChange={(e) => handleChange(block.key, 'value_en', e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                      Malayalam
                    </label>
                    <textarea
                      className="font-malayalam w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent resize-y min-h-[80px]"
                      value={state.value_ml}
                      onChange={(e) => handleChange(block.key, 'value_ml', e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => handleSave(block.key)}
                    disabled={state.saving}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
                  >
                    <Save className="w-4 h-4" />
                    {state.saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ContentEditor;
