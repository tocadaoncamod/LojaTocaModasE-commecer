import { supabase } from '../lib/supabase';
import { AdminUser } from '../types/admin';

export class AuthService {
  // Login admin user
  static async loginAdmin(username: string, password: string): Promise<AdminUser | null> {
    try {
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('id, username, password, role, display_name, email, profile_image')
        .eq('username', username)
        .eq('password', password)
        .maybeSingle();

      if (adminError) {
        console.error('Database error:', adminError);
        return null;
      }

      if (!adminUser) {
        return null;
      }

      const user = {
        id: adminUser.id,
        username: adminUser.username,
        role: adminUser.role,
        displayName: adminUser.display_name || adminUser.username,
        email: adminUser.email || `${username}@tocadaonca.com`,
        profileImage: adminUser.profile_image
      };
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  }

  // Logout admin user
  static async logoutAdmin(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  // Update admin profile
  static async updateAdminProfile(
    adminId: string, 
    updates: {
      username?: string;
      displayName?: string;
      email?: string;
      profileImage?: string;
      currentPassword?: string;
      newPassword?: string;
    }
  ): Promise<boolean> {
    try {
      const updateData: any = {};
      
      if (updates.username) {
        updateData.username = updates.username;
      }
      if (updates.displayName) {
        updateData.display_name = updates.displayName;
      }
      if (updates.email) {
        updateData.email = updates.email;
      }
      if (updates.profileImage !== undefined) {
        updateData.profile_image = updates.profileImage || null;
      }
      if (updates.newPassword) {
        updateData.password = updates.newPassword;
      }

      if (Object.keys(updateData).length === 0) {
        return true;
      }

      const { error } = await supabase
        .from('admin_users')
        .update(updateData)
        .eq('id', adminId);

      if (error) {
        console.error('Profile update error:', error);
        return false;
      }

      return true;
      
    } catch (error) {
      console.error('Update profile error:', error);
      return false;
    }
  }

  // Get admin profile
  static async getAdminProfile(adminId: string): Promise<AdminUser | null> {
    try {
      const { data: adminUser, error } = await supabase
        .from('admin_users')
        .select('id, username, role, display_name, email, profile_image')
        .eq('id', adminId)
        .single();

      if (error || !adminUser) {
        console.error('Error fetching admin profile:', error);
        return null;
      }

      return {
        id: adminUser.id,
        username: adminUser.username,
        role: adminUser.role,
        displayName: adminUser.display_name || adminUser.username,
        email: adminUser.email || `${adminUser.username}@tocadaonca.com`,
        profileImage: adminUser.profile_image
      };
    } catch (error) {
      console.error('Get profile error:', error);
      return null;
    }
  }

  // Create new admin user (for future use)
  static async createAdmin(
    username: string, 
    password: string, 
    role: 'admin' | 'manager' = 'admin',
    displayName?: string,
    email?: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('admin_users')
        .insert([
          {
            username,
            password: password,
            role,
            display_name: displayName || username,
            email: email || `${username}@tocadaonca.com`
          }
        ]);

      if (error) {
        console.error('Error creating admin:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Create admin error:', error);
      return false;
    }
  }

  // Verify admin session (for future JWT implementation)
  static async verifyAdminSession(token: string): Promise<AdminUser | null> {
    return null;
  }
}