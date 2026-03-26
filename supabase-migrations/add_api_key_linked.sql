-- Migration: add api_key_linked column to subscriptions
-- Run this in Supabase → SQL Editor if the table already exists.

alter table public.subscriptions
  add column if not exists api_key_linked boolean not null default false;
