"use client";

import { useEffect, useState } from "react";
import InputField from "./InputField";
import styles from "./Login.module.css";
import { useDebounce } from "@/lib/useDebounce";

export default async function Login({ register } : { register : boolean }) {
    const [usernameExists, setUsernameExists] = useState("No username");
    const [username, setUsername] = useState('');
    const debouncedSearchTerm = useDebounce(username, 200);

    useEffect(() => {
        if (debouncedSearchTerm) {
            console.log(debouncedSearchTerm);
        }
    }, [debouncedSearchTerm]);

    return <div className="flex flex-col w-full h-screen overflow-hidden bg-white">
        {register ? <article className="p-4 text-justify w-full max-w-2xl mx-auto gap-4 flex flex-col items-center">
            <h1 className="text-xl text-center font-bold">Register</h1>
            <form>  
                <InputField 
                    className={usernameExists != "Available" ? usernameExists ? styles.error : "" : styles.success } 
                    onChange={e => setUsername(e.currentTarget.value)} 
                    label={usernameExists ? "Username - " + usernameExists : "Username"} 
                    name="username" 
                    type="text" 
                    placeholder="Username" required />
                <InputField label="Password" name="password" type="password" placeholder="Password" required />
                
                <input type="submit" value="Signup" className="button" />
            </form>
        </article> : <article className="p-4 text-justify w-full max-w-2xl mx-auto gap-4 flex flex-col items-center">
            <h1 className="text-xl text-center font-bold">Login</h1>
            <form>  
                <InputField label="Username" name="username" type="text" placeholder="Username" required />
                <InputField label="Password" name="password" type="password" placeholder="Password" required />
                
                <input type="submit" value="Signup" className="button" />
            </form>
        </article> }
    </div>
}