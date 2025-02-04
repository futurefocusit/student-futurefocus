import Link from "next/link"

const HeroSection = () => {
    return (
      <section className="bg-gradient-to-r from-blue-500 to-indigo-700 text-white text-center py-20">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-6">Simplifying Education Management for Training Institutions</h1>
          <p className="text-lg sm:text-xl mb-8">Xcool empowers training institutions to manage students, track attendance, and streamline cash flow all in one place.</p>
          <div className="space-x-4">
            <Link href="/signup" className="bg-yellow-500 text-black py-2 px-6 rounded-lg hover:bg-yellow-400 transition duration-300">Start  now</Link>
            <Link href="/docs" className="bg-transparent border-2 border-white text-white py-2 px-6 rounded-lg hover:bg-white hover:text-black transition duration-300">Learn More</Link>
          </div>
        </div>
      </section>
    )
  }
  
  export default HeroSection
  