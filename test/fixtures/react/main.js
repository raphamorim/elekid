import React from 'react'
import { log } from './helpers'
import Tab from './atoms/Tab'

export default function Dialog (props) {
  log('sample')

  return (
    <section role='dialog' className='modal'>
      <input type='text' className='modal-search' id='modal-search' placeholder='Search for packages....' />
      <div className='modal-items' />
      <Tab />
    </section>
  )
}
