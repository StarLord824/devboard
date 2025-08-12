'use client'
import {useForm, type SubmitHandler} from 'react-hook-form'
import {z} from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

export default function SignIn() {
  //get input of userame and password
  const Inputs = z.object({
    username: z.string().min(3),
    password: z.string().min(6)
  })
  type Inputs = z.infer<typeof Inputs>
  const {register, handleSubmit, formState: {errors, isSubmitting}, } = useForm<Inputs>({
    resolver: zodResolver(Inputs),
  })
  const submitHandler : SubmitHandler<Inputs> = async (data: Inputs) => {
    const response = await fetch('/api/v1/users/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (response.ok) {
      console.log('User signed in successfully')
    } else {
      console.log('Error signing in')
    }
    console.log(data)
  }
  return (
    <div className='flex flex-col items-center justify-center h-screen w-screen text-center gap-3 bg-white  rounded-2xl border-2 border-gray-500'>
      <form action="/home" onSubmit={handleSubmit(submitHandler)}
        className='flex flex-col items-center justify-center h-3/4 w-2/5 text-center bg-red-600 gap-3'
      >
        <input type="text" placeholder='Username' {...register('username')} 
          className='bg-gray-100 border-2 border-gray-300 rounded-lg p-2 text-center text-black font-semibold'
        />
        {
          errors.username && <h1 className='text-white'>{errors.username?.message}</h1>
        }
        <input type="password" placeholder='Password' {...register('password')} 
          className='bg-gray-100 border-2 border-gray-300 rounded-lg p-2 text-center text-black font-semibold'
        />
        {
          errors.password && <h1 className='text-white'>{errors.password?.message}</h1>
        }
        <button disabled={isSubmitting} type="submit"
          className='bg-yellow-400 text-white rounded-lg p-2 text-center text-black font-semibold'
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}