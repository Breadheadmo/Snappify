import { Check, Package, Truck, MapPin, Home, X, RotateCcw } from 'lucide-react';
import { OrderStatus, TrackingEvent } from '../../types/Order';

interface OrderStatusTimelineProps {
  currentStatus: OrderStatus;
  trackingEvents: TrackingEvent[];
}

const OrderStatusTimeline = ({ currentStatus, trackingEvents }: OrderStatusTimelineProps) => {
  const statusConfig = {
    [OrderStatus.PENDING]: {
      icon: Package,
      label: 'Order Placed',
      color: 'bg-blue-500',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50'
    },
    [OrderStatus.CONFIRMED]: {
      icon: Check,
      label: 'Confirmed',
      color: 'bg-green-500',
      textColor: 'text-green-700',
      bgColor: 'bg-green-50'
    },
    [OrderStatus.PROCESSING]: {
      icon: Package,
      label: 'Processing',
      color: 'bg-yellow-500',
      textColor: 'text-yellow-700',
      bgColor: 'bg-yellow-50'
    },
    [OrderStatus.SHIPPED]: {
      icon: Truck,
      label: 'Shipped',
      color: 'bg-purple-500',
      textColor: 'text-purple-700',
      bgColor: 'bg-purple-50'
    },
    [OrderStatus.OUT_FOR_DELIVERY]: {
      icon: MapPin,
      label: 'Out for Delivery',
      color: 'bg-orange-500',
      textColor: 'text-orange-700',
      bgColor: 'bg-orange-50'
    },
    [OrderStatus.DELIVERED]: {
      icon: Home,
      label: 'Delivered',
      color: 'bg-green-600',
      textColor: 'text-green-700',
      bgColor: 'bg-green-50'
    },
    [OrderStatus.CANCELLED]: {
      icon: X,
      label: 'Cancelled',
      color: 'bg-red-500',
      textColor: 'text-red-700',
      bgColor: 'bg-red-50'
    },
    [OrderStatus.RETURNED]: {
      icon: RotateCcw,
      label: 'Returned',
      color: 'bg-gray-500',
      textColor: 'text-gray-700',
      bgColor: 'bg-gray-50'
    },
    [OrderStatus.REFUNDED]: {
      icon: RotateCcw,
      label: 'Refunded',
      color: 'bg-gray-500',
      textColor: 'text-gray-700',
      bgColor: 'bg-gray-50'
    }
  };

  const normalFlow = [
    OrderStatus.PENDING,
    OrderStatus.CONFIRMED,
    OrderStatus.PROCESSING,
    OrderStatus.SHIPPED,
    OrderStatus.OUT_FOR_DELIVERY,
    OrderStatus.DELIVERED
  ];

  const getCurrentStepIndex = () => {
    return normalFlow.indexOf(currentStatus);
  };

  const isStepCompleted = (step: OrderStatus) => {
    const currentIndex = getCurrentStepIndex();
    const stepIndex = normalFlow.indexOf(step);
    return stepIndex <= currentIndex;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (currentStatus === OrderStatus.CANCELLED || 
      currentStatus === OrderStatus.RETURNED || 
      currentStatus === OrderStatus.REFUNDED) {
    const config = statusConfig[currentStatus];
    const Icon = config.icon;
    
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${config.color} mb-4`}>
            <Icon className="h-10 w-10 text-white" />
          </div>
          <h3 className={`text-2xl font-bold ${config.textColor} mb-2`}>
            Order {config.label}
          </h3>
          <p className="text-gray-600">
            This order has been {config.label.toLowerCase()}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Order Progress</h3>
      
      {/* Desktop Timeline */}
      <div className="hidden md:block">
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-8 left-0 right-0 h-1 bg-gray-200">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
              style={{ width: `${(getCurrentStepIndex() / (normalFlow.length - 1)) * 100}%` }}
            />
          </div>

          {/* Steps */}
          <div className="relative flex justify-between">
            {normalFlow.map((step, index) => {
              const config = statusConfig[step];
              const Icon = config.icon;
              const isCompleted = isStepCompleted(step);
              const isCurrent = step === currentStatus;

              return (
                <div key={step} className="flex flex-col items-center" style={{ flex: 1 }}>
                  <div className={`
                    relative flex items-center justify-center w-16 h-16 rounded-full border-4 
                    transition-all duration-300 z-10
                    ${isCompleted ? config.color + ' border-white shadow-lg' : 'bg-gray-200 border-gray-300'}
                    ${isCurrent ? 'scale-110 ring-4 ring-opacity-50 ring-' + config.color : ''}
                  `}>
                    <Icon className={`h-7 w-7 ${isCompleted ? 'text-white' : 'text-gray-400'}`} />
                    {isCompleted && isCurrent && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                  <p className={`mt-3 text-sm font-semibold text-center ${
                    isCompleted ? config.textColor : 'text-gray-400'
                  }`}>
                    {config.label}
                  </p>
                  {isCurrent && trackingEvents.length > 0 && (
                    <p className="mt-1 text-xs text-gray-500 text-center">
                      {formatDate(trackingEvents[trackingEvents.length - 1].timestamp)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Timeline */}
      <div className="md:hidden space-y-4">
        {normalFlow.map((step, index) => {
          const config = statusConfig[step];
          const Icon = config.icon;
          const isCompleted = isStepCompleted(step);
          const isCurrent = step === currentStatus;

          return (
            <div key={step} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className={`
                  flex items-center justify-center w-12 h-12 rounded-full
                  ${isCompleted ? config.color : 'bg-gray-200'}
                  ${isCurrent ? 'ring-4 ring-opacity-50' : ''}
                `}>
                  <Icon className={`h-6 w-6 ${isCompleted ? 'text-white' : 'text-gray-400'}`} />
                </div>
                {index < normalFlow.length - 1 && (
                  <div className={`w-0.5 h-12 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </div>
              <div className="flex-1 pt-2">
                <p className={`font-semibold ${isCompleted ? config.textColor : 'text-gray-400'}`}>
                  {config.label}
                </p>
                {isCurrent && trackingEvents.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(trackingEvents[trackingEvents.length - 1].timestamp)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tracking Events */}
      {trackingEvents.length > 0 && (
        <div className="mt-8 border-t pt-6">
          <h4 className="text-lg font-bold text-gray-900 mb-4">Tracking History</h4>
          <div className="space-y-3">
            {trackingEvents.slice().reverse().map((event, index) => (
              <div key={event.id} className={`
                flex items-start gap-3 p-3 rounded-lg
                ${index === 0 ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-gray-50'}
              `}>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{event.description}</p>
                    {index === 0 && (
                      <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                        Latest
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                    <span>{formatDate(event.timestamp)}</span>
                    {event.location && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderStatusTimeline;