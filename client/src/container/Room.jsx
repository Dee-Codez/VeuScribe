import React, { useCallback, useEffect, useState,useRef } from 'react'
import ReactPlayer from 'react-player'
import { useSocket } from '../utils/SocketProvider'
import peer from '../utils/peer'
import { fetchUser } from '../utils/fetchUser'
import { MdExpandCircleDown } from "react-icons/md";
import { useLocation } from 'react-router-dom';
import { FaRegClipboard } from "react-icons/fa";
import { Tldraw } from 'tldraw'
import "../index.css"
import { MdDraw } from "react-icons/md";
import { IoMdCloseCircle } from "react-icons/io";
import { AiOutlineAudio } from "react-icons/ai";
import { AiOutlineAudioMuted } from "react-icons/ai";
import { CiVideoOn } from "react-icons/ci";
import { CiVideoOff } from "react-icons/ci";

const Room = () => {

    const socket = useSocket();
    const user = fetchUser();
    const [remName, setRemName] = useState("");
    const [hostName, sethostName] = useState("");
    const [remoteSocketId, setRemoteSocketId] = useState(null);
    const [myStream, setMyStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    let [remTranscript, setRemTranscript] = useState("");
    const videoRef = useRef(null);
    const remVideoRef = useRef(null);
    const [remJoined, setRemJoined] = useState(false);
    const [summary, setSummary] = useState("");
    let [isVideoOn, setIsVideoOn] = useState(true);
    let [isAudioOn, setIsAudioOn] = useState(true);
    const {pathname} = useLocation();
    
    const HuggingFaceKey = import.meta.env.VITE_HUGGINFACE_API_TOKEN

    const [isCanvasVisible, setIsCanvasVisible] = useState(false);

    const toggleCanvas = () => {
        setIsCanvasVisible(!isCanvasVisible);
    };

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
        if(note != ''){
            setSavedNotes([...savedNotes, `${user.name}: ${note}`]);
        }
        
        note='';
        notes.current='';
        setNote('');
      }


    const handleCallUser =  useCallback(async ()=>{
        const stream = await navigator.mediaDevices.getUserMedia({audio: isAudioOn, video: isVideoOn});
        const offer = await peer.getOffer();
        socket.emit("user:call",{to:remoteSocketId, offer});
        setMyStream(stream);
    },[isAudioOn, isVideoOn, remoteSocketId, socket]);

    const handleIncomingCall = useCallback(async({from,host,offer})=>{
        setRemoteSocketId(from);
        console.log(host);
        sethostName(host);
        console.log(from,offer);
        const ans = await peer.getAnswer(offer);
        socket.emit("call:accepted",{to:from,ans});
    },[socket]);

    const handleUserJoined = useCallback(({name,id}) => {
        console.log(`${name} joined`);
        setRemName(name);
        setRemoteSocketId(id);
    },[]);

    const sendStreams = useCallback(() => {
        for(const track of myStream.getTracks()) {
          // Only add the track if it's enabled
          if ((track.kind === 'audio' && isAudioOn) || (track.kind === 'video' && isVideoOn)) {
            peer.peer.addTrack(track, myStream);
          }
        }
      }, [myStream, isAudioOn, isVideoOn]);

    const sendIceCandidates = useCallback((data)=>{
        console.log(data,`icecandidates sent`);
            socket.emit("send:icecandidate",{data,to:remoteSocketId});
    },[remoteSocketId, socket])

    const handleCallAccepted = useCallback(({from,ans})=>{
        sethostName(from);
        console.log(from);

        
        peer.setLocalDescription(ans);

        console.log(`Call accepted `);
        sendStreams();
    },[sendStreams]);

    const handleRcvTranscript = useCallback(({transcript})=>{
        console.log(`Transcript received ${transcript}`);
        setRemTranscript(transcript);
    },[]);

    const toggleVideo = async () => {
        if (videoRef.current && videoRef.current.srcObject) {
          const enabled = videoRef.current.srcObject.getVideoTracks()[0].enabled;
          if (enabled) {
            videoRef.current.srcObject.getVideoTracks()[0].enabled = false;
            isVideoOn = false;
            setIsVideoOn(isVideoOn);
          } else {
            videoRef.current.srcObject.getVideoTracks()[0].enabled = true;
            isVideoOn = true;
            setIsVideoOn(isVideoOn);
          }
        }  
        // Create a new stream with the updated constraints
        const stream = await navigator.mediaDevices.getUserMedia({ video: isVideoOn, audio: isAudioOn });
        // Set this stream as the new myStream
        setMyStream(stream);
        // Send the updated stream
        sendStreams();
      };
      
      const toggleAudio = async () => {
        if (videoRef.current && videoRef.current.srcObject) {
          const enabled = videoRef.current.srcObject.getAudioTracks()[0].enabled;
          if (enabled) {
            videoRef.current.srcObject.getAudioTracks()[0].enabled = false;
            isAudioOn = false;
            setIsAudioOn(isAudioOn);
          } else {
            videoRef.current.srcObject.getAudioTracks()[0].enabled = true;
            isAudioOn = true;
            setIsAudioOn(isAudioOn);
          }
        // Create a new stream with the updated constraints
        const stream = await navigator.mediaDevices.getUserMedia({ video: isVideoOn, audio: isAudioOn });
        // Set this stream as the new myStream
        setMyStream(stream);
        // Send the updated stream
        sendStreams();
        }
      };

    useEffect(() => {
        peer.peer.addEventListener('track', async ev =>{
            const remoteStream = ev.streams;
            console.log("Got Tracks");
            console.log(remoteStream);
            setRemoteStream(remoteStream[0]);
            remVideoRef.current.srcObject = remoteStream[0];
            remVideoRef.current.play();
            setRemJoined(true);
        })
    }, [])

    const handleRcvCandidate = useCallback(({candidate})=>{
        peer.peer.addIceCandidate(candidate);
    },[]);

    const handleNegoNeeded = useCallback(async () =>{
        const offer = await peer.getOffer();
        socket.emit('peer:nego:needed',{offer, to:remoteSocketId});
    },[remoteSocketId, socket]);

    const handleNegoNeededIncoming = useCallback( async ({from,offer}) =>{
        const ans = await peer.getAnswer(offer);
        socket.emit("peer:nego:done",{to:from,ans});
    },[socket]);

    const handleNegoNeedFinal = useCallback(async({ans})=>{
        await peer.setLocalDescription(ans);
    },[])

    const getSummary = useCallback(async(totNotes)=>{
        console.log(JSON.stringify(`"inputs": ${totNotes}`))
        const response = await fetch("https://api-inference.huggingface.co/models/gauravkoradiya/T5-Finetuned-Summarization-DialogueDataset",{
                headers: { Authorization:`Bearer ${HuggingFaceKey}` },
                method: "POST",
            body: JSON.stringify(`${totNotes}`),
            });
        const result = await response.json();
        console.log(result);
        setSummary(result[0]['summary_text']);
    },[]);

    useEffect(() => {
        const initAudioVideo = async () => {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({video: true,audio: true});
            setMyStream(stream);
            let vid = videoRef.current
            vid.srcObject = stream;
            vid.onloadedmetadata = function(e) {
                vid.play();
            };
          } catch (err) {
            console.log(err);
          }
        };
        initAudioVideo();
      }, []);
    

    useEffect(() => {
        peer.peer.addEventListener("icecandidate",sendIceCandidates);
      peer.peer.addEventListener('negotiationneeded', handleNegoNeeded);
      return () => {
        peer.peer.removeEventListener("icecandidate",sendIceCandidates);
        peer.peer.removeEventListener('negotiationneeded',handleNegoNeeded);
      }
    }, [handleNegoNeeded, sendIceCandidates]);
    

    useEffect(() => {
        const interval = setInterval(() =>{
          if(isListening){
              console.log(`transcript ${note} sent`);
              handleListen();
              if(remTranscript != ''){
                setSavedNotes([...savedNotes, `${remName?remName:hostName}: ${remTranscript}`]);
              }
              const totNotes = savedNotes.join('\n');
              if(totNotes){
                getSummary(totNotes);
              }
              toggleTranscript();
              handleSaveNote(); 
              toggleTranscript();
          }
        },5000);
        return () => clearInterval(interval);
    }, [note,remTranscript])

    // useEffect(() => {
    //     getVideo();
    //     console.log("getVideo UseEffect called");
    //   }, [videoRef]);
  
    useEffect(() => {
        socket.on("set:remote:transcript", handleRcvTranscript);
        
    }, [handleRcvTranscript, socket])

    useEffect(() => {
        socket.emit('remote:transcript',{to:remoteSocketId,script:note});
    }, [note])
    

    useEffect(() => {
          console.log(isListening);
          handleListen();
    }, [isListening]);

    useEffect(()=>{
        socket.on('user:joined', handleUserJoined);
        socket.on('incoming:call', handleIncomingCall);
        socket.on('call:accepted', handleCallAccepted);
        socket.on('peer:nego:needed', handleNegoNeededIncoming);
        socket.on("peer:nego:final", handleNegoNeedFinal);
        socket.on("receive:icecandidate", handleRcvCandidate);
        
        return () => {
            socket.off('user:joined', handleUserJoined);
            socket.off('incoming:call', handleIncomingCall);
            socket.off('call:accepted', handleCallAccepted);
            socket.off('peer:nego:needed', handleNegoNeededIncoming);
            socket.off("peer:nego:final", handleNegoNeedFinal);
            socket.off("receive:icecandidate", handleRcvCandidate);
        }
    },[socket, handleUserJoined, handleIncomingCall, handleCallAccepted, handleNegoNeededIncoming, handleNegoNeedFinal, handleRcvCandidate, handleRcvTranscript]);
  return (
    <div>
      <div className='flex justify-center'>
        <div className='flex flex-col text-black items-center'>
            <div className='mt-5'>
                <div className='flex flex-col items-center gap-10'>
                    <div className='flex flex-row items-center gap-5'>
                        <div className='text-3xl'>Meeting ID : {pathname.substring(6)}</div>
                        <div className='text-white bg-black/20 rounded-full p-3 cursor-pointer' onClick={() => {
                            navigator.clipboard.writeText(pathname.substring(6));
                            alert('Meeting ID Copied');
                            }}>
                             <FaRegClipboard size={30} className='' />
                        </div>
                    </div>
                    
                    <div className='text-center '>{remoteSocketId? 'Connected' : 'Waiting For Others To Join'}</div>
                    {remoteSocketId && (
                        <div className='flex flex-row gap-5'>
                            <div onClick={handleCallUser} className='px-4 py-2 border-2 border-green-400 cursor-pointer rounded-md'>Join</div>
                            <button onClick={sendStreams} className='z-10 p-2 bg-black/30 cursor-pointer'>Send Stream</button>
                        </div>
                    )}
                    <div className='flex flex-row items-center gap-10'>
                        {!remJoined && 
                        <>
                        <div className='w-[500px]'></div>
                        </>
                        }
                        <div className='relative'>
                            <video muted ref={videoRef} className='rounded-3xl w-[500px]'></video>
                            <p className='absolute bottom-0 right-0 pr-3 py-1 pl-1 text-white rounded-br-3xl bg-black/20'>{user?user.name:hostName}</p>
                        </div>
                        <div className='relative'>
                            <video key={remVideoRef} ref={remVideoRef} className='rounded-3xl w-[500px]'></video>
                            {remJoined && (<p className='absolute bottom-0 right-0 pr-3 py-1 pl-1 text-white rounded-br-3xl bg-black/20'>{remName?remName:hostName}</p>)}
                        </div>
                    </div>
                    <div className='flex w-screen justify-center gap-96'>
                            <div className="flex items-center mt-10 gap-2 flex-col pb-10">
                                <div className="flex flex-col items-center">
                                    <div className='flex gap-5'>
                                        <button key={isListening} className='p-2 bg-[#8ab7e2] rounded-md text-white' onClick={()=>{toggleTranscript()}}>
                                            {isListening ? "Transcript-On": "Transcript-Off"}
                                        </button>
                                    </div>
                                    <div className='flex flex-col items-center mt-3' > 
                                        {note &&(
                                            <div className='p-5 bg-black/15 border border-[#8ab7e2]'>
                                            <p className='text-md max-w-[600px]' key={note}>
                                                You: {note}
                                            </p>
                                            {remTranscript && <p className='bg-black/10 p-2 text-md max-w-[600px]'>
                                                {remName?remName:hostName}: {remTranscript}
                                            </p>}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="relative mt-3 ">
                                    <div className='flex flex-row gap-2 items-center justify-center'>
                                        <h2 className='text-xl font-bold'>Whole Transcript : </h2>
                                        <div className='cursor-pointer' onClick={()=>{toggleIsScript()}}>{isScript? <MdExpandCircleDown className='rotate-180' fontSize={30} /> : <MdExpandCircleDown fontSize={30} />}</div>
                                    </div>
                                    {isScript && savedNotes.length != 0 && 
                                    <div>
                                        <div className='mt-2 leading-7 p-2 bg-white border-2 border-[#8ab7e2] max-w-[700px]'>
                                        {isScript && savedNotes.map((n,index) => (
                                            <p key={index}>{n}</p>
                                        ))}
                                    </div>
                                    </div>
                                    }
                                    
                                </div>
                            </div>
                            <div className='absolute top-56 right-40 flex flex-col gap-8'>
                                <button className='cursor-pointer p-2 bg-sky-500/50 rounded-xl ' onClick={toggleVideo}>
                                    {isVideoOn ? <div className='flex items-center gap-2'><CiVideoOff size={30}/>Turn Video Off</div> : 
                                    <div className='flex items-center gap-2'><CiVideoOn size={30}/>Turn Video On</div>}
                                </button>
                                <button className='cursor-pointer p-2 bg-sky-500/50 rounded-xl' onClick={toggleAudio}>
                                    {isAudioOn ? <div className='flex items-center gap-2'><AiOutlineAudioMuted size={30}/>Mute</div> : 
                                    <div className='flex items-center gap-2'><AiOutlineAudio size={30}/>Unmute</div>}
                                </button>

                                <button className='cursor-pointer p-2 bg-sky-500/50 rounded-xl ' onClick={toggleCanvas}>
                                    {isCanvasVisible ? 
                                    <div className='flex items-center gap-2'>
                                        <IoMdCloseCircle size={30} />
                                        Close Canvas
                                    </div>
                                    : 
                                    <div className='flex items-center gap-2'>
                                        <MdDraw size={30} />
                                        Open Canvas
                                    </div>
                                    }
                                </button>

                            </div>
                            {isCanvasVisible && (
                                <div className='absolute bg-white bg-opacity-75 top-28 right-96 z-50 flex items-center justify-center' style={{ width: '70vw', height: '70vh' }}>
                                    <Tldraw id="canvas" className='w-full h-full'/>
                                </div>
                            )}
                        <div className='flex items-center gap-5 max-w-[600px] flex-col mt-10'>
                        <p className='text-2xl font-bold'>Summary :</p>
                        <div className='text-center'>
                            {summary? summary: "Not Enough Dialogue To Summarize"}
                        </div>
                        </div>
                    </div>
                    
                    
                    
                </div>
                


            </div>
        </div>
      </div>
    </div>
  )
}

export default Room
