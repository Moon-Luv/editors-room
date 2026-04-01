import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Trash2, 
  User,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Mail,
  Calendar,
  Edit2,
  Loader2,
  Check,
  X,
  UserPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/src/lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'user' | 'client' | 'manager';
  avatar_url: string;
  created_at: string;
}

export const UsersManagement = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  const updateRole = async (id: string, role: Profile['role']) => {
    setIsUpdating(id);
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', id);

    if (error) {
      alert('Error updating role: ' + error.message);
    } else {
      fetchUsers();
    }
    setIsUpdating(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user profile?')) return;

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Error deleting user: ' + error.message);
    } else {
      fetchUsers();
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      (u.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: Profile['role']) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 gap-1.5"><ShieldAlert className="w-3 h-3" /> Admin</Badge>;
      case 'manager':
        return <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20 gap-1.5"><ShieldCheck className="w-3 h-3" /> Manager</Badge>;
      case 'client':
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 gap-1.5"><User className="w-3 h-3" /> Client</Badge>;
      default:
        return <Badge className="bg-white/5 text-white/60 border-white/10 gap-1.5"><User className="w-3 h-3" /> User</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage user accounts, roles, and permissions.</p>
        </div>
        <Button className="gap-2">
          <UserPlus className="w-4 h-4" />
          Invite User
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name or email..." 
            className="pl-10 bg-muted/50 border-border"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[150px] bg-muted/50 border-border">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border text-foreground">
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="client">Client</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2 border-border bg-muted/50">
            <Filter className="w-4 h-4" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">User</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Role</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Joined</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={4} className="px-6 py-8"><div className="h-4 bg-white/5 rounded w-full"></div></td>
                  </tr>
                ))
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center text-primary font-bold border border-white/5">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.full_name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            (user.full_name || 'U').charAt(0)
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{user.full_name || 'Unnamed User'}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" /> {user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" /> 
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 px-2 gap-1 text-xs" disabled={isUpdating === user.id}>
                              {isUpdating === user.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Change Role'}
                              <MoreVertical className="w-3 h-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-card border-border text-foreground">
                            <DropdownMenuItem onClick={() => updateRole(user.id, 'admin')} className="gap-2">
                              <ShieldAlert className="w-4 h-4 text-rose-500" /> Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateRole(user.id, 'manager')} className="gap-2">
                              <ShieldCheck className="w-4 h-4 text-purple-500" /> Manager
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateRole(user.id, 'client')} className="gap-2">
                              <User className="w-4 h-4 text-blue-500" /> Client
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateRole(user.id, 'user')} className="gap-2">
                              <User className="w-4 h-4 text-white/40" /> User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(user.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                      <User className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-bold">No users found</h3>
                    <p className="text-muted-foreground">Try adjusting your search or filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Placeholder */}
        <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between bg-white/[0.01]">
          <p className="text-xs text-muted-foreground">Showing {filteredUsers.length} of {users.length} users</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 px-3 text-xs border-white/5 bg-transparent" disabled>Previous</Button>
            <Button variant="outline" size="sm" className="h-8 px-3 text-xs border-white/5 bg-transparent" disabled>Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
