import React from 'react';
import Apple from "@/assets/appstore.webp";
import { Link } from 'react-router-dom';

const AppleStore: React.FC = () => {
    return (
        <Link to={"https://apps.apple.com/in/app/klout-club/id6475306206"} target='_blank'>
            <img src={Apple} alt="Apple Store" width={166} height={44} className='w-[166px] h-[44px] dark:invert' />
        </Link>
    )
}

export default AppleStore;
