import { AppConstants } from "@/constants/AppConstants";
import { AppRelease, Chapter, ChapterImage, DonateMethod, Manhwa, ManhwaCard, OugiUser, ReadingSummary } from "@/helpers/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthError, createClient, PostgrestError, Session } from '@supabase/supabase-js';


// RLS
const supabaseUrl = "https://amqgqpnbtwbnmjuqxiqb.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtcWdxcG5idHdibm1qdXF4aXFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NzA0OTIsImV4cCI6MjA2NjQ0NjQ5Mn0.zHaLOyRyRPihVYgFoyRCaWYJYpLsTJH3SMWmpk_YqKA"


export const supabase = createClient(supabaseUrl, supabaseKey as any, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
});


export async function spGetSession(): Promise<Session | null> {
    const { data: {session} } = await supabase.auth.getSession()
    return session
}


export async function spFetchUser(
    user_id: string
): Promise<OugiUser | null> {

    const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("user_id", user_id)
        .single()
    
    if (error) {
        console.log("error spFetchUser", error)
        return null
    }

    if (!data) {
        console.log("no user found", user_id)
        return null
    }

    return data as OugiUser
}

export async function spCreateUser(
    email: string,
    password: string, 
    username: string
): Promise<{
    user: OugiUser | null, 
    session: Session | null,
    error: AuthError | null
}> {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } }
    })
    if (error) {
        console.log("error spCreateUser", error)
        return {user: null, session: null, error}
    }    

    const user = await spFetchUser(data.session!.user.id)

    return {user, error, session: data.session}
}


export async function spChangeUserInfos(
    user_id: string,
    username: string
) {
    const { error } = await supabase
        .from("users")
        .update({ username })
        .eq("user_id", user_id)
    return error
}

export async function spSetUserProfileImageUrl(
    user_id: string, 
    profile_image_url: string,
    profile_image_width: number,
    profile_image_height: number
): Promise<PostgrestError | null> {
    const { error } = await supabase
        .from("users")
        .update({profile_image_url, profile_image_width, profile_image_height})
        .eq("user_id", user_id)
    return error
}

export async function spGetManhwas(): Promise<Manhwa[]> {
    const { data, error } = await supabase.from("mv_manhwas").select("*")
    
    if (error) {
        console.log("error spGetManhwas", error)
        return []
    }
    
    return data
}

export async function spFetchManhwasByLastUpdate(p_offset: number = 0, p_limit: number = 30): Promise<Manhwa[]> {
    const { data, error } = await supabase
        .from("mv_manhwas")
        .select('*')
        .range(p_offset * p_limit, (p_offset + 1) * p_limit)
        .order("updated_at", {ascending: false})

    if (error) {
        console.log("error spFetchManhwasByLastUpdate", error)
        return []
    }

    return data as Manhwa[]
}


export async function spFetchChapterList(manhwa_id: number): Promise<Chapter[]> {
    
    const { data, error } = await supabase
        .from("chapters")
        .select("chapter_id, manhwa_id, chapter_name, chapter_num, created_at")
        .eq("manhwa_id", manhwa_id)
        .order("chapter_num", {ascending: true})

    if (error) {
        console.log("error spFetchChapterList", error)
        return []
    }

    return data
}


export async function spUpdateManhwaViews(p_manhwa_id: number) {
    const { error } = await supabase
        .rpc('increment_manhwa_views', { p_manhwa_id  });

    if (error) {
        console.error('error spUpdateMangaViews', error);
        return null;
    }  
}


export async function spGetReleases(): Promise<AppRelease[]> {
    const { data, error } = await supabase
        .from("releases")
        .select("release_id, version, url, descr, created_at")
        .order("created_at", {ascending: false})
        
    if (error) { 
        console.log("error spGetAllAppVersions", error)
        return [] 
    }    

    return data as AppRelease[]
}


export async function spUpdateManhwaReadingStatus(
    user_id: string,
    manhwa_id: number, 
    status: string
) {
    const { error } = await supabase
        .from("reading_status")
        .upsert({user_id, manhwa_id, status})

    if (error) {
        console.log("error spUpdateManhwaReadingStatus", error)
    }
}


export async function spFetchChapterImages(chapter_id: number): Promise<ChapterImage[]> {
    const { data, error } = await supabase
        .from("chapter_images")
        .select("image_url, width, height")
        .eq("chapter_id", chapter_id)
        .order('index', {ascending: true})

    if (error) {
        console.log("error spFetchChapterImages", error)
        return []
    }

    return data
}


export async function spRequestManhwa(manhwa: string, message: string | null) {
    const { error } = await supabase
        .from("manhwa_requests")
        .insert([{manhwa, message}])

    if (error) {
        console.log("error spRequestManhwa")
    }
}

export async function spReportBug(
    title: string, 
    descr: string | null, 
    bug_type: string
): Promise<number | null> {
    const { data, error } = await supabase
        .from("bug_reports")
        .insert([{title, descr, bug_type}])
        .select("bug_id")
        .single()
    
    if (error) {
        console.log("error spReportBug", error)
        return null
    }
    
    return data.bug_id
}


export async function spGetDonationMethods(): Promise<DonateMethod[]> {
    const { data, error } = await supabase
        .from("donate_methods")
        .select("method, value, action")

    if (error) {
        console.log("error spGetDonationMethods", error)
        return []
    }

    return data
}


export async function spFetchUserReadingStatusSummary(
    p_user_id: string
): Promise<ReadingSummary[]> {    

    const { data, error } = await supabase
        .rpc("get_reading_status_summary", {p_user_id})

    if (error) {
        console.log("error spFetchUserReadingStatusSummary", error)
        return AppConstants.READING_STATUS_ORDER.map(i => {return {status: i, total: 0}})
    }
    return data
}

export async function spFetchUserReadingStatus(user_id: string): Promise<{manhwa_id: number, status: string}[]> {
    const { data, error } = await supabase
        .from('reading_status')
        .select("manhwa_id, status")
        .eq("user_id", user_id)

    if (error) {
        console.log("error spFetchUserReadingStatus", error)
        return []
    }

    return data
}


export async function spFetchRandomManhwaCards(p_limit: number = 30, p_offset: number = 0): Promise<ManhwaCard[]> {
    const { data, error } = await supabase
        .rpc("get_random_cards", {p_offset, p_limit})

    if (error) {
        console.log("error spFetchRandomManhwaCards", error)
    }

    return data as ManhwaCard[]
}