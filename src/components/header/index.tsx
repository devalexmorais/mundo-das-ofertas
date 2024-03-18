import { useContext, useRef, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import { FiLogIn } from 'react-icons/fi';
import logoImg from '../../assets/bazar-svg.svg';
import avatarImg from '../../assets/avatar.png';
import { signOut } from "firebase/auth";
import { auth } from "../../services/index";

export function Header() {

    const [open, setOpen] = useState(false);

    const menuRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    const { signed, loadingAuth } = useContext(AuthContext);

    window.addEventListener("click", (e) => {
        if (e.target !== menuRef.current && e.target !== imgRef.current) {
            setOpen(false);
        }
    });

    async function handleLogout() {
        await signOut(auth);
        
    }

    return (
        <div className="w-full flex items-center justify-center h-16 bg-white drop-shadow mb-4">
            <header className="flex w-full max-w-7xl items-center justify-between px-4 mx-auto">
                <Link to="/">
                    <img
                        className="w-40"
                        src={logoImg}
                        alt="Logo do site"
                    />
                </Link>

                {!loadingAuth && signed && (
                    <div className="relative">
                        <img
                            ref={imgRef}
                            onClick={() => setOpen(!open)}
                            className="h-10 w-10 object-cover border-2 border-gray-300 rounded-full cursor-pointer"
                            src={ avatarImg } alt="Foto do usuário"
                        />
                        {open && (
                            <div
                                ref={menuRef}
                                className="absolute top-14  right-0 mx-auto rounded-md bg-white p-4 w-44 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                            >
                                <ul>
                                    <li onClick={() => setOpen(false)} className="p-2 text-lg cursor-pointer rounded hover:bg-gray-100">
                                        <Link to="/dashboard">dashboard</Link>
                                    </li>
                                    <li className="p-2 text-lg cursor-pointer rounded hover:bg-gray-100">
                                        <Link to="/profile">Perfil</Link>
                                    </li>
                                    <li onClick={() => setOpen(false)} className="p-2 text-lg cursor-pointer rounded hover:bg-gray-100 text-red-500">
                                        <button onClick={handleLogout}>sair</button>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                )}
                {!loadingAuth && !signed && (
                    <Link to="/login">
                        <FiLogIn size={24} color="#000"/>
                    </Link>
                )}
            </header>
        </div>
    );
}
