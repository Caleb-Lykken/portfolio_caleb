import React from 'react';


function Portfolio() {
  return (
<div>
  <div className='portfolio-header'>
    <img src='/svg/Caleb Lykken.svg' alt='caleb lykken' className='portfolio-title'></img>
    <img src='/images/deer_licking.gif' alt='dear licking its lips'></img>
    <img src='/images/Caleb.avif' alt='Caleb Lykken' />
  </div>
  <div className='projects' >
    <div className='projects-header'>
      <div className='projects-title'>Personal Projects</div>
      <img src='/images/down_arrow.png' alt='down arrow'></img>
      <button className='github-link'>Github</button>
      <button className='linkedin-link'>LinkedIN</button>
      <img src='/images/running_deer.gif' alt='deer running gif'></img>
    </div>
    <div className='about-me'>
      <p>
      Hi! I’m Caleb, a settle-based software developer. 
      I graduated with a bachelors degree in Informatics from the University of Washington. 
      I believe that Thanks for taking the time to take a look at my portfolio take a look
       at some of my projects!
      </p>
    </div>
    <div className='projects cards'>

    </div>
  </div>

</div>

  );
}
export default Portfolio;