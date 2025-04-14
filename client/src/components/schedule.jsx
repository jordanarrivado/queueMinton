import React, {useEffect, useState} from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import PlusLight from './icons/PlusLight.png';
import PlusBlack from './icons/PlusBlack.png';
import CalendarLight from './icons/calendarLight.png';
import CalendarBlack from './icons/calendarBlack.png';
import ClockLight from './icons/ClockLight.png';
import ClockBlack from './icons/ClockBlack.png';
import DelLight from './icons/delLight.png';
import DelDark from './icons/delDark.png';
import EditLight from './icons/editLight.png';
import EditDark from './icons/editDark.png';
import LocLight from './icons/locLight.png';
import LocBlack from './icons/locBlack.png';


const Schedule = ({isChecked,areas,setAreas,user, schedules, setSchedules, newSchedule, setNewSchedule}) => {

   const [showInputSched, setShowInputSched] = useState();
    const [switchDisplay, setSwitchDisplay] = useState(false);
    const [selectedArea, setSelectedArea] = useState('');
    const lightTheme = ['#1b1f4b', '#1b1f4b3a'];
    const darkTheme = ['#00ffffe5', '#00ffff25'];
    const COLORS = isChecked ? darkTheme : lightTheme ;
    const shadow = isChecked ? 'drop-shadow(0 0 8px rgba(0, 238, 255, 0.5))' : 'drop-shadow(0 0 8px rgba(34, 51, 68, 0.8))';


    
      useEffect(() => {
        if (user?.email) {
          fetchAreas();
        }
        console.log('NewSchedule', schedules);
      }, [user,schedules]); 
    
      const fetchAreas = async () => {
        try {
          const response = await axios.get(`http://localhost:3001/users/${user.email}/areas`);
          setAreas(response.data);
        } catch (error) {
          console.error('Error fetching areas:', error);
          Swal.fire('Error', 'Failed to fetch areas. Please try again later.', 'error');
        }
      };

      useEffect(() => {
        if(user?.email){
          fetchData();
          console.log(schedules);
        }
      },[user]);
    
     
        const fetchData = async () =>{
          try{
            const response =  await axios.get(`http://localhost:3001/users/${user.email}/schedules`);
            setSchedules(response.data);
          }catch(error){
            console.error('Error fetching schedules:', error);
          }
        }
        
    
     
    
   
    
      const handleShowInputSched = () =>{
        setShowInputSched((e) => !e);
      }
    
      const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewSchedule((prev) => ({ ...prev, [name]: value }));
      };
    
    
      const formatTime = (time) => {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours, 10);
        const isPM = hour >= 12;
        const formattedHour = hour % 12 || 12; 
        const ampm = isPM ? 'PM' : 'AM';
      
        return `${formattedHour}:${minutes} ${ampm}`;
      };
      const addScheduleToBackend = async (selectedArea) => {
        try {
          if (!newSchedule.date || !newSchedule.startTime) {
            throw new Error('Please fill in both date and start time.');
          }
      
          const dateObject = new Date(newSchedule.date); // Parse the date
          const [hours, minutes] = newSchedule.startTime.split(':');
          dateObject.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
          if (isNaN(dateObject.getTime())) {
            throw new Error('Invalid time value.');
          }
      
          // Format date as "Nov 22, 2024"
          const formattedDate = dateObject.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });
      
          // Format time (assuming `formatTime` works as intended)
          const formattedTime = formatTime(newSchedule.startTime);
      
          const response = await axios.put(`http://localhost:3001/users/${user.email}/schedules`, {
            title: newSchedule.title,
            date: formattedDate, // Send the formatted date
            startTime: formattedTime,
            description: newSchedule.description,
            location: selectedArea,
          });
      
          setSchedules((prev) =>
            prev.map((sched) => (sched._id === newSchedule._id ? response.data : sched))
          );
      
          setNewSchedule({ title: '', description: '', date: '', startTime: '', location: '' });
          handleShowInputSched();
      
          Swal.fire('Success', 'Schedule added successfully!', 'success');
        } catch (error) {
          const errorMessage =
            error.response && error.response.data
              ? error.response.data.message || 'Failed to add schedule. Please try again.'
              : error.message || 'Failed to add schedule. Please try again.';
          Swal.fire('Error', errorMessage, 'error');
          console.error('Error adding schedule:', error);
        }
      };
      
      
      
      
    
    
      const handleDelete = async (id) => {
        try {
          await axios.delete(`http://localhost:3001/users/${user.email}/schedules/${id}`);
          setSchedules((prev) => prev.filter((sched) => sched._id !== id)); 
          Swal.fire('Deleted!', 'Schedule has been deleted.', 'success');
        } catch (error) {
          Swal.fire('Error', 'Failed to delete schedule. Please try again.', 'error');
          console.error('Error deleting schedule:', error);
        }
      };
      
      const handleEdit = (schedule) => {
        handleShowInputSched();
      };
      
     
      const saveEditSchedule = async (selectedArea) => {
        try {
          if (!newSchedule._id) {
            Swal.fire('Error', 'No schedule selected to edit.', 'error');
            return;
          }
      
          const response = await axios.put(
            `http://localhost:3001/users/${user.email}/schedules/${newSchedule._id}`,
            {
              title: newSchedule.title,
              description: newSchedule.description,
              date: newSchedule.date,
              startTime: newSchedule.startTime,
              location: selectedArea,
            }
          );
      
          setSchedules((prev) =>
            prev.map((sched) => (sched._id === newSchedule._id ? response.data : sched))
          );
    
          //For Form 
          setNewSchedule({ title: '', description: '', date: '', startTime: '', location: '' }); 
          
          Swal.fire('Success', 'Schedule updated successfully!', 'success');
          setShowInputSched(false); 
        } catch (error) {
          Swal.fire('Error', 'Failed to update schedule. Please try again.', 'error');
          console.error('Error updating schedule:', error);
        }
      };

      const handleChange = (event) => {
        setSelectedArea(event.target.value);
      };

      const capitalizeFirstLetter = (str) => {
        return str.replace(/\b\w/g, (char) => char.toUpperCase());
      };
     
    
  return (
    <div className="leftSched">
        <h3>My Schedules</h3>
        <div className="imgs">
          <img
            src={isChecked ? CalendarLight : CalendarBlack}
            alt="Calendar"
            title="Calendar"
          />
          <img
            src={isChecked ? PlusLight : PlusBlack}
            onClick={handleShowInputSched}
            title="Add Schedule?"
          />
        </div>

        {showInputSched && (
              <div className="scheduleForm">
                <h3>Add Schedule</h3>
                <img
                  src={isChecked ? PlusLight : PlusBlack}
                  onClick={handleShowInputSched}
                  title="Close?"
                />
                <input
                  type="text"
                  name="title"
                  placeholder="Title (required)"
                  value={newSchedule.title}
                  onChange={handleInputChange}
                />

                <textarea
                  type="textarea"
                  name="description"
                  placeholder="Description (optional)"
                  value={newSchedule.description}
                  onChange={handleInputChange}
                />
                <input
                  type="date"
                  name="date"
                  className='date-input'
                  value={newSchedule.date}
                  onChange={handleInputChange}
                />
                <input
                  type="time"
                  name="startTime"
                  placeholder="Location (optional)"
                  value={newSchedule.startTime}
                  onChange={handleInputChange}
                />
              
                <select
                  id="areaSelect"
                  value={selectedArea}
                  onChange={handleChange}
                >
                  <option value="">Select Location</option>
                  {areas.map((area) => (
                    <option key={area.name} value={area.name}>
                      {capitalizeFirstLetter(area.name)}
                    </option>
                  ))}
                </select>

                <button onClick={newSchedule._id ? () => saveEditSchedule(selectedArea) : () => addScheduleToBackend(selectedArea)}>
                  {newSchedule._id ? 'Save Changes' : 'Add Schedule'}
                </button>

              </div>
            )}

            {/* Schedule Display */}
            <div className="Schedule">
      {schedules.length > 0 && (
        schedules.map((sched, index) => {
          const clock =  isChecked ? ClockBlack : ClockLight;
          const del = isChecked ? DelLight : DelDark;
          const edit = isChecked ? EditLight : EditDark;
          const locIcon = isChecked ? LocLight : LocBlack;
          return (
            
            <div key={index} className="schedCon">
              <div className="head">
                <h4 className="title">{sched.title}</h4>
                <div className="actions">
                  <img src={EditLight} onClick={() => handleEdit(sched)} className="edit" alt="Edit" />
                  <img src={DelLight} onClick={() => handleDelete(sched._id)} className="del" alt="Delete" />
                </div>
              </div>

              <div className="body"> 
                <div className="info">
                  <div className="icon-text">
                    <img src={ClockBlack} className="icon" alt="Clock" />
                    <p className="time">{sched.startTime}</p>
                  </div>
                  
                  <div className="icon-text">
                    <img src={CalendarLight} className="icon" alt="Calendar" />
                    <p className="date">{sched.date}</p>
                  </div>
                  
                  <div className="icon-text">
                    <img src={LocLight} className="icon" alt="Location" />
                    <p className="location">{sched.location || "No Location provided"}</p>
                  </div>
                </div>

                <div className="notes-section">
                  <p className="notes-title">Notes</p>
                  <p className="desc">{sched.description || "No description"}</p>
                </div>
              </div>
            </div>

          );
        })
      )}
    </div>
 
</div>
  )
}

export default Schedule;
