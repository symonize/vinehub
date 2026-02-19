import { useLocation, Outlet } from 'react-router-dom';

const AnimatedOutlet = () => {
  const location = useLocation();

  return (
    <div key={location.pathname} className="page-transition">
      <Outlet />
    </div>
  );
};

export default AnimatedOutlet;
