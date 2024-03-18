import { Link } from "react-router-dom";

export function DashboardHeader(){
    return(
        <div className="w-full items-center flex  h-10 bg-gray-500 rounded-lg text-white gap-4 px-4 mb-4">
            <Link to="/dashboard">
                dashboard
            </Link>
            <Link to="/dashboard/new">
                <p>Cadastrar</p>

            </Link>
        </div>
    )
}