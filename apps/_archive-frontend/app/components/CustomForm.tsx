'use client'
import {useForm} from '@repo/ui/Form'
import {z} from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
// import {useForm} from 'react-hook-form'
import Form from 'next/form'
import { SubmitHandler } from 'react-hook-form'
import { required } from 'zod/v4-mini'

export const CustomForm = () => {
  
  const Inputs = z.object({
    name: z.string().min(3),
    email: z.email(),
    username: z.string().min(3),
    password: z.string().min(6)
  })
  type Inputs = z.infer<typeof Inputs>
  const {register, handleSubmit, formState: {errors, isSubmitting}, } = useForm<Inputs>({
    resolver: zodResolver(Inputs),
  })
  const submitHandler : SubmitHandler<Inputs> = async (data: Inputs) => {
    await new Promise((r)=>setTimeout(r, 3000))
    console.log(data)
  }
  return (
    <Form action="" onSubmit={handleSubmit(submitHandler)}
      className='flex flex-col items-center justify-center h-screen w-screen text-center gap-3'
    >
        <input type="text" placeholder='Name' {...register('name', {required: "Name is required" })} />
        {
          errors.name && <h1>{errors.name?.message}</h1>
        }
        <input type="text" placeholder='Email' {...register('email', {required: "Email is required" })} />
        {
          errors.email && <h1>{errors.email?.message}</h1>
        }
        <input type="text" placeholder='Username' {...register('username')} />
        {
          errors.username && <h1>{errors.username?.message}</h1>
        }
        <input type="password" placeholder='Password' {...register('password', )} />
        {
          errors.password && <h1>{errors.password?.message}</h1>
        }
        <button disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
    </Form>
  )
}

export default Form