import { ChangeEvent, useState, useContext } from 'react'
import { Container } from '../../../components/container'
import { Input } from '../../../components/input'
import { DashboardHeader } from '../../../components/panelheader'

import { FiUpload, FiTrash } from 'react-icons/fi'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuthContext } from '../../../contexts/AuthContext'
import { v4 as uuidV4 } from 'uuid'

import { storage, db } from '../../../services'
import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from 'firebase/storage'
import { addDoc, collection} from 'firebase/firestore'
import toast from 'react-hot-toast'


const schema = z.object({
    category: z.string().min(1, "O campo nome é obrigatório"),
    price:z.string().min(1, "O preço é obrigatório"),
    city:z.string().min(1, "A cidade é obrigatório"),
    estado: z.string().min(1,"A sigla do estado é obrigatório"),
    whatsapp:z.string().min(1, "O Telefone é obrigatório").refine((value) => /^(\d{11,12})$/.test(value),{
        message: "Numero de telefone invalido."
      }),
    description:z.string().min(1, "A descrição é obrigatório"),
})

type FormData = z.infer<typeof schema>;

interface ImageItemprops{
    uid: string;
    name: string;
    previewUrl: string;
    url:string;
}

export function New(){
    const [itemImages, setItemImages] = useState<ImageItemprops[]>([])

    const { user } = useContext(AuthContext)
    const { register, handleSubmit, formState: { errors}, reset } = useForm<FormData>({
        resolver: zodResolver(schema),
        mode: "onChange"
    })


    // função para filtrar imagem e enviar para o banco de dados
    async function handleFile(e: ChangeEvent<HTMLInputElement>){
        if(e.target.files && e.target.files[0]){
            const image = e.target.files[0]

            if(image.type === 'image/jpeg' || image.type === 'image/png'){
                // Enviar a imagem para o banco 
                await handleUpload(image)  
            }else{
                alert("Envier uma imagem jpeg ou png")
                return
            }
        }
    }

    // função para enviar imagem para o banco de dados
    async function handleUpload(image: File){
        if(!user?.uid){
           return; 
        }

        const currentUid = user?.uid;
        const uidImage = uuidV4()

        const uploadRef = ref(storage, `images/${currentUid}/${uidImage}`)

        uploadBytes(uploadRef, image)
        .then((snapshot) => {
            getDownloadURL(snapshot.ref).then((downloadUrl) => {
            const imagemItem = {
                name: uidImage,
                previewUrl: URL.createObjectURL(image),
                url: downloadUrl,
                uid: currentUid,
            }

            setItemImages((images) => [...images, imagemItem])
            toast.success("Imagem cadastrada com sucesso!")
            })
        })
        .catch(() => {
            console.log("Erro ao enviar a foto")
        })
    }

    function onSubmit(data: FormData){
        if(itemImages.length === 0){
            toast.error("Envie pelo menos 1 imagem!")
            return
        }

        const ListImages = itemImages.map( obj => {
            return{
                uid: obj.uid,
                name: obj.name,
                url: obj.url
            }
        })

        addDoc(collection(db, "objetos"), {
            category:data.category.toUpperCase(),
            city: data.city,
            estado: data.estado,
            price: data.price,
            whatsapp: data.whatsapp,
            description: data.description,
            creted: new Date(),
            name: user?.name,
            uid: user?.uid,
            images: ListImages
        })
        .then(() => {
            reset()
            setItemImages([])
            console.log("cadastrado com sucesso")
            toast.success("Produto cadastrado com sucesso!")
        })
        .catch((error) => {
           console.log(error) 
           console.log("erro ao cadastrar")
           toast.error("Erro ao cadastrar produto!")
        })
    }

    
    // deletar imagem do banco de dados
    async function handleDeleteImage(item: ImageItemprops){
       const imagePath = `images/${item.uid}/${item.name}`

       const imageRef = ref(storage, imagePath);

       try{
        await deleteObject(imageRef)
        // retirar a imagem da tela
        setItemImages(itemImages.filter((objt) => objt.url !== objt.url))
       }catch(err){
        console.log(err, "erro ao deletar")
       }
    }

    return(
        <Container>
            <DashboardHeader/>

            <div className='w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2 '>
                <button className='border-2 w-48 rounded-lg flex items-center justify-center cursor-pointer border-gray-600 h-32 md:w-48'>
                    <div className='absolute cursor-pointer'>
                        <FiUpload size={30} color='#000'/>
                    </div>
                    <div 
                        className='cursor-pointer'>
                        <input type='file' accept='image/*' className='opacity-0 cursor-pointer' 
                        onChange={handleFile}/>
                    </div>
                </button>

                {itemImages.map( item => (
                    <div key={item.name} className='w-full h-32 flex items-center justify-center relative'>
                        <button className='absolute' onClick={() => handleDeleteImage(item)}>
                            <FiTrash size={28} color='#FFF'/>
                        </button>
                        <img
                            src={item.previewUrl}
                            className='rounded-lg w-full h-32 object-cover'
                            alt='Foto do produtos'
                        />
                    </div>
                ))}
            </div>
            <div className='w-full bg-white p-3 rounded-lg flex flex-col sm:flex-row items-center gap-2 mt-2 mb-6'>
                <form
                    className='w-full'
                    onSubmit={handleSubmit(onSubmit)}
                >

                    <div className='w-full mb-3'>
                        <p className='mb-2 font-medium'>O que você está vendendo?</p>
                        <Input
                            type='text'
                            register={register}
                            name="category"
                            error={errors.category?.message}
                            placeholder="Ex: Casa , Carro , Moto..."
                        />
                    </div>

                    <div className='flex w-full mb-3 flex-row items-center gap-4 '>
                        <div className='w-full'>
                            <p className='mb-2 font-medium'>Cidade</p>
                            <Input
                                type='text'
                                register={register}
                                name="city"
                                error={errors.city?.message}
                                placeholder="Ex: Casa , Carro , Moto..."
                            />
                        </div>

                        <div className='w-full'>
                            <p className='mb-2 font-medium'>Estado</p>
                            <Input
                                type='text'
                                register={register}
                                name="estado"
                                error={errors.estado?.message}
                                placeholder="Ex: Rio grande do norte..."
                            />
                        </div>
                    </div>

                    <div className='flex w-full mb-3 flex-row items-center gap-4'>
                        <div className='w-full'>
                            <p className='mb-2 font-medium'>Preço</p>
                            <Input
                                type='text'
                                register={register}
                                name="price"
                                error={errors.price?.message}
                                placeholder="Ex: 200.000"
                            />
                        </div>

                        <div className='w-full'>
                            <p className='mb-2 font-medium'>whatsapp / Telefone</p>
                            <Input
                                type='text'
                                register={register}
                                name="whatsapp"
                                error={errors.whatsapp?.message}
                                placeholder="Ex: 00 000000000"
                            />
                        </div>
                    </div>
                    
                    <div className='mb-3'>
                            <p className='mb-2 font-medium'>Descrição</p>
                            <textarea
                                className='border-2 w-full rounded-md h-24 px-2'
                                {...register("description")}
                                name="description"
                                id="description"
                                placeholder='Digite a descrição...'
                            />
                            {errors.description && <p className='mb-1 text-red-500'>{errors.description.message}</p>}
                    </div>

                    <button type='submit' className='w-full h-10 rounded-md bg-zinc-900 text-white font-medium'>
                        Cadastrar
                    </button>
                </form>

            </div>
        </Container>
    )
}