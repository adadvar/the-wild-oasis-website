"use client";

import { useOptimistic } from "react";
import { deleteBooking } from "../_lib/actions";
import ReservationCard from "./ReservationCard";

//@ts-ignore
const ReservationList = ({ bookings }) => {
	const [optimisticBookings, optimisticDelete] = useOptimistic(
		bookings,
		(curBookings, bookingId) => {
			return curBookings.filter((booking: any) => booking.id !== bookingId);
		}
	);

	async function handleDelete(bookingId: number) {
		optimisticDelete(bookingId);
		await deleteBooking(bookingId);
	}

	return (
		<ul className="space-y-6">
			{/* @ts-ignore */}
			{optimisticBookings.map((booking) => (
				<ReservationCard
					booking={booking}
					key={booking.id}
					onDelete={handleDelete}
				/>
			))}
		</ul>
	);
};

export default ReservationList;
