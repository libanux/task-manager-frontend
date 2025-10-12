export interface Task {
  _id?: string;
  title: string;
  description: string;
  status: 'pending' | 'completed';
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: 'pending' | 'completed';
}