import React from 'react'
import './btn.css'

const BtnSimple = ({text,click}) => {
  return (
    <div className='btn-base'>
      <button onClick={click}>{text}</button>
    </div>
  )
}

export default BtnSimple
