import React from 'react'

const Message = ({message},{type}) => {


  return (
    <div className='cont-alert'>
      <img src={logo_alert} alt={message} />
      <div className="content-message">
      message
      </div>
    </div>
  )
}

export default Message
