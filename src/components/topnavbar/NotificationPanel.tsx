import React, { useEffect } from 'react';
import { X, Bell, Trash2, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import type { RootState } from '../../store';
import {
    markAllNotificationsRead,
    clearAllNotifications,
    setHighlightedOrderId,
    setHighlightedMilestoneId,
} from '../../store/slices/uiSlice';

interface NotificationPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
};

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const notifications = useAppSelector((state: RootState) => state.ui.notifications);

    // Mark all read when the panel is opened
    useEffect(() => {
        if (isOpen) dispatch(markAllNotificationsRead());
    }, [isOpen, dispatch]);

    const handleView = (data: Record<string, string> = {}) => {
        if (data.type === 'MILESTONE_ACHIEVED' && data.milestone_id) {
            dispatch(setHighlightedMilestoneId(data.milestone_id));
            navigate('/offer-settings');
        } else if (data.type === 'REFERRAL_REWARD' && data.recipient_mobile) {
            navigate(`/user-management/network/${data.recipient_mobile}`);
        } else if (data.order_id) {
            dispatch(setHighlightedOrderId(data.order_id));
            navigate('/orders');
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Invisible backdrop — click outside to close */}
            <div
                style={{ position: 'fixed', inset: 0, zIndex: 9998 }}
                onClick={onClose}
            />

            {/* Slide-in panel */}
            <div style={{
                position: 'fixed',
                top: 0,
                right: 0,
                height: '100vh',
                width: '380px',
                backgroundColor: '#0f172a',
                borderLeft: '1px solid rgba(30,41,59,0.8)',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '-8px 0 32px rgba(0,0,0,0.45)',
            }}>

                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '18px 20px',
                    borderBottom: '1px solid rgba(30,41,59,0.8)',
                    flexShrink: 0,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Bell size={17} color="#6366f1" />
                        <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '15px' }}>
                            Notifications
                        </span>
                        {notifications.length > 0 && (
                            <span style={{
                                backgroundColor: '#6366f1',
                                color: 'white',
                                fontSize: '11px',
                                fontWeight: 700,
                                padding: '1px 7px',
                                borderRadius: '999px',
                            }}>
                                {notifications.length}
                            </span>
                        )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {notifications.length > 0 && (
                            <button
                                onClick={() => dispatch(clearAllNotifications())}
                                title="Clear all"
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#64748b',
                                    cursor: 'pointer',
                                    padding: '6px',
                                    borderRadius: '6px',
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                <Trash2 size={15} />
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#64748b',
                                cursor: 'pointer',
                                padding: '6px',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            <X size={17} />
                        </button>
                    </div>
                </div>

                {/* Notification list */}
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            color: '#475569',
                            gap: '12px',
                        }}>
                            <Bell size={40} style={{ opacity: 0.25 }} />
                            <p style={{ margin: 0, fontSize: '14px' }}>No notifications yet</p>
                        </div>
                    ) : (
                        notifications.map((notif) => {
                            const hasLink = !!(
                                notif.data?.order_id ||
                                notif.data?.milestone_id ||
                                notif.data?.recipient_mobile
                            );
                            return (
                                <div
                                    key={notif.id}
                                    style={{
                                        padding: '14px 20px',
                                        borderBottom: '1px solid rgba(30,41,59,0.5)',
                                        backgroundColor: notif.read
                                            ? 'transparent'
                                            : 'rgba(99,102,241,0.06)',
                                    }}
                                >
                                    {/* Title row */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '8px',
                                        marginBottom: '4px',
                                    }}>
                                        {!notif.read && (
                                            <span style={{
                                                width: '6px',
                                                height: '6px',
                                                borderRadius: '50%',
                                                backgroundColor: '#6366f1',
                                                flexShrink: 0,
                                                marginTop: '5px',
                                            }} />
                                        )}
                                        <span style={{
                                            color: '#f1f5f9',
                                            fontWeight: 600,
                                            fontSize: '13px',
                                            lineHeight: '1.4',
                                            flex: 1,
                                        }}>
                                            {notif.title}
                                        </span>
                                    </div>

                                    {/* Body — 2-line clamp */}
                                    <p style={{
                                        margin: '0 0 8px 0',
                                        color: '#94a3b8',
                                        fontSize: '12px',
                                        lineHeight: '1.55',
                                        paddingLeft: notif.read ? '0' : '14px',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                    } as React.CSSProperties}>
                                        {notif.body}
                                    </p>

                                    {/* Date + View button */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        paddingLeft: notif.read ? '0' : '14px',
                                    }}>
                                        <span style={{ color: '#475569', fontSize: '11px' }}>
                                            {formatDate(notif.receivedAt)}
                                        </span>

                                        {hasLink && (
                                            <button
                                                onClick={() => handleView(notif.data || {})}
                                                style={{
                                                    background: 'none',
                                                    border: '1px solid rgba(99,102,241,0.35)',
                                                    color: '#818cf8',
                                                    fontSize: '11px',
                                                    padding: '3px 10px',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                }}
                                            >
                                                View <ExternalLink size={10} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </>
    );
};

export default NotificationPanel;
