import { useState, useEffect } from 'react';

export const useMobile = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const media = window.matchMedia('(max-width: 768px)');
        const checkMobile = () => {
            setIsMobile(media.matches);
        };
        
        checkMobile();
        media.addEventListener('change', checkMobile);
        return () => media.removeEventListener('change', checkMobile);
    }, []);

    return isMobile;
};
