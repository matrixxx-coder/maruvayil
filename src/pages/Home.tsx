import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, Camera, Phone, ChevronRight, Star, Flame, Sparkles, Bell } from 'lucide-react';
import { contentApi, Announcement } from '../lib/api';

const IMAGE_BASE = 'https://maruvayiltemple.weebly.com/uploads/1/2/6/7/126797572/';

const deities = [
  { name: 'Paradevata', ml: 'പരദേവത', icon: '🙏', image: '/paradevata3.png' },
  { name: 'Ganapathi', ml: 'ഗണപതി', icon: '🐘', image: '/ganapathi2.png' },
  { name: 'Nagaraja', ml: 'നാഗരാജ', icon: '🐍', image: '/nagaraja2.png' },
  { name: 'Subrahmanya Swami', ml: 'സുബ്രഹ്മണ്യ സ്വാമി', icon: '✨', image: '/murugan2.png' },
  { name: 'Ayyapa Swami', ml: 'അയ്യപ്പ സ്വാമി', icon: '🌟', image: '/ayyappa.png' },
];

const featuredImages = [
  'mar5-1.jpg',
  'mar5-3.jpg',
  'mar5-5.jpg',
  'mar4-27.jpg',
  'mar3-01.jpg',
  'mar4-3.jpg',
];

const Home: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isMl = i18n.language === 'ml';
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    contentApi.announcements()
      .then((data) => setAnnouncements(data))
      .catch(() => {
        // Silently fail — announcements are optional
      });
  }, []);

  return (
    <div className="bg-cream min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-teal-800 via-teal-700 to-teal-900 text-white overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="flex flex-col items-center text-center">
            {/* Logo */}
            <div className="mb-6 relative">
              <div className="w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-gold-400 shadow-2xl overflow-hidden bg-teal-600">
                <img
                  src={`${IMAGE_BASE}published/temple-logo.jpg`}
                  alt="Maruvayil Temple Logo"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '';
                    target.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-5xl">🕉️</div>';
                  }}
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gold-400 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-teal-900" />
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2 mb-6">
              <h1 className={`text-3xl md:text-5xl font-bold text-white ${isMl ? 'font-malayalam' : ''}`}>
                {t('home.hero_title')}
              </h1>
              <p className={`text-xl md:text-2xl text-gold-300 font-semibold ${isMl ? 'font-malayalam' : ''}`}>
                {t('home.hero_subtitle')}
              </p>
              <div className="flex items-center justify-center gap-2 text-teal-200 text-sm mt-2">
                <Star className="w-4 h-4 text-gold-400 fill-current" />
                <span className={isMl ? 'font-malayalam' : ''}>{t('home.hero_tagline')}</span>
                <Star className="w-4 h-4 text-gold-400 fill-current" />
              </div>
            </div>

            {/* Malayalam subtitle */}
            <p className="font-malayalam text-teal-200 text-lg mb-8">
              മറുവയൽ ശ്രീ ശിവ പാർവതി കുടുംബ ക്ഷേത്രം
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                to="/pooja"
                className="px-6 py-3 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-lg shadow-lg transition-all transform hover:scale-105"
              >
                {t('home.register_pooja')}
              </Link>
              <Link
                to="/gallery"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/30 backdrop-blur-sm transition-all"
              >
                {t('home.view_gallery')}
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" className="w-full fill-cream">
            <path d="M0,60 C360,0 1080,0 1440,60 L1440,60 L0,60 Z" />
          </svg>
        </div>
      </section>

      {/* Announcements Section */}
      {announcements.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-gold-600" />
            <h2 className="text-lg font-bold text-teal-800">Announcements</h2>
          </div>
          <div className="space-y-3">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4"
              >
                <p className="font-semibold text-amber-800 text-sm">
                  {isMl && ann.title_ml ? ann.title_ml : ann.title_en}
                </p>
                <p className={`text-amber-700 text-sm mt-1 ${isMl ? 'font-malayalam' : ''}`}>
                  {isMl && ann.body_ml ? ann.body_ml : ann.body_en}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Welcome Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-1 w-8 bg-gold-500 rounded" />
              <span className="text-gold-600 text-sm font-semibold uppercase tracking-wider">Sacred Heritage</span>
            </div>
            <h2 className={`text-3xl md:text-4xl font-bold text-teal-800 mb-4 ${isMl ? 'font-malayalam' : ''}`}>
              {t('home.welcome_title')}
            </h2>
            <p className={`text-gray-600 leading-relaxed mb-6 ${isMl ? 'font-malayalam' : ''}`}>
              {t('home.welcome_text')}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-teal-50 rounded-xl p-4 border border-teal-100">
                <p className="text-3xl font-bold text-teal-700">300+</p>
                <p className="text-sm text-teal-600">Years of history</p>
              </div>
              <div className="bg-gold-50 rounded-xl p-4 border border-gold-100">
                <p className="text-3xl font-bold text-gold-600">2020</p>
                <p className="text-sm text-gold-700">Reconstructed</p>
              </div>
            </div>
          </div>

          {/* Featured image grid */}
          <div className="grid grid-cols-3 gap-2 h-72">
            {featuredImages.map((img, i) => (
              <div
                key={img}
                className={`overflow-hidden rounded-xl ${i === 0 ? 'col-span-2 row-span-2' : ''}`}
              >
                <img
                  src={`${IMAGE_BASE}${img}`}
                  alt={`Temple ${i + 1}`}
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
      </section>

      {/* Monthly Pooja Banner */}
      <section className="bg-gradient-to-r from-maroon-700 to-maroon-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gold-400/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Flame className="w-7 h-7 text-gold-400" />
              </div>
              <div>
                <h3 className={`text-xl font-bold text-white ${isMl ? 'font-malayalam' : ''}`}>
                  {t('home.monthly_pooja_title')}
                </h3>
                <p className={`text-maroon-200 text-sm ${isMl ? 'font-malayalam' : ''}`}>
                  {t('home.monthly_pooja_desc')}
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gold-400">{t('home.monthly_pooja_price')}</p>
              </div>
              <Link
                to="/pooja"
                className="px-6 py-2.5 bg-gold-500 hover:bg-gold-400 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
              >
                {t('home.join_now')}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Deities Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="h-1 w-8 bg-gold-500 rounded" />
            <span className="text-gold-600 text-sm font-semibold uppercase tracking-wider">Divine Presences</span>
            <div className="h-1 w-8 bg-gold-500 rounded" />
          </div>
          <h2 className={`text-3xl font-bold text-teal-800 ${isMl ? 'font-malayalam' : ''}`}>
            {t('home.deities_title')}
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {deities.map((deity) => (
            <div
              key={deity.name}
              className="bg-white rounded-2xl p-5 text-center shadow-sm border border-amber-100 hover:shadow-md hover:border-gold-200 transition-all"
            >
              {deity.image ? (
                <div className="w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden border-2 border-amber-200 bg-amber-50">
                  <img src={deity.image} alt={deity.name} className="w-full h-full object-contain p-0.5" />
                </div>
              ) : (
                <div className="text-4xl mb-3">{deity.icon}</div>
              )}
              <p className="font-semibold text-teal-800 text-sm">{deity.name}</p>
              <p className="font-malayalam text-teal-600 text-xs mt-1">{deity.ml}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About + Expenses Section */}
      <section className="bg-teal-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* About */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-teal-100">
              <h3 className={`text-2xl font-bold text-teal-800 mb-4 ${isMl ? 'font-malayalam' : ''}`}>
                {t('home.about_title')}
              </h3>
              <p className={`text-gray-600 leading-relaxed ${isMl ? 'font-malayalam' : ''}`}>
                {t('home.about_text')}
              </p>
              <Link
                to="/temple"
                className="inline-flex items-center gap-2 mt-4 text-teal-600 font-medium hover:text-teal-700 transition-colors"
              >
                Learn more <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Monthly Expenses */}
            <div className="bg-gradient-to-br from-teal-700 to-teal-800 rounded-2xl p-8 text-white">
              <h3 className={`text-2xl font-bold text-white mb-4 ${isMl ? 'font-malayalam' : ''}`}>
                {t('home.monthly_expenses')}
              </h3>
              <div className="text-4xl font-bold text-gold-400 mb-2">
                {t('home.monthly_expenses_amount')}
              </div>
              <p className={`text-teal-200 mb-6 ${isMl ? 'font-malayalam' : ''}`}>
                {t('home.monthly_expenses_desc')}
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 font-medium transition-colors"
              >
                {t('home.contact_us')}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className={`text-3xl font-bold text-teal-800 ${isMl ? 'font-malayalam' : ''}`}>
            {t('home.quick_links')}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Link
            to="/pooja"
            className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-gold-200 transition-all text-center"
          >
            <div className="w-14 h-14 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-gold-200 transition-colors">
              <Calendar className="w-7 h-7 text-gold-600" />
            </div>
            <h3 className={`font-bold text-teal-800 mb-2 ${isMl ? 'font-malayalam' : ''}`}>
              {t('home.register_pooja')}
            </h3>
            <p className="text-gray-500 text-sm">
              ₹1,000/month · Family blessings
            </p>
          </Link>

          <Link
            to="/gallery"
            className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-gold-200 transition-all text-center"
          >
            <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-teal-200 transition-colors">
              <Camera className="w-7 h-7 text-teal-600" />
            </div>
            <h3 className={`font-bold text-teal-800 mb-2 ${isMl ? 'font-malayalam' : ''}`}>
              {t('home.view_gallery')}
            </h3>
            <p className="text-gray-500 text-sm">
              Photos & Videos
            </p>
          </Link>

          <Link
            to="/contact"
            className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-gold-200 transition-all text-center"
          >
            <div className="w-14 h-14 bg-maroon-50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-maroon-100 transition-colors">
              <Phone className="w-7 h-7 text-maroon-600" />
            </div>
            <h3 className={`font-bold text-teal-800 mb-2 ${isMl ? 'font-malayalam' : ''}`}>
              {t('home.contact_us')}
            </h3>
            <p className="text-gray-500 text-sm">
              maruvayiltemple@gmail.com
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
