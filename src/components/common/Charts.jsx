import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const VELOCITY_DATA = [
  { day: 'Oct 01', received: 180, resolved: 150, breached: 8 },
  { day: 'Oct 06', received: 220, resolved: 195, breached: 12 },
  { day: 'Oct 12', received: 245, resolved: 210, breached: 14 },
  { day: 'Oct 18', received: 312, resolved: 260, breached: 28 }, // Peak
  { day: 'Oct 24', received: 270, resolved: 255, breached: 18 },
  { day: 'Oct 30', received: 290, resolved: 284, breached: 15 },
  { day: 'Nov 06', received: 305, resolved: 298, breached: 11 },
];

export const VelocityAreaChart = () => {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={VELOCITY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#004AC6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#004AC6" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4338D9" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#4338D9" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis
            dataKey="day"
            stroke="#737686"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#E2E8F0' }}
          />
          <YAxis
            stroke="#737686"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `${val}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0B1C30',
              borderRadius: '8px',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
            labelStyle={{ fontWeight: 'bold', color: '#B4C5FF' }}
          />
          <Area
            type="monotone"
            dataKey="received"
            name="Received Intake"
            stroke="#004AC6"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorReceived)"
          />
          <Area
            type="monotone"
            dataKey="resolved"
            name="Resolved Cases"
            stroke="#4338D9"
            strokeWidth={2}
            strokeDasharray="4 2"
            fillOpacity={1}
            fill="url(#colorResolved)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const DEPT_PERF_DATA = [
  { name: 'Roads & NHAI', rate: 96, target: 90 },
  { name: 'Jal Shakti', rate: 88, target: 90 },
  { name: 'Urban Dev', rate: 79, target: 90 },
  { name: 'Energy Grid', rate: 84, target: 90 },
  { name: 'PDS Food', rate: 93, target: 90 },
  { name: 'Social Welfare', rate: 81, target: 90 },
];

export const DepartmentBarChart = () => {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={DEPT_PERF_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis
            dataKey="name"
            stroke="#737686"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#E2E8F0' }}
          />
          <YAxis
            stroke="#737686"
            fontSize={11}
            domain={[0, 100]}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `${val}%`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0B1C30',
              borderRadius: '8px',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '12px'
            }}
          />
          <Bar dataKey="rate" name="SLA Redressal Rate (%)" radius={[4, 4, 0, 0]}>
            {DEPT_PERF_DATA.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.rate >= 90 ? '#004AC6' : entry.rate >= 80 ? '#4338D9' : '#BA1A1A'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const CATEGORY_DATA = [
  { name: 'Water & Sanitation', value: 3840, color: '#004AC6' },
  { name: 'Roads & Potholes', value: 4120, color: '#2563EB' },
  { name: 'Power & Billing', value: 2900, color: '#4338D9' },
  { name: 'Urban Backlog', value: 5210, color: '#BA1A1A' },
  { name: 'Social Welfare', value: 1450, color: '#565E74' },
];

export const CategoryPieChart = () => {
  return (
    <div className="w-full h-60">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={CATEGORY_DATA}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {CATEGORY_DATA.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#0B1C30',
              borderRadius: '8px',
              color: '#FFFFFF',
              fontSize: '12px',
              border: 'none'
            }}
          />
          <Legend
            iconType="circle"
            wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

