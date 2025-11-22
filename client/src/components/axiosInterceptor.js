import axios from 'axios';

export const setupAxiosInterceptor = (logoutUser) => {
  axios.interceptors.response.use(
    // If the response is successful, just return it.
    (response) => response,
    // If there's an error...
    (error) => {
      // Check if the error is a 401 Unauthorized
      if (error.response && error.response.status === 401) {
        // Call the logout function passed from the context
        logoutUser();
        alert('Your session has expired. Please log in again.');
        // Redirect to login page
        window.location.href = '/login';
      }
      // For all other errors, just reject the promise
      return Promise.reject(error);
    }
  );
};