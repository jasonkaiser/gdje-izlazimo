import React from 'react';
import { Calendar, Clock, CheckCircle, XCircle, TrendingUp } from 'lucide-react';

export function SectionCards() {
  const cards = [
    {
      title: "Today Reservations",
      value: "32",
      gradient: "linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.0705) 100%)",
      bgColor: "#021226",
      icon: Calendar,
      footerText: "Active bookings for today",
      trend: "+8 from yesterday"
    },
    {
      title: "Weekly Reservations",
      value: "124",
      gradient: "linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.0705) 100%)",
      bgColor: "#021226",
      icon: TrendingUp,
      footerText: "Total bookings this week",
      trend: "+15% vs last week"
    },
    {
      title: "Pending Reservations",
      value: "12",
      gradient: "linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.1316) 100%)",
      bgColor: "#261802",
      icon: Clock,
      footerText: "Awaiting confirmation",
      trend: "Requires attention"
    },
    {
      title: "Accepted Reservations",
      value: "97",
      gradient: "linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.1316) 100%)",
      bgColor: "#022602",
      icon: CheckCircle,
      footerText: "Confirmed bookings",
      trend: "78% acceptance rate"
    },
    {
      title: "Declined Reservations",
      value: "42",
      gradient: "linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.1316) 100%)",
      bgColor: "#260202",
      icon: XCircle,
      footerText: "Rejected bookings",
      trend: "22% decline rate"
    }
  ];

  return (
    <div className="space-y-4 px-4 lg:px-6">
      {/* First Row */}
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2">
        {cards.slice(0, 2).map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="relative overflow-hidden transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: card.gradient + ", " + card.bgColor,
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '17px',
                padding: '20px',
                minHeight: '133px'
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-gray-400 text-xs font-medium mb-2 uppercase tracking-wider">
                    {card.title}
                  </p>
                  <h2 className="text-5xl font-bold text-white tabular-nums">
                    {card.value}
                  </h2>
                </div>
                <div 
                  className="p-2 rounded-lg"
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <Icon className="w-5 h-5 text-white opacity-60" />
                </div>
              </div>
              
              <div className="mt-auto pt-3 border-t border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white text-xs font-medium">{card.trend}</span>
                </div>
                <p className="text-gray-500 text-xs">
                  {card.footerText}
                </p>
              </div>
              
              {/* Subtle glow effect */}
              <div 
                className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full opacity-10 blur-2xl pointer-events-none"
                style={{ background: card.bgColor }}
              />
            </div>
          );
        })}
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-3">
        {cards.slice(2, 5).map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="relative overflow-hidden transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: card.gradient + ", " + card.bgColor,
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '17px',
                padding: '20px',
                minHeight: '133px'
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-gray-400 text-xs font-medium mb-2 uppercase tracking-wider">
                    {card.title}
                  </p>
                  <h2 className="text-5xl font-bold text-white tabular-nums">
                    {card.value}
                  </h2>
                </div>
                <div 
                  className="p-2 rounded-lg"
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <Icon className="w-5 h-5 text-white opacity-60" />
                </div>
              </div>
              
              <div className="mt-auto pt-3 border-t border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white text-xs font-medium">{card.trend}</span>
                </div>
                <p className="text-gray-500 text-xs">
                  {card.footerText}
                </p>
              </div>
              
              {/* Subtle glow effect */}
              <div 
                className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full opacity-10 blur-2xl pointer-events-none"
                style={{ background: card.bgColor }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}