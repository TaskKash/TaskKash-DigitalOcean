import React from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function AdminTasks() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Tasks</h1>
            <p className="text-muted-foreground">Manage all tasks and campaigns</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Task
          </Button>
        </div>

        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No tasks yet. Create your first task!</p>
        </Card>
      </div>
    </AdminLayout>
  );
}
