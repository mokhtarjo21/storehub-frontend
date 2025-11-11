import React from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  ShoppingBagIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';

interface TimelineStep {
  status: string;
  label: string;
  timestamp: string | null;
  completed: boolean;
}

interface OrderStatusTimelineProps {
  timeline: TimelineStep[];
  currentStatus: string;
}

const OrderStatusTimeline: React.FC<OrderStatusTimelineProps> = ({ timeline, currentStatus }) => {
  const getStepIcon = (status: string, completed: boolean, isActive: boolean) => {
    const iconClass = `w-6 h-6 ${
      completed 
        ? 'text-green-500' 
        : isActive 
        ? 'text-blue-500' 
        : 'text-gray-400'
    }`;

    switch (status) {
      case 'placed':
        return completed ? (
          <CheckCircleSolidIcon className={iconClass} />
        ) : (
          <ShoppingBagIcon className={iconClass} />
        );
      case 'confirmed':
        return completed ? (
          <CheckCircleSolidIcon className={iconClass} />
        ) : (
          <CheckCircleIcon className={iconClass} />
        );
      case 'preparing':
        return completed ? (
          <CheckCircleSolidIcon className={iconClass} />
        ) : (
          <ClockIcon className={iconClass} />
        );
      case 'shipped':
        return completed ? (
          <CheckCircleSolidIcon className={iconClass} />
        ) : (
          <TruckIcon className={iconClass} />
        );
      case 'delivered':
        return completed ? (
          <CheckCircleSolidIcon className={iconClass} />
        ) : (
          <HomeIcon className={iconClass} />
        );
      default:
        return <ClockIcon className={iconClass} />;
    }
  };

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {timeline.map((step, stepIdx) => {
          const isActive = step.status === currentStatus;
          const isLast = stepIdx === timeline.length - 1;

          return (
            <li key={step.status}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className={`absolute top-4 left-4 -ml-px h-full w-0.5 ${
                      step.completed ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-3">
                  <div>
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: stepIdx * 0.1 }}
                      className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ${
                        step.completed
                          ? 'bg-green-500 ring-green-100 dark:ring-green-900'
                          : isActive
                          ? 'bg-blue-500 ring-blue-100 dark:ring-blue-900'
                          : 'bg-gray-300 ring-gray-100 dark:bg-gray-600 dark:ring-gray-800'
                      }`}
                    >
                      {getStepIcon(step.status, step.completed, isActive)}
                    </motion.span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p className={`text-sm font-medium ${
                        step.completed || isActive 
                          ? 'text-gray-900 dark:text-white' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {step.label}
                      </p>
                      {step.timestamp && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(step.timestamp).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default OrderStatusTimeline;