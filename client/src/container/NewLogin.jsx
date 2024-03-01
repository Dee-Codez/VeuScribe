import {useState} from 'react'
import vs from '../assets/veuscribe.png'
import vstype from '../assets/VeuScribe_typed.png'
import { GoogleLogin } from '@react-oauth/google';
import {FcGoogle} from 'react-icons/fc'
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';

const NewLogin = () => {

    const navigate = useNavigate();
    const [name, setName] = useState("");

    const handleInput = (e) => {
        e.preventDefault();
        const val = e.target.value;
        setName(val);
    }

    const handleSubmit = () => {
        localStorage.setItem('user',JSON.stringify({"name":name}));
        navigate('/',{ replace: true })
    }

    const responseGoogle = (response) => {
        if (response.credential != null ) {
            const USER_CREDENTIAL = jwtDecode(response.credential);
            localStorage.setItem('user',JSON.stringify(USER_CREDENTIAL));
            console.log(USER_CREDENTIAL);
            navigate('/',{replace: true})
        }
    }



  return (
    <div className=''>
            <div>
                <div>
                    <div className="relative z-0 flex justify-center items-center h-screen w-screen  ">
                        <div className="absolute h-[100vh] w-screen -top-96  bg-[#8ab7e2] rotate-180 rounded-tl-full rounded-tr-full"></div>
                        <div className='z-10 flex gap-16 absolute top-40 ml-20'>
                            <img src={vs} className='scale-150' />
                            <div>
                            <img src={vstype} className='z-10 mb-10' />
                            </div>
                        </div>
                        <div className='w-[400px] z-20 flex flex-col rounded-xl bg-white/20 backdrop-blur-lg'>
                            <div className='p-5 mt-10'>
                                <input type="text" onChange={handleInput} className='rounded-full w-full text-xl p-4 appearance-none outline-none' placeholder=' Name'  />
                            </div>
                            <div className='flex mt-10 font-bold text-white items-center text-xl justify-center'>
                                <button onClick={handleSubmit} className='p-4 mx-4 bg-[#8ab7e2] rounded-full w-full '>
                                    LOG IN
                                </button>
                            </div>
                            <div className='flex items-center mt-4 gap-2 justify-center'>
                                <hr className='h-px my-8 mx-1 w-1/4 bg-gray-200 border-0 dark:bg-gray-700' />
                                <div className='mx-0'>or continue with</div>
                                <hr className='h-px my-8 mx-1 w-1/4 bg-gray-200 border-0 dark:bg-gray-700' />
                            </div>
                            <div className='rounded-full flex items-center justify-center pb-10'>
                            <GoogleLogin
                                render={(renderProps) => (
                                <button
                                type='button'
                                style={{borderRadius: "10px",
                                    background:'rgba(255, 255, 255)'
                                }}
                                className='bg-white  text-black p-3 rounded-full cursor-pointer outline-none'
                                onClick={renderProps.onClick}
                                disabled={renderProps.disabled}
                                >
                                    <FcGoogle className='mr-4' /> Sign In With Google
                                </button>
                                )}
                                onSuccess={responseGoogle}
                                onError={responseGoogle}
                                useOneTap
                            />
                            </div>

                        </div>
                    </div>
                    <div>
                        
                    </div>
                <div>

            </div>
        </div>
    </div>
      
    </div>
  )
}

export default NewLogin
