export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      accounts: {
        Row: {
          connected_wallet: string | null
          created_at: string
          dataregistry_url: string | null
          dimo_token: string | null
          dimo_wallet: string
          file_sync_status: Database["public"]["Enums"]["sync_status"]
          id: string
          public_id: string
          transaction_completed_at: string | null
          wallet_completed_at: string | null
        }
        Insert: {
          connected_wallet?: string | null
          created_at?: string
          dataregistry_url?: string | null
          dimo_token?: string | null
          dimo_wallet: string
          file_sync_status?: Database["public"]["Enums"]["sync_status"]
          id?: string
          public_id?: string
          transaction_completed_at?: string | null
          wallet_completed_at?: string | null
        }
        Update: {
          connected_wallet?: string | null
          created_at?: string
          dataregistry_url?: string | null
          dimo_token?: string | null
          dimo_wallet?: string
          file_sync_status?: Database["public"]["Enums"]["sync_status"]
          id?: string
          public_id?: string
          transaction_completed_at?: string | null
          wallet_completed_at?: string | null
        }
        Relationships: []
      }
      files: {
        Row: {
          blockchainFileId: number
          created_at: string | null
          failure_reason: string | null
          id: string
          is_onchain: boolean
          owner_id_fkey: string
          proof: Json | null
          proof_txn: string | null
          relay_url: string | null
          status: Database["public"]["Enums"]["file_status"]
          txn_hash: string
          updated_at: string
          url: string
          verbose_proof: Json | null
        }
        Insert: {
          blockchainFileId: number
          created_at?: string | null
          failure_reason?: string | null
          id?: string
          is_onchain?: boolean
          owner_id_fkey: string
          proof?: Json | null
          proof_txn?: string | null
          relay_url?: string | null
          status?: Database["public"]["Enums"]["file_status"]
          txn_hash: string
          updated_at?: string
          url: string
          verbose_proof?: Json | null
        }
        Update: {
          blockchainFileId?: number
          created_at?: string | null
          failure_reason?: string | null
          id?: string
          is_onchain?: boolean
          owner_id_fkey?: string
          proof?: Json | null
          proof_txn?: string | null
          relay_url?: string | null
          status?: Database["public"]["Enums"]["file_status"]
          txn_hash?: string
          updated_at?: string
          url?: string
          verbose_proof?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "files_owner_id_fkey_fkey"
            columns: ["owner_id_fkey"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["public_id"]
          },
        ]
      }
      "files-old": {
        Row: {
          blockchainFileId: number
          createdAt: string | null
          id: string
          is_onchain: boolean
          ownerIdFkey: string
          proof: Json | null
          proof_txn: string | null
          relay_url: string | null
          txnHash: string
          url: string
          verbose_proof: Json | null
        }
        Insert: {
          blockchainFileId: number
          createdAt?: string | null
          id?: string
          is_onchain?: boolean
          ownerIdFkey: string
          proof?: Json | null
          proof_txn?: string | null
          relay_url?: string | null
          txnHash: string
          url: string
          verbose_proof?: Json | null
        }
        Update: {
          blockchainFileId?: number
          createdAt?: string | null
          id?: string
          is_onchain?: boolean
          ownerIdFkey?: string
          proof?: Json | null
          proof_txn?: string | null
          relay_url?: string | null
          txnHash?: string
          url?: string
          verbose_proof?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "files_ownerIdFkey_fkey"
            columns: ["ownerIdFkey"]
            isOneToOne: false
            referencedRelation: "profiles_wallet"
            referencedColumns: ["public_id"]
          },
        ]
      }
      profiles: {
        Row: {
          connected_wallet: string | null
          created_at: string | null
          dimo_completed_at: string | null
          dimo_completed_value: string | null
          dimo_completed_wallet: string | null
          dimo_dataregistry_relay_url: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          points: number
          public_id: string
          wallet_completed_at: string | null
        }
        Insert: {
          connected_wallet?: string | null
          created_at?: string | null
          dimo_completed_at?: string | null
          dimo_completed_value?: string | null
          dimo_completed_wallet?: string | null
          dimo_dataregistry_relay_url?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          points?: number
          public_id?: string
          wallet_completed_at?: string | null
        }
        Update: {
          connected_wallet?: string | null
          created_at?: string | null
          dimo_completed_at?: string | null
          dimo_completed_value?: string | null
          dimo_completed_wallet?: string | null
          dimo_dataregistry_relay_url?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          points?: number
          public_id?: string
          wallet_completed_at?: string | null
        }
        Relationships: []
      }
      profiles_wallet: {
        Row: {
          auth_nonce: string | null
          connected_wallet: string
          created_at: string | null
          dimo_completed_at: string | null
          dimo_completed_value: string | null
          dimo_completed_wallet: string | null
          dimo_dataregistry_relay_url: string | null
          id: string
          points: number
          public_id: string
          wallet_completed_at: string | null
        }
        Insert: {
          auth_nonce?: string | null
          connected_wallet: string
          created_at?: string | null
          dimo_completed_at?: string | null
          dimo_completed_value?: string | null
          dimo_completed_wallet?: string | null
          dimo_dataregistry_relay_url?: string | null
          id: string
          points?: number
          public_id?: string
          wallet_completed_at?: string | null
        }
        Update: {
          auth_nonce?: string | null
          connected_wallet?: string
          created_at?: string | null
          dimo_completed_at?: string | null
          dimo_completed_value?: string | null
          dimo_completed_wallet?: string | null
          dimo_dataregistry_relay_url?: string | null
          id?: string
          points?: number
          public_id?: string
          wallet_completed_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      file_status:
        | "new"
        | "proof_generated"
        | "submitted"
        | "confirmed"
        | "failed"
      sync_status: "not_synced" | "synced" | "failed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
