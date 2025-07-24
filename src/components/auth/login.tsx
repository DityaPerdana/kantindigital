import { login, signup } from "@/utils/server/action"

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto mt-8">
      <form className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email:
          </label>
          <input 
            id="email" 
            name="email" 
            type="email" 
            required 
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Password:
          </label>
          <input 
            id="password" 
            name="password" 
            type="password" 
            required 
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div className="flex space-x-4">
          <button 
            formAction={login}
            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Log in
          </button>
          <button 
            formAction={signup}
            className="flex-1 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
          >
            Sign up
          </button>
        </div>
      </form>
    </div>
  )
}