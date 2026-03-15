import React from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Clock, Users, Award } from 'lucide-react';

const IMAGE_BASE = 'https://maruvayiltemple.weebly.com/uploads/1/2/6/7/126797572/';

const committeeMembers = [
  { role: 'president', name: 'Manoj Kumar', nameML: 'മനോജ് കുമാർ' },
  { role: 'vice_president', name: 'Suresh Nair', nameML: 'സുരേഷ് നായർ' },
  { role: 'vice_president', name: 'Rajan Pillai', nameML: 'രാജൻ പിള്ള' },
  { role: 'secretary', name: 'Anitha Menon', nameML: 'അനിത മേനോൻ' },
  { role: 'treasurer', name: 'Pradeep Kumar', nameML: 'പ്രദീപ് കുമാർ' },
  { role: 'joint_secretary', name: 'Sreenivas Varma', nameML: 'ശ്രീനിവാസ് വർമ' },
  { role: 'joint_secretary', name: 'Lekha Devi', nameML: 'ലേഖ ദേവി' },
  { role: 'joint_secretary', name: 'Gopinath Nambiar', nameML: 'ഗോപിനാഥ് നമ്പ്യാർ' },
  { role: 'joint_secretary', name: 'Vijayalakshmi', nameML: 'വിജയലക്ഷ്മി' },
];

const roleColors: Record<string, string> = {
  president: 'bg-gold-100 text-gold-700 border-gold-200',
  vice_president: 'bg-teal-100 text-teal-700 border-teal-200',
  secretary: 'bg-maroon-50 text-maroon-700 border-maroon-100',
  treasurer: 'bg-purple-100 text-purple-700 border-purple-200',
  joint_secretary: 'bg-blue-50 text-blue-700 border-blue-100',
};

const TempleDetails: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isMl = i18n.language === 'ml';

  return (
    <div className="bg-cream min-h-screen">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-800 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className={`text-4xl font-bold mb-3 ${isMl ? 'font-malayalam' : ''}`}>
            {t('temple.title')}
          </h1>
          <p className="font-malayalam text-teal-200">
            മറുവയൽ ശ്രീ ശിവ പാർവതി കുടുംബ ക്ഷേത്രം
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* History & Reconstruction Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* History */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-gold-100 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-gold-600" />
              </div>
              <h2 className={`text-2xl font-bold text-teal-800 ${isMl ? 'font-malayalam' : ''}`}>
                {t('temple.history_title')}
              </h2>
            </div>
            <p className={`text-gray-600 leading-relaxed ${isMl ? 'font-malayalam' : ''}`}>
              {t('temple.history_text')}
            </p>
            <div className="mt-4 p-4 bg-teal-50 rounded-xl border border-teal-100">
              <p className="text-teal-700 text-sm font-medium">
                ⏳ Established over 300 years ago
              </p>
            </div>
          </div>

          {/* Reconstruction */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-maroon-50 rounded-full flex items-center justify-center">
                <Award className="w-5 h-5 text-maroon-600" />
              </div>
              <h2 className={`text-2xl font-bold text-teal-800 ${isMl ? 'font-malayalam' : ''}`}>
                {t('temple.reconstruction_title')}
              </h2>
            </div>
            <p className={`text-gray-600 leading-relaxed ${isMl ? 'font-malayalam' : ''}`}>
              {t('temple.reconstruction_text')}
            </p>
            <div className="mt-4 p-4 bg-maroon-50 rounded-xl border border-maroon-100">
              <p className="text-maroon-700 text-sm font-medium">
                🏛️ Reconstructed & Consecrated: February 2020
              </p>
            </div>
          </div>
        </div>

        {/* Temple Images */}
        <div className="mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['mar5-1.jpg', 'mar5-2.jpg', 'mar3-01.jpg', 'mar4-3.jpg'].map((img, i) => (
              <div key={i} className="rounded-xl overflow-hidden aspect-square shadow-sm">
                <img
                  src={`${IMAGE_BASE}${img}`}
                  alt={`Temple view ${i + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-12">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
              <MapPin className="w-5 h-5 text-teal-600" />
            </div>
            <h2 className={`text-2xl font-bold text-teal-800 ${isMl ? 'font-malayalam' : ''}`}>
              {t('temple.location_title')}
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className={`text-gray-700 leading-relaxed font-medium ${isMl ? 'font-malayalam' : ''}`}>
                {t('temple.location_address')}
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="w-20 font-medium text-gray-600">District:</span>
                  <span>Calicut (Kozhikode)</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="w-20 font-medium text-gray-600">Taluk:</span>
                  <span>Vadagara</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="w-20 font-medium text-gray-600">State:</span>
                  <span>Kerala, India</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="w-20 font-medium text-gray-600">Via:</span>
                  <span>Chombala</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-100 rounded-xl overflow-hidden h-48">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d62433.46041780754!2d75.5804!3d11.6049!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba6701b5d7b7d71%3A0x8d47f92fd3c3e3cc!2sChombala%2C%20Kerala!5e0!3m2!1sen!2sin!4v1703000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Temple Location"
              />
            </div>
          </div>
        </div>

        {/* Committee Members */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gold-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-gold-600" />
            </div>
            <h2 className={`text-2xl font-bold text-teal-800 ${isMl ? 'font-malayalam' : ''}`}>
              {t('temple.committee_title')}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {committeeMembers.map((member, i) => (
              <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-sm">
                    {member.name.charAt(0)}
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full border ${roleColors[member.role]}`}>
                    {t(`temple.${member.role}`)}
                  </span>
                </div>
                <p className="font-semibold text-teal-800">{member.name}</p>
                <p className="font-malayalam text-teal-600 text-sm mt-0.5">{member.nameML}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <h2 className={`text-2xl font-bold text-teal-800 mb-8 ${isMl ? 'font-malayalam' : ''}`}>
            {t('temple.timeline_title')}
          </h2>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-teal-100" />
            <div className="space-y-8">
              {[
                {
                  year: '~1720',
                  title: t('temple.timeline_founded'),
                  desc: t('temple.timeline_founded_desc'),
                  color: 'bg-gold-400',
                },
                {
                  year: '2018–20',
                  title: t('temple.timeline_reconstruction'),
                  desc: t('temple.timeline_reconstruction_desc'),
                  color: 'bg-maroon-600',
                },
                {
                  year: '2020',
                  title: t('temple.timeline_trust'),
                  desc: t('temple.timeline_trust_desc'),
                  color: 'bg-teal-600',
                },
              ].map((item, i) => (
                <div key={i} className="relative pl-12">
                  <div className={`absolute left-1.5 top-1 w-5 h-5 ${item.color} rounded-full border-2 border-white shadow`} />
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{item.year}</span>
                    </div>
                    <p className={`font-semibold text-teal-800 mb-1 ${isMl ? 'font-malayalam' : ''}`}>{item.title}</p>
                    <p className={`text-gray-600 text-sm ${isMl ? 'font-malayalam' : ''}`}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TempleDetails;
