import { Gift } from 'lucide-react';
import Link from 'next/link';

export const Feature = () => {


  return (
    <section id='kantin-digital' className='bg-white rounded-3xl p-4 my-16 max-w-6xl mx-auto'>
      <div className='flex flex-col md:flex-row items-end justify-between w-full'>
        <div className='flex flex-col my-12 w-full items-start justify-start gap-4'>
          <div className='flex flex-col md:flex-row gap-2 items-end w-full justify-between '>
            <h2 className="relative text-4xl md:text-5xl font-sans font-semibold max-w-xl text-left leading-[1em] text-base-content">Kantin Digital, <br/> <span><Gift className="inline-flex text-accent fill-accent/10 rotate-12" size={40} strokeWidth={2} /></span> Solusi Modern untuk Pengelolaan Kantin.</h2>
            <p className='max-w-sm font-semibold text-md text-neutral/50'>Kelola menu, pesanan, dan transaksi kantin sekolah atau kantor dengan mudah, cepat, dan efisien. Semua fitur yang Anda butuhkan dalam satu platform digital.</p>
          </div>
          <div className='flex flex-row text-accent gap-6 items-start justify-center'>
            <p className='text-base whitespace-nowrap font-medium'>+1,000 Pesanan Diproses</p>
            <p className='text-base whitespace-nowrap font-medium'>Digunakan oleh 100+ Pengelola Kantin</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 md:items-start md:justify-start gap-4 ">
        <Link href={"/menu"} className="md:col-span-2 overflow-hidden hover:scale-101 hover:shadow-[-6px_6px_32px_8px_rgba(192,192,192,0.2)] hover:rotate-1 transition-all duration-200 ease-in-out h-[330px] overflow-hidden relative bg-accent/20 rounded-xl flex flex-row items-center gap-8 justify-between px-3 pt-3 pb-6">
          <div className='relative flex flex-col items-start justify-center ml-4 gap-0'>
            <p className='-rotate-1 ml-4 mb-1 text-base-content'>Kelola Menu</p>
            <h3 className='-rotate-1 text-2xl whitespace-nowrap font-semibold text-center px-6 py-2 bg-base-content/90 text-white rounded-full'>Manajemen Menu Makanan & Minuman</h3>
          </div>  
          <div className="w-full object-fill rounded-xl"></div>
        </Link>

        <Link href={"/orders"} className="overflow-hidden md:hover:scale-105 hover:shadow-[-6px_6px_32px_8px_rgba(192,192,192,0.2)] hover:rotate-3 transition-all duration-200 ease-in-out relative bg-highlight/20 h-[330px] rounded-xl flex flex-col items-center justify-between px-3 py-6">
          <div className='flex flex-col items-center justify-center gap-1'>
            <p className='rotate-6 mb-1 text-base-content'>Pantau Pesanan</p>
            <h3 className='rotate-6 text-2xl font-semibold text-center px-6 py-2 bg-base-content/90 text-white rounded-full'>Pesanan Real-time</h3>
          </div>  
          <div className="w-full object-fill rounded-xl"></div>            
        </Link>

        <Link href={"/laporan"} className="overflow-hidden md:hover:scale-105 hover:shadow-[-6px_6px_32px_8px_rgba(192,192,192,0.2)] hover:-rotate-3 transition-all duration-200 ease-in-out relative bg-secondary/20 h-[330px] rounded-xl flex flex-col items-center justify-between px-5 py-6">
          <div className='flex flex-col items-center justify-center gap-1'>
            <p className='-rotate-3 mb-1 text-base-content'>Laporan Penjualan</p>
            <h3 className='-rotate-3 text-2xl font-semibold text-center px-6 py-2 bg-base-content/90 text-white rounded-full'>Rekap & Analitik</h3>
          </div>
          <div className="w-full object-fill rounded-xl"></div>
        </Link>

        <Link href={"/blog"} className="pointer-events-none overflow-hidden md:hover:scale-105 hover:shadow-[-6px_6px_32px_8px_rgba(192,192,192,0.2)] hover:rotate-4 transition-all duration-200 ease-in-out relative bg-base-100 h-[330px] rounded-xl flex flex-col items-center justify-center px-5 py-6">
          <p className='-rotate-3 mb-1 text-base-content'>Blog & Panduan</p>
          <h3 className='-rotate-3 text-2xl font-semibold text-center px-6 py-2 bg-white/75 rounded-full text-black'>Segera Hadir</h3>
        </Link>

        <Link href={"/fitur-lain"} className="pointer-events-none flex items-center justify-center overflow-hidden md:hover:scale-105 hover:shadow-[-6px_6px_32px_8px_rgba(192,192,192,0.2)] hover:-rotate-6 transition-all duration-200 ease-in-out relative bg-primary/20 h-[330px] rounded-xl flex flex-col items-center justify-center px-5 py-6">
          <p className='rotate-6 mb-1 text-base-content'>Fitur Lainnya</p>
          <h3 className='rotate-6 text-2xl font-semibold text-center px-6 py-2 bg-white/75 rounded-full text-black'>Segera Hadir</h3>
        </Link>
      </div>
    </section>
  );
};
