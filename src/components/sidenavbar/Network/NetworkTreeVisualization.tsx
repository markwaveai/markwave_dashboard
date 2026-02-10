import React, { useState } from 'react';
import { ChevronRight, ChevronDown, User, Coins, ShoppingBag, Users, Phone, MapPin } from "lucide-react";

// Types
interface TreeNode {
    id: string;
    mobile: string;
    name: string;
    coins: number;
    paid_orders_count: number;
    paid_units_count: number;
    direct_referrals_count: number;
    indirect_referrals_count: number;
    role?: string;
    city?: string;
    referrals: TreeNode[];
    level: number;
}

// Recursive Row Component
const TreeRow = ({
    node,
    level,
    expanded,
    toggleExpand
}: {
    node: TreeNode,
    level: number,
    expanded: Record<string, boolean>,
    toggleExpand: (mobile: string) => void
}) => {
    const hasChildren = node.referrals && node.referrals.length > 0;
    const isExpanded = expanded[node.mobile];

    return (
        <>
            <tr className={`border-b hover:bg-gray-50 transition-colors ${level === 0 ? 'bg-blue-50/30' : ''}`}>
                <td className="py-3 pr-4 pl-4 whitespace-nowrap">
                    <div
                        className="flex items-center gap-2"
                        style={{ paddingLeft: `${level * 24}px` }}
                    >
                        {/* Expand/Collapse Button */}
                        {hasChildren ? (
                            <button
                                type="button"
                                onClick={() => toggleExpand(node.mobile)}
                                className="p-1 rounded hover:bg-gray-200 text-gray-500 transition-colors"
                            >
                                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>
                        ) : (
                            <div className="w-6" /> // Spacer
                        )}

                        {/* Avatar */}
                        {/* Avatar */}
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${level === 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-600'}`}>
                            {node.name ? node.name[0].toUpperCase() : 'U'}
                        </div>

                        {/* Name & Mobile */}
                        <div>
                            <div className="text-xs font-bold text-gray-900">{node.name}</div>
                            <div className="text-[10px] text-gray-400 flex items-center gap-1 font-mono">
                                {node.mobile}
                            </div>
                        </div>
                    </div>
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-tighter">
                        {node.role || 'Member'}
                    </span>
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-center">
                    <div className="text-xs font-black text-amber-600">
                        {node.coins.toLocaleString('en-IN')}
                    </div>
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-center">
                    <div className="text-xs font-bold text-gray-700">
                        {node.paid_orders_count}
                    </div>
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-center">
                    <div className="text-xs font-bold text-emerald-600">
                        {node.paid_units_count.toLocaleString('en-IN')}
                    </div>
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-center">
                    <div className="inline-flex items-center justify-center min-w-[20px] px-1 h-5 rounded bg-blue-50 text-blue-700 text-[10px] font-black">
                        {node.direct_referrals_count}
                    </div>
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-center">
                    <div className="inline-flex items-center justify-center min-w-[20px] px-1 h-5 rounded bg-purple-50 text-purple-700 text-[10px] font-black">
                        {node.indirect_referrals_count}
                    </div>
                </td>
            </tr>
            {/* Render Children if Expanded */}
            {isExpanded && hasChildren && node.referrals.map((child) => (
                <TreeRow
                    key={child.mobile}
                    node={{ ...child, level: level + 1 }}
                    level={level + 1}
                    expanded={expanded}
                    toggleExpand={toggleExpand}
                />
            ))}
        </>
    );
};

const NetworkTreeTable = ({ data }: { data: any }) => {
    // Construct root node from data
    const rootNode: TreeNode = data ? {
        id: data.user.mobile,
        mobile: data.user.mobile,
        name: `${data.user.first_name || ''} ${data.user.last_name || ''}`.trim() || data.user.name,
        coins: data.stats?.total_coins || 0,
        paid_orders_count: data.stats?.paid_orders_count || 0,
        paid_units_count: data.stats?.paid_units_count || 0,
        direct_referrals_count: data.stats?.direct_referrals_count || 0,
        indirect_referrals_count: data.stats?.indirect_referrals_count || 0,
        role: data.user.role,
        referrals: data.network_tree || [],
        level: 0
    } : null!;

    // State to track expanded nodes - Initialize with root expanded
    const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
        return rootNode ? { [rootNode.mobile]: true } : {};
    });

    if (!data || !data.user) return null;

    // Toggle expand/collapse
    const toggleExpand = (mobile: string) => {
        setExpanded(prev => ({ ...prev, [mobile]: !prev[mobile] }));
    };

    return (
        <div className="overflow-hidden bg-white rounded-lg border border-gray-200">
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="min-w-full text-left text-sm relative">
                    <thead className="sticky top-0 z-10 bg-slate-50 text-gray-400 font-bold uppercase text-[10px] tracking-widest border-b border-gray-100 shadow-sm">
                        <tr>
                            <th className="px-4 py-4">User Details</th>
                            <th className="px-3 py-4 text-center">Role</th>
                            <th className="px-3 py-4 text-center">Coins</th>
                            <th className="px-3 py-4 text-center">Orders</th>
                            <th className="px-3 py-4 text-center">Units</th>
                            <th className="px-3 py-4 text-center">Direct Referrals</th>
                            <th className="px-3 py-4 text-center">Indirect Referrals</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 bg-white">
                        <TreeRow
                            node={rootNode}
                            level={0}
                            expanded={expanded}
                            toggleExpand={toggleExpand}
                        />
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default NetworkTreeTable;
