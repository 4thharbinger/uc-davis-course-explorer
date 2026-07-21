export default function Header({ children } : { children : React.ReactNode }) {
    return <header className="flex-none h-14 border-b px-4 flex items-center bg-white z-10 border-gray-200 text-2xl font-bold">{children}</header>
}