import React from 'react';

function HighlightText({text}){
    return(
        <span className='font-bold text-richblue-500'>
            {" "}
            {text}
        </span>
    )
}

export default HighlightText