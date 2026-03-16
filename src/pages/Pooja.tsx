import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check, ArrowRight, Flame, Star, ExternalLink, ClipboardList, Users, UserCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const MEMBER_FORMS = [
  {
    title_en: 'Monthly Pooja & Payment',
    title_ml: 'പ്രതിമാസ പൂജ & പേയ്‌മെന്റ്',
    form_url: 'https://docs.google.com/forms/d/e/1FAIpQLScjo4ZGZgecD8X2W6J7Lgj6r4put_nJnZ55iK-1TG2FGDOJhA/viewform',
    list_url: 'https://docs.google.com/spreadsheets/d/1wOoheHf9guHZTotWVBUsvIsYGUkLPJqmQs2vjxN2EHc/edit',
    icon: '🪔',
  },
  {
    title_en: 'All Other Pooja & Payment',
    title_ml: 'മറ്റ് പൂജകൾ & പേയ്‌മെന്റ്',
    form_url: 'https://docs.google.com/forms/d/e/1FAIpQLSeVrlpOWkKB0J7qZk4I7GzvAE-qoWPqvgvdYYVNMS6QkLfaoQ/viewform',
    list_url: 'https://docs.google.com/spreadsheets/d/1H6kZGXWMTOgbPYwFlseDTWG-8lNwgQhIBxvNNZWWlX4/edit',
    icon: '🙏',
  },
];

const DEVOTEE_FORMS = [
  {
    title_en: 'Monthly Pooja & Payment',
    title_ml: 'പ്രതിമാസ പൂജ & പേയ്‌മെന്റ്',
    form_url: 'https://docs.google.com/forms/d/e/1FAIpQLSdq8hdHya5D9OYCtsIrryTn2ce64B84eKLPln8iwqXxjzKPiQ/viewform',
    list_url: 'https://docs.google.com/spreadsheets/d/1930Wu3OV7giKN10G2a1mnukIZjI3w9cVDqWWJvcfJaw/edit',
    icon: '🌸',
  },
];

const deities = [
  { icon: '🙏', image: '/paradevata3.png', en: 'Paradevata', ml: 'പരദേവത', desc: 'Principal Deity' },
  { icon: '🐘', image: '/ganapathi2.png', en: 'Ganapathi', ml: 'ഗണപതി', desc: 'Lord of Beginnings' },
  { icon: '🐍', image: '/nagaraja2.png', en: 'Nagaraja', ml: 'നാഗരാജ', desc: 'Serpent King' },
  { icon: '✨', image: '/murugan2.png', en: 'Subrahmanya Swami', ml: 'സുബ്രഹ്മണ്യ സ്വാമി', desc: 'God of War & Wisdom' },
  { icon: '🌟', image: '/ayyappa.png', en: 'Ayyapa Swami', ml: 'അയ്യപ്പ സ്വാമി', desc: 'Lord Ayyapa' },
];

const Pooja: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isMl = i18n.language === 'ml';
  const [activeTab, setActiveTab] = useState<'members' | 'devotees'>('members');

  const forms = activeTab === 'members' ? MEMBER_FORMS : DEVOTEE_FORMS;

  return (
    <div className="bg-cream min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-maroon-700 to-maroon-800 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Flame className="w-8 h-8 text-gold-400" />
            <h1 className={`text-4xl font-bold ${isMl ? 'font-malayalam' : ''}`}>
              {t('pooja.title')}
            </h1>
            <Flame className="w-8 h-8 text-gold-400" />
          </div>
          <p className={`text-maroon-200 text-lg ${isMl ? 'font-malayalam' : ''}`}>
            {t('pooja.subtitle')}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="md:col-span-2 space-y-8">
            {/* About */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h2 className={`text-2xl font-bold text-teal-800 mb-4 ${isMl ? 'font-malayalam' : ''}`}>
                {t('pooja.about_title')}
              </h2>
              <p className={`text-gray-600 leading-relaxed mb-6 ${isMl ? 'font-malayalam' : ''}`}>
                {t('pooja.about_text')}
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="#whats-included" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 transition-colors">
                  🍛 <span className={isMl ? 'font-malayalam' : ''}>{isMl ? 'എന്ത് ഉൾപ്പെടുന്നു' : "What's Included"}</span>
                </a>
                <a href="#deities" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 transition-colors">
                  🙏 <span className={isMl ? 'font-malayalam' : ''}>{isMl ? 'ആരാധിക്കുന്ന ദേവതകൾ' : 'Deities Worshipped'}</span>
                </a>
              </div>
            </div>

            {/* Registration Forms — tabbed */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Tab headers */}
              <div className="flex border-b border-gray-100">
                <button
                  onClick={() => setActiveTab('members')}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-semibold transition-colors ${
                    activeTab === 'members'
                      ? 'bg-teal-700 text-white'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span className={isMl ? 'font-malayalam' : ''}>
                    {isMl ? 'അംഗങ്ങൾ' : 'Members'}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('devotees')}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-semibold transition-colors ${
                    activeTab === 'devotees'
                      ? 'bg-maroon-700 text-white'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span className={isMl ? 'font-malayalam' : ''}>
                    {isMl ? 'മറ്റ് ഭക്തർ' : 'Other Devotees'}
                  </span>
                </button>
              </div>

              {/* Tab content */}
              <div className="p-8">
                <p className={`text-gray-500 text-sm mb-6 ${isMl ? 'font-malayalam' : ''}`}>
                  {activeTab === 'members'
                    ? (isMl ? 'അംഗങ്ങൾക്കുള്ള പൂജ രജിസ്ട്രേഷൻ ഫോമുകൾ' : 'Registration forms for temple members')
                    : (isMl ? 'മറ്റ് ഭക്തർക്കുള്ള പൂജ രജിസ്ട്രേഷൻ ഫോമുകൾ' : 'Registration forms for other devotees')}
                </p>
                <div className="space-y-4">
                  {forms.map((form) => (
                    <div
                      key={form.form_url}
                      className={`rounded-xl border p-5 ${
                        activeTab === 'members'
                          ? 'bg-teal-50 border-teal-100'
                          : 'bg-maroon-50 border-maroon-100'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl">{form.icon}</span>
                        <h3 className={`font-semibold text-gray-800 ${isMl ? 'font-malayalam' : ''}`}>
                          {isMl ? form.title_ml : form.title_en}
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <a
                          href={form.form_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors ${
                            activeTab === 'members'
                              ? 'bg-teal-700 hover:bg-teal-800'
                              : 'bg-maroon-700 hover:bg-maroon-800'
                          }`}
                        >
                          <ClipboardList className="w-4 h-4" />
                          <span className={isMl ? 'font-malayalam' : ''}>
                            {isMl ? 'ഫോം തുറക്കുക' : 'Open Form'}
                          </span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <a
                          href={form.list_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border-2 border-gray-300 text-gray-600 hover:bg-white transition-colors"
                        >
                          <Users className="w-4 h-4" />
                          <span className={isMl ? 'font-malayalam' : ''}>
                            {isMl ? 'രജിസ്‌ട്രേഡ് ലിസ്റ്റ്' : 'Registered List'}
                          </span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Nudge non-logged-in users toward member registration */}
                {activeTab === 'members' && !user && (
                  <div className="mt-5 p-4 bg-gold-50 border border-gold-200 rounded-xl text-sm text-amber-800">
                    <span className={isMl ? 'font-malayalam' : ''}>
                      {isMl
                        ? 'ഞങ്ങളുടെ അംഗത്വ പോർട്ടലിൽ ചേരൂ — കുടുംബ അംഗങ്ങളെ ചേർക്കാനും പ്രതിമാസ പൂജ ട്രാക്ക് ചെയ്യാനും.'
                        : 'Join our member portal to add family members and track monthly poojas.'}
                    </span>
                    {' '}
                    <Link to="/auth/register" className="font-semibold text-teal-700 underline">
                      {isMl ? 'ഇപ്പോൾ ചേരൂ' : 'Register now'}
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* What's Included */}
            <div id="whats-included" className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h2 className={`text-2xl font-bold text-teal-800 mb-6 ${isMl ? 'font-malayalam' : ''}`}>
                {t('pooja.includes_title')}
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { key: 'includes_nivedhyam', icon: '🍛', color: 'bg-orange-50 border-orange-100' },
                  { key: 'includes_neelanjanam', icon: '👁️', color: 'bg-blue-50 border-blue-100' },
                  { key: 'includes_maala', icon: '🌸', color: 'bg-pink-50 border-pink-100' },
                  { key: 'includes_deeparadhana', icon: '🪔', color: 'bg-amber-50 border-amber-100' },
                ].map((item) => (
                  <div key={item.key} className={`flex items-start gap-3 p-4 rounded-xl border ${item.color}`}>
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <p className={`font-medium text-gray-800 text-sm ${isMl ? 'font-malayalam' : ''}`}>
                          {t(`pooja.${item.key}`)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Deities */}
            <div id="deities" className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h2 className={`text-2xl font-bold text-teal-800 mb-6 ${isMl ? 'font-malayalam' : ''}`}>
                {t('pooja.deities_title')}
              </h2>
              <div className="space-y-3">
                {deities.map((deity) => (
                  <div key={deity.en} className="flex items-center gap-4 p-4 rounded-xl bg-teal-50 border border-teal-100">
                    {deity.image ? (
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-amber-200 flex-shrink-0 bg-amber-50">
                        <img src={deity.image} alt={deity.en} className="w-full h-full object-contain p-0.5" />
                      </div>
                    ) : (
                      <span className="text-3xl">{deity.icon}</span>
                    )}
                    <div>
                      <p className="font-semibold text-teal-800">{deity.en}</p>
                      <p className="font-malayalam text-teal-600 text-sm">{deity.ml}</p>
                    </div>
                    <span className="ml-auto text-xs text-teal-500">{deity.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* How to Register */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h2 className={`text-2xl font-bold text-teal-800 mb-6 ${isMl ? 'font-malayalam' : ''}`}>
                {t('pooja.how_to_register')}
              </h2>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-teal-700 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {step}
                    </div>
                    <p className={`text-gray-700 pt-1 ${isMl ? 'font-malayalam' : ''}`}>
                      {t(`pooja.register_step${step}`)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                {user ? (
                  <Link
                    to="/dashboard/family"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg transition-colors"
                  >
                    {t('pooja.register_button')}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <Link
                    to="/auth/register"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg transition-colors"
                  >
                    {t('pooja.register_button')}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 border-2 border-teal-700 text-teal-700 hover:bg-teal-50 font-semibold rounded-lg transition-colors"
                >
                  {t('pooja.contact_button')}
                </Link>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <div className="bg-gradient-to-br from-teal-700 to-teal-800 rounded-2xl p-6 text-white sticky top-20">
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <Star className="w-6 h-6 text-gold-400 fill-current" />
                </div>
                <p className={`text-teal-200 text-sm mb-2 ${isMl ? 'font-malayalam' : ''}`}>
                  {t('pooja.price_title')}
                </p>
                <p className="text-4xl font-bold text-gold-400">
                  {t('pooja.price_amount')}
                </p>
                <p className={`text-teal-300 text-sm mt-1 ${isMl ? 'font-malayalam' : ''}`}>
                  {t('pooja.price_period')}
                </p>
              </div>

              <hr className="border-teal-600 my-5" />

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-teal-100">
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span>Nivedhyam</span>
                </div>
                <div className="flex items-center gap-2 text-teal-100">
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span>Neelanjanam</span>
                </div>
                <div className="flex items-center gap-2 text-teal-100">
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span>Maala</span>
                </div>
                <div className="flex items-center gap-2 text-teal-100">
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <span>Deeparadhana</span>
                </div>
              </div>

              <div className="mt-5">
                {user ? (
                  <Link
                    to="/dashboard/family"
                    className="block text-center px-4 py-3 bg-gold-500 hover:bg-gold-400 text-white font-semibold rounded-lg transition-colors"
                  >
                    {t('pooja.register_button')}
                  </Link>
                ) : (
                  <Link
                    to="/auth/register"
                    className="block text-center px-4 py-3 bg-gold-500 hover:bg-gold-400 text-white font-semibold rounded-lg transition-colors"
                  >
                    {t('pooja.register_button')}
                  </Link>
                )}
              </div>
            </div>

            {/* Temple monthly expenses */}
            <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
              <p className="text-amber-800 font-semibold text-sm mb-2">Monthly Temple Expenses</p>
              <p className="text-2xl font-bold text-amber-700">₹40,000+</p>
              <p className="text-amber-700 text-xs mt-2">
                Your monthly contribution helps sustain this sacred tradition for generations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pooja;
