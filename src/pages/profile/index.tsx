import { useContext, useState, ChangeEvent} from "react";
import { AuthContext } from '../../contexts/AuthContext';
import { FiUpload } from "react-icons/fi";
import { Container } from "../../components/container";
import avatar from '../../assets/avatar.png';
import { db, storage } from "../../services";
import { addDoc, collection } from "firebase/firestore";
import toast from "react-hot-toast";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidV4 } from 'uuid'


interface ImageProfileProps{
    uid: string;
    previewUrl: string;
    url: string;
}

export function Profile() {
    const { user } = useContext(AuthContext);
    const [name, setName] = useState('');
    const [imageAvatar, setImageAvatar] = useState<ImageProfileProps[]>([]);

    async function handleFile(e: ChangeEvent<HTMLInputElement>){
        if(e.target.files && e.target.files[0]){
            const image = e.target.files[0];

            if(image.type === 'image/jpeg' || image.type === 'image/png'){
                await handleUpload(image);
            } else {
                alert("Envie uma imagem jpeg ou png");
            }
        }
    }

    async function handleUpload(image: File) {
        if(!user?.uid) return;

        const currentUid = user?.uid;
        const uidImage = uuidV4();

        const uploadRef = ref(storage, `imagesProfile/${currentUid}/${uidImage}`);

        uploadBytes(uploadRef, image)
            .then((snapshot) => {
                getDownloadURL(snapshot.ref).then((downloadUrl) => {
                    const imageProfile = {
                        uid: currentUid,
                        previewUrl: URL.createObjectURL(image),
                        url: downloadUrl
                    };

                    setImageAvatar([...imageAvatar, imageProfile]);
                });
            })
            .catch(() => {
                console.log("Erro ao enviar a foto");
            });
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault();

        if(imageAvatar.length === 0){
            toast.error("Envie uma imagem");
            return;
        }

        const listImages = imageAvatar.map((obj) => ({
            uid: obj.uid,
            previewUrl: obj.previewUrl,
            url: obj.url
        }));

        addDoc(collection(db, "objetos"), { images: listImages })
            .then(() => {
                setImageAvatar([]);
                toast.success("Produto cadastrado com sucesso");
            })
            .catch((error) => {
                console.log(error);
            });
    }

    return (
        <Container>
            <div className='w-full bg-white p-16 rounded-lg sm:flex-row gap-2 '>
                <form onSubmit={handleSubmit}>
                    <label className="flex justify-center items-center flex-col cursor-pointer">
                        <span className='absolute cursor-pointer text-white opacity-0 transition-all hover:opacity-100'>
                           <FiUpload size={25}/> 
                        </span>
                        <input className="opacity-0 cursor-pointer" type="file" accept="image/*" onChange={handleFile}/><br/>
                        <img src={imageAvatar.length > 0 ? imageAvatar[0].previewUrl : avatar} alt="foto de perfil" className="mb-2 rounded-full" width={200} height={250}/>
                    </label>

                    <div className="w-full mt-4">
                        <p className='mb-2 font-medium'>Nome</p>
                        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border-2 rounded-md h-11 px-2 cursor-pointer"></input>
                    </div>

                    <div className="mt-4">
                        <p className='mb-2 font-medium'>Email</p>
                        <input className="w-full border-2 rounded-md h-11 px-2 cursor-not-allowed" type="text" value={user?.email || ''} disabled={true}/>
                    </div>

                    <button type="submit" className='mt-4 mb-4 w-full h-10 rounded-md bg-zinc-900 text-white font-medium'>Salvar</button>
                </form>
            </div>
        </Container>
    );
}
