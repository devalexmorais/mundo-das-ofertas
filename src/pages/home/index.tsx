import { Container } from '../../components/container'
import { useState ,useEffect } from 'react'
import { Link } from 'react-router-dom'
import avatarImg from '../../assets/avatar.png';


import {
    collection, query, getDocs, orderBy, where
} from 'firebase/firestore'
import { db } from '../../services/index'

interface ObjetoProps{
    id: string
    name:string
    uid: string
    price: string | number
    city: string
    estado: string
    category: string
    images: ObjetosImageProps[]
}

interface ObjetosImageProps{
    name: string;
    uid: string;
    url: string;
}

export function Home() {
    const [objetos, setObjetos] = useState<ObjetoProps[]>([])
    const [loadImages, setLoadImages] = useState<string[]>([])
    const [input, setInput] = useState("")



    useEffect(() => {
       

       loadObjetos()
        
    },[])

    function loadObjetos(){
        const obj = collection(db, "objetos")
        const queryRef = query(obj, orderBy("creted", "desc"))

        getDocs(queryRef)
        .then((snapshot) => {
            const listobj = [] as ObjetoProps[]

            snapshot.forEach( doc => {
                listobj.push({
                    id: doc.id,
                    name: doc.data().name,
                    city: doc.data().city,
                    estado: doc.data().estado,
                    price: doc.data().price,
                    images: doc.data().images,
                    uid: doc.data().uid,
                    category: doc.data().category,
                })
            })
            setObjetos(listobj)
        })
       }

    function handleImageLoad(id: string){
        setLoadImages((prevImageLoaded) => [...prevImageLoaded, id ])
    }

    // função do input de pesquisa
    async function handleSearch(){
        if(input === ""){
           loadObjetos() 
           return
        }

        setObjetos([])
        setLoadImages([])

        const q = query(collection(db, "objetos"),
        where("category", ">=", input.toUpperCase()),
        where("category", "<=", input.toUpperCase() + "\uf8ff")
        )

        const querySnapshot = await getDocs(q)

        const listobj = [] as ObjetoProps[]

        querySnapshot.forEach((doc) => {
            listobj.push({
                id: doc.id,
                name: doc.data().name,
                city: doc.data().city,
                estado: doc.data().estado,
                price: doc.data().price,
                images: doc.data().images,
                uid: doc.data().uid,
                category: doc.data().category
            })
        })

        setObjetos(listobj)
    }

    return(
        <Container>
            <section className='bg-white p-4 rounded-lg w-full max-w-3xl mx-auto flex justify-center items-center gap-2'>
                <input
                    className='w-full border-2 rounded-lg h-9 px-3 outline-none'
                    placeholder='Digite o que vc quer buscar'
                    value={input}
                    onChange={ (e) => setInput(e.target.value)}
                />
                <button 
                    onClick={handleSearch}
                    className='bg-gray-500 h-9 px-8 rounded-lg text-white font-medium'>Buscar
                </button>
            </section>

            <main className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6'>
                {objetos.map ( obj => (
                    <Link key={obj.id} to={`/detail/${obj.id}`}>
                        <section  className='w-full bg-white rounded-lg mt-5' >
                            <div className='mr-2 ml-2 p-2'>
                                <div 
                                    style={{ display: loadImages.includes(obj.id) ? "none" : "block"}}  
                                    className='flex justify-center items-center h-screen '
                                >
                                    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-3 border-gray-900"></div>
                                </div>

                                <div className='flex items-center gap-4 '>
                                    <img
                                        className='h-10 w-10 object-cover border-2 border-gray-300 rounded-full cursor-pointer mt-1 mb-2'
                                        src={avatarImg}
                                    />
                                    <p className='mb-2'>{obj.name}</p>
                                </div>

                                <img
                                    className='h-80 w-96 mt-2 object-cover bg-white rounded-lg hover:scale-105 transition-all mb-4'
                                    src={obj.images[0].url}
                                    onLoad={() => handleImageLoad(obj.id)}
                                    style={{ display: loadImages.includes(obj.id) ? "block" : "none"}}
                                />

                                <strong className='text-black font-medium text-3xl mb-2 px-2'>R${obj.price}</strong>

                                <div className='w-full h-px bg-slate-200 my-2'></div>
                                
                                <div className='px-2 pb-2 flex gap-2'>
                                    <span className='text-zinc-700'>{obj.city} - </span>
                                    <span className='text-zinc-700'>{obj.estado}</span>
                                </div>
                            </div>
                        </section>   
                    </Link>

                ))}
            </main>
        </Container>
    )
}
