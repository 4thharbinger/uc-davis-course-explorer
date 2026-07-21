"use client";

import Image from "next/image";
import styles from "./InputField.module.css";
import { useEffect } from "react";

export default function InputField({ onChange, className, label, name, type, required }: { 
    onChange?: (e: React.InputEvent<HTMLInputElement>) => void, 
    className?: string, 
    label: string,
    name: string, 
    type: string, 
    placeholder: string, 
    required?: boolean 
}) {
    
    return (
        <div id={name} className={`${styles.inputField} ${className}`}>
            <label>{label}</label>
            <input id={name + "Input"} name={name} type={type} placeholder={label} required={required} onInput={e => onChange && onChange(e)} />
        </div>
    );
}
