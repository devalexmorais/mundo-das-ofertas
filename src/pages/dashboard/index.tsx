import { useEffect, useState, useContext } from "react"
import { Container } from "../../components/container"
import { DashboardHeader } from '../../components/panelheader'

import { FiTrash2} from 'react-icons/fi'
import { collection, getDocs, where , query,doc, deleteDoc} from "firebase/firestore"
import { db, storage } from "../../services"
import { ref, deleteObject } from "firebase/storage"
import { AuthContext } from "../../contexts/AuthContext"

import toast from 'react-hot-toast'





interface ObjetoProps{
    id: string
    name:string
    uid: string
    price: string | number
    city: string
    estado: string
    category: string
    images: ImageProps[]
}

interface ImageProps{
    name: string;
    uid: string;
    url: string;
}

export function Dashboard(){
    const { user } = useContext(AuthContext)
    const [objetos, setObjetos] = useState<ObjetoProps[]>([])


    useEffect(() => {

        function loadObjetos(){
            if(!user?.uid){
                return;
            }

            const obj = collection(db, "objetos")
            const queryRef = query(obj, where("uid", "==", user.uid))
    
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
                        category: doc.data().category
                    })
                })
                setObjetos(listobj)
            })
            }
    
            loadObjetos()
            
        },[user])

        async function handleDelete(obj:ObjetoProps){
            const itemObj = obj

            const docRef = doc(db, "objetos", itemObj.id)
            await deleteDoc(docRef);

            itemObj.images.map( async (image) => {
                const imagePath = `images/${image.uid}/${image.name}`
                const imageRef = ref(storage, imagePath)

                try{
                    await deleteObject(imageRef)
                    setObjetos(objetos.filter(obj => obj.id !== itemObj.id))
                    toast.success("Produto excluida com sucesso!")


                }catch(err){
                    console.log("Erro ao excluir essa imagem")
                    console.log(err)
                }
            })
            
        }
 
    return(
        <Container>
            <DashboardHeader/>

            <main className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 my-6">
                {objetos.map( obj => (
                    <section key={obj.id} className="w-full bg-white rounded-lg relative">
                    <button onClick={ () => handleDelete(obj)} className="absolute bg-white w-14 h-14 rounded-full flex items-center justify-center right-2 top-2 drop-shadow">
                        <FiTrash2 size={26} color="#000"/> 
                    </button>
                    <img
                        className="w-full h-80 rounded-lg max-h-70 mb-4"
                        src={obj.images[0].url}
                    />


                    <strong className='text-black font-medium text-3xl mb-2 px-2'>R$ {obj.price}</strong>

                    <div className='w-full h-px bg-slate-200 my-2'></div>
                    
                    <div className='px-2 pb-2 flex gap-2'>
                        <span className='text-zinc-700'> {obj.city} - </span>
                        <span className='text-zinc-700'>{obj.estado}</span>
                    </div>

                </section>
                ))}
            </main>
        </Container>
    )
}