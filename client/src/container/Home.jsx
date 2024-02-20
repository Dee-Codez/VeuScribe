import { useState, useEffect} from 'react'
import { fetchUser } from '../utils/fetchUser'
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const user = fetchUser();
    const [name, setName] = useState("");
    const nuser = {"name":name};
    const navigate = useNavigate();

    const handleInput = (e) => {
        const val = e.target.value;
        setName(val);
    }

    const handleSubmit = () => {
        localStorage.setItem('user',JSON.stringify({"name":name}));
        navigate('/',{ replace: true })
    }

    if(!user) {
        return (
            <>
            <div>
                <div className='flex h-screen justify-center text-white'>
                    <div className='flex items-center'>
                        <div className='flex flex-col  items-center gap-4 border-2 border-white shadow-xl shadow-black/50 rounded-2xl p-10'>
                            <div className='my-7 mx-3'>
                                <label htmlFor="name">Name :</label>
                                <input type="text" onChange={handleInput} className='bg-black/20 ml-2' />
                            </div>
                            <div className='p-6 mb-4 cursor-pointer shadow-lg shadow-white/5 bg-black/15 rounded-xl' onClick={handleSubmit}>
                                Continue
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </>
        )
    }


  return (
    <div>
      <div>
        <div className='flex'>
            <div className='flex justify-center h-screen'>

            </div>
        </div>
      </div>
    </div>
  )
}

export default Home
