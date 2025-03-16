// // components/Login.js
// import React, { useState } from 'react';
// import axios from 'axios';

// const Login = () => {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await axios.post('http://localhost:5000/login', { username, password });
//       localStorage.setItem('token', response.data.token);
//       alert('Logged in successfully');
//     } catch (error) {
//       alert(error.response.data.message);
//     }
//   };
//   return (
//     <form onSubmit={handleSubmit}>
//       <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
//       <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
//       <button type="submit">Login</button>
//     </form>
//   );
// };
// export default Login;


