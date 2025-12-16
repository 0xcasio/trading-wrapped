'use client';

import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    ReferenceLine
} from 'recharts';

interface MonthlyChartProps {
    data: { month: string; pnl: number }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const value = payload[0].value;
        return (
            <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-2">
                <p className="font-bold text-sm">{label}</p>
                <p className={`text-sm font-mono font-bold ${value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {value >= 0 ? '+' : ''}{value.toFixed(2)}
                </p>
            </div>
        );
    }
    return null;
};

export function MonthlyChart({ data }: MonthlyChartProps) {
    return (
        <div className="w-full h-full min-h-[300px] border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{
                        top: 20,
                        right: 0,
                        left: 0,
                        bottom: 0,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                    <XAxis
                        dataKey="month"
                        tick={{ fontSize: 10, fill: '#000' }}
                        tickLine={false}
                        axisLine={{ stroke: '#000', strokeWidth: 2 }}
                    />
                    <YAxis
                        hide
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                    <ReferenceLine y={0} stroke="#000" strokeWidth={2} />
                    <Bar dataKey="pnl">
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.pnl >= 0 ? '#bef264' : '#fda4af'}
                                stroke="#000"
                                strokeWidth={2}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
