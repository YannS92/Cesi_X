import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import '../styles/cardCarousel.css'; // Adjust the path as necessary
import { useNavigate } from 'react-router-dom';
import { Box, IconButton } from '@mui/material';
import Card from './Card'; // Import the Card component

const CardCarousel = ({ items, carouselId, onCardClick }) => {
    const navigate = useNavigate();

    const handleItemClick = (link, item) => {
        if (onCardClick) {
            onCardClick(item);
        } else {
            navigate(link);
        }
    };

    const swiperProps = {
        spaceBetween: 10, // Adjust space between slides
        slidesPerView: 5,
        className: "mySwiper",
        modules: [Pagination, Navigation],
    };

    if (items.length !== 5) {
        swiperProps.pagination = { clickable: true };
        swiperProps.navigation = {
            nextEl: `.next-${carouselId}`,
            prevEl: `.prev-${carouselId}`,
        };
    }

    return (
        <Box sx={{ margin: '20px 0' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h2></h2>
                {items.length !== 5 && (
                    <Box sx={{ display: 'flex', gap: '10px' }}>
                        <IconButton className={`prev-${carouselId}`}>
                            <FontAwesomeIcon icon={faChevronLeft} className="carousel-control" />
                        </IconButton>
                        <IconButton className={`next-${carouselId}`}>
                            <FontAwesomeIcon icon={faChevronRight} className="carousel-control" />
                        </IconButton>
                    </Box>
                )}
            </Box>
            <Swiper {...swiperProps}>
                {items.map((item) => (
                    <SwiperSlide key={item.id} className="swiper-slide">
                        <Box onClick={() => handleItemClick(item.link, item)} sx={{ cursor: 'pointer' }}>
                            <Card
                                img={item.img}
                                title={item.title}
                                price={item.price} // Pass the price to the Card component
                            />
                        </Box>
                    </SwiperSlide>
                ))}
            </Swiper>
        </Box>
    );
};

export default CardCarousel;
