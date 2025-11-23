import React from 'react'
import whatsappIcon from '../assets/whatsapp.png'
import classes from './WhatsappIcon.module.css'
function WhatsappIcon() {
  return (
    <>
    <div className={classes.zap}>
          <div className={classes.bolaZap}></div>
          <a href="https://wa.me/5511998765432?text=Olá!" target="_blank" class={classes.whatsappIcon}>
            <img src={whatsappIcon} alt="WhatsApp" className={classes.playIcon}  />
          </a>        
          </div>
    </>
  )
}

export default WhatsappIcon