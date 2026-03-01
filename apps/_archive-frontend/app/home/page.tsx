import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-evenly h-screen w-screen bg-neutral-950">
        <div>
          <h1 className="text-3xl font-bold text-center">Welcome to DevBoard</h1>
        </div>
        <div className="flex h-1/3 w-1/2 justify-evenly items-center">
          {/* //create, join boards */}
          <Link href='/home/create' className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Create Board</Link>
          <Link href='/home/join' className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Join Board</Link>
        </div>
    </div>
  )
}