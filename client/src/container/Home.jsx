import { useState, useEffect, useCallback} from 'react'
import { fetchUser } from '../utils/fetchUser'
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../utils/SocketProvider';

const Home = () => {
    const user = fetchUser();
    const [name, setName] = useState("");
    const [room, setRoom] = useState("");
    const socket = useSocket()
    const navigate = useNavigate();

 

    const handleInput = (e) => {
        const val = e.target.value;
        setName(val);
    }

    const changeRoom = (e) => {
        const value = e.target.value;
        setRoom(value);
    }

    const logout = () => {
        localStorage.clear();
        navigate('/login')
    }

    const roomSubmit = useCallback((e) =>{
        e.preventDefault();
        socket.emit("room:join", {name,room});
        },[name,room,socket]);

    const handleSubmit = () => {
        localStorage.setItem('user',JSON.stringify({"name":name}));
        navigate('/',{ replace: true })
    }

    const handleJoinRoom = useCallback((data) => {
        const {name, room} = data;
        navigate(`/room/${room}`)
    })

    useEffect(() => {
        if(user){
          setName(user.name)
        }
      }, [])

    useEffect(() => {
        socket.on('room:join', handleJoinRoom);
        return () =>{
            socket.off("room:join", handleJoinRoom);
        }
    }, [socket,handleJoinRoom])
    

    
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
        <div className='relative flex justify-center text-white'>
            <div onClick={logout} className='absolute top-5 cursor-pointer right-10 p-5 bg-white/30'>Logout</div>
            <div className='flex flex-col mt-40 h-screen'>
                <div className='relative border-2 h-[200px] rounded-md border-white/30'>
                    <div></div>
                    <div className='absolute bottom-0 bg-black/10 px-2 py-1 z-10 right-0'>
                        {name}
                    </div>
                </div>
                <div className='mt-10 flex items-center gap-3'>
                    <label htmlFor="meetingid">Meeting ID : </label>
                    <input onChange={changeRoom} type="text" className='bg-black/20 p-2' />
                    <div onClick={roomSubmit} className='p-2 bg-white/20 rounded-lg cursor-pointer'>Join</div>
                </div>
            </div>
            <div>
            </div>
        </div>
      </div>
    </div>
  )
}

export default Home
