import React, { useState, useCallback, useEffect } from 'react';
import styles from './MeetingCard.module.css';
import { HiUsers, HiCheck, HiX } from 'react-icons/hi';
import ParticipantsPopup from '../ParticipantsPopup';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

const MeetingCard = ({ 
    title, 
    date, 
    startTime,
    endTime,
    participants, 
    status, 
    statusForUser,
    onAccept, 
    onReject,
    onCancel,
    showActions,
    isPast,
    description,
    meetingLink,
    displayStatus,
    meetingId,
    invitationId
}) => {
    const [showParticipantsPopup, setShowParticipantsPopup] = useState(false);
    const [detailedParticipants, setDetailedParticipants] = useState([]);
    const { errorToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [activeParticipantsCount, setActiveParticipantsCount] = useState(0);

    // Count active users
    useEffect(() => {
        if (Array.isArray(participants)) {
            const activeCount = participants.filter(p => p.status !== 'rejected').length;
            setActiveParticipantsCount(activeCount);
        } else {
            setActiveParticipantsCount(0);
        }
    }, [participants]);

    // Check if we should show accept/reject buttons
    const showAcceptRejectButtons = useCallback(() => {
        return (
            status === 'pending' || 
            displayStatus === 'pending' || 
            statusForUser === 'pending'
        ) && showActions && !isPast;
    }, [status, displayStatus, statusForUser, showActions, isPast]);

    // Format date nicely
    const formatDate = (dateStr) => {
        try {
            const dateObj = new Date(dateStr);
            return dateObj.toLocaleDateString('en-US', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'short' 
            });
        } catch (e) {
            return dateStr;
        }
    };

    // Format time range
    const formatTimeRange = () => {
        // Convert to 12-hour format
        const convertTo12Hour = (timeStr) => {
            if (/\d+:\d+\s*(AM|PM)/i.test(timeStr)) {
                return timeStr;
            }
            
            const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
            if (match) {
                let hours = parseInt(match[1], 10);
                const minutes = match[2];
                const period = hours >= 12 ? 'PM' : 'AM';
                
                if (hours > 12) {
                    hours -= 12;
                } else if (hours === 0) {
                    hours = 12;
                }
                
                return `${hours}:${minutes} ${period}`;
            }
            
            return timeStr;
        };

        const start = convertTo12Hour(startTime);
        const end = convertTo12Hour(endTime);
        
        return `${start} - ${end}`;
    };

    // Open participant list popup
    const openParticipantsPopup = async () => {
        try {
            setLoading(true);
            // Get participant data
            const response = await api.get(`/api/meetings/${meetingId}/participants`);
            
            let participantsList = [];
            if (response.data?.participants) {
                console.log('Fetched participants:', response.data.participants);
                participantsList = response.data.participants;
            } else if (response.data?.data) {
                console.log('Fetched participants from data:', response.data.data);
                participantsList = response.data.data;
            } else {
                console.log('Using existing participants data:', participants);
                participantsList = participants;
            }

            // Format properly
            const formattedParticipants = participantsList.map(p => ({
                id: p.id || p.userId || p._id,
                name: p.name || p.email || 'Anonymous',
                email: p.email || '',
                status: p.status || 'pending',
                profileImage: p.profileImage || null
            }));
            
            // Update count
            const activeCount = formattedParticipants.filter(p => p.status !== 'rejected').length;
            setActiveParticipantsCount(activeCount);
            
            setDetailedParticipants(formattedParticipants);
            setShowParticipantsPopup(true);
        } catch (error) {
            console.error('Error fetching participants:', error);
            errorToast('Failed to load participants');
            // Fallback
            const formattedParticipants = participants.map(p => ({
                id: p.id || p.userId || p._id,
                name: p.name || p.email || 'Anonymous',
                email: p.email || '',
                status: p.status || 'pending',
                profileImage: p.profileImage || null
            }));
            
            // Update count even in error case
            const activeCount = formattedParticipants.filter(p => p.status !== 'rejected').length;
            setActiveParticipantsCount(activeCount);
            
            setDetailedParticipants(formattedParticipants);
            setShowParticipantsPopup(true);
        } finally {
            setLoading(false);
        }
    };

    const closeParticipantsPopup = () => {
        setShowParticipantsPopup(false);
        
        // Update count when closing
        if (detailedParticipants.length > 0) {
            const activeCount = detailedParticipants.filter(p => p.status !== 'rejected').length;
            setActiveParticipantsCount(activeCount);
        }
        
        // Refresh if status changed
        if (typeof onAccept === 'function' && typeof onReject === 'function') {
            setTimeout(() => {
                window.location.reload();
            }, 500);
        }
    };

    // Update status and count
    const updateParticipantStatus = (userId, newStatus) => {
        setDetailedParticipants(prev => {
            const updated = prev.map(p => 
                (p.id === userId || p.email === userId) ? { ...p, status: newStatus } : p
            );
            
            // Update count after status change
            const activeCount = updated.filter(p => p.status !== 'rejected').length;
            setActiveParticipantsCount(activeCount);
            
            return updated;
        });
    };

    return (
        <>
            <div className={`${styles.card} ${isPast ? styles.pastMeeting : ''}`} 
                 data-meeting-id={meetingId} 
                 data-invitation-id={invitationId}>
                <div className={styles.dateTime}>
                    <div className={styles.date}>{formatDate(date)}</div>
                    <div className={styles.time}>{formatTimeRange()}</div>
                </div>
                
                <div className={styles.details}>
                    <h3 className={styles.title}>{title}</h3>
                    <div className={styles.participants}>
                        You and {description || 'team members'}
                    </div>
                </div>
                
                <div className={styles.actionsContainer}>
                    <div className={styles.statusSection}>
                        {(displayStatus === 'accepted' || status === 'accepted' || displayStatus === 'upcoming') && (
                            <div className={`${styles.statusBadge} ${styles.accepted}`}>
                                Accepted
                            </div>
                        )}
                        
                        {(displayStatus === 'rejected' || status === 'rejected') && (
                            <div className={`${styles.statusBadge} ${styles.rejected}`}>
                                Rejected
                            </div>
                        )}
                        
                        {(displayStatus === 'cancelled' || status === 'cancelled') && (
                            <div className={`${styles.statusBadge} ${styles.rejected}`}>
                                Rejected
                            </div>
                        )}
                        
                        {activeParticipantsCount > 0 && (
                            <div 
                                className={styles.participantsCount}
                                onClick={openParticipantsPopup}
                                title="View participants"
                                role="button"
                                tabIndex={0}
                            >
                                <HiUsers className={styles.participantsIcon} />
                                {activeParticipantsCount} {activeParticipantsCount === 1 ? 'person' : 'people'}
                            </div>
                        )}
                    </div>
                    
                    {showAcceptRejectButtons() ? (
                        <div className={styles.actions}>
                            <button 
                                className={`${styles.actionButton} ${styles.rejectButton}`}
                                onClick={onReject}
                                title="Reject meeting"
                                data-invitation-id={invitationId}
                            >
                                <HiX />
                                <span>Reject</span>
                            </button>
                            <button 
                                className={`${styles.actionButton} ${styles.acceptButton}`}
                                onClick={onAccept}
                                title="Accept meeting"
                                data-invitation-id={invitationId}
                            >
                                <HiCheck />
                                <span>Accept</span>
                            </button>
                        </div>
                    ) : null}
                </div>
            </div>
            {showParticipantsPopup && (
                <ParticipantsPopup
                    participants={detailedParticipants}
                    onClose={closeParticipantsPopup}
                    meetingId={invitationId || meetingId}
                    onUpdateStatus={updateParticipantStatus}
                />
            )}
        </>
    );
};

export default MeetingCard;