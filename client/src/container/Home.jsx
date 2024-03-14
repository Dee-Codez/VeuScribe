import { useState, useEffect, useCallback, useRef} from 'react'
import { fetchUser } from '../utils/fetchUser'
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../utils/SocketProvider';
import { AiOutlineAudio } from "react-icons/ai";
import { AiOutlineAudioMuted } from "react-icons/ai";
import { CiVideoOn } from "react-icons/ci";
import { CiVideoOff } from "react-icons/ci";
import ReactPlayer from 'react-player';


const Home = () => {
    const user = fetchUser();
    const [name, setName] = useState("");
    const [room, setRoom] = useState("");
    const [myStream, setMyStream] = useState(null);
    let [audio, setAudio] = useState(true);
    let [video, setVideo] = useState(true);
    let [VidTracks, setVidTracks] = useState(1);
    
    const videoRef = useRef(null);

    const socket = useSocket();
    const navigate = useNavigate();

    const toggleAudio = () => {
        audio = !audio;
        setAudio(audio);
        getVideo(audio,video);
    }

    const toggleVideo = () => {
        video = !video;
        setVideo(video);
        getVideo(audio,video);
    }

    const handleAudioVideo = (aud,vid) =>{
        console.log("Before Toggle : ",audio,video);
        {aud && toggleAudio()}
        {vid && toggleVideo()}
        console.log("After Toggle : ",audio,video);
        getVideo(audio,video);
        
    }

    const getVideo = (aud=true,vid=true) => {
        
        navigator.mediaDevices.getUserMedia( {audio:aud,video:vid} )
        .then(stream => {
          let video = videoRef.current;
          video.srcObject = stream;
          video.play();
          if(vid){VidTracks=1}
          else{VidTracks=0}
          setVidTracks(VidTracks);
          console.log("VidTracks : ",VidTracks);
        })
        .catch(err => {
          console.error("error:", err);
        });
      };

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
        videoRef.current.pause();
        navigate(`/room/${room}`)

    },[navigate])

    const initAudioVideo = useCallback(async()=>{
        const stream = await navigator.mediaDevices.getUserMedia({audio: true, video: true});
        setMyStream(stream);
    },[]);

    // const handleAudioVideo = useCallback(async (aud,vid)=>{
    //     {aud && setAudio(!audio)}
    //     {vid && setVideo(!video)}
    //     console.log(audio,video);
    //     const stream = await navigator.mediaDevices.getUserMedia({audio: audio, video: video});
    //     stream.getAudioTracks().forEach((track) => {
    //         if(audio)
    //             track.enabled=true;
    //         else
    //             track.enabled=false;
    //     })
    //     stream.getVideoTracks().forEach((track) => {
    //         if(video)
    //             track.enabled=true;
    //         else
    //             track.enabled=false;
    //     })

    //     setMyStream(stream);  
    // },[audio,video])

    useEffect(() => {
        if(user){
          setName(user.name)
        }
        initAudioVideo();
      }, [initAudioVideo, user])

    useEffect(() => {
        socket.on('room:join', handleJoinRoom);
        return () =>{
            socket.off("room:join", handleJoinRoom);
        }
    }, [socket,handleJoinRoom]);

    useEffect(() => {
        getVideo();
        console.log("getVideo UseEffect called");
      }, [videoRef]);
    
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
            <div onClick={logout} className='absolute top-10 shadow-lg shadow-black/15 cursor-pointer rounded-xl right-10 px-5 py-3 text-red-500 font-semibold text-lg bg-[#8ab7e2]'>Logout</div>
                <div className='flex flex-col mt-40 h-screen'>
                    <div className='relative border overflow-hidden p-3 bg-white shadow-xl shadow-black/50 w-[500px] rounded-3xl border-black/30'>
                        {myStream && 
                        <div className='relative flex items-center rounded-3xl border-4 border-[#0c8be8] justify-center '>
                            {(VidTracks == 0) && (<img src="/Novid.jpg" alt="No Video" className='w-[500px] ml-[300px] rounded-3xl' />)}
                            <video muted ref={videoRef} className='rounded-3xl'></video>
                            {/* <ReactPlayer key={myStream} style={{ overflow: 'hidden'}} width={"500px"} className="rounded-lg scale-105" playing muted url={myStream}/> */}
                            <div className='absolute rounded-br-3xl  bottom-0 bg-black/20 pr-5 pl-2 py-1 z-10 right-0'>
                                {name}
                            </div>
                        </div>
                        }
                        
                        </div>
                        <div className='flex justify-center mt-3 gap-5'>
                            <div className='p-3 rounded-full bg-black/20' onClick={()=>{handleAudioVideo(true,false)}} >{audio?<AiOutlineAudio fontSize={30} />: <AiOutlineAudioMuted fontSize={30} />}</div>
                            <div className='p-3 rounded-full bg-black/20' onClick={()=>{handleAudioVideo(false,true)}} >{video?<CiVideoOn fontSize={30} />: <CiVideoOff fontSize={30} />}</div>
                        </div>
                        
                        <div className='mt-10 flex justify-center items-center gap-3'>
                            <label className='text-black text-lg' htmlFor="meetingid">Meeting ID : </label>
                            <input onChange={changeRoom} type="text" className='bg-white/50 p-2 text-black' />
                            <div onClick={roomSubmit} className='p-2 bg-[#8ab7e2] rounded-lg cursor-pointer'>Join</div>
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
