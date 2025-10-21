import { MapPin, Clock } from 'lucide-react';
import { TrackingEvent } from '../../types/Order';

interface TrackingHistoryListProps {
  events: TrackingEvent[];
}

const TrackingHistoryList = ({ events }: TrackingHistoryListProps) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>No tracking history available yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.slice().reverse().map((event, index) => (
        <div
          key={event.id}
          className={`relative pl-8 pb-4 ${
            index !== events.length - 1 ? 'border-l-2 border-gray-200' : ''
          }`}
        >
          <div className={`absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full ${
            index === 0 ? 'bg-blue-500 ring-4 ring-blue-100' : 'bg-gray-300'
          }`} />
          
          <div className={`${index === 0 ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-gray-50'} p-4 rounded-lg`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="font-semibold text-gray-900 mb-1">{event.description}</p>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(event.timestamp)}
                  </span>
                  {event.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {event.location}
                    </span>
                  )}
                </div>
              </div>
              {index === 0 && (
                <span className="px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">
                  Latest
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TrackingHistoryList;