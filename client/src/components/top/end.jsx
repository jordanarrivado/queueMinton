import React, { useEffect } from 'react';
import Swal from 'sweetalert2';

const End = ({ setSessionStart, sessionStart, onNavigationClick }) => {

  useEffect(() => {}, [sessionStart, setSessionStart]);

  const handleClick = (component) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you want to End the Session?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: "Yes"
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('Session');
        localStorage.removeItem('LocalArea'); 
        localStorage.removeItem('GameMode'); 
        setSessionStart(false);
        Swal.fire("Session ended!", "The data has been added.", "success").then(() => {
          window.location.reload(); 
        });
        ;
      }
    });
  };

  const hasV = sessionStart ? 'allComponent' : 'selectArea';

  return (
    <div className='end' onClick={() => handleClick(hasV)} title='End the Session now?'>
      <h3>END</h3>
    </div>
  );
}

export default End;
