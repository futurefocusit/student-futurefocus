import FeaturesSection from "@/components/Feature"
import Footer from "@/components/footer"
import Header from "@/components/header"
import HeroSection from "@/components/hero.Section"
import { CallToAction } from "@mui/icons-material"


const Home = () => {
  return (
    <div>
        <Header/>
      <HeroSection />
      <FeaturesSection />
      <CallToAction />
      <Footer/>
    </div>
  )
}

export default Home
