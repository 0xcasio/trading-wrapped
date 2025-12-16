'use client';

import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { WhatIfResult } from '@/lib/whatIf';

interface PnLChartProps {
    data: { date: string; value: number }[];
    color?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-2">
                <p className="font-bold text-sm">{label}</p>
                <p className="text-sm">
                    Value: <span className="font-mono font-bold">${payload[0].value.toFixed(2)}</span>
                </p>
            </div>
        );
    }
    return null;
};

export function PnLChart({ data, color = '#bef264' }: PnLChartProps) {
    // Ensure data is sorted
    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return (
        <div className="w-full h-full min-h-[300px] border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={sortedData}
                    margin={{
                        top: 10,
                        right: 10,
                        left: 0,
                        bottom: 0,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                    <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10, fill: '#000' }}
                        tickLine={false}
                        axisLine={{ stroke: '#000', strokeWidth: 2 }}
                        tickFormatter={(value) => {
                            const date = new Date(value);
                            return `${date.getMonth() + 1}/${date.getDate()}`;
                        }}
                    />
                    <YAxis
                        tick={{ fontSize: 10, fill: '#000' }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value}`}
                        width={40}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#000"
                        strokeWidth={2}
                        fill={color}
                        fillOpacity={0.8}
                        activeDot={{ r: 6, stroke: '#000', strokeWidth: 2, fill: '#fff' }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
