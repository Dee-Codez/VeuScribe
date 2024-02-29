import React, { useCallback, useEffect, useState,useRef } from 'react'
import ReactPlayer from 'react-player'
import { useSocket } from '../utils/SocketProvider'
import peer from '../utils/peer'
import { fetchUser } from '../utils/fetchUser'
import { MdExpandCircleDown } from "react-icons/md";

const Room = () => {

    const socket = useSocket();
    const user = fetchUser();
    const [remName, setRemName] = useState("");
    const [hostName, sethostName] = useState("");
    const [remoteSocketId, setRemoteSocketId] = useState(null);
    const [myStream, setMyStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);

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

    const handleCallUser =  useCallback(async ()=>{
        const stream = await navigator.mediaDevices.getUserMedia({audio: true, video: true});
        const offer = await peer.getOffer();
        socket.emit("user:call",{to:remoteSocketId, offer});
        setMyStream(stream);
    },[remoteSocketId, socket]);

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
            peer.peer.addTrack(track,myStream);
        }
    },[myStream])

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
    },[sendStreams])

    useEffect(() => {
        peer.peer.addEventListener('track', async ev =>{
            const remoteStream = ev.streams;
            console.log("Got Tracks");
            console.log(remoteStream);
            setRemoteStream(remoteStream[0]);
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
    },[socket, handleUserJoined, handleIncomingCall, handleCallAccepted, handleNegoNeededIncoming, handleNegoNeedFinal, handleRcvCandidate]);
  return (
    <div>
      <div className='flex justify-center'>
        <div className='flex flex-col text-white items-center'>
            <div className='mt-5'>
                <div className='flex flex-col items-center gap-10'>
                    <div className='text-3xl'>Meeting ID : {}</div>
                    <div className='text-center '>{remoteSocketId? 'Connected' : 'Waiting For Others To Join'}</div>
                    {remoteSocketId && (
                        <div className='flex flex-row gap-5'>
                            <div onClick={handleCallUser} className='px-4 py-2 border-2 border-green-400 rounded-md'>Join</div>
                            <button onClick={sendStreams} className='z-10 p-2 bg-black/30 cursor-pointer'>Send Stream</button>
                        </div>
                    )}
                    <div className='flex md:flex-row flex-col gap-[500px]'>
                        {myStream && (
                            <>
                                <div className='relative'>
                                    
                                    <div className='absolute top-0 left-0 z-10'>
                                        <ReactPlayer style={{borderRadius: '5px', overflow: 'hidden'}} className=" overflow-hidden rounded-xl" playing muted url={myStream}/>
                                        <div className='bg-black/20 px-2 py-1 absolute bottom-0 right-20 z-20'> 
                                        {user?user.name:hostName}
                                        </div>
                                </div>
                                </div>
                            </>
                        )}
                        {remoteStream && (
                            <>
                                <div className='relative'>
                                    
                                    <div className='absolute top-0 left-0 z-10'>
                                        <ReactPlayer className=" overflow-hidden rounded-xl" playing url={remoteStream}/>
                                        <div className='bg-black/20 px-2 py-1 absolute bottom-0 right-20 z-20'> 
                                            {remName?remName:hostName}
                                        </div>
                                </div>
                                </div>
                            </>
                        )}
                        <div className='relative z-10'> 
                        
                         </div>

                    </div>
                    <>
                            <div className="flex items-center mt-[40vh] gap-2 flex-col">
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
                


            </div>
        </div>
      </div>
    </div>
  )
}

export default Room
