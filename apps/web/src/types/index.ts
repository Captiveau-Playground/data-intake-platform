export interface User {
  id: number;
  username: string;
  role: "administrator" | "datacollector";
}

export interface Club {
  id: number;
  name: string;
  country: string;
  league: string;
  instagram_handle: string;
  created_at: string;
}

export interface Post {
  id: number;
  club_id: number;
  post_type: string;
  caption: string | null;
  post_url: string | null;
  post_date: string;
  source_filename: string | null;
  created_at: string;
}

export interface Comment {
  id: number;
  post_id: number;
  comment_id: string;
  text: string;
  username: string | null;
  user_id: string | null;
  profile_pic_url: string | null;
  comment_created_at: string | null;
  created_at: string;
}

export interface IngestionJob {
  id: number;
  status: "pending" | "processing" | "completed" | "failed";
  total_files: number;
  total_rows: number;
  inserted_rows: number;
  duplicate_rows: number;
  failed_rows: number;
  created_by: number | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_comments: number;
  total_posts: number;
  total_uploads: number;
  total_duplicates: number;
  latest_job: IngestionJob | null;
}
