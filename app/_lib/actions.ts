'use server';

import { revalidatePath } from "next/cache";
import { auth, signIn, signOut } from "./auth";
import { supabase } from "./supabase";

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

export async function signInAction() {
  await signIn('google', { redirectTo: '/account' })
}

export async function signOutAction() {
  await signOut({ redirectTo: '/' })
}