import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'

function AuthModel({onclose}){
    const {userData}=useSelector((state)=>state.user)

    useEffect(()=>{
        if(userData){
            onclose()
        }
    },[])

  return (
    <div className='fixed inset-0 z-[999] flex items-center justify-center
    bg-black/10 backdrop-blur-sm px-4'>

      
    </div>
  )
}

export default AuthModel
