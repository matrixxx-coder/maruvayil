import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Mail, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-teal-900 text-teal-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="https://maruvayiltemple.weebly.com/uploads/1/2/6/7/126797572/published/temple-logo.jpg"
                alt="Temple Logo"
                className="h-12 w-12 rounded-full object-cover border-2 border-gold-400"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div>
                <p className="text-white font-bold text-sm">Maruvayil Sree ShivaParvathy</p>
                <p className="text-gold-400 text-xs">Kudumba Kshetra</p>
              </div>
            </div>
            <p className="text-teal-300 text-sm">
              {t('footer.tagline')}
            </p>
            <p className="text-teal-400 text-xs font-malayalam">
              മറുവയൽ ശ്രീ ശിവ പാർവതി കുടുംബ ക്ഷേത്രം
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              {t('footer.quick_links')}
            </h3>
            <ul className="space-y-2">
              {[
                { to: '/', label: t('nav.home') },
                { to: '/temple', label: t('nav.temple') },
                { to: '/pooja', label: t('nav.pooja') },
                { to: '/gallery', label: t('nav.gallery') },
                { to: '/contact', label: t('nav.contact') },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-teal-300 hover:text-gold-400 text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              {t('footer.contact')}
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gold-400 mt-0.5 flex-shrink-0" />
                <p className="text-teal-300 text-sm">
                  Maruveyil House, Post Kunhumakara,<br />
                  Via Chombala, Vadagara Taluq,<br />
                  Calicut District, Kerala
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <a
                  href="mailto:maruvayiltemple@gmail.com"
                  className="text-teal-300 hover:text-gold-400 text-sm transition-colors"
                >
                  maruvayiltemple@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-teal-700 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-teal-400 text-xs">
            &copy; {new Date().getFullYear()} {t('footer.trust')}. {t('footer.rights')}.
          </p>
          <p className="text-teal-500 text-xs flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-maroon-400" /> for our devotees
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
