import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Trash2, 
  Mail, 
  Calendar, 
  Loader2, 
  MessageSquare,
  Eye,
  User,
  Clock,
  ChevronRight,
  AlertCircle,
  Download,
  CheckCircle2,
  Circle,
  Filter,
  X,
  CheckSquare,
  Square,
  MoreVertical,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/src/lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/src/lib/utils';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  service?: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

export const ContactsManagement = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching messages:', error);
    } else {
      setMessages(data || []);
    }
    setLoading(false);
  };

  const toggleReadStatus = async (id: string, currentStatus: boolean) => {
    setIsUpdatingStatus(id);
    const { error } = await supabase
      .from('contact_submissions')
      .update({ is_read: !currentStatus })
      .eq('id', id);

    if (error) {
      console.error('Error updating status:', error);
    } else {
      setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: !currentStatus } : m));
    }
    setIsUpdatingStatus(null);
  };

  const bulkUpdateReadStatus = async (read: boolean) => {
    if (selectedIds.length === 0) return;
    
    setIsBulkUpdating(true);
    const { error } = await supabase
      .from('contact_submissions')
      .update({ is_read: read })
      .in('id', selectedIds);

    if (error) {
      console.error('Error bulk updating status:', error);
      alert('Error updating messages: ' + error.message);
    } else {
      setMessages(prev => prev.map(m => 
        selectedIds.includes(m.id) ? { ...m, is_read: read } : m
      ));
      setSelectedIds([]);
    }
    setIsBulkUpdating(false);
  };

  const bulkDelete = async () => {
    if (selectedIds.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} messages?`)) return;

    setIsBulkUpdating(true);
    const { error } = await supabase
      .from('contact_submissions')
      .delete()
      .in('id', selectedIds);

    if (error) {
      console.error('Error bulk deleting messages:', error);
      alert('Error deleting messages: ' + error.message);
    } else {
      setMessages(prev => prev.filter(m => !selectedIds.includes(m.id)));
      setSelectedIds([]);
    }
    setIsBulkUpdating(false);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredMessages.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredMessages.map(m => m.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDelete = async () => {
    if (!messageToDelete) return;
    
    setIsDeleting(messageToDelete);
    const { error } = await supabase
      .from('contact_submissions')
      .delete()
      .eq('id', messageToDelete);

    if (error) {
      alert('Error deleting message: ' + error.message);
    } else {
      setMessages(prev => prev.filter(m => m.id !== messageToDelete));
      setIsDeleteDialogOpen(false);
      setMessageToDelete(null);
    }
    setIsDeleting(null);
  };

  const handleExport = () => {
    const headers = ['Name', 'Email', 'Service', 'Message', 'Date', 'Status'];
    const csvData = messages.map(m => [
      `"${m.name}"`,
      `"${m.email}"`,
      `"${m.service || 'N/A'}"`,
      `"${m.message.replace(/"/g, '""')}"`,
      `"${new Date(m.created_at).toLocaleString()}"`,
      `"${m.is_read ? 'Read' : 'Unread'}"`
    ]);
    
    const csvContent = [headers.join(","), ...csvData.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `contact_messages_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredMessages = messages.filter(m => {
    const matchesSearch = 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.service || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.message.toLowerCase().includes(searchQuery.toLowerCase());

    const messageDate = new Date(m.created_at);
    const matchesStartDate = startDate ? messageDate >= new Date(startDate) : true;
    const matchesEndDate = endDate ? messageDate <= new Date(endDate + 'T23:59:59') : true;

    return matchesSearch && matchesStartDate && matchesEndDate;
  });

  const openViewModal = async (message: ContactMessage) => {
    setSelectedMessage(message);
    setIsViewOpen(true);
    
    // Automatically mark as read if it's unread
    if (!message.is_read) {
      await toggleReadStatus(message.id, false);
    }
  };

  const confirmDelete = (id: string) => {
    setMessageToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const unreadCount = messages.filter(m => !m.is_read).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            Contact Messages
            {unreadCount > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {unreadCount} New
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground">Manage and respond to user inquiries.</p>
        </div>
        <div className="flex items-center gap-3">
          {selectedIds.length > 0 ? (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 bg-primary/10 border border-primary/20 p-1 rounded-lg"
            >
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-xs gap-1.5 text-primary hover:bg-primary/20"
                onClick={() => bulkUpdateReadStatus(true)}
                disabled={isBulkUpdating}
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Mark Read
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-xs gap-1.5 text-primary hover:bg-primary/20"
                onClick={() => bulkUpdateReadStatus(false)}
                disabled={isBulkUpdating}
              >
                <Mail className="w-3.5 h-3.5" /> Mark Unread
              </Button>
              <div className="w-px h-4 bg-primary/20 mx-1" />
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-xs gap-1.5 text-destructive hover:bg-destructive/10"
                onClick={bulkDelete}
                disabled={isBulkUpdating}
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground"
                onClick={() => setSelectedIds([])}
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </motion.div>
          ) : (
            <>
              <Button 
                variant="outline" 
                className="border-white/10 bg-white/5 gap-2"
                onClick={handleExport}
                disabled={messages.length === 0}
              >
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10 text-xs text-muted-foreground">
                <MessageSquare className="w-4 h-4" />
                <span>Total: {messages.length}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div className="relative col-span-1 md:col-span-2 lg:col-span-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search name, email..." 
            className="pl-10 bg-muted/50 border-border"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
          <Input 
            type="date" 
            className="bg-muted/50 border-border text-xs"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <span className="text-muted-foreground">to</span>
          <Input 
            type="date" 
            className="bg-muted/50 border-border text-xs"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          {(startDate || endDate) && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-muted-foreground"
              onClick={() => { setStartDate(''); setEndDate(''); }}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="px-6 py-4 w-10">
                  <Checkbox 
                    checked={filteredMessages.length > 0 && selectedIds.length === filteredMessages.length}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Sender</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Service</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Message</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Date</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="px-6 py-8"><div className="h-4 bg-muted rounded w-full"></div></td>
                  </tr>
                ))
              ) : filteredMessages.length > 0 ? (
                filteredMessages.map((msg) => (
                  <tr 
                    key={msg.id} 
                    className={cn(
                      "hover:bg-muted/30 transition-colors group cursor-pointer",
                      !msg.is_read && "bg-primary/5",
                      selectedIds.includes(msg.id) && "bg-primary/10"
                    )}
                    onClick={() => openViewModal(msg)}
                  >
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <Checkbox 
                        checked={selectedIds.includes(msg.id)}
                        onCheckedChange={() => toggleSelect(msg.id)}
                        aria-label={`Select message from ${msg.name}`}
                      />
                    </td>
                    <td className="px-6 py-4">
                      {!msg.is_read ? (
                        <div className="flex items-center gap-2 text-primary">
                          <Circle className="w-3 h-3 fill-current" />
                          <span className="text-[10px] font-bold uppercase tracking-tighter">New</span>
                        </div>
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-muted-foreground/30" />
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className={cn("text-sm", !msg.is_read ? "font-bold" : "font-medium")}>{msg.name}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" /> {msg.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium truncate max-w-[150px] block capitalize">
                        {msg.service || <span className="text-muted-foreground italic">No Service</span>}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-muted-foreground truncate max-w-[250px]">
                        {msg.message}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" /> 
                        {new Date(msg.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() => toggleReadStatus(msg.id, msg.is_read)}
                          disabled={isUpdatingStatus === msg.id}
                        >
                          {isUpdatingStatus === msg.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : msg.is_read ? (
                            <Mail className="w-4 h-4" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => openViewModal(msg)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => confirmDelete(msg.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-bold">No messages found</h3>
                    <p className="text-muted-foreground">Try adjusting your search or filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Grid */}
      <div className="md:hidden space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-muted rounded w-3/4"></div>
            </div>
          ))
        ) : filteredMessages.length > 0 ? (
          filteredMessages.map((msg) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "bg-card border border-border rounded-xl p-4 space-y-3 relative overflow-hidden",
                !msg.is_read && "border-primary/30 bg-primary/5"
              )}
              onClick={() => openViewModal(msg)}
            >
              {!msg.is_read && (
                <div className="absolute top-0 right-0 p-1">
                  <Badge className="text-[8px] h-4 px-1">NEW</Badge>
                </div>
              )}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className={cn("text-sm", !msg.is_read ? "font-bold" : "font-medium")}>{msg.name}</h3>
                  <p className="text-xs text-muted-foreground">{msg.email}</p>
                </div>
                <Badge variant="outline" className="text-[10px] bg-muted border-border">
                  {new Date(msg.created_at).toLocaleDateString()}
                </Badge>
              </div>
              
              <div>
                <p className="text-xs font-semibold text-primary mb-1 capitalize">{msg.service || 'No Service'}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{msg.message}</p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 text-xs gap-1.5"
                  onClick={(e) => { e.stopPropagation(); toggleReadStatus(msg.id, msg.is_read); }}
                >
                  {msg.is_read ? <Mail className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  {msg.is_read ? 'Unread' : 'Read'}
                </Button>
                <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5" onClick={() => openViewModal(msg)}>
                  <Eye className="w-3.5 h-3.5" /> View
                </Button>
                <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5 text-destructive hover:bg-destructive/10" onClick={(e) => { e.stopPropagation(); confirmDelete(msg.id); }}>
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </Button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-20 text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground">No messages found</p>
          </div>
        )}
      </div>

      {/* View Message Modal */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="bg-card border-border text-foreground max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2 text-foreground">
              <MessageSquare className="w-5 h-5 text-primary" />
              Message Details
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Received on {selectedMessage && new Date(selectedMessage.created_at).toLocaleString()}
            </DialogDescription>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">From</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                      {selectedMessage.name.charAt(0)}
                    </div>
                    <p className="font-semibold text-foreground">{selectedMessage.name}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <a href={`mailto:${selectedMessage.email}`} className="hover:text-primary transition-colors underline underline-offset-4 decoration-border">
                      {selectedMessage.email}
                    </a>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Service</p>
                <p className="font-medium text-primary capitalize">{selectedMessage.service || 'No Service'}</p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Message</p>
                <div className="bg-muted/30 border border-border rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap min-h-[150px] text-foreground">
                  {selectedMessage.message}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" className="border-border bg-transparent" onClick={() => setIsViewOpen(false)}>
              Close
            </Button>
            <Button className="gap-2" onClick={() => {
              window.location.href = `mailto:${selectedMessage?.email}?subject=Re: Inquiry regarding ${selectedMessage?.service || 'your project'}`;
            }}>
              <Mail className="w-4 h-4" /> Reply via Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-card border-border text-foreground max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to delete this message? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" className="border-border bg-transparent" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={!!isDeleting}
              className="gap-2"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Delete Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
