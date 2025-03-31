import  React from 'react';
import { Link } from 'react-router-dom';
import {FaArrowRight} from "react-icons";

import HighlightText from '../components/core/HomePage/HighlightText';
import CTAButton from '../components/core/HomePage/Button';

function Home() {
    return(
        <div>
            {/* section 1 */}
            {/* HW: add shadow to the below btn */}
            <div className='group relative mx-auto flex flex-col w-11/12 items-center max-w-maxContent
             text-white justify-between'>
                <Link to={"/signup"}>

                    <div className='mt-16 p-1 max-auto rounded-full ring-richblack-500 font-bold text-richblack-200 transition-all duration-200 hover:scale-95 w-fit'>
                        <div className='flex flex-row items-center gap-2 rounded-fullpy-[5px] transition-all duration-200 group-hover:bg-richblack-900'>
                            <p>Become an Instructor</p>
                            <FaArrowRight/>
                        </div>
                    </div>

                </Link>

                <div className='text-center text-4xl font-semibold mt-7'>
                    Empower Your Future with 
                    <HighlightText text={"Coding Skills"}/>
                </div>

                <div className='mt-4 w-[90%] text-center font-bold text-lg text-richblack-300'>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatem, sapiente laudantium. Laudantium dolor, id ab officia quisquam fuga architecto amet incidunt deleniti dolores maxime enim repellat corporis sed repudiandae fugit.
                </div>

                <div className='flex flex-row mt-8 gap-7'>
                    {/* HW: try achieve closer btn with figma file */}
                    <CTAButton active={true} linkTo={"/signup"}>
                        Learn More
                    </CTAButton>

                    <CTAButton active={true} linkTo={"/signup"}>
                        Book a Demo
                    </CTAButton>
                </div>

                <video>

                </video>
            </div>

            {/* section 2 */}

            {/* section 3 */}

            {/* footer */}
        </div>
    );
}

export default Home