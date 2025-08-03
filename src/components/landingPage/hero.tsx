import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

import LogoutButton from './LogoutButton';

export default async function LandingPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()

  return (
    <section className="relative w-full min-h-[70vh] flex flex-col items-center justify-center bg-gradient-to-br from-green-100 via-white to-accent/20 py-20 px-4 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-accent/20 rounded-full blur-3xl opacity-60 animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-primary/20 rounded-full blur-2xl opacity-50 animate-pulse" />
      </div>
      <div className="relative z-10 max-w-3xl text-center flex flex-col items-center">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 drop-shadow-xl leading-tight">
          <span className="text-accent">Kantin Digital</span> <span className="text-primary">Open Source</span>
        </h1>
        <p className="text-lg md:text-2xl text-gray-700 mb-8 font-medium max-w-2xl mx-auto">
          <span className="bg-accent/10 px-2 py-1 rounded text-accent font-semibold">Solusi All-in-One</span> untuk pengelolaan menu, pesanan, dan transaksi kantin <span className="text-primary font-semibold">sekolah</span> maupun <span className="text-primary font-semibold">kantor</span>. Mudah, cepat, dan real-time!
        </p>
        <a
          href="/catalog"
          className="inline-block bg-gradient-to-r from-accent to-primary text-white font-bold px-10 py-4 rounded-full shadow-2xl hover:scale-105 hover:shadow-accent/30 transition-all text-lg tracking-wide mb-4"
        >
          🚀 Mulai Kelola Kantin
        </a>
        <div className="flex flex-wrap gap-3 justify-center mt-2">
          <span className="bg-white/80 text-accent px-4 py-1 rounded-full text-sm font-semibold shadow">1000+ Pesanan Diproses</span>
          <span className="bg-white/80 text-primary px-4 py-1 rounded-full text-sm font-semibold shadow">Realtime Dashboard</span>
          <span className="bg-white/80 text-green-700 px-4 py-1 rounded-full text-sm font-semibold shadow">Gratis Selamanya</span>
        </div>
      </div>
      <div className="relative z-10 mt-14 flex justify-center">
        <div className="relative">
          <img
            src="/sushi-svgrepo-com.svg"
            alt="Ilustrasi Kantin Digital"
            className="w-64 h-64 object-contain drop-shadow-2xl animate-fade-in"
          />
          <img
            src="/food-and-drink-svgrepo-com.svg"
            alt="Makanan dan Minuman"
            className="absolute -bottom-8 -right-16 w-32 h-32 object-contain opacity-80 animate-float"
          />
        </div>
      </div>
    </section>
  )
}