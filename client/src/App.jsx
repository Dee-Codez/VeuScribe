import { useState ,useEffect} from 'react'
import './App.css'
import { Routes,Route, useNavigate} from "react-router-dom"
import Login from './container/Login';
import Home from './container/Home';



function App() {

  const [user, setUser] = useState();
  const navigate = useNavigate();
  const userInfo = localStorage.getItem('user') !== 'undefined' ? JSON.parse(localStorage.getItem('user')) : localStorage.clear();
  console.log(userInfo)
  useEffect(() => {
    setUser(userInfo)
    if(!userInfo) navigate('/login'); 
  }, [])
  

  

  return (
    <>
    <Routes>
      <Route path='/login' element={<Login />}/>
      <Route path='/home' element={<Home />}/>
    </Routes>

    </>
  )
}

export default App
