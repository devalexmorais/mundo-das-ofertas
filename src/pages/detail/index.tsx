import { useState, useEffect } from "react"
import { Container } from "../../components/container"
import { FaWhatsapp } from 'react-icons/fa'
import { useNavigate, useParams } from "react-router-dom"
import { getDoc, doc } from "firebase/firestore"
import { db } from "../../services"

import { Swiper, SwiperSlide } from 'swiper/react'

interface ObjetoProps{
    id: string
    name:string
    uid: string
    price: string | number
    city: string
    estado: string,
    description: string,
    owner: string,
    whatsapp: string,
    images: ImageProps[]
}

interface ImageProps{
    name: string;
    uid: string;
    url: string;
}

export function Detail(){
    const [objto, setObjto] = useState<ObjetoProps>()
    const { id } =  useParams()
    const [sliderPerView, setSliderperView] = useState<number>(2);
    const navigate = useNavigate()

    useEffect(() => {
        async function loadObj(){
            if(!id){
                return
            }

            const docRef = doc(db, "objetos",id)
            getDoc(docRef)
            .then((snapshot) => {
                if(!snapshot.data()){
                    navigate("/")
                }

                setObjto({
                    id: snapshot.id,
                    uid: snapshot.data()?.uid,
                    name: snapshot.data()?.name,
                    price: snapshot.data()?.price,
                    city: snapshot.data()?.city,
                    estado: snapshot.data()?.estado,
                    whatsapp: snapshot.data()?.whatsapp,
                    description: snapshot.data()?.description,
                    owner: snapshot.data()?.owner,
                    images: snapshot.data()?.images
                })
            })
        }

        loadObj()

    },[id])


    useEffect(() => {

        function handleResize(){
            if(window.innerWidth < 720){
                setSliderperView(1)
            } else{
                setSliderperView(2)
            }
        }

        handleResize()

        window.addEventListener("resize", handleResize)

        return() => {
            window.removeEventListener("resize", handleResize)
        }
    },[])

    return(
        <Container>

            {objto && (
                <Swiper 
                    slidesPerView={sliderPerView}
                    pagination={{ clickable: true }}
                    navigation
                >
                    {objto?.images.map( image => (
                        <SwiperSlide key={image.name}>
                            <img
                                src={image.url}
                                className="w-full h-96 object-cover rounded-lg"
                            />   
                        </SwiperSlide>
                    ))}
                </Swiper>
            )}

            {objto && (
              <main className="w-full bg-white rounded-lg p-6 my-6">
                <div className="flex flex-col sm:flex-row mb-4 items-center justify-between">
                    <h1 className="font-bold text-3xl text-black">R$ {objto.price}</h1>
                </div>

                <strong>Proprietario</strong>
                <p className="mb-4">{objto.name}</p>

                <div className="flex w-full gap-6 my-4">
                    <div className="flex  gap-4">
                        <div>
                            <p>Cidade:</p>
                            <strong>{objto.city}</strong>
                        </div>
                        <div>
                            <p>Estado:</p>
                            <strong>{objto.estado}</strong>
                        </div>
                    </div>
                </div>

                <strong>Whatsapp</strong>
                <p className="mb-4">{objto.whatsapp}</p>

                <strong>Descrição:</strong>
                <p className="mb-4">{objto.description}</p>

                <a 
                    href={`https://api.whatsapp.com/send?phone=${objto.whatsapp}&text=Olá vi esse ${objto?.name} no site mundo das ofertas e fiquei interessado`}
                    target="_black"
                    className="bg-green-500 w-full text-white flex items-center justify-center gap-2 my-6 h-11 text-xl rounded-lg font-medium cursor-pointer">
                    Conversar com Vendedor
                    <FaWhatsapp size={24} color="#FFF"/>
                </a>

              </main>  
            )}
        </Container>
    )
}