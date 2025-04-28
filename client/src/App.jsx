import React from 'react'
import  Home from './Pages/home.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Login from './Pages/login.jsx'
import Register from './Pages/register.jsx'
import Nav from './Component/navbar.jsx'
import Video from './Pages/video.jsx'
import Landing from './Pages/landing.jsx'
import { UserContextProvider } from './Context/user'
import Profile from './Pages/profile.jsx'
import Quiz from './Pages/quiz.jsx'
import Article from './Pages/article.jsx'
import QuizPage from './Pages/quizpage.jsx'
import ImgUpload from './Pages/imgUpload.jsx'
import LiveDetect from './Pages/LiveDetect.jsx'
import Learn from './Pages/learn.jsx'
import EditProfile from './Pages/editProfile.jsx'
import ContactUs from './Pages/contactUs.jsx'



const App = () => {  

  const router=createBrowserRouter([
    {
      path:'/',
      element:<>
      <Nav/>
      <Landing/>
      </>
    },
   {
      path: '/learn',  // Add the '/learn' route
      element: <>
        <Nav />
        <Learn />  
      </>
    },
    {
       path:'/videos',
      element:<>
        <Nav/>
        <Home/>
      </>
    }
     ,
    {
      path:'/login',
      element:<Login/>
    },
    {
      path:'/register',
      element:<Register/>
    },
    {
      path:'/videos/:param',
      element:<>
      <Nav/>
      <Video/>
      </>
    },
    {
      path:'/profile',
      element:<>
       <Nav/><Profile/>
      </>
    },
    {
      path: '/EditProfile',  
      element: <>
        <Nav />
        <EditProfile />  
      </>
    },
    {
      path:'/quiz',
      element:<>
      <Nav/>
      <Quiz/>
      </>
    },
    {
      path:'/quiz/:param',
      element:<>
      <Nav/>
      <QuizPage/>
      </>
    },
    {
      path:'/articles',
      element:<>
      <Nav/>
      <Article/>
      </>
    },
    {
      path:'/imgUpload',
      element:<>
      <Nav></Nav>
      <ImgUpload></ImgUpload>
      </>
    },
    {
      path: '/liveDetect',
      element: <>
        <Nav/>
        <LiveDetect/>
      </>
    },
    {
      path: '/contactUs',
      element: <>
        <Nav/>
        <ContactUs/>
        </>
    }
  ])
  return (
    <>  
    <UserContextProvider>
      <RouterProvider router={router}></RouterProvider>
    </UserContextProvider>
    </>
  )
}

export default App;