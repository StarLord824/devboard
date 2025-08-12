import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-evenly h-screen w-screen bg-neutral-600">
      <h1>Welcome to DevBoard</h1>
      <div>
        <Link href="/signin">Sign In</Link>
        <Link href="/signup">Sign Up</Link>
      </div>  
    </div>
  );
}
