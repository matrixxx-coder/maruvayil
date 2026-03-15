import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, ChevronLeft, ChevronRight, Play, Image } from 'lucide-react';

const IMAGE_BASE = 'https://maruvayiltemple.weebly.com/uploads/1/2/6/7/126797572/';

const allImages: string[] = [
  'mar5-1.jpg', 'mar5-2.jpg', 'mar5-3.jpg', 'mar5-4.jpg', 'mar5-5.jpg',
  'mar5-6.jpg', 'mar5-7.jpg', 'mar5-8.jpg', 'mar5-9.jpg', 'mar5-10.jpg',
  'mar5-11.jpg', 'mar5-12.jpg', 'mar5-13.jpg', 'mar5-14.jpg', 'mar5-15.jpg',
  'mar5-16.jpg', 'mar5-17.jpg', 'mar5-18.jpg', 'mar5-19.jpg', 'mar5-20.jpg',
  'mar5-21.jpg', 'mar5-22.jpg', 'mar5-23.jpg', 'mar5-24.jpg', 'mar5-25.jpg',
  'mar4-27.jpg', 'mar4-28.jpg', 'mar4-29.jpg', 'mar4-30.jpg', 'mar4-31.jpg',
  'mar4-32.jpg', 'mar4-33.jpg',
  'mar4-3.jpg',
  'mar4-7.jpg', 'mar4-8.jpg', 'mar4-9.jpg', 'mar4-10.jpg', 'mar4-11.jpg',
  'mar4-12.jpg', 'mar4-13.jpg', 'mar4-14.jpg', 'mar4-15.jpg', 'mar4-16.jpg',
  'mar4-17.jpg', 'mar4-18.jpg', 'mar4-19.jpg', 'mar4-20.jpg', 'mar4-21.jpg',
  'mar4-22.jpg', 'mar4-23.jpg', 'mar4-24.jpg', 'mar4-25.jpg', 'mar4-26.jpg',
  'mar3-01.jpg', 'mar3-02.jpg', 'mar3-03.jpg', 'mar3-04.jpg', 'mar3-05.jpg', 'mar3-06.jpg',
  'mar4-1.jpg', 'mar4-2.jpg',
];

const youtubeVideos = [
  { id: 'FpU9yku7f-E', title: 'Temple Ceremony' },
  { id: 'u_-NaNzznr4', title: 'Pooja Rituals' },
  { id: 'tFcQx5ElYxg', title: 'Temple Festival' },
  { id: 'v0HiDa9KKzQ', title: 'Sacred Celebrations' },
];

const Gallery: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isMl = i18n.language === 'ml';
  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos');
  const [lightbox, setLightbox] = useState<{ open: boolean; index: number }>({ open: false, index: 0 });
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [visibleCount, setVisibleCount] = useState(20);

  const openLightbox = (index: number) => {
    setLightbox({ open: true, index });
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightbox({ open: false, index: 0 });
    document.body.style.overflow = '';
  };

  const prevImage = () => {
    setLightbox((prev) => ({
      ...prev,
      index: prev.index === 0 ? allImages.length - 1 : prev.index - 1,
    }));
  };

  const nextImage = () => {
    setLightbox((prev) => ({
      ...prev,
      index: prev.index === allImages.length - 1 ? 0 : prev.index + 1,
    }));
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!lightbox.open) return;
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightbox.open]);

  const handleImageLoad = (img: string) => {
    setLoadedImages((prev) => new Set(prev).add(img));
  };

  return (
    <div className="bg-cream min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-800 text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className={`text-4xl font-bold mb-3 ${isMl ? 'font-malayalam' : ''}`}>
            {t('gallery.title')}
          </h1>
          <p className={`text-teal-200 text-lg ${isMl ? 'font-malayalam' : ''}`}>
            {t('gallery.subtitle')}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm border border-gray-100 w-fit mb-8">
          <button
            onClick={() => setActiveTab('photos')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'photos'
                ? 'bg-teal-700 text-white shadow'
                : 'text-gray-600 hover:text-teal-700'
            }`}
          >
            <Image className="w-4 h-4" />
            <span className={isMl ? 'font-malayalam' : ''}>{t('gallery.photos_tab')}</span>
            <span className="ml-1 text-xs opacity-70">({allImages.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'videos'
                ? 'bg-teal-700 text-white shadow'
                : 'text-gray-600 hover:text-teal-700'
            }`}
          >
            <Play className="w-4 h-4" />
            <span className={isMl ? 'font-malayalam' : ''}>{t('gallery.videos_tab')}</span>
            <span className="ml-1 text-xs opacity-70">({youtubeVideos.length})</span>
          </button>
        </div>

        {/* Photos Grid */}
        {activeTab === 'photos' && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {allImages.slice(0, visibleCount).map((img, i) => (
                <div
                  key={img}
                  className="aspect-square rounded-xl overflow-hidden cursor-pointer group bg-gray-100 shadow-sm"
                  onClick={() => openLightbox(i)}
                >
                  {!loadedImages.has(img) && (
                    <div className="w-full h-full bg-gradient-to-br from-teal-50 to-teal-100 animate-pulse flex items-center justify-center">
                      <Image className="w-6 h-6 text-teal-300" />
                    </div>
                  )}
                  <img
                    src={`${IMAGE_BASE}${img}`}
                    alt={`Temple ${i + 1}`}
                    className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${
                      loadedImages.has(img) ? 'block' : 'hidden'
                    }`}
                    loading="lazy"
                    onLoad={() => handleImageLoad(img)}
                    onError={(e) => {
                      (e.target as HTMLImageElement).closest('div')!.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-xl" />
                </div>
              ))}
            </div>
            {visibleCount < allImages.length && (
              <div className="mt-8 text-center">
                <button
                  onClick={() => setVisibleCount((v) => v + 20)}
                  className="px-8 py-3 border-2 border-teal-700 text-teal-700 hover:bg-teal-700 hover:text-white font-semibold rounded-lg transition-colors"
                >
                  Load More Photos
                </button>
              </div>
            )}
          </>
        )}

        {/* Videos Grid */}
        {activeTab === 'videos' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {youtubeVideos.map((video) => (
              <div key={video.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                <div className="aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${video.id}`}
                    title={video.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="p-4">
                  <p className="font-semibold text-teal-800">{video.title}</p>
                  <a
                    href={`https://www.youtube.com/watch?v=${video.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 hover:text-teal-700 text-sm flex items-center gap-1 mt-1"
                  >
                    <Play className="w-3 h-3" />
                    Watch on YouTube
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox.open && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeLightbox();
          }}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Prev button */}
          <button
            onClick={prevImage}
            className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Image */}
          <div className="max-w-5xl max-h-[90vh] mx-16 flex items-center justify-center">
            <img
              src={`${IMAGE_BASE}${allImages[lightbox.index]}`}
              alt={`Temple ${lightbox.index + 1}`}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
          </div>

          {/* Next button */}
          <button
            onClick={nextImage}
            className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 rounded-full text-white text-sm">
            {lightbox.index + 1} / {allImages.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
