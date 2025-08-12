'use client'
import {useForm, type SubmitHandler} from 'react-hook-form'
import {z} from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

export default function SignUp() {
  //get input of userame, name, email, password
  const Inputs = z.object({
    username: z.string().min(3),
    name: z.string().min(3),
    email: z.email(),
    password: z.string().min(6)
  })
  type Inputs = z.infer<typeof Inputs>
  const {register, handleSubmit, formState: {errors, isSubmitting}, } = useForm<Inputs>({
    resolver: zodResolver(Inputs),
  })
  const submitHandler : SubmitHandler<Inputs> = async (data: Inputs) => {
    //call to http backend to create user
    const response = await fetch('/api/v1/users/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    if (response.ok) {
      console.log('User created successfully')
    } else {
      console.log('Error creating user')
    }
    console.log(data)
  }
  return (
    <div className='flex flex-col items-center justify-center h-screen w-screen text-center gap-3 bg-white'>
      <form action="/home" onSubmit={handleSubmit(submitHandler)}
        className='flex flex-col items-center justify-center h-3/4 w-2/5 text-center bg-red-600 gap-3 rounded-2xl border-2 border-gray-500'
      >
        <input type="text" placeholder='Username' {...register('username')} 
          className='bg-gray-100 border-2 border-gray-300 rounded-lg p-2 text-center text-black font-semibold'
        />
        {
          errors.username && <h1 className='text-white'>{errors.username?.message}</h1>
        }
        <input type="text" placeholder='Name' {...register('name')} 
          className='bg-gray-100 border-2 border-gray-300 rounded-lg p-2 text-center text-black font-semibold'
        />
        {
          errors.name && <h1 className='text-white'>{errors.name?.message}</h1>
        }
        <input type="text" placeholder='Email' {...register('email')} 
          className='bg-gray-100 border-2 border-gray-300 rounded-lg p-2 text-center text-black font-semibold'
        />
        {
          errors.email && <h1 className='text-white'>{errors.email?.message}</h1>
        }
        <input type="password" placeholder='Password' {...register('password')} 
          className='bg-gray-100 border-2 border-gray-300 rounded-lg p-2 text-center text-black font-semibold'
        />
        {
          errors.password && <h1 className='text-white'>{errors.password?.message}</h1>
        }
        <button disabled={isSubmitting} type="submit"
          className='bg-yellow-400 text-white rounded-lg p-2 text-center'
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}