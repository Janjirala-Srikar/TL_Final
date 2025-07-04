import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { AuthModalProvider } from './context/AuthModalContext'

// Import motion for animations
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import FloatingCodeWords from './components/FloatingCodeWords'
import LoadingScreen from './components/LoadingScreen'

// Homepage component
const HomePage = () => {
  const navigate = useNavigate()
  const bottomTextRef = useRef(null)
  const [isBottomTextInViewport, setIsBottomTextInViewport] = useState(false)

  // Typewriter effect state
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const fullText = "T E C H L E A R N ;"
  const headingRef = useRef(null)

  // Stats animation state
  const statsRef = useRef(null)
  const [animatedStats, setAnimatedStats] = useState({
    courses: 0,
    batches: 0,
    students: 0,
    rating: 0
  })

  // Marquee refs for intersection observer
  const marqueeRefs = useRef([])

  // Stats data
  const statsData = [
    { target: 10, label: "Courses Offered", suffix: "+" },
    { target: 400, label: "Batches Completed", suffix: "+" },
    { target: 5101, label: "Students Trained", suffix: "+" },
    { target: 4.6, label: "Google Rating", isDecimal: true }
  ]

  // Marquee sections data
  const marqueeData = [
    {
      title: "tech PREP",
      subtitle: "Struggling with technical rounds or job interviews?",
      description: "Tech Prep helps you master core concepts, crack interviews, and build a job-ready portfolio.",
      features: ["Placement-focused courses", "Live classes with real hiring patterns"],
      link: "/learn"
    },
    {
      title: "mini PROJECTS",
      subtitle: "Mini Projects — because upskilling is what we do.",
      description: "Learn by doing, solve real problems, and build a portfolio that speaks for you. Master your basics then Build. Solve. Stand out.",
      link: "/build",
      reverse: true
    },
    {
      title: "summer INTERN",
      subtitle: "Join live internships in Web Dev, UI/UX Design, or Content Creation.",
      description: "Build real projects, get mentored by pros.",
      note: "Summer positions filled — Winter applications open in November.",
      link: "/careers"
    },
    {
      title: "design LAB",
      subtitle: "DesignLab is our open-source UI library with ready-to-use buttons, loaders, forms, toggles, radios, and more.",
      description: "Coming soon — build beautiful interfaces faster, without reinventing the basics.",
      link: "/build",
      reverse: true
    }
  ]

  // Custom viewport detection for typewriter - triggers every time
  useEffect(() => {
    const element = headingRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isTyping) {
          // Start typewriter effect
          setIsTyping(true)
          setDisplayedText("")
          setCurrentIndex(0)
        } else if (!entry.isIntersecting && isTyping) {
          // Reset when out of viewport
          setIsTyping(false)
          setDisplayedText("")
          setCurrentIndex(0)
        }
      },
      {
        threshold: 0.3, // Trigger when 30% of element is visible
        rootMargin: '0px'
      }
    )

    observer.observe(element)
    return () => observer.unobserve(element)
  }, [isTyping])

  // Typewriter animation - matching HTML timing
  useEffect(() => {
    if (isTyping && currentIndex < fullText.length) {
      // Match HTML timing: 1.5s total for 20 characters = 75ms per character
      // For mobile: 2.4s total for 20 characters = 120ms per character
      const isMobile = window.innerWidth <= 480
      const charDelay = isMobile ? 120 : 75 // Match HTML steps timing exactly

      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + fullText[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, charDelay)

      return () => clearTimeout(timeout)
    } else if (isTyping && currentIndex >= fullText.length) {
      // Animation complete, but keep isTyping true to prevent retriggering
      // until element leaves viewport
    }
  }, [currentIndex, fullText, isTyping])

  // Custom viewport detection for stats - triggers every time like heading
  useEffect(() => {
    const element = statsRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Reset and start animation
          setAnimatedStats({ courses: 0, batches: 0, students: 0, rating: 0 })

          // Start animations for each stat
          statsData.forEach((stat, index) => {
            const increment = stat.isDecimal ? 0.1 : Math.ceil(stat.target / 50)
            let count = 0

            const timer = setInterval(() => {
              count += increment
              if (count >= stat.target) {
                count = stat.target
                clearInterval(timer)
              }

              setAnimatedStats(prev => ({
                ...prev,
                [index === 0 ? 'courses' : index === 1 ? 'batches' : index === 2 ? 'students' : 'rating']: count
              }))
            }, 30)
          })
        } else {
          // Reset to zero when out of viewport
          setAnimatedStats({ courses: 0, batches: 0, students: 0, rating: 0 })
        }
      },
      {
        threshold: 0.3, // Trigger when 30% of element is visible
        rootMargin: '0px'
      }
    )

    observer.observe(element)
    return () => observer.unobserve(element)
  }, []) // Empty dependency array so it only sets up once

  // Bottom text viewport detection
  useEffect(() => {
    const element = bottomTextRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsBottomTextInViewport(entry.isIntersecting)
      },
      {
        threshold: 0.3,
        rootMargin: '0px'
      }
    )

    observer.observe(element)
    return () => observer.unobserve(element)
  }, [])

  // Marquee animation intersection observer - exact match from HTML
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const title = entry.target.querySelector('.marquee-title, .marquee-title-2')
        if (title) {
          if (entry.isIntersecting) {
            title.classList.add('animate')
          } else {
            title.classList.remove('animate')
          }
        }
      })
    }, {
      threshold: 0.3 // Adjust how much is visible before it triggers
    })

    marqueeRefs.current.forEach(header => {
      if (header) {
        observer.observe(header)
      }
    })

    return () => {
      marqueeRefs.current.forEach(header => {
        if (header) {
          observer.unobserve(header)
        }
      })
    }
  }, [])

  return (
    <div className="bg-transparent dark:bg-transparent relative">
      {/* Floating Code Words Background Effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <FloatingCodeWords />
      </div>

      {/* Hero Section */}
      <div className="h-screen flex flex-col items-center justify-center px-6 relative pt-16">
        <div className="relative z-10 flex flex-col items-center justify-center text-center">
          {/* TECHLEARN Heading with Typewriter Effect */}
          <div className="mb-4">
            <div
              ref={headingRef}
              className="font-bold text-[#001862] dark:text-[#ffffffde] font-poppins relative"
              style={{
                fontWeight: 700,
                lineHeight: 1.2,
                marginBottom: '10px',
                marginTop: '10%',
                fontSize: 'clamp(42px, 8vw, 110px)', // Responsive: 42px mobile → 110px desktop
                textAlign: 'center'
              }}
            >
              {/* Invisible placeholder to reserve space */}
              <span
                style={{
                  visibility: 'hidden',
                  whiteSpace: 'nowrap'
                }}
                aria-hidden="true"
              >
                {fullText}
              </span>

              {/* Visible typewriter text */}
              <span
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  whiteSpace: 'nowrap'
                }}
              >
                {displayedText}
              </span>
            </div>
            <h2
              className="font-medium text-[#002d88] dark:text-[#ffffffde] font-poppins"
              style={{
                fontWeight: 500,
                marginTop: '10px',
                fontSize: 'clamp(15px, 3vw, 25px)' // Responsive: 15px mobile → 25px desktop
              }}
            >
              Don't Just Use Technology, Build It.
            </h2>
          </div>

          {/* Start for Free Button */}
          <button
            onClick={() => navigate('/learn')}
            className="inline-block font-poppins font-semibold rounded-lg transition-all duration-300"
            style={{
              padding: '12px 30px',
              backgroundColor: '#ffffffac',
              color: '#001242',
              fontSize: '1rem',
              marginTop: '30px',
              border: 'none',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#001242'
              e.target.style.color = '#ffffff'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#ffffffac'
              e.target.style.color = '#001242'
            }}
          >
            Start for Free
          </button>
        </div>

        {/* Stats Section */}
        <div
          ref={statsRef}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 w-full max-w-4xl mt-4 md:mt-16 px-4"
        >
          {statsData.map((stat, index) => (
            <div key={index} className="text-center">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-light text-[#000c3e] dark:text-[#ffffffde]">
                {stat.isDecimal
                  ? animatedStats.rating.toFixed(1)
                  : Math.floor(index === 0 ? animatedStats.courses : index === 1 ? animatedStats.batches : animatedStats.students)
                }{stat.suffix || ''}
              </h2>
              <p className="text-sm md:text-base text-[#000234] dark:text-[#555] mt-2 font-inter">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
      {/* Marquee Sections - exact HTML structure */}
      {marqueeData.map((item, index) => (
        <div
          key={index}
          className={item.reverse ? "marquee-header-2" : "marquee-header"}
          ref={el => marqueeRefs.current[index] = el}
        >
          <a
            href={item.link}
            className="marquee-link"
            onClick={(e) => {
              e.preventDefault();
              navigate(item.link);
            }}
          >
            <h2 className={item.reverse ? "marquee-title-2" : "marquee-title"}>
              <span>
                <i>{item.title.split(' ')[0]}</i> {item.title.split(' ').slice(1).join(' ')}
              </span>
            </h2>
          </a>
          <p className={item.reverse ? "marquee-subtext-2" : "marquee-subtext"}>
            {item.subtitle}<br/><br/>
            <strong>{item.description}</strong>
            {item.features && (
              <>
                <br/>
                {item.features.map((feature, idx) => (
                  <span key={idx}>• {feature}<br/></span>
                ))}
              </>
            )}
            {item.note && (
              <>
                <br/>
                <em>{item.note}</em>
              </>
            )}
          </p>
        </div>
      ))}
      {/* Reviews Section */}
      <div className="py-2 md:py-16">
        {/* Desktop: Two column layout with vertical scrolling */}
        <div className="hidden md:flex h-screen overflow-hidden">
          {/* Left column scrolling up */}
          <div className="flex-1 flex flex-col justify-start items-center overflow-hidden relative">
            <div className="flex flex-col gap-4 animate-scroll-up">
              {[
                { name: "Daksh Mavani", text: "I had got myself enrolled in C language course as a beginner. We were given enough theory on all aspects of course so that we would be aware of all important concepts." },
                { name: "Loknath", text: "Through her experience ma'am has explained the concepts in a way in which everyone can understand easily. If one has pure interest in learning, he/she will thoroughly understand." },
                { name: "Sudhakar Reddy", text: "The tutor was really good and explained each and every topic clearly with personal care." },
                { name: "Pavan Vinayak", text: "TechLearn Solutions is an exceptional coding institution that provides comprehensive and engaging programming education." },
                { name: "Prakash", text: "Best institute for beginners to learn any programming language. The faculty was highly knowledgeable with personalized attention." }
              ].map((review, index) => (
                <div key={index} className="bg-transparent border-none rounded-3xl p-5 min-h-[90px] w-80 max-w-sm mx-auto">
                  <div className="font-bold mb-2 text-[#490096] dark:text-purple-300">{review.name}</div>
                  <div className="text-[#00195a] dark:text-gray-300 text-sm leading-relaxed line-clamp-2">{review.text}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Center heading */}
          <div className="flex-none flex items-center justify-center px-5">
            <h2 className="text-3xl lg:text-4xl font-bold text-center text-[#04013d] dark:text-white">
              <span className="italic">learn</span> REVIEWS
            </h2>
          </div>

          {/* Right column scrolling down */}
          <div className="flex-1 flex flex-col justify-start items-center overflow-hidden relative">
            <div className="flex flex-col gap-4 animate-scroll-down">
              {[
                { name: "Samuel Jude Philips", text: "Many people don't know about this centre due to its location but you'll go in as a beginner with zero knowledge and walk out confidently with all the necessary knowledge acquired!" },
                { name: "Prasanna", text: "Mam explains the class in a very good way. She takes many real-time examples and makes the topic clear to understand so that it makes us easy to take an interview." },
                { name: "Teja", text: "Very easy to understand the concept and faculty explain doubts very easily. Thank you Techlearn Solutions." },
                { name: "Rajani", text: "It was a great experience to be back in classroom after almost 25 years. Prashanthi Ma'm is subject expert with good grasp on fundamentals." },
                { name: "Shradha", text: "Very good learning experience. I have learnt C language in Techlearn Solutions and I feel really confident with the coding part." }
              ].map((review, index) => (
                <div key={index} className="bg-transparent border-none rounded-3xl p-5 min-h-[90px] w-80 max-w-sm mx-auto">
                  <div className="font-bold mb-2 text-[#490096] dark:text-purple-300">{review.name}</div>
                  <div className="text-[#00195a] dark:text-gray-300 text-sm leading-relaxed line-clamp-2">{review.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile: Horizontal scrolling layout */}
        <div className="md:hidden">
          {/* Mobile heading */}
          <div className="text-center mb-2">
            <h2 className="text-2xl font-bold text-[#04013d] dark:text-white">
              <span className="italic">learn</span> REVIEWS
            </h2>
          </div>

          {/* Horizontal scrolling reviews */}
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4 px-4 animate-scroll-horizontal">
              {[
                { name: "Daksh Mavani", text: "I had got myself enrolled in C language course as a beginner. We were given enough theory on all aspects of course so that we would be aware of all important concepts." },
                { name: "Loknath", text: "Through her experience ma'am has explained the concepts in a way in which everyone can understand easily. If one has pure interest in learning, he/she will thoroughly understand." },
                { name: "Sudhakar Reddy", text: "The tutor was really good and explained each and every topic clearly with personal care." },
                { name: "Pavan Vinayak", text: "TechLearn Solutions is an exceptional coding institution that provides comprehensive and engaging programming education." },
                { name: "Prakash", text: "Best institute for beginners to learn any programming language. The faculty was highly knowledgeable with personalized attention." },
                { name: "Samuel Jude Philips", text: "Many people don't know about this centre due to its location but you'll go in as a beginner with zero knowledge and walk out confidently with all the necessary knowledge acquired!" },
                { name: "Prasanna", text: "Mam explains the class in a very good way. She takes many real-time examples and makes the topic clear to understand so that it makes us easy to take an interview." },
                { name: "Teja", text: "Very easy to understand the concept and faculty explain doubts very easily. Thank you Techlearn Solutions." },
                { name: "Rajani", text: "It was a great experience to be back in classroom after almost 25 years. Prashanthi Ma'm is subject expert with good grasp on fundamentals." },
                { name: "Shradha", text: "Very good learning experience. I have learnt C language in Techlearn Solutions and I feel really confident with the coding part." }
              ].map((review, index) => (
                <div key={index} className="bg-transparent border-none rounded-3xl p-4 min-h-[120px] w-72 flex-shrink-0">
                  <div className="font-bold mb-2 text-[#490096] dark:text-purple-300">{review.name}</div>
                  <div className="text-[#00195a] dark:text-gray-300 text-sm leading-relaxed line-clamp-3">{review.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}


const BuildPage = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for consistency
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingScreen showMessage={false} size={48} duration={800} />;
  }

  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center bg-transparent dark:bg-transparent">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Build Page</h1>
        <p className="text-gray-600 dark:text-gray-300">Coming soon...</p>
      </div>
    </div>
  );
};

const CareersPage = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for consistency
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingScreen showMessage={false} size={48} duration={800} />;
  }

  return (
    <div className="min-h-screen pt-24 pb-16 flex items-center justify-center bg-transparent dark:bg-transparent">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Careers Page</h1>
        <p className="text-gray-600 dark:text-gray-300">Coming soon...</p>
      </div>
    </div>
  );
};



// Import Learn components
import LearnMain from './pages/Learn/LearnMain'
import Courses from './pages/Learn/Courses'
import AllCourses from './pages/Learn/AllCourses'
import CourseDetails from './pages/Learn/CourseDetails'
import CourseQuiz from './pages/Learn/CourseQuiz'
import CourseTopics from './pages/Learn/CourseTopics'
import LiveBatchDetails from './pages/Learn/LiveBatchDetails'

// Import Exercise components
import Exercises from './pages/Learn/Exercises'
import ExercisesList from './pages/Learn/ExercisesList'
import ExerciseDetail from './pages/Learn/ExerciseDetail'

// Import Certification components
import Certification from './pages/Learn/Certification'
import CertificationPayment from './pages/Learn/CertificationPayment'

// Import Compiler component
import OnlineCompiler from './pages/Learn/OnlineCompiler'



// Auth components are now handled by modals in AuthModalProvider
// Login and Register pages are deprecated

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthModalProvider>
          <Router>
            <ScrollToTop />
            <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#daf0fa] via-[#bceaff] to-[#bceaff] dark:from-[#020b23] dark:via-[#001233] dark:to-[#0a1128] transition-all duration-300">
              <Navbar />
              <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/learn" element={<LearnMain />} />
                <Route path="/learn/courses" element={<Courses />} />
                <Route path="/learn/courses/all" element={<AllCourses />} />
                <Route path="/learn/courses/:courseId" element={<CourseDetails />} />
                <Route path="/learn/courses/:courseId/topics" element={<CourseTopics />} />
                <Route path="/learn/courses/:courseId/quiz" element={<CourseQuiz />} />
                <Route path="/learn/batches/:batchId" element={<LiveBatchDetails />} />
                <Route path="/learn/exercises" element={<Exercises />} />
                <Route path="/learn/exercises/:courseId" element={<ExercisesList />} />
                <Route path="/learn/exercises/:courseId/:exerciseId" element={<ExerciseDetail />} />
                <Route path="/learn/certification" element={<Certification />} />
                <Route path="/learn/certification/payment" element={<CertificationPayment />} />
                <Route path="/learn/compiler" element={<OnlineCompiler />} />

                <Route path="/build" element={<BuildPage />} />
                <Route path="/careers" element={<CareersPage />} />
                {/* Login and Register routes removed - now handled by modals */}
              </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </AuthModalProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
