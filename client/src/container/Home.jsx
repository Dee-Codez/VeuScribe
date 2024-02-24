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


const SpeechRecognition =window.SpeechRecognition || window.webkitSpeechRecognition
    const mic = new SpeechRecognition()
    mic.continuous = true
    mic.interimResults = true
    mic.lang = 'en-US'
    mic.maxAlternatives = 1;

const Home = () => {
    const user = fetchUser();
    const [name, setName] = useState("");
    const [room, setRoom] = useState("");
    const [myStream, setMyStream] = useState(null);
    const [audio, setAudio] = useState(true);
    const [video, setVideo] = useState(true);
    let vidEnabled = useRef(true);

    const toggleVid = ()=>{
        console.log("Before : " + vidEnabled.current);
        vidEnabled = !vidEnabled.current;
        console.log("After : " + vidEnabled.current);
    }

    
    
    // const [value, setValue] = useState('');

    // const { listen, listening, stop } = useSpeechRecognition({
    //     onResult: (result) => {
    //       setValue(result);
    //     },
    //   });

    // const { startListening, stopListening, transcript } = useVoiceToText();

    const [isListening, setIsListening] = useState(false)
    const [note, setNote] = useState(null)
    const [savedNotes, setSavedNotes] = useState([])

    useEffect(() => {
        handleListen()
      }, [isListening])

      const handleListen = () => {
        if (isListening) {
          mic.start()
          mic.onend = () => {
            console.log('continue..')
            mic.start()
          }
        } else {
          mic.stop()
          mic.onend = () => {
            console.log('Stopped Mic on Click')
          }
        }
        mic.onstart = () => {
          console.log('Mics on')
        }
    
        mic.onresult = event => {
          const transcript = Array.from(event.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('')
          console.log(transcript)
          setNote(transcript)
          mic.onerror = event => {
            console.log(event.error)
          }
        }
      }
    
    const handleSaveNote = () => {
        setSavedNotes([...savedNotes, note])
        setNote('')
    }

    const videoRef = useRef(null);

    const socket = useSocket()
    const navigate = useNavigate();

    const toggleAudio = () => {
        const naudio = !audio;
        setAudio(naudio);
        reRender();
        getVideo(audio,video);
    }
    const toggleVideo = () => setVideo(value => !value);

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
 
    const reRender = () => { 
        // Calling the forceUpdate() method 
        this.forceUpdate(); 
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
    }, [socket,handleJoinRoom])

    useEffect(() => {
        getVideo();
        console.log("getVideo UseEffect called");
      }, [videoRef]);

    useEffect(() =>{console.log(savedNotes.join(" "))},[savedNotes])
    
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
                            <div className='p-3 rounded-full bg-black/20' onClick={toggleVid} >{vidEnabled?<CiVideoOn fontSize={30} />: <CiVideoOff fontSize={30} />}</div>
                        </div>
                        <div className='mt-10 flex items-center gap-3'>
                            <label htmlFor="meetingid">Meeting ID : </label>
                            <input onChange={changeRoom} type="text" className='bg-black/20 p-2' />
                            <div onClick={roomSubmit} className='p-2 bg-white/20 rounded-lg cursor-pointer'>Join</div>
                        </div>
                        {/* <div>
                            <textarea
                            className='text-black'
                                value={value}
                                onChange={(event) => setValue(event.target.value)}
                            />
                            <button onClick={stop}>
                                🎤
                            </button>
                            {listening && <div>Go ahead Im listening</div>}
                        </div> */}
                        {/* <div className='mt-10 flex flex-col justify-center items-center gap-3'>
                            <button className='bg-white/20 max-w-40' onClick={startListening}>Start Listening</button>
                            <button className='bg-white/20 max-w-40' onClick={stopListening}>Stop Listening</button>
                            {transcript && <span className='text-center text-lg bg-black/20 py-2 max-w-3/4'>{transcript}</span>}
                        </div> */}
                        <>
                            <h1>Voice Notes</h1>
                            <div className="container">
                                <div className="box">
                                <h2>Current Note</h2>
                                {isListening ? <span>🎙️</span> : <span>🛑🎙️</span>}
                                <button onClick={handleSaveNote} disabled={!note}>
                                    Save Note
                                </button>
                                <button onClick={() => setIsListening(prevState => !prevState)}>
                                    Start/Stop
                                </button>
                                <p>{note}</p>
                                </div>
                                <div className="box">
                                <h2>Notes</h2>
                                {savedNotes.map(n => (
                                    <p key={n}>{n}</p>
                                ))}
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
