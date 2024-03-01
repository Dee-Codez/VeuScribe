import { useState, useEffect, useCallback, useRef} from 'react'
import { fetchUser } from '../utils/fetchUser'
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../utils/SocketProvider';
import { AiOutlineAudio } from "react-icons/ai";
import { AiOutlineAudioMuted } from "react-icons/ai";
import { CiVideoOn } from "react-icons/ci";
import { CiVideoOff } from "react-icons/ci";
import ReactPlayer from 'react-player';
import { useVoiceToText } from "react-speakup";
import { MdClosedCaption } from "react-icons/md";
import { MdClosedCaptionDisabled } from "react-icons/md";
import { MdExpandCircleDown } from "react-icons/md";


const Home = () => {
    const user = fetchUser();
    const [name, setName] = useState("");
    const [room, setRoom] = useState("");
    const [myStream, setMyStream] = useState(null);
    let [audio, setAudio] = useState(true);
    let [video, setVideo] = useState(true);
    
    const videoRef = useRef(null);

    const socket = useSocket();
    const navigate = useNavigate();

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const mic = new SpeechRecognition();
    mic.continuous = true;
    mic.interimResults = true;
    mic.lang = 'en-US';

    const notes = useRef('');
    let [isScript, setIsScript] = useState(false);

    let [isListening, setIsListening] = useState(false);
    let [note, setNote] = useState(notes.current);
    const [savedNotes, setSavedNotes] = useState([]);
   
    const toggleIsScript = () => {
        isScript = !isScript;
        setIsScript(isScript);
    }

    const toggleTranscript = () => {
        isListening = !isListening;
        setIsListening(isListening);
    }

    const handleListen = () => {
        if (isListening) {
            mic.start()
            console.log('continue..')
        } else {
            mic.abort();
            handleSaveNote();
            console.log('ends..');
            mic.onend = () => {
                console.log('Stopped Mic on Click')
            }
        }
    }
    mic.onstart = () => {
        console.log('Mics on')
        }
    mic.onsoundend = () => {
        console.log('Mic Sound Stopped')
    }
    mic.onspeechend = () => {
        console.log('Mic Speech Stopped')
    }
    mic.onresult = event => {
        const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('')
        console.log(transcript);
        setNote(transcript);
        notes.current=transcript;
        mic.onerror = event => {
            console.log(event.error)
        }
    }
      
    
      const handleSaveNote = () => {
        setSavedNotes([...savedNotes, notes.current]);
        note='';
        notes.current='';
        setNote('');
      }

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
      const interval = setInterval(() =>{
        if(isListening){
            handleListen();
            toggleTranscript();
            handleSaveNote(); 
            toggleTranscript();
        }
      },5000);
      return () => clearInterval(interval);
    }, [note])
    

    useEffect(() => {
        console.log(isListening);
        handleListen();
      }, [isListening])

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
            <div onClick={logout} className='absolute top-10 shadow-lg shadow-white/30 cursor-pointer rounded-xl right-10 px-5 py-3 bg-[#c8a02e]'>Logout</div>
                <div className='flex flex-col mt-40 h-screen'>
                    <div className='relative border overflow-hidden p-1 shadow-xl shadow-black/50 w-[500px] rounded-3xl border-white/30'>
                        {myStream && 
                        <div className='flex items-center justify-center'>
                            <video muted ref={videoRef} className='rounded-3xl'></video>
                            {/* <ReactPlayer key={myStream} style={{ overflow: 'hidden'}} width={"500px"} className="rounded-lg scale-105" playing muted url={myStream}/> */}
                        </div>
                            }
                        <div className='absolute bottom-0 bg-black/20 pr-5 pl-2 py-1 z-10 right-0'>
                            {name}
                        </div>
                        </div>
                        <div className='flex justify-center mt-3 gap-5'>
                            <div className='p-3 rounded-full bg-black/20' onClick={()=>{handleAudioVideo(true,false)}} >{audio?<AiOutlineAudio fontSize={30} />: <AiOutlineAudioMuted fontSize={30} />}</div>
                            <div className='p-3 rounded-full bg-black/20' onClick={()=>{handleAudioVideo(false,true)}} >{video?<CiVideoOn fontSize={30} />: <CiVideoOff fontSize={30} />}</div>
                        </div>
                        
                        <div className='mt-10 flex justify-center items-center gap-3'>
                            <label htmlFor="meetingid">Meeting ID : </label>
                            <input onChange={changeRoom} type="text" className='bg-black/20 p-2' />
                            <div onClick={roomSubmit} className='p-2 bg-white/20 rounded-lg cursor-pointer'>Join</div>
                        </div>
                        <>
                            <div className="flex items-center mt-10 gap-2 flex-col">
                                <div className="flex flex-col items-center">
                                    <div className='flex gap-5'>
                                        <button key={isListening} className='p-2 bg-white/30' onClick={()=>{toggleTranscript()}}>
                                            {isListening ? "Transcript-On": "Transcript-Off"}
                                        </button>
                                    </div>
                                    <div className='flex items-center mt-3' >
                                        <p>Dialogue:</p>
                                        {note?<p className='bg-black/10 p-2 text-md' key={note}>{note}</p>:""}
                                    </div>
                                    
                                </div>
                                <div className="relative mt-3">
                                    <div className='flex flex-row gap-2 items-center justify-center'>
                                        <h2 className='text-xl font-bold'>Whole Transcript : </h2>
                                        <div className='cursor-pointer' onClick={()=>{toggleIsScript()}}>{isScript? <MdExpandCircleDown className='rotate-180' fontSize={30} /> : <MdExpandCircleDown fontSize={30} />}</div>
                                    </div>
                                    <div className='mt-2 leading-7'>
                                        {isScript && savedNotes.map((n,index) => (
                                            <p key={index}>{n}</p>
                                        ))}
                                    </div>
                                    
                                </div>
                            </div>
                        </>
                    </div>
                <div>
            </div>
        </div>
      </div>
    </div>
  )
}

export default Home
