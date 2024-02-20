import React from 'react'
import { GoogleLogin } from '@react-oauth/google';
import {FcGoogle} from 'react-icons/fc'
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';



const Login = () => {

    const navigate = useNavigate();
 
    const responseGoogle = (response) => {
        if (response.credential != null ) {
            const USER_CREDENTIAL = jwtDecode(response.credential);
            localStorage.setItem('user',JSON.stringify(USER_CREDENTIAL));
            // const {name, sub, picture} = USER_CREDENTIAL;
            console.log(USER_CREDENTIAL);
            navigate('/',{replace: true})
        }
    }

    const skipLogin = () => {
        localStorage.clear();
        navigate('/');
    }

  return (
    <div className='text-white text-3xl'>
        <div className='flex flex-col gap-5 justify-center h-screen items-center'>
            <GoogleLogin
                render={(renderProps) => (
                <button
                type='button'
                className='bg-white text-black flex justify-center items-center p-3 rounded-lg cursor-pointer outline-none'
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
            <div className='m-4 cursor-pointer' onClick={skipLogin}>
                <div className='bg-red-400 px-6 py-3 rounded-2xl'>
                    Skip
                </div>
            </div>
        </div>
      
    </div>
  )
}

export default Login
