import React from 'react'

const handleLogout = async (event) => {
    event.preventDefault();
    
    try {
      const res = await fetch('/api/session', { method: 'DELETE' });
      if (res.ok) {
        window.location.reload(); // Reload the page after logging out
      } else {
        console.error('Failed to log out:', res.statusText);
      }
    } catch (err) {
      console.error('An error occurred while logging out:', err);
    }
  };

  

const ProfileNavBar = () => {
  return (
  <div>
    <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
            <div className="w-10 rounded-full">
              <img
                src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                alt="User avatar" 
              />
            </div>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
            <li>
              <a className="justify-between">
                Profile 
                <span className="badge">New</span>
              </a>
            </li>
            
            <li><a>Settings</a></li>
            <li><form onClick={handleLogout}><button type="submit" >Logout</button></form></li>
          </ul>
        </div>
  </div>
  )
}

export default ProfileNavBar