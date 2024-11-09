import React from 'react'
import Typewriter, { Cursor, useTypewriter } from 'react-simple-typewriter';


const TypewriterAnimation = () => {
  const words = ['Explore', 'Connect', 'Learn', 'Teach', 'Empower', 'Collaborate', 'Transform'];
  const [typeEffect] = useTypewriter({
    words,
    loop: true,
    deleteSpeed: 40,
    typeSpeed: 60,
    delaySpeed: 2000,
    bounce: true,
  });
  return (
    <div className='type-animation d-flex align-items-end'>
      <span>{typeEffect}</span>
      <span><Cursor
        cursorStyle='●'
      /></span>
    </div>
  )
}

export default TypewriterAnimation