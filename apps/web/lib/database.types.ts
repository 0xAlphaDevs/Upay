export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      merchants: {
        Row: {
          id: string;
          name: string;
          email: string;
          settlement_address: string;
          settlement_token: string;
          settlement_chain: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          settlement_address: string;
          settlement_token?: string;
          settlement_chain?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          settlement_address?: string;
          settlement_token?: string;
          settlement_chain?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      api_keys: {
        Row: {
          id: string;
          merchant_id: string;
          key_prefix: string;
          key_hash: string;
          type: string;
          revoked: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          merchant_id: string;
          key_prefix: string;
          key_hash: string;
          type: string;
          revoked?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          merchant_id?: string;
          key_prefix?: string;
          key_hash?: string;
          type?: string;
          revoked?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      checkout_sessions: {
        Row: {
          id: string;
          merchant_id: string;
          amount: number;
          settle_token: string;
          settle_chain: string;
          recipient: string;
          status: string;
          metadata: Json | null;
          success_url: string | null;
          cancel_url: string | null;
          created_at: string;
          expires_at: string;
        };
        Insert: {
          id?: string;
          merchant_id: string;
          amount: number;
          settle_token: string;
          settle_chain: string;
          recipient: string;
          status?: string;
          metadata?: Json | null;
          success_url?: string | null;
          cancel_url?: string | null;
          created_at?: string;
          expires_at: string;
        };
        Update: {
          id?: string;
          merchant_id?: string;
          amount?: number;
          settle_token?: string;
          settle_chain?: string;
          recipient?: string;
          status?: string;
          metadata?: Json | null;
          success_url?: string | null;
          cancel_url?: string | null;
          created_at?: string;
          expires_at?: string;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          session_id: string;
          merchant_id: string;
          payer_address: string;
          settle_token: string;
          settle_chain: string;
          amount: number;
          source_breakdown: Json | null;
          tx_hashes: Json;
          status: string;
          settled_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          merchant_id: string;
          payer_address: string;
          settle_token: string;
          settle_chain: string;
          amount: number;
          source_breakdown?: Json | null;
          tx_hashes: Json;
          status?: string;
          settled_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          merchant_id?: string;
          payer_address?: string;
          settle_token?: string;
          settle_chain?: string;
          amount?: number;
          source_breakdown?: Json | null;
          tx_hashes?: Json;
          status?: string;
          settled_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      webhook_endpoints: {
        Row: {
          id: string;
          merchant_id: string;
          url: string;
          events: string[];
          secret: string;
          enabled: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          merchant_id: string;
          url: string;
          events?: string[];
          secret: string;
          enabled?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          merchant_id?: string;
          url?: string;
          events?: string[];
          secret?: string;
          enabled?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      webhook_deliveries: {
        Row: {
          id: string;
          webhook_endpoint_id: string;
          payment_id: string | null;
          event: string;
          payload: Json;
          response_status: number | null;
          response_body: string | null;
          delivered: boolean;
          attempted_at: string;
        };
        Insert: {
          id?: string;
          webhook_endpoint_id: string;
          payment_id?: string | null;
          event: string;
          payload: Json;
          response_status?: number | null;
          response_body?: string | null;
          delivered?: boolean;
          attempted_at?: string;
        };
        Update: {
          id?: string;
          webhook_endpoint_id?: string;
          payment_id?: string | null;
          event?: string;
          payload?: Json;
          response_status?: number | null;
          response_body?: string | null;
          delivered?: boolean;
          attempted_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
