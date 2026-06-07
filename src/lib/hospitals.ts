import { supabase } from "./supabase";


export type Hospital = {
  id: string;
  name: string;
  address: string;
  city: string;
  lga: string;
  state: string;
  phone: string | null;
  email: string | null;
  specialties: string[];
  ownership_type: "public" | "private";
  description: string | null;
  visiting_hours: string | null;
  is_published: boolean;
  avg_rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
  latitude: number | null;
  longitude: number | null;
  image_url: string | null
};

export type Review = {
  id: string;
  hospital_id: string;
  user_id: string;
  rating: number;
  review_text: string | null;
  status: "pending" | "approved" | "hidden";
  created_at: string;
};


export async function fetchHospitals({
  city,
  specialty,
  ownership,
  sortBy,
}: {
  city?: string | null;
  specialty?: string | null;
  ownership?: string | null;
  sortBy?: string | null;
}) {
  console.log("fetchHospitals called with:", { city, specialty, ownership, sortBy });

  let query = supabase
    .from("hospitals")
    .select("*")
    .eq("is_published", true);

  if (city) {
    query = query.ilike("city", `%${city}%`);
  }

  if (specialty) {
    query = query.contains("specialties", [specialty]);
  }

  if (ownership === "public" || ownership === "private") {
    query = query.eq("ownership_type", ownership);
  }

  if (sortBy === "rating") {
    query = query.order("avg_rating", { ascending: false });
  } else {
    query = query.order("name", { ascending: true });
  }

  const { data, error } = await query;

  console.log("fetchHospitals result count:", data?.length);
  console.log("fetchHospitals error:", error);

  if (error) throw error;
  return data as Hospital[];
}

export async function fetchHospitalById(id: string) {
  const { data, error } = await supabase
    .from("hospitals")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Hospital;
}


export async function fetchAllHospitalsAdmin() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  console.log("Fetching as:", session?.user?.email);

  const { data, error } = await supabase
    .from("hospitals")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fetch error:", error);
    throw error;
  }

  return data as Hospital[];
}

export async function createHospital(data: Partial<Hospital>) {
  const { error } = await supabase.from("hospitals").insert([data]);
  if (error) throw error;
}

export async function updateHospital(id: string, data: Partial<Hospital>) {
  const { error } = await supabase
    .from("hospitals")
    .update(data)
    .eq("id", id);
  if (error) throw error;
}

export async function deleteHospital(id: string) {
  const { error } = await supabase
    .from("hospitals")
    .delete()
    .eq("id", id);
  if (error) throw error;
}


export async function fetchHospitalReviews(hospitalId: string) {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("hospital_id", hospitalId)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Review[];
}

export async function submitReview({
  hospitalId,
  rating,
  reviewText,
}: {
  hospitalId: string;
  rating: number;
  reviewText: string;
}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  console.log("Session in submitReview:", !!session);
  console.log("User ID in submitReview:", session?.user?.id);
  console.log("Access token exists:", !!session?.access_token);

  if (!session) throw new Error("You must be logged in to submit a review");

  const { data, error } = await supabase
    .from("reviews")
    .insert([
      {
        hospital_id: hospitalId,
        user_id: session.user.id,
        rating,
        review_text: reviewText,
        status: "pending",
      },
    ])
    .select();

  console.log("Insert result:", data);
  console.log("Insert error:", error);

  if (error) throw error;
}

export async function fetchAllReviewsAdmin() {
  const { data, error } = await supabase
    .from("reviews")
    .select(`
      *,
      hospitals ( name )
    `)
    .order("created_at", { ascending: false });

  console.log("fetchAllReviewsAdmin data:", data);
  console.log("fetchAllReviewsAdmin error:", error);

  if (error) throw error;
  return data;
}

export async function updateReviewStatus(
  id: string,
  status: "approved" | "hidden"
) {
  const { error } = await supabase
    .from("reviews")
    .update({ status })
    .eq("id", id);

  if (error) throw error;
}

export async function fetchHospitalsByRadius({
  lat,
  lng,
  radiusKm,
}: {
  lat: number
  lng: number
  radiusKm: number
}) {
  const { data, error } = await supabase
    .rpc('hospitals_within_radius', {
      lat,
      lng,
      radius_km: radiusKm,
    })

  if (error) throw error
  return data as Hospital[]
}


export async function uploadHospitalImage(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
  const filePath = `hospitals/${fileName}`

  const { error } = await supabase.storage
    .from('hospital-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) throw error

  const { data } = supabase.storage
    .from('hospital-images')
    .getPublicUrl(filePath)

  return data.publicUrl
}