import React, { useState } from 'react';
import { ChevronRight, ChevronDown, User, Coins, ShoppingBag, Users, Phone, MapPin } from "lucide-react";

// Types
interface TreeNode {
    id: string;
    mobile: string;
    name: string;
    coins: number;
    paid_orders_count: number;
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
                                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </button>
                        ) : (
                            <div className="w-6" /> // Spacer
                        )}

                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${level === 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-600'}`}>
                            {node.name ? node.name[0].toUpperCase() : 'U'}
                        </div>

                        {/* Name & Mobile */}
                        <div>
                            <div className="text-sm font-medium text-gray-900">{node.name}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                                <Phone size={10} /> {node.mobile}
                            </div>
                        </div>
                    </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                        {node.role || 'Member'}
                    </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1.5 text-sm font-medium text-yellow-700">
                        <Coins size={14} />
                        {node.coins.toLocaleString()}
                    </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1.5 text-sm text-gray-700">
                        <ShoppingBag size={14} className="text-gray-400" />
                        {node.paid_orders_count}
                    </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-1.5 text-sm text-gray-700">
                        <Users size={14} className="text-gray-400" />
                        {node.referrals ? node.referrals.length : 0}
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
        <div className="overflow-hidden border rounded-lg shadow-sm bg-white">
            <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm divide-y divide-gray-200">
                    <thead className="bg-gray-50 text-gray-500 font-medium uppercase text-xs">
                        <tr>
                            <th className="px-4 py-3 pl-12">User</th>
                            <th className="px-4 py-3">Role</th>
                            <th className="px-4 py-3 text-right">Coins</th>
                            <th className="px-4 py-3 text-right">Orders</th>
                            <th className="px-4 py-3 text-right">Referrals</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
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
