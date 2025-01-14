import Link from "next/link"

const CallToAction = () => {
    return (
      <section className="bg-yellow-500 text-center py-16">
        <h2 className="text-3xl font-bold text-black mb-6">Ready to Revolutionize Your Training Institution?</h2>
        <Link href="/signup" className="bg-black text-white py-3 px-8 rounded-lg text-xl hover:bg-gray-800 transition duration-300">Start Your Free Trial</Link>
      </section>
    )
  }
  
  export default CallToAction
  