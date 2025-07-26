import React from 'react';
import { CalendarPlus } from 'lucide-react';

const Test = React.memo(function Test() {

  return (

    <CalendarPlus size={30} color="currentColor" className="p-0.5 ml-0.5 my-1"/>
    
  );

});

export default Test;