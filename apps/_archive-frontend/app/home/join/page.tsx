'use client'

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
    slug: z.string(),
});
export default function JoinBoard() {
    const { register, handleSubmit, formState: { errors } } = useForm({
      resolver: zodResolver(schema),
    });
    const onSubmit = (data: any) => {
      console.log(data);
    }
    return (
      <div className="flex flex-col items-center justify-evenly h-screen w-screen bg-neutral-900">
        <h1 className="text-3xl font-bold text-center">Join Board</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <input type="text" placeholder="Board Slug" className="border border-gray-300 rounded p-2 w-full" {...register("slug")} />
          <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Join</button>
        </form>
      </div>
    );
}