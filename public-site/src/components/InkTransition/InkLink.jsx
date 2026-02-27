import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useInkTransition } from './InkTransitionProvider';

export default function InkLink({ to, useInk = true, children, onClick, ...props }) {
  const { navigateWithInk } = useInkTransition();
  const location = useLocation();

  if (!useInk) {
    return (
      <Link to={to} onClick={onClick} {...props}>
        {children}
      </Link>
    );
  }

  function handleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    if (location.pathname === to) return;
    onClick?.(e);
    navigateWithInk(to);
  }

  return (
    <a href={to} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}
