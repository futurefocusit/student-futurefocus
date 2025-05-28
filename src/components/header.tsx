import Image from 'next/image'
import Link from 'next/link'

const Header = () => {
  return (
    <header className="bg-blue-500 text-white shadow-md sticky top-0">
      <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
        <div className="">
          <Link href="/">
          <Image src="/xcooll.jpg " className='' alt="logo" width={70} height={70}></Image>
          </Link>
        </div>
        <nav>
          <ul className="flex space-x-6">
            <li><Link href="/" className="hover:text-yellow-400">Home</Link></li>
            {/* <li><Link href="/docs" className="hover:text-yellow-400">Documentation</Link></li>
            <li><Link href="/pricing" className="hover:text-yellow-400">Pricing</Link></li>
            <li><Link href="/about" className="hover:text-yellow-400">About Us</Link></li> */}
            {/* <li><Link href="/contact" className="hover:text-yellow-400">Contact</Link></li> */}
            <li><Link href="/signup" className="bg-yellow-600 p-2 rounded-md font-extrabold hover:bg-yellow-700">Register</Link></li>
            <li><Link href="/login" className="bg-yellow-600 p-2 rounded-md font-extrabold hover:bg-yellow-700">Login</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header
