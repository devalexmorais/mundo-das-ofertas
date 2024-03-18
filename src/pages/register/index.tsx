import { useContext, useEffect} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logoImg from '../../assets/bazar-svg.svg'
import { Container } from '../../components/container'

import { Input } from '../../components/input'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { auth } from '../../services'
import { createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth'
import { AuthContext } from '../../contexts/AuthContext'

import toast from 'react-hot-toast'


const schema = z.object({
    name: z.string().min(1,'O compo nome é obrigatório'),
    email: z.string().min(1, "O campo email é obrigatório").email("Insira um email válido"),
    password: z.string().min(1, "O campo senha é obrigatório")
})

type FormData = z.infer<typeof schema>

export function Register(){
    const {handleInfoUser} = useContext(AuthContext)

  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange"
  })

  useEffect(() => {
    async function handleLogout() {
      await signOut(auth)
    }

    handleLogout();
  }, [])

  async function signIIn(data: FormData){
    createUserWithEmailAndPassword(auth, data.email, data.password)
    .then(async(user) => {
      await updateProfile(user.user, {
        displayName: data.name
      })
      handleInfoUser({
        name:data.name,
        email:data.email,
        uid:user.user.uid
      })

      console.log("Cadastrado com sucesso!")
      toast.success("Bem vindo ao WebCarros!")
      navigate("/dashboard", {replace: true })
    })
    .catch((error) => {
      console.log(error);
      console.log("Erro ao cadastrar este usuário")
    })
  }



    return(
        <Container>
            <div className='w-full min-h-screen flex justify-center items-center flex-col gap-4'>
                <Link to="/" className='mb-6 max-w-sm w-full'>
                    <img
                        src={logoImg}
                        alt='logo do site'
                        className='w-full'
                    />
                </Link>

                <form 
                    className='bg-white max-w-xl w-full rounded-lg p-4'
                    onSubmit={handleSubmit(signIIn)}
                >
                    <div className='mb-3'>
                        <Input
                            type="name"
                            placeholder="Digite seu nome..."
                            name="name"
                            error={errors.name?.message}
                            register={register}
                        />   
                    </div>

                    <div className='mb-3'>
                        <Input
                            type="email"
                            placeholder="Digite seu email..."
                            name="email"
                            error={errors.email?.message}
                            register={register}
                        />   
                    </div>

                    <div className='mb-3'>
                        <Input
                            type="password"
                            placeholder="Digite sua senha..."
                            name="password"
                            error={errors.password?.message}
                            register={register}
                        />
                    </div>


                    <button type='submit' className='bg-zinc-900 w-full rounded-md text-white font-medium h-11'>
                        Cadastrar
                    </button>
                </form>

                <div>Tem uma conta? <Link to="/login" className='text-blue-500'>Conecte-se</Link></div>
            </div>
        </Container>
    )
}