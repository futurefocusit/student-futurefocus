import Link from "next/link"

const HeroSection = () => {
    return (
      <section className="bg-gradient-to-r from-blue-500 to-indigo-700 text-white text-center py-20">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-6">{'Simplifying Education Management'.toUpperCase()}</h1>
          <p className="text-lg sm:text-xl mb-8">XCOOLL is an educational management system designed to help school administrators improve the management of their schools, managing staff, students, finances, accounting, inventory....</p>
          <div className="space-x-4">
            <Link href="/signup" className="bg-yellow-500 text-black py-2 px-6 rounded-lg hover:bg-yellow-400 transition duration-300">Start  now</Link>
          </div>
        </div>
      </section>
    )
  }
  
  export default HeroSection
  