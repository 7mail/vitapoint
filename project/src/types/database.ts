export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: 'Admin' | 'Sales' | 'Warehouse';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: 'Admin' | 'Sales' | 'Warehouse';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: 'Admin' | 'Sales' | 'Warehouse';
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          brand: string;
          category: string;
          sku: string;
          price: number;
          stock: number;
          min_stock_level: number;
          description: string | null;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          brand: string;
          category: string;
          sku: string;
          price?: number;
          stock?: number;
          min_stock_level?: number;
          description?: string | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          brand?: string;
          category?: string;
          sku?: string;
          price?: number;
          stock?: number;
          min_stock_level?: number;
          description?: string | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          phone: string | null;
          address: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          customer_id: string | null;
          customer_name: string;
          total_amount: number;
          status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
          payment_status: 'Unpaid' | 'Paid' | 'Refunded';
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          customer_id?: string | null;
          customer_name: string;
          total_amount?: number;
          status?: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
          payment_status?: 'Unpaid' | 'Paid' | 'Refunded';
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          customer_id?: string | null;
          customer_name?: string;
          total_amount?: number;
          status?: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
          payment_status?: 'Unpaid' | 'Paid' | 'Refunded';
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          product_name: string;
          quantity: number;
          price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          product_name: string;
          quantity: number;
          price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string | null;
          product_name?: string;
          quantity?: number;
          price?: number;
          created_at?: string;
        };
      };
      inventory_logs: {
        Row: {
          id: string;
          product_id: string | null;
          change_type: 'IN' | 'OUT' | 'ADJUSTMENT';
          quantity: number;
          reason: string | null;
          reference_type: string | null;
          reference_id: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id?: string | null;
          change_type: 'IN' | 'OUT' | 'ADJUSTMENT';
          quantity: number;
          reason?: string | null;
          reference_type?: string | null;
          reference_id?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string | null;
          change_type?: 'IN' | 'OUT' | 'ADJUSTMENT';
          quantity?: number;
          reason?: string | null;
          reference_type?: string | null;
          reference_id?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
      };
      activity_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          entity_type: string | null;
          entity_id: string | null;
          details: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          entity_type?: string | null;
          entity_id?: string | null;
          details?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action?: string;
          entity_type?: string | null;
          entity_id?: string | null;
          details?: Json;
          created_at?: string;
        };
      };
      audit_trail: {
        Row: {
          id: string;
          user_id: string | null;
          table_name: string;
          operation: string;
          record_id: string | null;
          old_values: Json | null;
          new_values: Json | null;
          changed_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          table_name: string;
          operation: string;
          record_id?: string | null;
          old_values?: Json | null;
          new_values?: Json | null;
          changed_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          table_name?: string;
          operation?: string;
          record_id?: string | null;
          old_values?: Json | null;
          new_values?: Json | null;
          changed_by?: string | null;
          created_at?: string;
        };
      };
    };
  };
}
