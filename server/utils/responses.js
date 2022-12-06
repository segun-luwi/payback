const responses = {
  // success function
  success: (message, data='') => {
    if(!data){
      return {
        message
      }
    }
    // function returns the success object
    return  {
      message,
      data
    };
  },

  // error function
  error: (message, error='') => {
    if(!error) {
      return {
        message
      }
    }
    // function returns the error object
    return {
      message,
      error
    };
  }
};

export default responses;