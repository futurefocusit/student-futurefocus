import Link from 'next/link'
import { FaFacebook, FaTwitter, FaLinkedin } from 'react-icons/fa'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 ">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul>
              <li><Link href="/"className="hover:text-yellow-400">Home</Link></li>
              {/* <li><Link href="/docs"  className="hover:text-yellow-400">Documentation</Link></li>
              <li><Link href="/pricing" className="hover:text-yellow-400">Pricing</Link></li>
              <li><Link href="/about" className="hover:text-yellow-400">Terms and Conditions</Link></li>
              <li><Link href="/contact" className="hover:text-yellow-400">Contact</Link></li> */}
            </ul>
          </div>

          {/* Social Media Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <Link href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-yellow-400">
                <FaFacebook size={24} />
              </Link>
              <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-yellow-400">
                <FaTwitter size={24} />
              </Link>
              <Link href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-yellow-400">
                <FaLinkedin size={24} />
              </Link>
            </div>
          </div>

          {/* Company Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company Info</h3>
            <p>Developed by <strong>Future Focus IT</strong></p>
            <p >Developer <a href='https://rodrigue.xcooll.com/'  className='text-emerald-500'>Rwigara Rodrigue</a></p>
          </div>

          {/* Newsletter Signup */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Stay Informed</h3>
            <p className="mb-4">Subscribe to our newsletter for updates and news.</p>
            <form>
              <input type="email" className="w-full p-2 rounded-lg mb-2 text-gray-800" placeholder="Enter your email" />
              <button type="submit" className="w-full bg-yellow-500 text-black py-2 rounded-lg hover:bg-yellow-400 transition duration-300">Subscribe</button>
            </form>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-8 border-t border-gray-700 pt-4 text-center text-sm">
          <p>&copy; 2025 Xcool. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
