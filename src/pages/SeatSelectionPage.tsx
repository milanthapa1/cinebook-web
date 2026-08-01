import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export const SeatSelectionPage: React.FC = () => {
  const { showtimeId } = useParams<{ showtimeId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to showtimes page - seat selection is integrated there
    // This route is deprecated but kept for backwards compatibility
    navigate('/showtimes', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-900">Redirecting to showtimes...</div>
    </div>
  );
};
