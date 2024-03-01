import { useState ,useEffect} from 'react'
import './App.css'
import { Routes,Route, useNavigate} from "react-router-dom"
import Login from './container/Login';
import Home from './container/Home';
import { fetchUser } from './utils/fetchUser';
import Room from './container/Room';
import NewLogin from './container/NewLogin';


function App() {

  const navigate = useNavigate();
  const user = fetchUser();
  console.log(user)
  useEffect(() => {
    if(!user) navigate('/login'); 
  }, [])
  
  return (
    <>
    <Routes>
      <Route path='/login' element={<NewLogin />}/>
      <Route path='/' element={<Home />}/>
      <Route path='/room/:roomId' element={<Room />}/>
    </Routes>
    </>
  )
}

export default App
