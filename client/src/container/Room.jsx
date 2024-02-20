import React, { useCallback, useEffect, useState } from 'react'
import ReactPlayer from 'react-player'
import { useSocket } from '../utils/SocketProvider'
import peer from '../utils/peer'

const Room = () => {

    const socket = useSocket();
    const [remoteSocketId, setRemoteSocketId] = useState(null);
    const [myStream, setMyStream] = useState(null);  

    const handleCallUser =  useCallback(async ()=>{
        const stream = await navigator.mediaDevices.getUserMedia({audio: true, video: true});
        const offer = await peer.getOffer();
        socket.emit("user:call",{to:remoteSocketId, offer});
        setMyStream(stream);
    },[]);

    const handleIncomingCall = useCallback((data)=>{
        const {from,offer} = data;
        console.log(`${from},${offer} are there`);
    },[]);

    const handleUserJoined = useCallback(({name,id}) => {
        console.log(`${name} joined`);
        setRemoteSocketId(id);
    },[]);

    useEffect(()=>{
        socket.on('user:joined', handleUserJoined);
        socket.on('incoming:call', handleIncomingCall);
        return () => {
            socket.off('user:joined', handleUserJoined);
            socket.off('incoming:call', handleIncomingCall);
        }
    },[socket,handleUserJoined,handleIncomingCall]);
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
                            <ReactPlayer className="absolute top-0 left-0 overflow-hidden rounded-xl" playing muted url={myStream}/>
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
