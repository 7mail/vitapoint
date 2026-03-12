/*
  # Fix Profile RLS Infinite Recursion

  ## Problem
  The policy "Admins can read all profiles" causes infinite recursion because it queries
  the profiles table within a policy on the profiles table itself.

  ## Solution
  1. Drop the recursive "Admins can read all profiles" policy
  2. Keep the basic "Users can read own profile" policy which uses auth.uid() directly
  3. This prevents the recursion while maintaining security
  4. Admins can still read their own profile like all users
  
  ## Security Impact
  - Users can only read their own profile (secure)
  - Removes the problematic admin read-all policy that was causing recursion
  - Maintains all other security policies intact
*/

-- Drop the problematic policy that causes recursion
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;

-- The existing "Users can read own profile" policy is sufficient and doesn't cause recursion
-- because it only uses auth.uid() without querying the profiles table
