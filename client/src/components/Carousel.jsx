import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import '../styles/carousel.css'; // Adjust the path as necessary
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { Box, IconButton } from '@mui/material';

const Carousel = ({ items, carouselId }) => {
    const navigate = useNavigate(); // Initialize useNavigate

    const handleItemClick = (link) => {
        navigate(link); // Navigate to the specified link
    };

    return (
        <Box sx={{ margin: '20px 0' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h2></h2>
                <Box sx={{ display: 'flex', gap: '10px' }}>
                    <IconButton className={`prev-${carouselId}`}>
                        <FontAwesomeIcon icon={faChevronLeft} className="carousel-control" />
                    </IconButton>
                    <IconButton className={`next-${carouselId}`}>
                        <FontAwesomeIcon icon={faChevronRight} className="carousel-control" />
                    </IconButton>
                </Box>
            </Box>
            <Swiper
                spaceBetween={0}
                pagination={{ clickable: true }}
                navigation={{ nextEl: `.next-${carouselId}`, prevEl: `.prev-${carouselId}` }}
                slidesPerView={4}
                className="mySwiper"
                modules={[Pagination, Navigation]}
            >
                {items.map((item) => (
                    <SwiperSlide key={item.id} className="swiper-slide">
                        <Box
                            className="slide-content"
                            onClick={() => handleItemClick(item.link)}
                            sx={{
                                backgroundColor: item.color,
                                padding: '20px',
                                borderRadius: '10px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                            }}
                        >
                            <Box sx={{ marginBottom: '10px' }}>
                                <div className="title">{item.title}</div>
                                <div className="content">{item.content}</div>
                            </Box>
                            <Box sx={{ marginBottom: '10px', width: '200px', height: '200px' }}>
                                <img src={item.img} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} />
                            </Box>
                            <Box>
                                <div className="text">{item.text}</div>
                            </Box>
                        </Box>
                    </SwiperSlide>
                ))}
            </Swiper>
        </Box>
    );
};

export default Carousel;
