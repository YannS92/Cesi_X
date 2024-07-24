import React from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { useLocation } from 'react-router-dom';
import '../styles/pageTransition.css';

const PageTransition = ({ children }) => {
    const location = useLocation();

    return (
        <TransitionGroup>
            <CSSTransition
                key={location.key}
                timeout={500}
                classNames="page"
            >
                <div className="page">
                    {children}
                </div>
            </CSSTransition>
        </TransitionGroup>
    );
};

export default PageTransition;
