import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-evenly h-screen w-screen bg-neutral-950">
      <h1 className="text-3xl font-bold text-center">Welcome to DevBoard</h1>
      <div className="flex h-1/3 w-1/2 justify-evenly items-center">
        <Link href="/signin" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Sign In</Link>
        <Link href="/signup" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Sign Up</Link>
      </div> 
    </div>  
  );
}
