import { login, signInWithGoogle, signup } from "@/utils/server/action";

// Komponen Ikon untuk Google dan GitHub (SVG disematkan langsung)
const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-1.7c-.62 0-1.3.3-1.3.8V12h3l-.5 3h-2.5v6.8c4.56-.93 8-4.96 8-9.8z" />
    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2c4.41 0 8-3.59 8-8s-3.59-8-8-8-8 3.59-8 8 3.59 8 8 8zm-1-9h2v2h-2v-2zm-3-3h2v2H8V8zm6 0h2v2h-2V8z" />
    <path d="M12 12c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z" />
    <g fill="none" fillRule="evenodd">
      <path d="M20.64 12.2045c0-.6386-.0573-1.2545-.1636-1.8409H12v3.4818h4.8445c-.2086 1.125-.8441 2.0782-1.7959 2.7164v2.2582h2.9082c1.7018-1.5668 2.6836-3.8736 2.6836-6.6155z" fill="#4285F4" />
      <path d="M12 21c2.4909 0 4.5818-0.8273 6.0955-2.2364l-2.9082-2.2582c-.8273.5564-1.8818.8855-3.1873.8855-2.4336 0-4.4932-1.6364-5.2309-3.8345H3.74v2.3318C5.2336 18.9818 8.3918 21 12 21z" fill="#34A853" />
      <path d="M6.7691 13.4182c-.1827-.5564-.2855-1.1536-.2855-1.7727s.1027-1.2164.2855-1.7727V7.5409H3.74C3.2577 8.6618 3 9.9273 3 11.25s.2577 2.5882.74 3.7091l3.0291-2.3318z" fill="#FBBC05" />
      <path d="M12 6.2727c1.3455 0 2.5636.4636 3.5227 1.3909l2.5818-2.5818C16.5818 3.5182 14.4909 2.5 12 2.5c-3.6082 0-6.7664 2.0182-8.26 4.9091l3.0291 2.3318c.7377-2.1982 2.7973-3.8345 5.2309-3.8345z" fill="#EA4335" />
    </g>
  </svg>
);

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Selamat Datang</h1>
          <p className="mt-2 text-sm text-gray-600">Masuk untuk melanjutkan ke Kantin Digital</p>
        </div>

        {/* Form untuk OAuth Providers */}
        <div className="space-y-4">
          <form action={signInWithGoogle}>
            <button type="submit" className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400">
              <GoogleIcon className="w-5 h-5" />
              <span className="text-sm font-medium text-gray-700">Lanjutkan dengan Google</span>
            </button>
          </form>
        </div>

        <div className="relative flex items-center">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink mx-4 text-xs uppercase text-black">Atau masuk dengan email</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        {/* Form untuk Email & Password */}
        <form action={login} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Alamat Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
              placeholder="anda@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full px-3 py-2 bg-white border text-black border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Masuk
          </button>
        </form>
        
        {/* Form untuk Sign Up */}
        <div className="text-center text-sm">
          <span className="text-gray-600">Belum punya akun? </span>
          <form action={signup} className="inline-block">
             <button type="submit" className="font-medium text-blue-600 hover:text-blue-500">
                Daftar di sini
             </button>
          </form>
        </div>
      </div>
    </div>
  );
}