import React, { useCallback, useEffect, useState } from 'react'
import ReactPlayer from 'react-player'
import { useSocket } from '../utils/SocketProvider'
import peer from '../utils/peer'


const Room = () => {

    const socket = useSocket();
    const [remoteSocketId, setRemoteSocketId] = useState(null);
    const [myStream, setMyStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);

    const handleCallUser =  useCallback(async ()=>{
        const stream = await navigator.mediaDevices.getUserMedia({audio: true, video: true});
        const offer = await peer.getOffer();
        socket.emit("user:call",{to:remoteSocketId, offer});
        setMyStream(stream);
    },[remoteSocketId,socket]);

    const handleIncomingCall = useCallback(async({from,offer})=>{
        setRemoteSocketId(from);
        console.log(from,offer);
        const ans = await peer.getAnswer(offer);
        socket.emit("call:accepted",{to:from,ans});
    },[socket]);

    const handleUserJoined = useCallback(({name,id}) => {
        console.log(`${name} joined`);
        setRemoteSocketId(id);
    },[]);

    const handleCallAccepted = useCallback(({from,ans})=>{
        peer.setLocalDescription(ans);
        console.log(`Call accepted `)
        for(const track of myStream.getTracks()) {
            peer.peer.addTrack(track,myStream);
        }
    },[myStream])

    useEffect(() => {
      
        peer.peer.addEventListener('track', async ev =>{
            const remoteStream = ev.streams;
            setRemoteStream(remoteStream);
        })
   
    }, [])

    const handleNegoNeeded = useCallback(async () =>{
        const offer = await peer.getOffer();
        socket.emit('peer:nego:needed',{offer, to:remoteSocketId});
    },[remoteSocketId, socket]);

    const handleNegoNeededIncoming = useCallback( ({from,offer}) =>{
        const ans = peer.getAnswer(offer);
        socket.emit("peer:nego:done",{to:from,ans});
    },[socket]);

    const handleNegoNeedFinal = useCallback(async(ans)=>{
        await peer.setLocalDescription(ans);
    },[])

    useEffect(() => {
      peer.peer.addEventListener('negotiationneeded', handleNegoNeeded);
      return () => {
        peer.peer.removeEventListener('negotiationneeded',handleNegoNeeded);
      }
    }, [handleNegoNeeded]);
    
    

    useEffect(()=>{
        socket.on('user:joined', handleUserJoined);
        socket.on('incoming:call', handleIncomingCall);
        socket.on('call:accepted', handleCallAccepted);
        socket.on('peer:nego:needed', handleNegoNeededIncoming);
        socket.on("peer:nego:final", handleNegoNeedFinal);
        return () => {
            socket.off('user:joined', handleUserJoined);
            socket.off('incoming:call', handleIncomingCall);
            socket.off('call:accepted', handleCallAccepted);
            socket.off('peer:nego:needed', handleNegoNeededIncoming);
            socket.off("peer:nego:final", handleNegoNeedFinal);
        }
    },[socket, handleUserJoined, handleIncomingCall, handleCallAccepted, handleNegoNeededIncoming, handleNegoNeedFinal]);
  return (
    <div>
      <div className='flex justify-center'>
        <div className='flex flex-col text-white items-center'>
            <div className='mt-5'>
                <div className='flex flex-col items-center gap-10'>
                    <div className='text-3xl'>Meeting ID : {}</div>
                    <div className='text-center '>{remoteSocketId? 'Connected' : 'Waiting For Others To Join'}</div>
                    {remoteSocketId && (
                        <>
                            <div onClick={handleCallUser} className='px-4 py-2 border-2 border-green-400 rounded-md'>Start</div>
                        </>
                    )}
                    {myStream && (
                        <>
                            <div className=' relative rounded-full'>
                                Local Stream : 
                                <ReactPlayer className="absolute top-0 left-0 overflow-hidden rounded-xl" playing muted url={myStream}/>
                            </div>
                        </>
                    )}
                    {remoteStream && (
                        <>
                            <div className=' relative rounded-full'>
                                Remote Stream
                                <ReactPlayer className="absolute top-0 left-0 overflow-hidden rounded-xl" playing muted url={remoteStream}/>
                            </div>
                        </>
                    )}
                </div>
                


            </div>
        </div>
      </div>
    </div>
  )
}

export default Room
