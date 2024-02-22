import { useState, useEffect, useCallback} from 'react'
import { fetchUser } from '../utils/fetchUser'
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../utils/SocketProvider';
import { AiOutlineAudio } from "react-icons/ai";
import { AiOutlineAudioMuted } from "react-icons/ai";
import { CiVideoOn } from "react-icons/ci";
import { CiVideoOff } from "react-icons/ci";
import ReactPlayer from 'react-player'


const Home = () => {
    const user = fetchUser();
    const [name, setName] = useState("");
    const [room, setRoom] = useState("");
    const [myStream, setMyStream] = useState(null);
    const [audio, setAudio] = useState(true);
    const [video, setVideo] = useState(true);

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

    const initAudioVideo = useCallback(async()=>{
        const stream = await navigator.mediaDevices.getUserMedia({audio: true, video: true});
        setMyStream(stream);
    },[]);

    const handleAudioVideo = useCallback(async (aud,vid)=>{
        (aud)?setAudio(!audio):"";
        (vid)?setVideo(!video):"";
        console.log(audio,video);
        const stream = await navigator.mediaDevices.getUserMedia({audio: audio, video: video});
        setMyStream(stream);   
    },[audio,video])

    useEffect(() => {
        if(user){
          setName(user.name)
        }
        initAudioVideo();
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
                <div className='relative border py-2 shadow-md shadow-white/10 w-[500px] rounded-md border-white/30'>
                    {myStream && 
                        <ReactPlayer width={"500px"} className="rounded-lg" playing muted url={myStream}/>
                    }
                    <div className='absolute bottom-0 bg-black/10 px-2 py-1 z-10 right-0'>
                        {name}
                    </div>
                </div>
                <div className='flex justify-center mt-3 gap-5'>
                    <div className='p-3 rounded-full bg-black/20' onClick={()=>{handleAudioVideo(true,false)}} >{audio?<AiOutlineAudio fontSize={30} />: <AiOutlineAudioMuted fontSize={30} />}</div>
                    <div className='p-3 rounded-full bg-black/20' onClick={()=>{handleAudioVideo(false,true)}} >{video?<CiVideoOn fontSize={30} />: <CiVideoOff fontSize={30} />}</div>
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
