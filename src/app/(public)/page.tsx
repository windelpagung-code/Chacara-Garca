import { prisma } from "@/lib/db";
import PublicCalendar from "@/components/modules/PublicCalendar";
import Link from "next/link";
import { MapPinIcon, PhoneIcon, UsersIcon, SparklesIcon, StarIcon } from "@heroicons/react/24/outline";

async function getSettings() {
  const settings = await prisma.setting.findMany();
  const result: Record<string, string> = {};
  settings.forEach((s) => { result[s.key] = s.value; });
  return result;
}

// Coqueiro SVG inline
function PalmTree({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Trunk */}
      <path d="M38 155 Q36 120 40 80 Q42 50 38 20" stroke="#8B6914" strokeWidth="5" strokeLinecap="round" fill="none"/>
      {/* Leaves */}
      <path d="M40 20 Q10 10 0 30 Q20 25 40 20Z" fill="#2D8B4E" opacity="0.9"/>
      <path d="M40 20 Q70 5 80 25 Q60 22 40 20Z" fill="#2D8B4E" opacity="0.9"/>
      <path d="M40 20 Q15 -5 25 25 Q32 18 40 20Z" fill="#34A85A" opacity="0.85"/>
      <path d="M40 20 Q65 -5 55 25 Q47 18 40 20Z" fill="#34A85A" opacity="0.85"/>
      <path d="M40 20 Q0 15 5 35 Q22 22 40 20Z" fill="#22C55E" opacity="0.8"/>
      <path d="M40 20 Q80 15 75 35 Q58 22 40 20Z" fill="#22C55E" opacity="0.8"/>
      <path d="M40 20 Q30 -10 40 15Z" fill="#16A34A" opacity="0.9"/>
      {/* Coconuts */}
      <circle cx="38" cy="28" r="4" fill="#92400E"/>
      <circle cx="44" cy="32" r="3.5" fill="#78350F"/>
    </svg>
  );
}

// Garça SVG inline
function Heron({ className = "", flipped = false }: { className?: string; flipped?: boolean }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={flipped ? { transform: "scaleX(-1)" } : {}}
    >
      {/* Body */}
      <ellipse cx="60" cy="55" rx="28" ry="18" fill="white" stroke="#CBD5E1" strokeWidth="1"/>
      {/* Wing detail */}
      <path d="M35 55 Q50 45 75 50 Q60 58 35 55Z" fill="#E2E8F0"/>
      {/* Neck */}
      <path d="M72 45 Q85 35 80 20 Q78 15 82 10" stroke="white" strokeWidth="8" strokeLinecap="round" fill="none"/>
      {/* Head */}
      <ellipse cx="82" cy="10" rx="8" ry="6" fill="white"/>
      {/* Beak */}
      <path d="M89 9 L105 7 L89 11Z" fill="#F59E0B"/>
      {/* Eye */}
      <circle cx="84" cy="8" r="2" fill="#1E293B"/>
      <circle cx="85" cy="7.5" r="0.8" fill="white"/>
      {/* Crest feathers */}
      <path d="M78 6 Q72 -2 68 4" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M77 7 Q70 0 67 6" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      {/* Legs */}
      <line x1="52" y1="70" x2="48" y2="92" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="62" y1="71" x2="60" y2="92" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Feet */}
      <path d="M48 92 L42 96 M48 92 L48 97 M48 92 L54 95" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M60 92 L54 96 M60 92 L60 97 M60 92 L66 95" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Tail feathers */}
      <path d="M35 60 Q20 65 15 58" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M35 63 Q18 70 14 62" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

const WHATSAPP_SVG = (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.558 4.116 1.524 5.85L.057 23.869l6.168-1.438A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.948 0-3.77-.534-5.327-1.459l-.38-.225-3.965.924.993-3.875-.245-.393A9.942 9.942 0 012 12c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10z" />
  </svg>
);

export default async function HomePage() {
  const settings = await getSettings();

  const chacaraName = settings.chacara_name || "Chácara Garça";
  const description = settings.chacara_description || "Um refúgio natural com piscina, área gourmet e espaço amplo para seus eventos, reuniões em família e celebrações inesquecíveis. Venha desfrutar da natureza e da tranquilidade.";
  const address = settings.chacara_address || "";
  // Extract src from iframe tag if stored as full tag, then validate it's an absolute URL
  const rawMaps = settings.maps_embed_url || "";
  const iframeSrcMatch = rawMaps.match(/src="([^"]+)"/);
  const resolvedMaps = iframeSrcMatch ? iframeSrcMatch[1] : rawMaps;
  const mapsUrl = resolvedMaps.startsWith("http://") || resolvedMaps.startsWith("https://") ? resolvedMaps : "";
  const whatsapp = settings.whatsapp_number || "";
  const instagram = settings.instagram_url || "";
  const facebook = settings.facebook_url || "";

  const whatsappLink = whatsapp ? `https://wa.me/${whatsapp}` : "#";

  const amenities = [
    { icon: UsersIcon, title: "Grande Capacidade", desc: "Espaço amplo para eventos, festas e reuniões familiares" },
    { icon: SparklesIcon, title: "Estrutura Completa", desc: "Piscina, área gourmet e toda infraestrutura para seu evento" },
    { icon: StarIcon, title: "Ambiente Natural", desc: "Rodeado de natureza, árvores e muito verde para relaxar" },
    { icon: PhoneIcon, title: "Atendimento Dedicado", desc: "Atendimento personalizado para tornar seu evento perfeito" },
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur border-b border-emerald-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11">
              <Heron className="w-11 h-11" />
            </div>
            <div>
              <span className="text-lg font-bold text-emerald-800">{chacaraName}</span>
              <p className="text-xs text-emerald-500 leading-none">Natureza & Eventos</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {["Sobre", "Disponibilidade", "Localização", "Contato"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace("ç", "c").replace("ã", "a")}`}
                className="text-gray-600 hover:text-emerald-600 font-medium text-sm transition-colors"
              >
                {item}
              </a>
            ))}
          </nav>

          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-600 transition-all shadow-sm hover:shadow-md hidden md:flex items-center gap-2"
          >
            {WHATSAPP_SVG && <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.558 4.116 1.524 5.85L.057 23.869l6.168-1.438A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.948 0-3.77-.534-5.327-1.459l-.38-.225-3.965.924.993-3.875-.245-.393A9.942 9.942 0 012 12c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10z"/></svg>}
            Reservar Agora
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[92vh] flex items-center bg-gradient-to-br from-emerald-900 via-emerald-700 to-teal-600 text-white overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{backgroundImage: "radial-gradient(circle at 20% 80%, #ffffff 1px, transparent 1px), radial-gradient(circle at 80% 20%, #ffffff 1px, transparent 1px)", backgroundSize: "40px 40px"}} />
        </div>

        {/* Water / pond at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-teal-900/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-16">
          <svg viewBox="0 0 1440 64" className="w-full h-full" preserveAspectRatio="none">
            <path d="M0,32 C360,64 720,0 1080,32 C1260,48 1380,56 1440,48 L1440,64 L0,64Z" fill="rgba(14,116,144,0.4)"/>
            <path d="M0,48 C480,24 960,56 1440,40 L1440,64 L0,64Z" fill="rgba(14,116,144,0.3)"/>
          </svg>
        </div>

        {/* Palm trees left */}
        <div className="absolute bottom-12 left-0 flex items-end gap-0 pointer-events-none select-none">
          <PalmTree className="w-20 h-40 opacity-80" />
          <PalmTree className="w-14 h-28 opacity-60 -ml-4" />
        </div>

        {/* Palm trees right */}
        <div className="absolute bottom-12 right-0 flex items-end gap-0 pointer-events-none select-none" style={{transform: "scaleX(-1)"}}>
          <PalmTree className="w-20 h-40 opacity-80" />
          <PalmTree className="w-14 h-28 opacity-60 -ml-4" />
        </div>

        {/* Herons on water */}
        <div className="absolute bottom-14 left-1/4 pointer-events-none select-none opacity-90">
          <Heron className="w-28 h-24" />
        </div>
        <div className="absolute bottom-16 right-1/4 pointer-events-none select-none opacity-80">
          <Heron className="w-20 h-16" flipped />
        </div>

        {/* Content */}
        <div className="relative max-w-6xl mx-auto px-4 py-32 text-center z-10 w-full">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm font-medium text-emerald-100 mb-8">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            Natureza, paz e celebração
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight drop-shadow-lg">
            {chacaraName}
          </h1>
          <p className="text-xl md:text-2xl text-emerald-100 mb-3 font-light">
            O Lugar Perfeito para o Seu Evento
          </p>
          <p className="text-base text-emerald-200/80 mb-12 max-w-xl mx-auto">
            {description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#disponibilidade"
              className="bg-white text-emerald-800 px-8 py-4 rounded-xl font-bold text-lg hover:bg-emerald-50 transition-all shadow-lg hover:shadow-xl"
            >
              Ver Disponibilidade
            </a>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.558 4.116 1.524 5.85L.057 23.869l6.168-1.438A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.948 0-3.77-.534-5.327-1.459l-.38-.225-3.965.924.993-3.875-.245-.393A9.942 9.942 0 012 12c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10z"/></svg>
              Falar no WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="sobre" className="py-24 bg-emerald-50 relative overflow-hidden">
        {/* Decorative palm */}
        <div className="absolute -right-4 top-0 opacity-10 pointer-events-none">
          <PalmTree className="w-32 h-64" />
        </div>

        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-emerald-600 text-sm font-semibold uppercase tracking-wider mb-3">
              <span className="w-8 h-px bg-emerald-400" />
              Conheça o espaço
              <span className="w-8 h-px bg-emerald-400" />
            </div>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Sobre a {chacaraName}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
              {description}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {amenities.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 shadow-md border border-emerald-100 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 mb-2 text-lg">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* Heron decoration */}
          <div className="flex justify-center mt-16 gap-8 opacity-40">
            <Heron className="w-24 h-20" />
            <div className="w-px bg-emerald-200 self-stretch" />
            <Heron className="w-24 h-20" flipped />
          </div>
        </div>
      </section>

      {/* Availability Calendar */}
      <section id="disponibilidade" className="py-24 bg-white relative">
        {/* Decorative palms */}
        <div className="absolute left-0 bottom-0 opacity-5 pointer-events-none">
          <PalmTree className="w-40 h-80" />
        </div>
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-emerald-600 text-sm font-semibold uppercase tracking-wider mb-3">
              <span className="w-8 h-px bg-emerald-400" />
              Reserve sua data
              <span className="w-8 h-px bg-emerald-400" />
            </div>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Disponibilidade</h2>
            <p className="text-gray-600 text-lg">
              Consulte as datas disponíveis e entre em contato para confirmar sua reserva.
            </p>
          </div>
          <PublicCalendar />
        </div>
      </section>

      {/* Location */}
      <section id="localizacao" className="py-24 bg-emerald-50 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none" style={{transform: "scaleX(-1)"}}>
          <PalmTree className="w-28 h-56" />
        </div>
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-emerald-600 text-sm font-semibold uppercase tracking-wider mb-3">
              <span className="w-8 h-px bg-emerald-400" />
              Como chegar
              <span className="w-8 h-px bg-emerald-400" />
            </div>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Localização</h2>
            {address && (
              <p className="text-gray-600 flex items-center justify-center gap-2 text-lg">
                <MapPinIcon className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                {address}
              </p>
            )}
          </div>

          {mapsUrl ? (
            <div className="rounded-3xl overflow-hidden shadow-xl border border-emerald-100 h-96">
              <iframe src={mapsUrl} width="100%" height="100%" style={{ border: 0 }} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-emerald-100 h-80 flex items-center justify-center shadow-lg">
              <div className="text-center text-gray-400">
                <MapPinIcon className="w-16 h-16 mx-auto mb-4 text-emerald-200" />
                <p className="font-semibold text-gray-500 text-lg">Localização</p>
                {address && <p className="text-sm mt-2 text-gray-400 max-w-xs">{address}</p>}
                <p className="text-xs mt-4 text-gray-300">Configure o mapa em Configurações</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Contact CTA */}
      <section id="contato" className="py-24 bg-gradient-to-br from-emerald-800 to-teal-700 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{backgroundImage: "radial-gradient(circle at 30% 70%, #ffffff 1px, transparent 1px)", backgroundSize: "30px 30px"}} />
        </div>
        <div className="absolute bottom-0 left-8 opacity-20 pointer-events-none">
          <PalmTree className="w-24 h-48" />
        </div>
        <div className="absolute bottom-0 right-8 opacity-20 pointer-events-none" style={{transform: "scaleX(-1)"}}>
          <PalmTree className="w-24 h-48" />
        </div>

        {/* Herons */}
        <div className="absolute bottom-4 left-1/3 opacity-30 pointer-events-none">
          <Heron className="w-20 h-16" />
        </div>
        <div className="absolute bottom-4 right-1/3 opacity-25 pointer-events-none">
          <Heron className="w-16 h-12" flipped />
        </div>

        <div className="relative max-w-3xl mx-auto px-4 text-center z-10">
          <Heron className="w-24 h-20 mx-auto mb-6 opacity-80" />
          <h2 className="text-4xl font-bold text-white mb-4">Pronto para Reservar?</h2>
          <p className="text-emerald-200 text-xl mb-10 leading-relaxed">
            Entre em contato pelo WhatsApp e garante sua data. Atendimento rápido e personalizado!
          </p>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-green-500 text-white px-12 py-5 rounded-2xl font-bold text-xl hover:bg-green-400 transition-all shadow-2xl hover:shadow-green-500/50 hover:scale-105"
          >
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.558 4.116 1.524 5.85L.057 23.869l6.168-1.438A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.948 0-3.77-.534-5.327-1.459l-.38-.225-3.965.924.993-3.875-.245-.393A9.942 9.942 0 012 12c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10z"/></svg>
            Falar no WhatsApp
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Heron className="w-10 h-8 opacity-70" />
              <div>
                <span className="text-white font-bold text-lg">{chacaraName}</span>
                <p className="text-xs text-gray-500">Natureza & Eventos</p>
              </div>
            </div>

            {address && (
              <p className="text-sm flex items-center gap-2">
                <MapPinIcon className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                {address}
              </p>
            )}

            <div className="flex items-center gap-5">
              {instagram && (
                <a href={instagram} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors text-sm hover:text-emerald-400">
                  Instagram
                </a>
              )}
              {facebook && (
                <a href={facebook} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors text-sm hover:text-emerald-400">
                  Facebook
                </a>
              )}
              <Link href="/login" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
                Admin
              </Link>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-6 text-center text-xs text-gray-600">
            © 2026 {chacaraName}. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
