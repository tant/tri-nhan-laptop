/**
 * Ticket Activity Hook
 * Tracks recent activity for specific tickets
 */

import { useRealtimeUpdates } from "@/hooks/use-realtime-updates";
import { useMemo } from "react";

export function useTicketActivity(ticketId: string, timeWindowMinutes = 30) {
	const { events, getRecentEvents } = useRealtimeUpdates();

	const ticketActivity = useMemo(() => {
		const recentEvents = getRecentEvents(timeWindowMinutes);

		// Find events related to this specific ticket
		const ticketEvents = recentEvents.filter(event => {
			const eventData = event.data;
			return (
				eventData?.ticket_id === ticketId ||
				eventData?.ticketCode?.includes(ticketId.slice(-6)) || // Match last 6 chars
				event.message.includes(ticketId)
			);
		});

		const hasRecentActivity = ticketEvents.length > 0;
		const lastActivity = ticketEvents[0]; // Most recent first
		const activityCount = ticketEvents.length;

		return {
			hasRecentActivity,
			lastActivity,
			activityCount,
			events: ticketEvents
		};
	}, [events, ticketId, timeWindowMinutes, getRecentEvents]);

	return ticketActivity;
}

export function useMultipleTicketsActivity(ticketIds: string[], timeWindowMinutes = 30) {
	const { getRecentEvents } = useRealtimeUpdates();

	const activitiesMap = useMemo(() => {
		const recentEvents = getRecentEvents(timeWindowMinutes);
		const activities: Record<string, {
			hasRecentActivity: boolean;
			lastActivity: any;
			activityCount: number;
		}> = {};

		// Initialize all tickets with no activity
		ticketIds.forEach(id => {
			activities[id] = {
				hasRecentActivity: false,
				lastActivity: null,
				activityCount: 0
			};
		});

		// Find events for each ticket
		recentEvents.forEach(event => {
			const eventData = event.data;

			ticketIds.forEach(ticketId => {
				const isRelated = (
					eventData?.ticket_id === ticketId ||
					eventData?.ticketCode?.includes(ticketId.slice(-6)) ||
					event.message.includes(ticketId)
				);

				if (isRelated) {
					activities[ticketId].hasRecentActivity = true;
					activities[ticketId].activityCount += 1;

					// Keep most recent activity
					if (!activities[ticketId].lastActivity) {
						activities[ticketId].lastActivity = event;
					}
				}
			});
		});

		return activities;
	}, [ticketIds, timeWindowMinutes, getRecentEvents]);

	return activitiesMap;
}