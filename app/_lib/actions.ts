'use server';

import { revalidatePath } from "next/cache";
import { auth, signIn, signOut } from "./auth";
import { supabase } from "./supabase";
import { getBooking } from "./data-service";
import { redirect } from "next/navigation";

export async function updateGuest(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error('You must be logged in')

  const nationalID = formData.get('nationalID');
  const nationalityEntry = formData.get('nationality') as string;

  const [nationality, countryFlag] = nationalityEntry.split('%');

  if (typeof nationalID !== 'string') throw new Error('National ID must be a string');

  if (!/^[a-zA-Z0-9]{6,12}$/.test(nationalID)) throw new Error('Please provide a valid national ID')

  const updateData = { nationality, countryFlag, nationalID }

  const { data, error } = await supabase
    .from('guests')
    .update(updateData)
    //@ts-ignore
    .eq('id', session?.user?.guestId)

  if (error) throw new Error('Guest could not be updated');

  revalidatePath('/account/profile')
}

//@ts-ignore
export async function deleteReservation(bookingId) {
  const session = await auth();
  if (!session) throw new Error('You must be logged in');

  const currentBooking = await getBooking(bookingId);
  //@ts-ignore
  if (session?.user?.guestId !== currentBooking.guestId) throw new Error('Your are not allowed to delete this booking');

  const { error } = await supabase.from('bookings').delete().eq('id', bookingId);

  if (error) throw new Error('Booking could not be deleted');

  revalidatePath('/account/reservations')
}


export async function editReservation(formData: FormData) {
  const bookingId = Number(formData.get('bookingId'));

  const session = await auth();
  if (!session) throw new Error('You must be logged in');

  const currentBooking = await getBooking(bookingId);
  //@ts-ignore
  if (session?.user?.guestId !== currentBooking.guestId) throw new Error('Your are not allowed to update this booking');

  const updateData = { numGuests: Number(formData.get('numGuests')), observations: formData.get('observations')?.slice(0, 1000) };

  const { data, error } = await supabase
    .from('bookings')
    .update(updateData)
    .eq('id', bookingId)
    .select()
    .single();

  if (error) throw new Error('Booking could not be updated');

  revalidatePath(`/account/reservations/edit/${bookingId}`)
  revalidatePath('/account/reservations')
  redirect('/account/reservations')
}

export async function signInAction() {
  await signIn('google', { redirectTo: '/account' })
}

export async function signOutAction() {
  await signOut({ redirectTo: '/' })
}