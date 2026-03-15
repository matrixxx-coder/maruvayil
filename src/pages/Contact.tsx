import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Mail, Send, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Contact: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isMl = i18n.language === 'ml';

  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate form submission (in production, connect to a backend or email service)
    await new Promise((resolve) => setTimeout(resolve, 1200));

    setLoading(false);
    setSubmitted(true);
    toast.success(t('contact.form_success'));
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="bg-cream min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-800 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className={`text-4xl font-bold mb-3 ${isMl ? 'font-malayalam' : ''}`}>
            {t('contact.title')}
          </h1>
          <p className={`text-teal-200 text-lg ${isMl ? 'font-malayalam' : ''}`}>
            {t('contact.subtitle')}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <h3 className={`font-bold text-teal-800 text-lg mb-2 ${isMl ? 'font-malayalam' : ''}`}>
                    {t('contact.address_title')}
                  </h3>
                  <p className={`text-gray-600 leading-relaxed ${isMl ? 'font-malayalam' : ''}`}>
                    {t('contact.address')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gold-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-gold-600" />
                </div>
                <div>
                  <h3 className={`font-bold text-teal-800 text-lg mb-2 ${isMl ? 'font-malayalam' : ''}`}>
                    {t('contact.email_title')}
                  </h3>
                  <a
                    href="mailto:maruvayiltemple@gmail.com"
                    className="text-teal-600 hover:text-teal-700 font-medium"
                  >
                    maruvayiltemple@gmail.com
                  </a>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <div className="p-4 border-b border-gray-100">
                <p className="font-semibold text-teal-800">Find Us on Map</p>
                <p className="text-sm text-gray-500">Chombala, Vadagara Taluk, Kerala</p>
              </div>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d62433.46041780754!2d75.5804!3d11.6049!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba6701b5d7b7d71%3A0x8d47f92fd3c3e3cc!2sChombala%2C%20Kerala!5e0!3m2!1sen!2sin!4v1703000000000!5m2!1sen!2sin"
                width="100%"
                height="280"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Temple Location"
              />
            </div>

            {/* Quick info card */}
            <div className="bg-teal-700 rounded-2xl p-6 text-white">
              <h3 className="font-bold text-lg mb-3">Temple Details</h3>
              <div className="space-y-2 text-sm text-teal-100">
                <div className="flex justify-between">
                  <span className="text-teal-300">Founded</span>
                  <span>300+ years ago</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-teal-300">Reconstructed</span>
                  <span>February 2020</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-teal-300">Monthly Pooja</span>
                  <span>₹1,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-teal-300">Trust</span>
                  <span>Charitable Trust</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className={`text-2xl font-bold text-teal-800 mb-6 ${isMl ? 'font-malayalam' : ''}`}>
              {t('contact.form_title')}
            </h2>

            {submitted ? (
              <div className="flex flex-col items-center text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Message Sent!</h3>
                <p className={`text-gray-600 ${isMl ? 'font-malayalam' : ''}`}>
                  {t('contact.form_success')}
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-6 px-6 py-2 border border-teal-700 text-teal-700 rounded-lg hover:bg-teal-50 font-medium"
                >
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 mb-1.5 ${isMl ? 'font-malayalam' : ''}`}>
                      {t('contact.form_name')} *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium text-gray-700 mb-1.5 ${isMl ? 'font-malayalam' : ''}`}>
                      {t('contact.form_email')} *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-1.5 ${isMl ? 'font-malayalam' : ''}`}>
                    {t('contact.form_subject')} *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                    placeholder="Subject of your message"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-1.5 ${isMl ? 'font-malayalam' : ''}`}>
                    {t('contact.form_message')} *
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition resize-none"
                    placeholder="Write your message here..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-teal-700 hover:bg-teal-800 disabled:bg-teal-400 text-white font-semibold rounded-lg transition-colors"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span className={isMl ? 'font-malayalam' : ''}>{t('contact.form_submit')}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
